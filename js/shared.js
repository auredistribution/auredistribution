// Shared utility & rendering logic extracted from index.html

// CONFIG CONSTANTS (can be overridden per event page before including this file if needed)
window.EVENT_NAME = window.EVENT_NAME || 'redistribution';
window.DEFAULT_STARTING_COORDS = window.DEFAULT_STARTING_COORDS || [-21.5, 146.5];
window.NUM_DIVISIONS = window.NUM_DIVISIONS || 93;
window.STATE_STARTING_TOTAL = window.STATE_STARTING_TOTAL || 3744585;
window.STATE_PROJECTED_TOTAL = window.STATE_PROJECTED_TOTAL || 4155112;
window.ENROLMENT_THRESHOLD = window.ENROLMENT_THRESHOLD || 0.1;
window.PROJECTION_THRESHOLD = window.PROJECTION_THRESHOLD || 0.1;
window.LARGE_DISTRICT_AREA_THRESHOLD = window.LARGE_DISTRICT_AREA_THRESHOLD || 0; // km2
window.LARGE_DISTRICT_VIRTUAL_ELECTOR_RATE = window.LARGE_DISTRICT_VIRTUAL_ELECTOR_RATE || 0.02; // per km2

// Global state containers (event pages should supply `data`, `sa1s`, `qld_2017` before calling initSharedApp)
let selectedDivision = "";
let newDivisionCount = 0;
let useProjectedThresholds = false;
let divisionsAndGroups = window.divisionsAndGroups || [];

function _syncDivisionsAndGroups() {
  if (Array.isArray(window.divisionsAndGroups) && window.divisionsAndGroups.length && divisionsAndGroups !== window.divisionsAndGroups) {
    divisionsAndGroups = window.divisionsAndGroups; // adopt latest reference
  }
}

function getColor(division) { // same mapping as original
  switch (division) {
    case "SPLIT":
      return { color: "white" };
    case "Warrego":
    case "Ferny Grove":
    case "Capricornia":
      return { color: "silver" };
    case "Gregory":
    case "Cooper":
    case "Herbert":
      return { color: "darkslategray" };
    case "Traeger":
    case "Maiwar":
    case "Kennedy":
      return { color: "darkolivegreen" };
    case "Cook":
    case "Moggill":
    case "Leichhardt":
      return { color: "sienna" };
    case "Barron River":
    case "Ipswich West":
    case "Dawson":
      return { color: "seagreen" };
    case "Cairns":
    case "Ipswich":
    case "Flynn":
      return { color: "midnightblue" };
    case "Mulgrave":
    case "Bundamba":
    case "Hinkler":
      return { color: "darkred" };
    case "Hill":
    case "Jordan":
    case "Wide Bay":
      return { color: "olive" };
    case "Hinchinbrook":
    case "Inala":
    case "Groom":
      return { color: "lightslategray" };
    case "Thuringowa":
    case "Mount Ommaney":
    case "Maranoa":
      return { color: "green" };
    case "Townsville":
    case "Miller":
    case "Wright":
      return { color: "rosybrown" };
    case "Mundingburra":
    case "South Brisbane":
    case "Fisher":
      return { color: "teal" };
    case "Burdekin":
    case "Greenslopes":
    case "Fairfax":
      return { color: "darkkhaki" };
    case "Whitsunday":
    case "Bulimba":
    case "Dickson":
      return { color: "peru" };
    case "Mackay":
    case "Lytton":
    case "Longman":
      return { color: "steelblue" };
    case "Mirani":
    case "Chatsworth":
    case "Lilley":
      return { color: "yellowgreen" };
    case "Rockhampton":
    case "Capalaba":
    case "Brisbane":
      return { color: "indianred" };
    case "Keppel":
    case "Oodgeroo":
    case "Petrie":
      return { color: "darkblue" };
    case "Gladstone":
    case "Redlands":
    case "Ryan":
      return { color: "limegreen" };
    case "Callide":
    case "Springwood":
    case "Blair":
      return { color: "goldenrod" };
    case "Burnett":
    case "Mansfield":
    case "Oxley":
      return { color: "#7f007f" };
    case "Bundaberg":
    case "Toohey":
    case "Bonner":
      return { color: "darkseagreen" };
    case "Hervey Bay":
    case "Algester":
    case "Griffith":
      return { color: "#b03060" };
    case "Maryborough":
    case "Stretton":
    case "Moreton":
      return { color: "mediumturquoise" };
    case "Gympie":
    case "Woodridge":
    case "Bowman":
      return { color: "darkorchid" };
    case "Noosa":
    case "Waterford":
    case "Forde":
      return { color: "red" };
    case "Nicklin":
    case "Macalister":
    case "Rankin":
      return { color: "darkorange" };
    case "Ninderry":
    case "Logan":
    case "Fadden":
      return { color: "gold" };
    case "Maroochydore":
    case "Coomera":
      return { color: "yellow" };
    case "Buderim":
    case "Theodore":
    case "Moncrieff":
      return { color: "mediumblue" };
    case "Kawana":
    case "Broadwater":
      return { color: "lime" };
    case "Caloundra":
    case "Bonney":
      return { color: "springgreen" };
    case "Glass House":
    case "Gaven":
      return { color: "darksalmon" };
    case "Pumicestone":
    case "Southport":
      return { color: "crimson" };
    case "Morayfield":
    case "Surfers Paradise":
      return { color: "deepskyblue" };
    case "Kurwongbah":
    case "Mermaid Beach":
      return { color: "blue" };
    case "Bancroft":
    case "Burleigh":
      return { color: "#a020f0" };
    case "Murrumba":
    case "Currumbin":
      return { color: "greenyellow" };
    case "Redcliffe":
    case "Mudgeeraba":
      return { color: "orchid" };
    case "Sandgate":
    case "Scenic Rim":
    case "McPherson":
      return { color: "coral" };
    case "Nudgee":
    case "Lockyer":
      return { color: "fuchsia" };
    case "Clayfield":
    case "Nanango":
      return { color: "dodgerblue" };
    case "McConnel":
    case "Condamine":
      return { color: "palevioletred" };
    case "Stafford":
    case "Toowoomba North":
      return { color: "plum" };
    case "Aspley":
    case "Toowoomba South":
      return { color: "skyblue" };
    case "Pine Rivers":
    case "Southern Downs":
      return { color: "deeppink" };
    case "Everton":
      return { color: "mediumslateblue" };
    case "(new 1)":
      return { color: "wheat" };
    case "(new 2)":
      return { color: "palegreen" };
    case "(new 3)":
      return { color: "aquamarine" };
    case "(new 4)":
      return { color: "hotpink" };
    case "(new 5)":
      return { color: "pink" };
    default:
      return { color: "black" };
  }
}

function formatNumber(number) {
  if (number > 1000000) {
    number = number.toString();
    return `${number.slice(0, -6)},${number.slice(-6, -3)},${number.slice(-3)}`;
  } else if (number > 1000) {
    number = number.toString();
    return `${number.slice(0, -3)},${number.slice(-3)}`;
  } else {
    return number;
  }
}

function initSharedApp() {

      // Populate dynamic text placeholders once DOM & globals are ready
    (function populateContextLine(){
      if(typeof window.NUM_DIVISIONS === 'undefined' || typeof window.STATE_STARTING_TOTAL === 'undefined') return;
      const fmt = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      const avg = Math.round(window.STATE_STARTING_TOTAL / window.NUM_DIVISIONS);
      const min = Math.round(avg * (1 - window.ENROLMENT_THRESHOLD));
      const max = Math.round(avg * (1 + window.ENROLMENT_THRESHOLD));
      const avgProjected = Math.round(window.STATE_PROJECTED_TOTAL / window.NUM_DIVISIONS);
      const minProjected = Math.round(avgProjected * (1 - window.PROJECTION_THRESHOLD));
      const maxProjected = Math.round(avgProjected * (1 + window.PROJECTION_THRESHOLD));
      const nd = document.getElementById('num-divisions');
      if(!nd) return; // safety
      document.getElementById('num-divisions').textContent = window.NUM_DIVISIONS;
      document.getElementById('avg-enrol').textContent = fmt(avg);
      document.getElementById('min-enrol').textContent = fmt(min);
      document.getElementById('max-enrol').textContent = fmt(max);
      document.getElementById('avg-projected').textContent = fmt(avgProjected);
      document.getElementById('min-projected').textContent = fmt(minProjected);
      document.getElementById('max-projected').textContent = fmt(maxProjected);
      document.getElementById('proj-threshold').textContent =
        (window.PROJECTION_THRESHOLD) === 0 ? '0' :
        (window.PROJECTION_THRESHOLD * 100 % 1 === 0 ? (window.PROJECTION_THRESHOLD * 100).toFixed(0) : (window.PROJECTION_THRESHOLD * 100).toFixed(1));
    })();

  _syncDivisionsAndGroups();
  if (typeof sa1s === 'undefined' || typeof data === 'undefined') {
    console.error('Shared init aborted: expected globals `sa1s` and `data` are missing.');
    return;
  }
  // Map starting divisions onto feature properties
  sa1s.forEach(sa1 => {
    const sa1Name = sa1.properties["SA1_CODE21"]; // assumes ABS 2021 code property name consistent
    sa1.properties.previousDivision = data[sa1Name].previousDivision;
    sa1.properties.division = data[sa1Name].currentDivision;
  });

  // Map setup
  // Performance: prefer Canvas rendering (faster for thousands of polygons, esp. Safari)
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const map = L.map("map", { preferCanvas: true }).setView(window.DEFAULT_STARTING_COORDS, 6);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a>"
  }).addTo(map);
  map.zoomControl.setPosition('bottomright');

  const sharedCanvasRenderer = L.canvas({ padding: 0.5 });
  const current_boundaries = new L.GeoJSON(current_boundaries_data, { renderer: sharedCanvasRenderer, style: () => ({ weight: 1.2, color: '#2b62c6' }), onEachFeature: onEachElectorate });
  const overlayMaps = { "Current Boundaries": current_boundaries };
  const current_boundaries_search = new L.Control.Search({ layer: current_boundaries, propertyName: 'name', position: 'bottomleft' });
  L.control.layers(null, overlayMaps, { collapsed: false, position: 'bottomleft' }).addTo(map);
  map.on('overlayadd', e => { if (e.layer === current_boundaries && !current_boundaries_search._map) map.addControl(current_boundaries_search); });
  map.on('overlayremove', e => { if (e.layer === current_boundaries && current_boundaries_search._map) map.removeControl(current_boundaries_search); });

  function clickFeature(e) {
    const thisLayer = e.target;
    if (!selectedDivision) return;
    let layers;
    if (e.originalEvent.shiftKey) {
      layers = features.getLayers().filter(l => (l.feature.properties["SA2_NAME21"] == thisLayer.feature.properties["SA2_NAME21"] && l.feature.properties.division == thisLayer.feature.properties.division));
    } else {
      layers = [thisLayer];
    }
    layers.forEach(layer => {
      const sa1Name = layer.feature.properties["SA1_CODE21"]; const originalDivision = data[sa1Name].previousDivision; const currentDivision = data[sa1Name].currentDivision;
      if (selectedDivision == currentDivision) {
        if (selectedDivision != originalDivision) {
          layer.feature.properties.division = originalDivision; data[sa1Name].currentDivision = originalDivision; layer.setStyle({ fillColor: getColor(originalDivision).color, fillOpacity: 0.5 });
        }
      } else {
        layer.feature.properties.division = selectedDivision; data[sa1Name].currentDivision = selectedDivision; layer.setStyle({ fillColor: getColor(selectedDivision).color, fillOpacity: (selectedDivision == originalDivision) ? 0.5 : 0.75 });
      }
    });
    renderDivisionList();
  }
  function highlightFeature(e) { const layer = e.target; infoPanel.update(layer.feature.properties); layer.setStyle({ weight: 2, color: '#000' }); }
  function unhighlightFeature(e) { const layer = e.target; infoPanel.update(null); layer.setStyle({ weight: 0.5, color: '#333' }); }
  function onEachFeature(feature, layer) { layer.on({ click: clickFeature, mouseover: highlightFeature, mouseout: unhighlightFeature }); }
  function highlightElectorate(e) { const layer = e.target; layer.setStyle({ weight: 4, color: 'green' }); if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) layer.bringToFront(); info.update(layer.feature.properties); }
  function resetHighlight(e) { e.target.setStyle({ weight: 2, color: 'blue' }); }
  function zoomToFeature(e) { map.fitBounds(e.target.getBounds()); }
  function onEachElectorate(feature, layer) { layer.on({ mouseover: highlightElectorate, mouseout: resetHighlight, click: zoomToFeature }); if(!isSafari){ layer.bindTooltip(feature.properties.name, { permanent: true, direction: 'center', className: 'countryLabel' }); } }

  const features = L.geoJSON(sa1s, {
    renderer: sharedCanvasRenderer,
    style: f => ({ fillColor: getColor(f.properties.division).color, fillOpacity: 0.5, weight: 0.4, color: '#333' }),
    onEachFeature
  }).addTo(map);
  // Expose for external helpers (import routine defined outside init)
  window._featuresLayer = features;

  // Info panel control
  const infoPanel = L.control();
  infoPanel.onAdd = function () { this._div = L.DomUtil.create('div', 'info-panel'); this.update(); return this._div; };
  infoPanel.update = function (props) { if (props) { const code = props["SA1_CODE21"]; this._div.innerHTML = `<b>${props["SA2_NAME21"]}</b><br/><i>${code}</i><br/>${props.division}<br/>${data[code].startingEnrolment} current electors / ${data[code].projectedEnrolment} projected electors`; } else { this._div.innerHTML = 'Hover over a SA1'; } };
  infoPanel.addTo(map);

  // Expose for event pages needing operations
  window._sharedMapCtx = { map, features, infoPanel };
  window.renderDivisionList = renderDivisionList; // attach for reuse

  function createNewDivision(groupName) {
    const idx = divisionsAndGroups.findIndex(e => e.name == groupName);
    divisionsAndGroups.splice(idx + divisionsAndGroups[idx].divisions.length + 1, 0, { type: 'division', name: `(new ${newDivisionCount + 1})` });
    divisionsAndGroups[idx].divisions.push(`(new ${newDivisionCount + 1})`);
    newDivisionCount++; renderDivisionList();
  }
  window.createNewDivision = createNewDivision;
  window.resetDivisions = function () {
    features.getLayers().forEach(layer => {
      const code = layer.feature.properties["SA1_CODE21"]; const original = data[code].previousDivision; layer.feature.properties.division = original; data[code].currentDivision = original; layer.setStyle({ fillColor: getColor(original).color, fillOpacity: 0.5 });
    });
    divisionsAndGroups = divisionsAndGroups.filter(e => e.name.slice(0, 4) !== '(new');
    divisionsAndGroups.forEach(e => { if (e.type == 'group') e.divisions = e.divisions.filter(d => d.slice(0, 4) !== '(new'); });
    renderDivisionList();
  };
  window.toggleProjectedThresholds = function () { useProjectedThresholds = !useProjectedThresholds; renderDivisionList(); };

  //======================//
  // RENDER DIVISION LIST //
  //======================//
  function renderDivisionList() {
    _syncDivisionsAndGroups();
    const divisionList = document.getElementById('divisions');
    if (!divisionList) return;
    divisionList.innerHTML = '';

    let outsideOfQuotaDivisions = 0;

    divisionsAndGroups.forEach(entry => {
      if (entry.type === 'division') {
        const division = entry.name;
        const divisionSa1s = Object.keys(data).filter(sa1 => (data[sa1].currentDivision === division));
        const area = divisionSa1s.map(sa1 => data[sa1].area).reduce((a, b) => a + b, 0);
        const isLargeDistrict = (LARGE_DISTRICT_AREA_THRESHOLD > 0) && (area > LARGE_DISTRICT_AREA_THRESHOLD);
        const largeAdj = isLargeDistrict ? area * LARGE_DISTRICT_VIRTUAL_ELECTOR_RATE : 0;
        const startingTotal = divisionSa1s.map(sa1 => data[sa1].startingEnrolment).reduce((a, b) => a + b, 0) + largeAdj;
        const projectedTotal = divisionSa1s.map(sa1 => data[sa1].projectedEnrolment).reduce((a, b) => a + b, 0) + largeAdj;
        const startingDeviation = 100 * startingTotal / (STATE_STARTING_TOTAL / NUM_DIVISIONS) - 100;
        const projectedDeviation = 100 * projectedTotal / (STATE_PROJECTED_TOTAL / NUM_DIVISIONS) - 100;

        let statusClass = 'status-ok';
        if (startingTotal === 0 && projectedTotal === 0) {
          statusClass = 'status-empty';
        } else if (startingDeviation > (ENROLMENT_THRESHOLD * 100) || (useProjectedThresholds && projectedDeviation > (PROJECTION_THRESHOLD * 100))) {
          statusClass = 'status-over';
          outsideOfQuotaDivisions++;
        } else if (startingDeviation < -(ENROLMENT_THRESHOLD * 100) || (useProjectedThresholds && projectedDeviation < -(PROJECTION_THRESHOLD * 100))) {
          statusClass = 'status-under';
          outsideOfQuotaDivisions++;
        }

        const row = document.createElement('div');
        row.className = 'division-row' + (division === selectedDivision ? ' is-selected' : '');

        // Status indicator
        const status = document.createElement('div');
        if (statusClass === 'status-empty') {
          status.className = 'status-empty';
        } else {
          status.className = 'status-dot ' + statusClass;
        }
        row.appendChild(status);

        // Text block
        const text = document.createElement('p');
        const startDevStr = `${startingDeviation.toFixed(2)}%`;
        const projDevStr = `${projectedDeviation.toFixed(2)}%`;
        const labelLarge = isLargeDistrict ? '<span class="large-flag">LARGE</span>' : '';
        const strikeStyle = (division.slice(0, 4) !== '(new' && startingTotal === 0 && projectedTotal === 0) ? 'text-decoration:line-through;' : '';
        text.style = strikeStyle;
        text.innerHTML = `<b>${division}</b> ${formatNumber(startingTotal.toFixed(0))} current <span class="quota-metric">(${startDevStr})</span> / ${formatNumber(projectedTotal.toFixed(0))} projected <span class="quota-metric">(${projDevStr})</span> ${labelLarge}`;
        row.appendChild(text);

        row.onclick = () => {
          selectedDivision = (selectedDivision === division) ? '' : division;
          renderDivisionList();
        };

        divisionList.appendChild(row);
      } else if (entry.type === 'group') {
        const groupRow = document.createElement('div');
        groupRow.className = 'group-row';
        const groupStartingTotal = Object.keys(data)
          .filter(sa1 => entry.divisions.includes(data[sa1].currentDivision))
          .map(sa1 => data[sa1].startingEnrolment).reduce((a, b) => a + b, 0);
        const text = document.createElement('p');
        text.innerHTML = `${entry.name} · ${(groupStartingTotal / (STATE_STARTING_TOTAL / NUM_DIVISIONS)).toFixed(2)} quotas · ${entry.divisions.length} districts`;
        groupRow.appendChild(text);
        const newBtn = document.createElement('button');
        newBtn.type = 'button';
        newBtn.className = 'button button-outline';
        newBtn.textContent = '+ New';
        newBtn.onclick = () => createNewDivision(entry.name);
        groupRow.appendChild(newBtn);
        divisionList.appendChild(groupRow);
      }
    });

    //====================//
    // RENDER HEADER INFO //
    //====================//
    var headerInfo = document.getElementById("header-info")

    headerInfo.innerHTML = ""

    var divisionsOutOfQuotaDetails = document.createElement("p")
    divisionsOutOfQuotaDetails.innerHTML = `<b>Districts out of quota:</b> ${outsideOfQuotaDivisions} (${useProjectedThresholds ? "Projected Enrolment" : "Current Enrolment"})`
    headerInfo.appendChild(divisionsOutOfQuotaDetails)

    var electorsMoved = Object.keys(data)
      .filter(sa1 => data[sa1].currentDivision != data[sa1].previousDivision)
      .map(sa1 => useProjectedThresholds ? data[sa1].projectedEnrolment : data[sa1].startingEnrolment)
      .reduce((a, b) => a + b, 0);

    var electorsMovedDetails = document.createElement("p")
    electorsMovedDetails.innerHTML = `<b>Electors moved:</b> ${formatNumber(electorsMoved)} (${(100 * electorsMoved / STATE_STARTING_TOTAL).toFixed(2)}%)`
    headerInfo.appendChild(electorsMovedDetails)
  }
  window.renderDivisionList = renderDivisionList;
  renderDivisionList();
}

    //==================//
    // EXPORT TO CSV //
    //==================//
    function exportCSV() {
      let csv = "SA1,OriginalDivision,ProposedDivision,CurrentEnrolment,ProjectedEnrolment\n";
      for (const sa1 in data) {
        const prev = data[sa1].previousDivision;
        const curr = data[sa1].currentDivision;
        const enrolment = data[sa1].startingEnrolment;
        const projected = data[sa1].projectedEnrolment;
        csv += `${sa1},${prev},${curr},${enrolment},${projected}\n`;
      }
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const now = new Date();
      const pad = n => String(n).padStart(2, '0');
      const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
      a.download = `${window.EVENT_NAME}_proposal_${timestamp}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    //=================================//
    // EXPORT PER-DISTRICT TOTALS TO CSV //
    //=================================//
    function exportDivisionTotalsCSV() {
      // Build a map of division -> { startingTotal, projectedTotal, area }
      const divisionTotals = {}; // key: division name
      for (const sa1 in data) {
        const division = data[sa1].currentDivision;
        if (!divisionTotals[division]) {
          divisionTotals[division] = { starting: 0, projected: 0, area: 0 };
        }
        divisionTotals[division].starting += data[sa1].startingEnrolment;
        divisionTotals[division].projected += data[sa1].projectedEnrolment;
        divisionTotals[division].area += data[sa1].area;
      }

      // Apply large district virtual electors (2% of area) where relevant (>100,000 km^2)
      Object.keys(divisionTotals).forEach(div => {
        const record = divisionTotals[div];
        if ((LARGE_DISTRICT_AREA_THRESHOLD > 0) && (record.area > LARGE_DISTRICT_AREA_THRESHOLD)) {
          const adjustment = record.area * LARGE_DISTRICT_VIRTUAL_ELECTOR_RATE; // as per logic in renderDivisionList
          record.starting += adjustment;
          record.projected += adjustment;
        }
      });

      let csv = "District,StartingTotal,ProjectedTotal,StartingDeviationPct,ProjectedDeviationPct,AreaKm2,IsLargeDistrict\n";
      const avgStarting = STATE_STARTING_TOTAL / NUM_DIVISIONS;
      const avgProjected = STATE_PROJECTED_TOTAL / NUM_DIVISIONS;
      Object.keys(divisionTotals).sort().forEach(div => {
        const rec = divisionTotals[div];
        const startingDev = 100 * rec.starting / avgStarting - 100;
        const projectedDev = 100 * rec.projected / avgProjected - 100;
        const isLarge = (LARGE_DISTRICT_AREA_THRESHOLD > 0) && (rec.area > LARGE_DISTRICT_AREA_THRESHOLD) ? "YES" : "NO";
        csv += `${div},${Math.round(rec.starting)},${Math.round(rec.projected)},${startingDev.toFixed(2)},${projectedDev.toFixed(2)},${rec.area.toFixed(2)},${isLarge}\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const now = new Date();
      const pad = n => String(n).padStart(2, '0');
      const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
      a.href = url;
      a.download = `${window.EVENT_NAME}_district_totals_${timestamp}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    //==================//
    // IMPORT FROM CSV  //
    //==================//
    function triggerImport() {
      document.getElementById('import-file').click();
    }

    document.getElementById('import-file').addEventListener('change', handleImport, false);

    function handleImport(evt) {
      const file = evt.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function (e) {
        parseDivisionCSV(e.target.result);
      };
      reader.readAsText(file);
      // reset input so same file can be chosen again if needed
      evt.target.value = "";
    }

    function parseDivisionCSV(text) {
      const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
      if (lines.length < 2) { alert('CSV appears empty'); return; }
      const header = lines[0].split(',').map(h => h.trim());
      const sa1Idx = header.indexOf('SA1');
      // Accept either ProposedDivision, CurrentDivision, Division as the target column name
      let currIdx = header.indexOf('ProposedDivision');
      if (currIdx === -1) currIdx = header.indexOf('CurrentDivision');
      if (currIdx === -1) currIdx = header.indexOf('Division');
      if (sa1Idx === -1 || currIdx === -1) { alert('Header must include SA1 and either ProposedDivision, CurrentDivision, or Division'); return; }

      const updates = {};
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',');
        if (cols.length <= currIdx) continue;
        const sa1 = cols[sa1Idx].trim();
        const newDiv = cols[currIdx].trim();
        if (!sa1 || !newDiv) continue;
        updates[sa1] = newDiv;
      }

      let applied = 0, skipped = 0;
      const layerCollection = window._featuresLayer || (window._sharedMapCtx && window._sharedMapCtx.features);
      if(!layerCollection){ alert('Map not initialised yet; please try import again after the map loads.'); return; }
      layerCollection.getLayers().forEach(layer => {
        const sa1Name = layer.feature.properties['SA1_CODE21'];
        if (updates.hasOwnProperty(sa1Name) && data[sa1Name]) {
          const newDiv = updates[sa1Name];
          data[sa1Name].currentDivision = newDiv;
          layer.feature.properties.division = newDiv;
          const originalDivision = data[sa1Name].previousDivision;
          layer.setStyle({
            fillColor: getColor(newDiv).color,
            fillOpacity: (newDiv == originalDivision) ? 0.5 : 0.75
          });
          applied++;
        } else if (updates.hasOwnProperty(sa1Name)) {
          skipped++;
        }
      });

      // Re-render division list with new totals
      renderDivisionList();
      alert(`Import complete: ${applied} SA1s updated${skipped ? ', ' + skipped + ' skipped (not found)' : ''}.`);
    }


// Simple tab show helper (can be reused)
function showTab(tabId) { document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');['tab-header-btn', 'tab-divisions-btn'].forEach(id => { const b = document.getElementById(id); if (b) b.classList.remove('button-grey'); }); const target = document.getElementById(tabId); if (target) target.style.display = ''; if (tabId === 'header-tab') { const btn = document.getElementById('tab-header-btn'); if (btn) btn.classList.add('button-grey'); } if (tabId === 'divisions-tab') { const btn = document.getElementById('tab-divisions-btn'); if (btn) btn.classList.add('button-grey'); } }
window.showTab = showTab;
