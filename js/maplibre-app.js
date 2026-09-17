/* MapLibre workspace. No source.setData() calls are needed for allocation edits. */
(function () {
  'use strict';

  const $ = id => document.getElementById(id);
  const fmt = value => Math.round(value).toLocaleString('en-AU');
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const message = text => { $('workspace-message').textContent = text; };
  const percent = (value, total, count) => count && total ? 100 * value * count / total - 100 : 0;
  let dirty = false;

  const confirmationDialog = $('confirmation-dialog');
  let pendingConfirmation = null;
  function confirmAction({ title, description, confirmLabel, cancelLabel = 'Cancel' }) {
    if (pendingConfirmation) return Promise.resolve(false);
    $('confirmation-title').textContent = title;
    $('confirmation-description').textContent = description;
    $('confirmation-accept').textContent = confirmLabel;
    $('confirmation-cancel').textContent = cancelLabel;
    confirmationDialog.returnValue = '';
    return new Promise(resolve => {
      pendingConfirmation = resolve;
      confirmationDialog.showModal();
    });
  }
  confirmationDialog.addEventListener('close', () => {
    const resolve = pendingConfirmation;
    pendingConfirmation = null;
    resolve?.(confirmationDialog.returnValue === 'confirm');
  });
  confirmationDialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const first = $('confirmation-cancel'), last = $('confirmation-accept');
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  });
  confirmationDialog.addEventListener('click', event => {
    const bounds = confirmationDialog.getBoundingClientRect();
    if (event.target === confirmationDialog &&
        (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) {
      confirmationDialog.close('cancel');
    }
  });

  document.querySelectorAll('[data-tab]').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.tab-content').forEach(el => { el.hidden = el.id !== button.dataset.tab; });
      document.querySelectorAll('[data-tab]').forEach(el => {
        el.classList.toggle('button-grey', el === button);
        el.setAttribute('aria-pressed', String(el === button));
      });
    });
  });
  const snippets = window.REDIST_SHARED_SNIPPETS;
  if (snippets) {
    $('shared-instructions').innerHTML = `<h3>${snippets.headings.instructions}</h3>${snippets.instructions.map(line => `<p>${line}</p>`).join('')}`;
    for (const key of ['disclaimer', 'attribution']) $('shared-' + key).innerHTML = `<h3>${snippets.headings[key]}</h3><p>${snippets[key]}</p>`;
  }

  window.addEventListener('beforeunload', event => {
    if (dirty) { event.preventDefault(); event.returnValue = ''; }
  });
  document.querySelectorAll('a[href$=".html"]').forEach(link => link.addEventListener('click', async event => {
    if (!dirty || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || link.target === '_blank') return;
    event.preventDefault();
    if (await confirmAction({
      title: 'Leave this session?',
      description: 'You have unexported changes. Leaving this page will discard your current redistribution work.',
      confirmLabel: 'Leave anyway', cancelLabel: 'Stay here'
    })) {
      dirty = false;
      window.location.assign(link.href);
    }
  }));

  try {
    start();
  } catch (error) {
    $('map-status').hidden = false;
    $('map-status').textContent = `Unable to load the map: ${error.message}. Please reload to try again.`;
    console.error(error);
  }

  function start() {
    const model = new RedistributionModel(sa1s, data, window.divisionsAndGroups);
    const collapsed = new Set();
    const rowElements = new Map();
    const colors = new Map();
    const customColors = new Map();
    const colorStorageKey = `customColors_${window.EVENT_NAME}`;
    let selected = '', spotlight = false, projectedThresholds = false, ready = false;
    let hoverKey = '', hoveredCodes = [], lastPoint = null, editingId = null;
    let activeBoundary = null, boundaryHover = null, boundaryRequest = 0;
    const boundaryCache = new Map();
    const scriptPromises = new Map();

    try {
      Object.entries(JSON.parse(localStorage.getItem(colorStorageKey) || '{}')).forEach(([id, color]) => {
        if (model.originalDivisions.has(id) && /^#[\da-f]{6}$/i.test(color)) customColors.set(id, color);
      });
    } catch (error) { console.warn('Saved colours could not be read.', error); }

    function saveColors() {
      try {
        // New division IDs belong to this session; do not attach their colours to a future session.
        localStorage.setItem(colorStorageKey, JSON.stringify(Object.fromEntries([...customColors].filter(([id]) => model.originalDivisions.has(id)))));
      } catch (_) { message('Colour preferences could not be saved in this browser.'); }
    }

    function color(id) {
      if (!id) return '#cccccc';
      if (!colors.has(id)) colors.set(id, customColors.get(id) || getColor(model.name(id)).color);
      return colors.get(id);
    }

    const map = new maplibregl.Map({
      container: 'map',
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [146.5, -21.5],
      // MapLibre uses 512px tiles, so zoom 5 matches the original Leaflet zoom 6.
      zoom: 5, minZoom: 3, maxZoom: 19,
      dragRotate: true, pitchWithRotate: true, touchPitch: true, boxZoom: false,
      renderWorldCopies: false, attributionControl: true
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: true, visualizePitch: true }), 'bottom-right');
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-right');

    function addControl(element, position) {
      map.addControl({
        onAdd() { element.classList.add('maplibregl-ctrl'); return element; },
        onRemove() { element.remove(); }
      }, position);
      return element;
    }
    const hoverPanel = document.createElement('div');
    hoverPanel.className = 'info-panel';
    hoverPanel.textContent = 'Hover over an SA1';
    addControl(hoverPanel, 'top-right');
    const selectionPanel = document.createElement('div');
    selectionPanel.className = 'info-panel division-info-panel';
    selectionPanel.hidden = true;
    addControl(selectionPanel, 'top-left');

    const boundaryControl = document.createElement('div');
    boundaryControl.className = 'boundary-control';
    boundaryControl.innerHTML = `<label for="boundary-select">Reference boundaries</label>
      <select id="boundary-select" disabled><option value="">None</option></select>
      <input id="boundary-search" type="search" placeholder="Search boundaries…" aria-label="Search reference boundaries" hidden />
      <div class="boundary-results" id="boundary-results"></div><p class="boundary-status" id="boundary-status" role="status"></p>`;
    addControl(boundaryControl, 'bottom-left');
    (window.DIVISION_MAPS || []).forEach(entry => {
      const option = document.createElement('option');
      option.value = entry.id; option.textContent = entry.name;
      $('boundary-select').appendChild(option);
    });
    // Controls must not trigger canvas keyboard shortcuts or map gestures.
    ['click', 'dblclick', 'mousedown', 'touchstart', 'keydown', 'wheel'].forEach(type => {
      boundaryControl.addEventListener(type, event => event.stopPropagation());
    });

    function featureState(code) {
      const record = model.records.get(code);
      return { division: record.division, color: color(record.division), moved: record.division !== record.original, assigned: !!record.division };
    }
    function updateFeatures(codes) {
      if (!ready) return;
      for (const code of codes) {
        const state = featureState(code);
        for (const id of model.featureIds.get(code)) map.setFeatureState({ source: 'sa1s', id }, state);
      }
    }
    function updateSpotlight() {
      if (!ready) return;
      const isDimmed = spotlight
        ? (selected ? ['!=', ['coalesce', ['feature-state', 'division'], ['get', 'division']], selected] : true)
        : false;
      map.setPaintProperty('sa1-fill', 'fill-color', ['case', isDimmed, '#d3d3d3', ['coalesce', ['feature-state', 'color'], ['get', 'color']]]);
      map.setPaintProperty('sa1-fill', 'fill-opacity', ['case', isDimmed, 0.3,
        ['!', ['coalesce', ['feature-state', 'assigned'], ['get', 'assigned']]], 0.3,
        ['coalesce', ['feature-state', 'moved'], ['get', 'moved']], 0.75, 0.5]);
    }

    map.on('styleimagemissing', event => {
      if (!map.hasImage(event.id)) map.addImage(event.id, { width: 1, height: 1, data: new Uint8Array(4) });
    });
    map.on('error', event => {
      console.error(event.error);
      if (event.sourceId === 'sa1s') {
        $('map-status').hidden = false;
        $('map-status').textContent = 'SA1 geometry could not be loaded. Reload to try again.';
      } else {
        message('A map resource could not be loaded. Check your connection if the background map is incomplete.');
      }
    });
    map.on('load', () => {
      const basemapLayers = map.getStyle().layers;
      // Hide bus-stop names and icons, including those in ranked POI layers at other zooms.
      for (const layer of basemapLayers) {
        if (layer.type === 'symbol' && layer['source-layer'] === 'poi') {
          map.setFilter(layer.id, ['all', ...(layer.filter ? [layer.filter] : []), ['!=', ['get', 'class'], 'bus']]);
        }
      }
      const features = sa1s.map((feature, id) => ({
        type: 'Feature', id, geometry: feature.geometry,
        // Only rendering and picking properties go to workers; enrolments remain in the model.
        properties: { code: String(feature.properties.SA1_CODE21), ...featureState(String(feature.properties.SA1_CODE21)) }
      }));
      map.addSource('sa1s', {
        type: 'geojson', data: { type: 'FeatureCollection', features },
        maxzoom: 16, tolerance: 0.2,
        attribution: 'SA1 boundaries © Australian Bureau of Statistics'
      });
      // Append above the entire basemap, tinting its buildings, labels and POI icons.
      // SA1 outlines/highlights and subsequently loaded reference boundaries remain on top.
      map.addLayer({ id: 'sa1-fill', type: 'fill', source: 'sa1s', paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0.5 } });
      map.addLayer({ id: 'sa1-line', type: 'line', source: 'sa1s', paint: {
        'line-color': '#333', 'line-width': ['interpolate', ['linear'], ['zoom'], 5, 0.2, 10, 0.4, 15, 0.7]
      } });
      map.addLayer({ id: 'sa1-hover', type: 'line', source: 'sa1s', paint: {
        'line-color': '#000', 'line-width': 2,
        'line-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 1, 0]
      } });
      const sourceReady = event => {
        if (event.sourceId !== 'sa1s' || !map.isSourceLoaded('sa1s')) return;
        map.off('sourcedata', sourceReady);
        ready = true;
        updateSpotlight();
        $('map-status').hidden = true;
        $('editing-controls').disabled = false;
        $('boundary-select').disabled = false;
        document.body.dataset.ready = 'true';
      };
      map.on('sourcedata', sourceReady);
    });

    function setHover(code, shift) {
      const record = code && model.records.get(code);
      const key = record ? (shift ? `sa2:${record.sa2}` : `sa1:${code}`) : '';
      if (key === hoverKey) return;
      for (const oldCode of hoveredCodes) {
        for (const id of model.featureIds.get(oldCode)) map.setFeatureState({ source: 'sa1s', id }, { hover: false });
      }
      hoverKey = key;
      hoveredCodes = record ? (shift ? model.sa2s.get(record.sa2) : [code]) : [];
      for (const nextCode of hoveredCodes) {
        for (const id of model.featureIds.get(nextCode)) map.setFeatureState({ source: 'sa1s', id }, { hover: true });
      }
      renderHover();
    }
    function renderHover() {
      if (!hoveredCodes.length) { hoverPanel.textContent = 'Hover over an SA1'; return; }
      const record = model.records.get(hoveredCodes[0]);
      let starting = 0, projected = 0;
      const names = new Set();
      for (const code of hoveredCodes) {
        const r = model.records.get(code);
        starting += r.starting; projected += r.projected;
        names.add(model.name(r.division) || 'Unallocated');
      }
      const label = hoverKey.startsWith('sa2:') ? `(SA2) · ${hoveredCodes.length} SA1s` : record.code;
      hoverPanel.innerHTML = `<b>${escapeHTML(record.sa2Name)}</b><br><i>${escapeHTML(label)}</i><br>${escapeHTML([...names].join(', '))}<br>${fmt(starting)} current electors / ${fmt(projected)} projected electors`;
    }
    function sa1At(point) { return map.queryRenderedFeatures(point, { layers: ['sa1-fill'] })[0]?.properties.code; }
    function boundaryAt(point) {
      return activeBoundary && map.queryRenderedFeatures(point, { layers: [`${activeBoundary}-fill`] })[0];
    }
    function setBoundaryHover(feature) {
      const id = feature?.id ?? null;
      if (id === boundaryHover) return;
      if (boundaryHover !== null && activeBoundary) map.setFeatureState({ source: activeBoundary, id: boundaryHover }, { hover: false });
      boundaryHover = id;
      if (id !== null) map.setFeatureState({ source: activeBoundary, id }, { hover: true });
      else renderHover();
    }
    map.on('mousemove', event => {
      if (!ready || map.isMoving()) return;
      lastPoint = event.point;
      const boundary = boundaryAt(event.point);
      setBoundaryHover(boundary);
      const code = boundary ? null : sa1At(event.point);
      setHover(code, event.originalEvent.shiftKey);
      if (boundary) hoverPanel.textContent = boundary.properties.name;
      map.getCanvas().style.cursor = boundary || code ? 'pointer' : '';
    });
    map.on('movestart', () => {
      if (!ready) return;
      setHover(null, false); setBoundaryHover(null); lastPoint = null;
    });
    map.getCanvas().addEventListener('mouseleave', () => {
      if (!ready) return;
      setHover(null, false); setBoundaryHover(null); lastPoint = null;
      map.getCanvas().style.cursor = '';
    });
    for (const type of ['keydown', 'keyup']) document.addEventListener(type, event => {
      if (event.key === 'Shift' && lastPoint && ready && !activeBoundary) setHover(sa1At(lastPoint), type === 'keydown');
    });
    map.on('click', event => {
      if (!ready) return;
      const boundary = boundaryAt(event.point);
      if (boundary) { fitBoundary(boundary.id); return; }
      const code = sa1At(event.point);
      if (code) applyChanges(model.transfer(code, selected, event.originalEvent.shiftKey));
    });
    map.on('contextmenu', event => {
      event.originalEvent.preventDefault();
      if (!ready) return;
      const code = sa1At(event.point);
      if (code) selectDivision(model.records.get(code).division);
    });

    function applyChanges(changed) {
      if (changed.length) { dirty = true; updateFeatures(changed); }
      renderStats(); renderSelection(); renderHover();
    }
    function selectDivision(id) {
      const old = selected;
      selected = selected === id ? '' : id;
      for (const key of [old, selected]) {
        const row = rowElements.get(key);
        if (row) {
          row.classList.toggle('is-selected', key === selected);
          row.querySelector('.division-select').setAttribute('aria-pressed', String(key === selected));
        }
      }
      renderSelection(); updateSpotlight();
    }

    function renderSelection() {
      selectionPanel.hidden = !selected;
      if (!selected) return;
      const totals = model.stats(selected), count = model.divisions.size;
      selectionPanel.innerHTML = `Selected Division: <b>${escapeHTML(model.name(selected))}</b><br><br>
        Population: <b>${fmt(totals.starting)}</b> <span class="quota-metric">(${percent(totals.starting, model.startingTotal, count).toFixed(2)}%)</span><br>
        Projected: <b>${fmt(totals.projected)}</b> <span class="quota-metric">(${percent(totals.projected, model.projectedTotal, count).toFixed(2)}%)</span>`;
    }

    function buildDivisionList() {
      const fragment = document.createDocumentFragment();
      rowElements.clear();
      for (const group of model.groups) {
        const groupRow = document.createElement('div');
        groupRow.className = 'group-row' + (collapsed.has(group.name) ? ' is-collapsed' : '');
        const toggle = document.createElement('button');
        toggle.type = 'button'; toggle.className = 'group-toggle-button';
        toggle.dataset.group = group.name;
        toggle.setAttribute('aria-expanded', String(!collapsed.has(group.name)));
        toggle.addEventListener('click', () => {
          if (collapsed.has(group.name)) collapsed.delete(group.name); else collapsed.add(group.name);
          buildDivisionList();
        });
        const add = document.createElement('button');
        add.type = 'button'; add.className = 'button button-outline'; add.textContent = '+ New';
        add.setAttribute('aria-label', `New division in ${group.name}`);
        add.addEventListener('click', () => {
          const id = model.createDivision(group.name);
          collapsed.delete(group.name); dirty = true;
          buildDivisionList(); renderSelection(); editDivision(id);
        });
        groupRow.append(toggle, add); fragment.appendChild(groupRow);
        for (const id of group.divisions) {
          if (!model.divisions.has(id) || collapsed.has(group.name)) continue;
          const row = document.createElement('div');
          row.className = 'division-row' + (selected === id ? ' is-selected' : '');
          row.dataset.division = id;
          row.innerHTML = '<span class="status-dot"></span><button type="button" class="division-select"><p></p></button><button type="button" class="division-edit" title="Edit name and colour">✎</button>';
          row.querySelector('.division-select').setAttribute('aria-pressed', String(selected === id));
          row.querySelector('.division-select').addEventListener('click', () => selectDivision(id));
          row.querySelector('.division-edit').setAttribute('aria-label', `Edit ${model.name(id)}`);
          row.querySelector('.division-edit').addEventListener('click', () => editDivision(id));
          row.addEventListener('contextmenu', event => { event.preventDefault(); editDivision(id); });
          rowElements.set(id, row); fragment.appendChild(row);
        }
      }
      const unallocated = document.createElement('div');
      unallocated.id = 'unallocated-row'; unallocated.className = 'division-row unallocated-row';
      fragment.appendChild(unallocated);
      $('divisions').replaceChildren(fragment);
      renderStats();
    }

    function renderStats() {
      const count = model.divisions.size;
      let outside = 0;
      for (const [id, division] of model.divisions) {
        const totals = model.stats(id);
        const currentDev = percent(totals.starting, model.startingTotal, count);
        const projectedDev = percent(totals.projected, model.projectedTotal, count);
        const empty = totals.starting === 0 && totals.projected === 0;
        const over = currentDev > 10 || (projectedThresholds && projectedDev > 3.5);
        const under = currentDev < -10 || (projectedThresholds && projectedDev < -3.5);
        if (!empty && (over || under)) outside++;
        const row = rowElements.get(id);
        if (!row) continue;
        row.firstElementChild.className = empty ? 'status-empty' : 'status-dot ' + (over ? 'status-over' : under ? 'status-under' : 'status-ok');
        const text = row.querySelector('p');
        text.style.textDecoration = empty && division.originalName ? 'line-through' : '';
        const swatch = customColors.has(id) ? `<span class="custom-color-indicator" style="background-color:${customColors.get(id)}" title="Custom colour"></span>` : '';
        text.innerHTML = `<b>${escapeHTML(division.name)}</b> ${swatch}${fmt(totals.starting)} current <span class="quota-metric">(${currentDev.toFixed(2)}%)</span> / ${fmt(totals.projected)} projected <span class="quota-metric">(${projectedDev.toFixed(2)}%)</span>`;
      }
      document.querySelectorAll('[data-group]').forEach(button => {
        const group = model.groups.find(g => g.name === button.dataset.group);
        const total = group.divisions.reduce((sum, id) => sum + model.stats(id).starting, 0);
        const quotas = count ? total * count / model.startingTotal : 0;
        button.textContent = `${collapsed.has(group.name) ? '+' : '−'} ${group.name} · ${quotas.toFixed(2)} quotas · ${group.divisions.length} districts`;
      });
      const unallocated = model.stats('');
      $('unallocated-row').hidden = !unallocated.count;
      $('unallocated-row').innerHTML = `<p><b>UNALLOCATED</b> ${fmt(unallocated.starting)} current / ${fmt(unallocated.projected)} projected <em>(${fmt(unallocated.count)} SA1s)</em></p>`;
      $('header-info').innerHTML = `<p><b>Current Electorates:</b> ${count}</p><p><b>Quota:</b> ${count ? fmt(model.startingTotal / count) : '—'}</p>
        <p><b>Districts out of quota:</b> ${outside} (${projectedThresholds ? 'Projected Enrolment' : 'Current Enrolment'})</p>
        <p><b>Electors moved:</b> ${fmt(model.movedTotal)} (${(100 * model.movedTotal / model.startingTotal).toFixed(2)}%)</p>`;
      $('num-divisions').textContent = count;
      for (const [suffix, total, threshold] of [['enrol', model.startingTotal, 0.1], ['projected', model.projectedTotal, 0.035]]) {
        const average = count ? Math.round(total / count) : 0;
        $('avg-' + suffix).textContent = count ? fmt(average) : '—';
        $('min-' + suffix).textContent = count ? fmt(average * (1 - threshold)) : '—';
        $('max-' + suffix).textContent = count ? fmt(average * (1 + threshold)) : '—';
      }
    }

    const colorCanvas = document.createElement('canvas').getContext('2d');
    function hexColor(value) {
      colorCanvas.fillStyle = '#888888'; colorCanvas.fillStyle = value;
      return colorCanvas.fillStyle;
    }
    let useDefaultColor = false;
    function editDivision(id) {
      editingId = id; useDefaultColor = false;
      $('division-name').value = model.name(id);
      $('division-color').value = hexColor(color(id));
      $('division-error').textContent = '';
      $('division-dialog').showModal(); $('division-name').select();
    }
    $('cancel-division').addEventListener('click', () => $('division-dialog').close());
    $('division-color').addEventListener('input', () => { useDefaultColor = false; });
    $('default-color').addEventListener('click', () => {
      useDefaultColor = true;
      $('division-color').value = hexColor(getColor($('division-name').value.trim()).color);
    });
    $('division-form').addEventListener('submit', event => {
      event.preventDefault();
      try {
        model.rename(editingId, $('division-name').value);
        if (useDefaultColor) customColors.delete(editingId);
        else customColors.set(editingId, $('division-color').value);
        colors.delete(editingId); saveColors(); dirty = true;
        updateFeatures(model.codes(editingId));
        buildDivisionList(); renderSelection(); renderHover();
        $('division-dialog').close();
      } catch (error) { $('division-error').textContent = error.message; }
    });
    $('delete-division').addEventListener('click', async () => {
      const id = editingId;
      if (!await confirmAction({
        title: `Delete ${model.name(id)}?`,
        description: 'This division will be removed and all of its SA1s will become unallocated.',
        confirmLabel: 'Delete division'
      })) return;
      const changed = model.deleteDivision(id);
      if (selected === id) selected = '';
      customColors.delete(id); colors.delete(id); saveColors();
      dirty = true; buildDivisionList(); applyChanges(changed); updateSpotlight();
      $('division-dialog').close();
    });

    function allocationCSV() {
      return encodeCSV([
        ['SA1', 'OriginalDivision', 'ProposedDivision', 'CurrentEnrolment', 'ProjectedEnrolment'],
        ...[...model.records.values()].map(r => [r.code, model.name(r.original), model.name(r.division), r.starting, r.projected])
      ]);
    }
    function totalsCSV() {
      const count = model.divisions.size;
      const ids = [...model.divisions.keys()];
      if (model.stats('').count) ids.push('');
      ids.sort((a, b) => model.name(a).localeCompare(model.name(b)));
      return encodeCSV([
        ['District', 'StartingTotal', 'ProjectedTotal', 'StartingDeviationPct', 'ProjectedDeviationPct', 'AreaKm2', 'IsLarge'],
        ...ids.map(id => {
          const t = model.stats(id);
          return [model.name(id) || 'UNALLOCATED', Math.round(t.starting), Math.round(t.projected), percent(t.starting, model.startingTotal, count).toFixed(2), percent(t.projected, model.projectedTotal, count).toFixed(2), t.area.toFixed(2), 'NO'];
        })
      ]);
    }
    function downloadCSV(csv, suffix) {
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${window.EVENT_NAME}_${suffix}_${new Date().toISOString().replace(/[:.]/g, '-')}.csv`;
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    function importCSV(text) {
      const rows = parseCSV(text);
      if (rows.length < 2) throw new Error('CSV appears empty.');
      const header = rows.shift().map(value => value.trim());
      const codeIndex = header.indexOf('SA1');
      const divisionIndex = ['ProposedDivision', 'CurrentDivision', 'Division'].map(name => header.indexOf(name)).find(index => index >= 0);
      if (codeIndex < 0 || divisionIndex === undefined) throw new Error('CSV needs SA1 and ProposedDivision, CurrentDivision or Division columns.');
      const assignments = new Map();
      let skipped = 0;
      for (const row of rows) {
        if (row.length <= Math.max(codeIndex, divisionIndex)) throw new Error('CSV contains a row with missing columns.');
        const code = row[codeIndex].trim();
        if (!model.records.has(code)) { skipped++; continue; }
        const name = row[divisionIndex].trim();
        assignments.set(code, name === 'null' || name === 'undefined' ? '' : name);
      }
      const idsByName = new Map([...model.divisions].map(([id, d]) => [d.name, id]));
      // Restore a deleted original division when it is present in an imported allocation.
      for (const name of new Set(assignments.values())) {
        if (!name || idsByName.has(name)) continue;
        const original = [...model.originalDivisions.values()].find(d => d.name === name);
        if (original) {
          model.divisions.set(original.id, original); idsByName.set(name, original.id);
          const group = model.originalGroups.find(g => g.divisions.includes(original.id));
          model.groups.find(g => g.name === group.name).divisions.push(original.id);
        } else {
          const groupName = 'IMPORTED DIVISIONS';
          if (!model.groups.some(g => g.name === groupName)) model.groups.push({ name: groupName, divisions: [] });
          idsByName.set(name, model.createDivision(groupName, name));
        }
      }
      const changed = model.assign(new Map([...assignments].map(([code, name]) => [code, name ? idsByName.get(name) : ''])));
      buildDivisionList(); applyChanges(changed); updateSpotlight();
      message(`Import complete: ${fmt(assignments.size)} SA1s read, ${fmt(changed.length)} changed${skipped ? `, ${fmt(skipped)} unknown SA1s skipped` : ''}.`);
      return { applied: assignments.size, changed: changed.length, skipped };
    }
    $('import-file').addEventListener('change', async event => {
      const file = event.target.files[0];
      if (!file) return;
      try { importCSV(await file.text()); }
      catch (error) { message(`Import failed: ${error.message}`); }
      event.target.value = '';
    });
    document.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', async () => {
      switch (button.dataset.action) {
        case 'stats':
          projectedThresholds = !projectedThresholds;
          button.setAttribute('aria-pressed', String(projectedThresholds)); renderStats(); break;
        case 'spotlight':
          spotlight = !spotlight;
          button.textContent = spotlight ? 'Exit Spotlight' : 'Spotlight';
          button.setAttribute('aria-pressed', String(spotlight)); updateSpotlight(); break;
        case 'export': downloadCSV(allocationCSV(), 'proposal'); dirty = false; break;
        case 'totals': downloadCSV(totalsCSV(), 'district_totals'); break;
        case 'import': $('import-file').click(); break;
        case 'clear':
          if (await confirmAction({
            title: 'Clear all division allocations?',
            description: 'Every SA1 will become unallocated. This will clear your current allocation of SA1s to divisions.',
            confirmLabel: 'Clear allocations'
          })) {
            selected = ''; const changed = model.assign(new Map([...model.records.keys()].map(code => [code, ''])));
            buildDivisionList(); applyChanges(changed); updateSpotlight();
          }
          break;
        case 'reset':
          if (await confirmAction({
            title: 'Reset SA1s?',
            description: 'All SA1s will return to their original divisions, and any new divisions will be removed.',
            confirmLabel: 'Reset SA1s'
          })) {
            const changed = model.resetAssignments();
            if (!model.divisions.has(selected)) selected = '';
            dirty = true; buildDivisionList(); applyChanges(changed); updateSpotlight();
          }
          break;
        case 'reset-names':
          if (await confirmAction({
            title: 'Reset division names?',
            description: 'Renamed original divisions will return to their original names.',
            confirmLabel: 'Reset names'
          })) {
            try {
              model.resetNames(); colors.clear(); dirty = true;
              updateFeatures(model.records.keys()); buildDivisionList(); renderSelection(); renderHover();
            } catch (error) { message(error.message); }
          }
          break;
      }
    }));

    function loadScript(entry) {
      if (!scriptPromises.has(entry.id)) {
        scriptPromises.set(entry.id, new Promise((resolve, reject) => {
          const script = document.createElement('script'); script.src = entry.path;
          script.onload = resolve;
          script.onerror = () => { script.remove(); scriptPromises.delete(entry.id); reject(new Error(`Could not load ${entry.name}. Select it again to retry.`)); };
          document.head.appendChild(script);
        }));
      }
      return scriptPromises.get(entry.id);
    }
    function geometryBounds(geometry) {
      const bounds = new maplibregl.LngLatBounds();
      function extend(coordinates) {
        if (typeof coordinates[0] === 'number') bounds.extend(coordinates);
        else coordinates.forEach(extend);
      }
      extend(geometry.coordinates);
      return bounds;
    }
    async function selectBoundary(id) {
      const request = ++boundaryRequest;
      setBoundaryHover(null);
      if (activeBoundary) for (const suffix of ['fill', 'line', 'labels']) map.setLayoutProperty(`${activeBoundary}-${suffix}`, 'visibility', 'none');
      activeBoundary = null; setHover(null, false); hoverPanel.textContent = 'Hover over an SA1';
      $('boundary-search').hidden = true; $('boundary-search').value = '';
      $('boundary-results').replaceChildren(); $('boundary-status').textContent = '';
      if (!id) return;
      const entry = window.DIVISION_MAPS.find(item => item.id === id);
      $('boundary-status').textContent = `Loading ${entry.name}…`;
      try {
        await loadScript(entry);
        if (request !== boundaryRequest) return;
        if (!boundaryCache.has(id)) {
          const geo = entry.getData();
          const features = geo.features.map((feature, index) => ({
            type: 'Feature', id: index, geometry: feature.geometry,
            properties: { name: feature.properties.name || feature.properties.Name || `Boundary ${index + 1}` }
          }));
          boundaryCache.set(id, features.map(feature => ({ name: feature.properties.name, bounds: geometryBounds(feature.geometry) })));
          map.addSource(id, { type: 'geojson', data: { type: 'FeatureCollection', features } });
          map.addLayer({ id: `${id}-fill`, type: 'fill', source: id, paint: { 'fill-color': '#2b62c6', 'fill-opacity': 0.035 } });
          map.addLayer({ id: `${id}-line`, type: 'line', source: id, paint: {
            'line-color': ['case', ['boolean', ['feature-state', 'hover'], false], 'green', '#2b62c6'],
            'line-width': ['case', ['boolean', ['feature-state', 'hover'], false], 4, 1.5]
          } });
          map.addLayer({ id: `${id}-labels`, type: 'symbol', source: id,
            layout: { 'text-field': ['get', 'name'], 'text-font': ['Noto Sans Regular'], 'text-size': 12 },
            paint: { 'text-color': '#173a6a', 'text-halo-color': '#fff', 'text-halo-width': 1.5 }
          });
        } else {
          for (const suffix of ['fill', 'line', 'labels']) map.setLayoutProperty(`${id}-${suffix}`, 'visibility', 'visible');
        }
        activeBoundary = id;
        $('boundary-search').hidden = false;
        $('boundary-status').textContent = 'Click a boundary to zoom. Choose None to edit SA1s.';
      } catch (error) {
        if (request === boundaryRequest) $('boundary-status').textContent = error.message;
      }
    }
    function fitBoundary(id) {
      const boundary = boundaryCache.get(activeBoundary)?.[id];
      if (boundary) map.fitBounds(boundary.bounds, { padding: 50, duration: 600 });
    }
    $('boundary-select').addEventListener('change', event => { selectBoundary(event.target.value); });
    $('boundary-search').addEventListener('input', event => {
      $('boundary-results').replaceChildren();
      const query = event.target.value.trim().toLocaleLowerCase();
      if (!query || !activeBoundary) return;
      let count = 0;
      boundaryCache.get(activeBoundary).forEach((boundary, id) => {
        if (count >= 10 || !boundary.name.toLocaleLowerCase().includes(query)) return;
        count++;
        const result = document.createElement('button'); result.type = 'button'; result.textContent = boundary.name;
        result.addEventListener('click', () => { fitBoundary(id); $('boundary-results').replaceChildren(); });
        $('boundary-results').appendChild(result);
      });
      if (!count) $('boundary-results').textContent = 'No matching boundaries';
    });

    buildDivisionList();
    // Small explicit API for diagnostics and allocation interchange, independent of map internals.
    window.redistributionApp = {
      map, model, allocationCSV, totalsCSV, importCSV,
      get ready() { return ready; }, get selectedDivision() { return selected; }
    };
  }
})();
