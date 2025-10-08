#!/usr/bin/env node
/**
 * CSV -> JavaScript Object converter (keyed by first column)
 * ------------------------------------------------------------------
 * Usage:
 *   node utils/convert_csv_firstcol_to_object.js <input.csv> [output.js|output.json]
 *
 * If output path ends with .json a JSON file is written.
 * If output path ends with .js a JS module exporting the object is written.
 * If no output path supplied, will derive one by replacing the input extension
 * with .js (exporting const data = {...}).
 *
 * Assumptions:
 * - First row is a header row.
 * - First column values are unique (later rows with same key overwrite earlier ones).
 * - Simple CSV (commas as separators, optional quotes). Basic quote handling included.
 * - Numeric detection: integers & floats are converted to Number; others kept as strings.
 */

const fs = require('fs');
const path = require('path');

function parseArgs() {
  const [, , inputArg, outputArg] = process.argv;
  if (!inputArg) {
    console.error('Error: input CSV path required.');
    console.error('Usage: node utils/convert_csv_firstcol_to_object.js <input.csv> [output.(js|json)]');
    process.exit(1);
  }
  const inPath = path.resolve(inputArg);
  if (!fs.existsSync(inPath)) {
    console.error('Error: input file not found:', inPath);
    process.exit(1);
  }
  const outPath = outputArg
    ? path.resolve(outputArg)
    : inPath.replace(/\.csv$/i, '.js');
  return { inPath, outPath };
}

// Basic CSV splitter with handling for quoted fields containing commas
function splitCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { // escaped quote
        current += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result.map(v => v.trim());
}

function coerce(value) {
  if (value === '') return '';
  // numeric?
  if (/^[-+]?\d+(?:\.\d+)?$/.test(value)) {
    const num = Number(value);
    if (!Number.isNaN(num)) return num;
  }
  return value; // leave as string
}

function convert(inPath) {
  const raw = fs.readFileSync(inPath, 'utf8');
  const lines = raw.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) {
    throw new Error('CSV appears to have no data rows.');
  }
  const header = splitCSVLine(lines[0]).map(h => h.replace(/^"|"$/g, ''));
  if (header.length < 2) {
    throw new Error('Need at least two columns (key + one value column).');
  }
  const obj = {};
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCSVLine(lines[i]);
    if (!cols.length) continue;
    const keyRaw = cols[0];
    if (!keyRaw) continue; // skip blank key
    const key = keyRaw.replace(/^"|"$/g, '');
    const record = {};
    for (let c = 1; c < header.length; c++) {
      const fieldName = header[c];
      const val = cols[c] !== undefined ? cols[c] : '';
      record[fieldName] = coerce(val.replace(/^"|"$/g, ''));
    }
    obj[key] = record;
  }
  return { header, obj };
}

function writeOutput(outPath, obj) {
  if (/\.json$/i.test(outPath)) {
    fs.writeFileSync(outPath, JSON.stringify(obj, null, 2));
    return { type: 'json', outPath };
  }
  // default JS module
  const varName = 'data';
  const js = `// Auto-generated from CSV on ${new Date().toISOString()}\n// Keyed by first column\nvar ${varName} = ${JSON.stringify(obj, null, 2)};\n`;
  fs.writeFileSync(outPath, js);
  return { type: 'js', outPath };
}

(function main() {
  try {
    const { inPath, outPath } = parseArgs();
    const { obj } = convert(inPath);
    const { type } = writeOutput(outPath, obj);
    console.log(`Conversion complete -> ${outPath} (${type.toUpperCase()}) with ${Object.keys(obj).length} keys.`);
  } catch (err) {
    console.error('Failed:', err.message);
    process.exit(1);
  }
})();
