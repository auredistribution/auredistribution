// Renderer-independent allocation state. Geometry stays immutable; totals are updated by delta.
(function (root) {
  'use strict';

  const emptyTotals = () => ({ starting: 0, projected: 0, area: 0, count: 0 });

  class RedistributionModel {
    constructor(features, data, entries) {
      this.records = new Map();
      this.featureIds = new Map();
      this.sa2s = new Map();
      this.divisions = new Map();
      this.originalDivisions = new Map();
      this.groups = entries.filter(e => e.type === 'group').map(e => ({ name: e.name, divisions: [...e.divisions] }));
      this.originalGroups = this.groups.map(g => ({ name: g.name, divisions: [...g.divisions] }));
      this.totals = new Map();
      this.members = new Map();
      this.startingTotal = 0;
      this.projectedTotal = 0;
      this.movedTotal = 0;
      this.nextDivision = 1;

      entries.filter(e => e.type === 'division').forEach(e => {
        const division = { id: e.name, name: e.name, originalName: e.name };
        this.divisions.set(e.name, division);
        this.originalDivisions.set(e.name, division);
      });
      features.forEach((feature, id) => {
        const code = String(feature.properties.SA1_CODE21);
        if (!data[code]) throw new Error(`Missing enrolment data for SA1 ${code}`);
        if (!this.featureIds.has(code)) this.featureIds.set(code, []);
        this.featureIds.get(code).push(id);
        // Multiple geometry pieces can share an SA1 code. Count and transfer that SA1 once.
        if (this.records.has(code)) return;
        const values = data[code];
        const sa2 = String(feature.properties.SA2_CODE21 || feature.properties.SA2_NAME21);
        const record = {
          code, sa2, sa2Name: feature.properties.SA2_NAME21,
          original: values.previousDivision || '', division: values.currentDivision || '',
          starting: Number(values.startingEnrolment) || 0,
          projected: Number(values.projectedEnrolment) || 0,
          area: Number(values.area) || 0
        };
        if (record.division && !this.divisions.has(record.division)) throw new Error(`Unknown division: ${record.division}`);
        this.records.set(code, record);
        if (!this.sa2s.has(sa2)) this.sa2s.set(sa2, []);
        this.sa2s.get(sa2).push(code);
        this.startingTotal += record.starting;
        this.projectedTotal += record.projected;
      });
      this.rebuildTotals();
    }

    name(id) { return this.divisions.get(id)?.name || this.originalDivisions.get(id)?.name || ''; }
    stats(id) { return this.totals.get(id) || emptyTotals(); }
    codes(id) { return this.members.get(id) || new Set(); }

    accumulate(record, sign) {
      const id = record.division;
      if (!this.totals.has(id)) this.totals.set(id, emptyTotals());
      if (!this.members.has(id)) this.members.set(id, new Set());
      const totals = this.totals.get(id);
      totals.starting += sign * record.starting;
      totals.projected += sign * record.projected;
      totals.area += sign * record.area;
      totals.count += sign;
      if (sign > 0) this.members.get(id).add(record.code);
      else this.members.get(id).delete(record.code);
      if (record.division !== record.original) this.movedTotal += sign * record.starting;
    }

    rebuildTotals() {
      this.totals.clear();
      this.members.clear();
      this.movedTotal = 0;
      this.records.forEach(r => this.accumulate(r, 1));
    }

    assign(updates) {
      // Validate a whole batch before applying any part of it.
      updates.forEach((division, code) => {
        if (!this.records.has(code)) throw new Error(`Unknown SA1: ${code}`);
        if (division && !this.divisions.has(division)) throw new Error(`Unknown division: ${division}`);
      });
      const changed = [];
      updates.forEach((division, code) => {
        const record = this.records.get(code);
        if (record.division === division) return;
        this.accumulate(record, -1);
        record.division = division;
        this.accumulate(record, 1);
        changed.push(code);
      });
      return changed;
    }

    transfer(code, selected, wholeSA2 = false) {
      if (!this.divisions.has(selected)) return [];
      const record = this.records.get(code);
      const codes = wholeSA2 ? this.sa2s.get(record.sa2) : [code];
      // Decide once for the entire selection: mixed SA2s move into the target;
      // only a selection wholly in the target returns to its original divisions.
      const returnToOriginal = codes.every(key => this.records.get(key).division === selected);
      return this.assign(new Map(codes.map(key => {
        const r = this.records.get(key);
        // A deleted original division cannot receive a returned SA1 until reset restores it.
        const original = this.divisions.has(r.original) ? r.original : '';
        return [key, returnToOriginal ? original : selected];
      })));
    }

    validateName(name, exceptId) {
      name = name.trim();
      if (!name) throw new Error('Enter a division name.');
      const all = new Map([...this.originalDivisions, ...this.divisions]);
      if ([...all.values()].some(d => d.id !== exceptId && d.name === name)) {
        throw new Error(`A division named “${name}” already exists.`);
      }
      return name;
    }

    createDivision(groupName, name) {
      const group = this.groups.find(g => g.name === groupName);
      if (!group) throw new Error('Unknown division group.');
      let id;
      do { id = `new-${this.nextDivision++}`; } while (this.divisions.has(id));
      if (!name) {
        let suffix = this.nextDivision - 1;
        do { name = `(new ${suffix++})`; } while ([...this.divisions.values()].some(d => d.name === name));
      }
      name = this.validateName(name);
      this.divisions.set(id, { id, name, originalName: null });
      group.divisions.push(id);
      return id;
    }

    rename(id, name) {
      this.divisions.get(id).name = this.validateName(name, id);
    }

    deleteDivision(id) {
      const changed = this.assign(new Map([...this.codes(id)].map(code => [code, ''])));
      this.divisions.delete(id);
      this.groups.forEach(g => { g.divisions = g.divisions.filter(key => key !== id); });
      return changed;
    }

    resetAssignments() {
      this.divisions = new Map(this.originalDivisions);
      this.groups = this.originalGroups.map(g => ({ name: g.name, divisions: [...g.divisions] }));
      return this.assign(new Map([...this.records].map(([code, r]) => [code, r.original])));
    }

    resetNames() {
      const names = [...this.divisions.values()].map(d => d.originalName || d.name);
      if (new Set(names).size !== names.length) throw new Error('Rename the new division that uses an original name before resetting names.');
      this.originalDivisions.forEach(d => { d.name = d.originalName; });
    }
  }

  // RFC-style quoted fields keep renamed divisions (commas, quotes, newlines) round-trippable.
  function parseCSV(text) {
    const rows = [];
    let row = [], field = '', quoted = false;
    text = text.replace(/^\uFEFF/, '');
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '"') {
        if (quoted && text[i + 1] === '"') { field += '"'; i++; }
        else quoted = !quoted;
      } else if (!quoted && (c === ',' || c === '\n' || c === '\r')) {
        row.push(field); field = '';
        if (c !== ',') {
          if (row.some(value => value.trim())) rows.push(row);
          row = [];
          if (c === '\r' && text[i + 1] === '\n') i++;
        }
      } else field += c;
    }
    if (quoted) throw new Error('CSV contains an unclosed quoted field.');
    row.push(field);
    if (row.some(value => value.trim())) rows.push(row);
    return rows;
  }

  function encodeCSV(rows) {
    return rows.map(row => row.map(value => {
      const text = String(value ?? '');
      return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    }).join(',')).join('\r\n') + '\r\n';
  }

  const api = { RedistributionModel, parseCSV, encodeCSV };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else Object.assign(root, api);
})(typeof window !== 'undefined' ? window : globalThis);
