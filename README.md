# RxScan

RxScan is a browser-based pharmacy inventory app for scanning barcodes, managing stock, tracking expiry dates, locating medicines on shelves, and reviewing alerts and analytics.

## Current Structure

Root files:

- `index.html` - main application shell
- `README.md` - project overview
- `supabase_setup.sql` - database setup script
- `archieve/` - archived older revisions

Frontend folders:

- `js/` - application logic
- `css/` - stylesheets
- `docs/` - deployment notes

## JavaScript Modules

- `js/app.js` - app bootstrap, auth flow, shared event handling, refresh flow
- `js/state.js` - central app state and state property bindings
- `js/supabase.js` - Supabase data/auth wrapper
- `js/navigation.js` - page navigation and nav state sync
- `js/overlays.js` - overlay open/close behavior
- `js/inventory.js` - inventory rendering and inventory CRUD flows
- `js/scanner.js` - barcode scanner and lookup flows
- `js/map.js` - store map, zone navigation, shelf detail behavior
- `js/alerts.js` - alert rendering and alert summary UI
- `js/analytics.js` - analytics/statistics rendering

## CSS Files

- `css/base.css` - variables, resets, global foundation
- `css/layout.css` - shared layout structure
- `css/components.css` - reusable UI components
- `css/pages.css` - page-specific styles
- `css/mobile.css` - responsive mobile adjustments

## Architecture

This project is still a static frontend app:

- no build step
- no frontend framework
- plain HTML, CSS, and vanilla JavaScript
- Supabase used for auth, persistence, and realtime updates

The app is split by feature, but it still uses browser globals and script load order rather than a bundler/module system.

## Main Features

- staff sign-in with Supabase auth
- inventory add, edit, delete, stock update
- barcode scanning and lookup
- expiry and low-stock tracking
- store map with zones and shelf details
- alerts for stock and expiry conditions
- analytics summaries and charts
- desktop and mobile layouts

## Running It

You can run the app as a static site.

Simple local option:

1. Open the project folder in a local static server
2. Serve `index.html`
3. Open the local URL in a browser

Example:

- VS Code Live Server
- any static file server

Do not rely on opening the file directly with `file://` if camera or auth behavior matters.

## External Dependencies

- Supabase JS client loaded from CDN
- Google Fonts
- optional barcode/scanner-related external lookups used by scanner flow

## Data Behavior

- auth and inventory data come from Supabase
- the app includes sample seed data behavior for first-use setup
- session and some UI state are cached in browser storage where needed

## Notes

- mobile `Map` flow has been heavily optimized compared with the older layout
- the codebase was previously a single large HTML file and is now split into maintainable JS/CSS modules
- the root folder is intentionally kept shallow; current organization is `js/`, `css/`, and `docs/`

## Deployment Notes

See:

- `docs/SUPABASE_NETLIFY_DEPLOY.md`
