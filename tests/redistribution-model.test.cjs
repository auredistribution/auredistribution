const { test } = require('node:test');
const assert = require('node:assert/strict');
const { RedistributionModel, parseCSV, encodeCSV } = require('../js/redistribution-model.js');

function fixture() {
  const features = ['1', '1', '2', '3'].map(code => ({ properties: {
    SA1_CODE21: code, SA2_CODE21: code === '3' ? '200' : '100', SA2_NAME21: code === '3' ? 'Other' : 'Town'
  } }));
  const record = (division, starting) => ({ previousDivision: division, currentDivision: division, startingEnrolment: starting, projectedEnrolment: starting * 2, area: 1.5 });
  return new RedistributionModel(features, { '1': record('A', 100), '2': record('B', 200), '3': record('B', 300) }, [
    { type: 'group', name: 'Group', divisions: ['A', 'B'] },
    { type: 'division', name: 'A' }, { type: 'division', name: 'B' }
  ]);
}

test('geometry pieces share an allocation and do not double-count electors', () => {
  const model = fixture();
  assert.deepEqual(model.featureIds.get('1'), [0, 1]);
  assert.equal(model.startingTotal, 600);
  assert.equal(model.projectedTotal, 1200);
  assert.deepEqual(model.sa2s.get('100'), ['1', '2']);
  assert.deepEqual(model.transfer('1', 'B'), ['1']);
  assert.equal(model.stats('A').starting, 0);
  assert.equal(model.stats('B').starting, 600);
  assert.equal(model.movedTotal, 100);
  model.transfer('1', 'B');
  assert.equal(model.records.get('1').division, 'A');
  assert.equal(model.movedTotal, 0);
});

test('SA2 transfer/return applies once per SA1 and preserves statewide totals', () => {
  const model = fixture();
  model.transfer('1', 'B', true);
  assert.equal(model.stats('B').starting, 600);
  assert.equal(model.stats('B').count, 3);
  model.transfer('1', 'B', true);
  assert.equal(model.stats('A').starting, 100);
  assert.equal(model.stats('B').starting, 500);
  assert.equal(model.movedTotal, 0);
});

test('a mixed SA2 moves wholly into the target without reverting SA1s already moved there', () => {
  // Clicking either the target-owned SA1 or the other SA1 must produce the same batch action.
  for (const clickedCode of ['1', '2']) {
    const model = fixture();
    model.assign(new Map([['1', 'B'], ['2', 'A']]));
    assert.deepEqual(model.transfer(clickedCode, 'A', true), ['1']);
    assert.equal(model.records.get('1').division, 'A');
    assert.equal(model.records.get('2').division, 'A');
    assert.equal(model.records.get('3').division, 'B');
    assert.equal(model.stats('A').starting, 300);
    assert.equal(model.stats('B').starting, 300);
    assert.equal(model.movedTotal, 200);

    // A subsequent Shift-click can return the now-uniform SA2 to its original allocations.
    assert.deepEqual(model.transfer(clickedCode, 'A', true), ['2']);
    assert.equal(model.records.get('1').division, 'A');
    assert.equal(model.records.get('2').division, 'B');
    assert.equal(model.movedTotal, 0);
  }
});

test('unallocated SA1s make an SA2 transfer into the target, rather than return originals', () => {
  const model = fixture();
  model.assign(new Map([['1', ''], ['2', 'A']]));
  assert.deepEqual(model.transfer('2', 'A', true), ['1']);
  assert.equal(model.stats('A').starting, 300);
  assert.equal(model.stats('').count, 0);
  assert.equal(model.movedTotal, 200);
});

test('rename keeps stable division identities, assignments and moved totals', () => {
  const model = fixture();
  model.rename('A', 'Renamed, "A"');
  assert.equal(model.name('A'), 'Renamed, "A"');
  assert.equal(model.records.get('1').division, 'A');
  assert.equal(model.movedTotal, 0);
  model.resetNames();
  assert.equal(model.name('A'), 'A');
});

test('clear, delete and reset restore originals and remove new divisions', () => {
  const model = fixture();
  const id = model.createDivision('Group');
  model.transfer('1', id);
  model.deleteDivision('B');
  assert.equal(model.stats('').starting, 500);
  assert.equal(model.movedTotal, 600);
  model.resetAssignments();
  assert.equal(model.divisions.size, 2);
  assert.equal(model.divisions.has(id), false);
  assert.equal(model.stats('A').starting, 100);
  assert.equal(model.stats('B').starting, 500);
  assert.equal(model.stats('').count, 0);
  assert.equal(model.movedTotal, 0);
});

test('invalid allocation batches are rejected before making any changes', () => {
  const model = fixture();
  assert.throws(() => model.assign(new Map([['1', 'B'], ['2', 'missing']])));
  assert.equal(model.records.get('1').division, 'A');
  assert.equal(model.stats('A').starting, 100);
  assert.throws(() => model.rename('A', 'B'));
});

test('delta totals match an independent full aggregation after mixed edits', () => {
  const model = fixture();
  const newId = model.createDivision('Group');
  for (let i = 0; i < 120; i++) {
    const code = String((i % 3) + 1);
    model.assign(new Map([[code, ['', 'A', 'B', newId][i % 4]]]));
    for (const id of ['', 'A', 'B', newId]) {
      const records = [...model.records.values()].filter(r => r.division === id);
      const expected = records.reduce((t, r) => ({ starting: t.starting + r.starting, projected: t.projected + r.projected, area: t.area + r.area, count: t.count + 1 }), { starting: 0, projected: 0, area: 0, count: 0 });
      assert.deepEqual(model.stats(id), expected);
      assert.equal(model.codes(id).size, records.length);
    }
    assert.equal(model.movedTotal, [...model.records.values()].filter(r => r.original !== r.division).reduce((sum, r) => sum + r.starting, 0));
  }
});

test('CSV round-trips quoted names, multiline fields and unallocated SA1s', () => {
  const rows = [['SA1', 'ProposedDivision'], ['1', 'Name, with "quotes"'], ['2', 'Two\nlines'], ['3', '']];
  assert.deepEqual(parseCSV('\uFEFF' + encodeCSV(rows)), rows);
  assert.deepEqual(parseCSV('SA1,Division\n1,A\n\n2,B'), [['SA1', 'Division'], ['1', 'A'], ['2', 'B']]);
  assert.throws(() => parseCSV('SA1,Division\n1,"unfinished'), /unclosed/);
});
