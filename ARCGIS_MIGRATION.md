# ArcGIS Dynamic Loading Migration Guide

## Overview

The Australian Redistribution Tool now supports **dynamic loading of SA1 boundaries** from the ABS ArcGIS REST API instead of using large static JavaScript files. This reduces repository size, ensures always-current data, and eliminates the need to manually download and process SA1 shapefiles.

## Benefits

- **No large static files**: Eliminates 12MB+ sa1_2021_*.js files from repository
- **Always current**: Fetches latest SA1 boundaries directly from ABS
- **Automatic caching**: Uses localStorage to cache results, reducing API calls
- **Progressive loading**: Shows loading progress with visual feedback
- **Resilient**: Includes retry logic for network failures

## How It Works

1. Page loads without SA1 geometry script
2. `initSharedApp()` detects missing `sa1s` global
3. If `ARCGIS_STATE_CODE` is set, it fetches SA1s from ArcGIS API
4. Results are cached in localStorage for subsequent loads
5. SA1 geometries are merged with enrolment data and rendered

## State Codes

The ArcGIS API uses numeric state codes (STE_CODE21):

| State/Territory | Code |
|-----------------|------|
| NSW | 1 |
| VIC | 2 |
| QLD | 3 |
| SA | 4 |
| WA | 5 |
| TAS | 6 |
| NT | 7 |
| ACT | 8 |
| Other Territories | 9 |

## Migration Steps

### 1. Update HTML Configuration

In your redistribution page (e.g., `fed_qld_2026.html`), add the state code:

```javascript
window.ARCGIS_STATE_CODE = '3'; // Queensland
```

### 2. Remove Static SA1 Geometry Script

**Remove** the line that loads the SA1 geometry file:

```html
<!-- REMOVE THIS LINE -->
<script src="data/sa1_2021_qld.js"></script>
```

**Keep** the SA1 division assignment data file (contains enrolment):

```html
<!-- KEEP THIS LINE -->
<script src="data/sa1_2021_fed_qld_2018.js"></script>
```

### 3. Update initSharedApp() Call

The function is now async, but you can call it normally:

```javascript
initSharedApp(); // Automatically handles async loading
```

### Complete Example

Before:
```html
<script>
  window.divisionsAndGroups = [...];
  window.EVENT_NAME = 'fed_qld_2026';
  window.STATE_STARTING_TOTAL = 3744585;
  // ... other config
</script>
<script src="data/sa1_2021_qld.js"></script>
<script src="data/sa1_2021_fed_qld_2018.js"></script>
<script src="js/shared.js"></script>
<script>
  initSharedApp();
</script>
```

After:
```html
<script>
  window.divisionsAndGroups = [...];
  window.EVENT_NAME = 'fed_qld_2026';
  window.STATE_STARTING_TOTAL = 3744585;
  window.ARCGIS_STATE_CODE = '3'; // ADD THIS
  // ... other config
</script>
<!-- REMOVED: <script src="data/sa1_2021_qld.js"></script> -->
<script src="data/sa1_2021_fed_qld_2018.js"></script>
<script src="js/shared.js"></script>
<script>
  initSharedApp(); // Now async-aware
</script>
```

## Cache Management

### Viewing Cache

SA1 data is cached in localStorage with the key format:
```
arcgis_sa1s_<EVENT_NAME>
```

For example: `arcgis_sa1s_fed_qld_2026`

### Clearing Cache

Users can clear the cache via browser console:
```javascript
clearSA1Cache(); // Clears cache and reloads page
```

Or manually via browser DevTools:
1. Open DevTools (F12)
2. Go to Application → Local Storage
3. Delete the `arcgis_sa1s_*` keys

### Cache Behavior

- **First load**: Fetches from ArcGIS API (~10-30 seconds depending on state size)
- **Subsequent loads**: Instant load from cache
- **Cache expiry**: Manual only (no automatic expiry)
- **Cache size**: ~2-10MB per state (varies by number of SA1s)

## API Details

### Endpoint
```
https://geo.abs.gov.au/arcgis/rest/services/ASGS2021/SA1/MapServer/0/query
```

### Query Parameters
- `where`: `STE_CODE21='3'` (filter by state)
- `outFields`: `SA1_CODE21,SA2_CODE21,SA2_NAME21`
- `f`: `geojson` (output format)
- `resultOffset`: Pagination offset
- `resultRecordCount`: Records per request (2000 max)
- `geometryPrecision`: 6 decimal places
- `outSR`: 4326 (WGS84 coordinate system)

### Rate Limiting

The ABS ArcGIS service may have rate limits. The implementation:
- Fetches 2000 records per request
- Includes 3-attempt retry logic with exponential backoff
- Caches results to minimize API calls

## Troubleshooting

### "Failed to load SA1 boundaries" Error

**Possible causes:**
1. Network connectivity issues
2. ArcGIS API temporarily unavailable
3. Invalid state code
4. Browser localStorage quota exceeded

**Solutions:**
- Check browser console for detailed error messages
- Verify `ARCGIS_STATE_CODE` is correct
- Clear browser cache/localStorage
- Refresh the page to retry

### Slow Initial Load

SA1 loading takes 10-30 seconds on first load depending on:
- State size (QLD has ~12,000 SA1s)
- Network speed
- ArcGIS API response time

**This is normal.** Subsequent loads are instant (cached).

### Cache Not Working

Check localStorage quota:
```javascript
// Check available space
if (localStorage) {
  let total = 0;
  for (let key in localStorage) {
    total += localStorage[key].length;
  }
  console.log(`localStorage usage: ${(total / 1024).toFixed(2)} KB`);
}
```

Most browsers allow 5-10MB per domain.

## Backward Compatibility

Pages **without** `ARCGIS_STATE_CODE` will continue to work with static files:

```html
<!-- Legacy mode - still works -->
<script src="data/sa1_2021_qld.js"></script>
<script src="data/sa1_2021_fed_qld_2018.js"></script>
<script src="js/shared.js"></script>
<script>
  initSharedApp(); // Detects sa1s global, uses static data
</script>
```

## Migration Checklist

For each redistribution page:

- [ ] Add `window.ARCGIS_STATE_CODE = 'X'` with correct state code
- [ ] Remove `<script src="data/sa1_2021_*.js"></script>` (geometry file)
- [ ] Keep `<script src="data/sa1_2021_fed_*_*.js"></script>` (enrolment data)
- [ ] Test page loads successfully
- [ ] Verify SA1s render correctly
- [ ] Check browser console for any errors
- [ ] Optionally delete large `data/sa1_2021_*.js` files from repository

## Performance Comparison

### Before (Static Files)
- **Repository size**: +12MB per state
- **Page load**: Instant (but downloads 12MB)
- **Data freshness**: Manual updates required
- **Network transfer**: 12MB every page load

### After (ArcGIS Dynamic)
- **Repository size**: No SA1 geometry files
- **First page load**: 10-30 seconds (one-time fetch)
- **Cached page load**: Instant
- **Data freshness**: Always current from ABS
- **Network transfer**: First load only, then cached

## Advanced Configuration

Override default loading behavior:

```javascript
// Custom loading configuration
window.ARCGIS_STATE_CODE = '3';
window.ARCGIS_CONFIG = {
  maxRecords: 1000,     // Smaller batch size
  maxRetries: 5,        // More retry attempts
  retryDelay: 2000,     // 2 second retry delay
  useCache: false       // Disable caching (always fetch fresh)
};
```

Then modify `initSharedApp()` to use `window.ARCGIS_CONFIG`.

## Next Steps

1. Migrate Queensland page (fed_qld_2026.html) - ✅ **DONE**
2. Test thoroughly with various scenarios
3. Migrate other states incrementally
4. Update documentation
5. Remove old static SA1 files from repository
