A tool for facilitating submissions for redistributions throughout Australia, utilising the Leaflet mapping library, OpenStreetMap and enrolment figures provided by relevent electoral commissions.

## Features

- **Interactive SA1 Editing**: Transfer SA1s (Statistical Area Level 1) between electoral divisions
- **Bulk SA2 Transfers**: Shift-click to transfer entire SA2 groups at once
- **Dynamic ArcGIS Loading**: Automatically fetches current SA1 boundaries from ABS ArcGIS API
- **Persistent Caching**: SA1 geometries cached in browser for instant subsequent loads
- **Division Management**: Create, rename, delete, and customize divisions
- **Real-time Statistics**: Track enrolment, quota compliance, and division metrics
- **Export/Import**: Save and share redistribution scenarios via CSV

============================================================

## Instructions

1. Access the Divisions tab, and then click any district in the left panel to select or unselect it

2. Click on any SA1 on the map to transfer it into the selected district

3. Click on any transferred SA1s to return them to their original district

4. Shift-click can be used to transfer or return whole SA2s

5. New divisions can be created by clicking the '+' symbol next to the group label

## Technical Details

### Dynamic SA1 Loading

Pages configured with `ARCGIS_STATE_CODE` will automatically fetch SA1 boundaries from the [ABS ArcGIS REST API](https://geo.abs.gov.au/arcgis/rest/services/ASGS2021) instead of loading large static files.

**Benefits:**
- Reduced repository size (no 12MB+ geometry files)
- Always-current boundary data
- First load: 10-30 seconds (fetches from API)
- Subsequent loads: Instant (cached in localStorage)

**See [ARCGIS_MIGRATION.md](ARCGIS_MIGRATION.md) for implementation details.**

## Disclaimer

This tool presents raw data provided by official sources. Calculations use published enrolment data; aggregated results are provided without warranty. Use at your own risk.
