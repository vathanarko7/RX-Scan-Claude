# RxScan

RxScan is a browser-based pharmacy inventory prototype built as a single-page app inside `index.html`. It is designed to help pharmacists scan medication barcodes, manage stock, track expiry dates, locate products on shelves, and view simple operational analytics.

## What It Does

- Scans barcodes and DataMatrix codes using the device camera
- Looks up existing medications in local inventory
- Supports adding, editing, deleting, and exporting medication records
- Tracks stock levels, reorder thresholds, expiry dates, and shelf locations
- Shows a visual store map with zone and shelf details
- Generates alerts for low stock, out-of-stock, expired, and soon-to-expire items
- Displays lightweight dashboard and analytics summaries
- Attempts to enrich unknown barcodes with public drug and product APIs

## Project Structure

- `index.html` - the full application, including HTML, CSS, and JavaScript
- `archieve/` - archived UI and feature iterations from earlier revisions

## Architecture

This project is a static frontend-only application:

- No backend server
- No package manager or build step
- No framework; it uses plain HTML, CSS, and vanilla JavaScript
- Data is stored locally in the browser with `localStorage`

Core pieces inside `index.html`:

- Inventory data store seeded from built-in sample data
- Page-based UI for dashboard, inventory, store map, alerts, and analytics
- Barcode scanner powered by the ZXing browser library loaded from CDN
- GS1/DataMatrix parsing for expiry, batch, and serial extraction
- Background barcode enrichment via public APIs such as BDPM, Open Food Facts, OpenFDA, RxNorm, UPC Item DB, and Go-UPC

## Running It

Because this is a static app, you can run it by opening `index.html` in a modern browser.

For the best experience:

- Use a browser with camera support
- Allow camera permissions for scanning
- Keep internet access enabled for external fonts, ZXing, and barcode enrichment lookups

## Data Behavior

- Inventory is saved under the browser `localStorage` key `rxscan_inventory`
- On first load, the app seeds itself with sample medication data
- Data is local to the browser and device; it is not shared across users

## Limitations

- Single-user local prototype only
- Depends on external CDNs and public APIs for some features
- All logic lives in one HTML file, which makes long-term maintenance harder
- No authentication, backend persistence, or server-side validation
- Archived revisions are present, but this folder does not currently contain Git metadata

## Notes

The app appears optimized for both desktop and mobile use, with special handling for the scan flow and mobile bottom navigation. Some text output shows character-encoding issues in terminal views, although the page itself declares UTF-8.
