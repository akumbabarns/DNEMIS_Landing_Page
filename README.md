# DNEMIS Landing Page

Landing page for the DNEMIS portal, now including a **Key Indicators** dashboard panel that displays exactly 6 indicator cards sourced from a DHIS2 instance (or mock fallback data when DHIS2 is not configured).

## Features

- Quick-access module cards for DNEMIS services.
- New **Key Indicators** panel on the landing page.
- Exactly 6 responsive indicator cards.
- DHIS2 analytics fetch support with environment-based configuration.
- Demo-safe fallback mode using mock values.

## Run Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment template:
   ```bash
   copy .env.example .env
   ```
3. Start development server:
   ```bash
   npm start
   ```

You can also use:

- `npm run dev`
- `npm run build`
- `npm run preview`

## DHIS2 Configuration

Set these in `.env`:

- `VITE_DHIS2_BASE_URL`: DHIS2 base URL, for example `https://your-dhis2-instance.example.org`
- `VITE_DHIS2_API_TOKEN`: Bearer token (recommended for browser usage)
- `VITE_DHIS2_USERNAME` and `VITE_DHIS2_PASSWORD`: optional basic auth fallback
- `VITE_DHIS2_INDICATOR_IDS`: comma-separated list of exactly 6 DHIS2 indicator IDs
- `VITE_DHIS2_INDICATOR_LABELS`: comma-separated labels for the 6 indicators
- `VITE_DHIS2_INDICATOR_UNITS`: optional comma-separated units (for example `%`)
- `VITE_DHIS2_ORG_UNIT`: defaults to `USER_ORGUNIT`
- `VITE_DHIS2_PERIOD`: defaults to `LAST_12_MONTHS`
- `VITE_DHIS2_USE_MOCK`: set `true` to force mock mode for demos

## Data Behavior

- If DHIS2 settings are valid, the indicator panel requests `/api/analytics.json` from the configured DHIS2 instance.
- If configuration is missing or request fails, the panel automatically falls back to mock data.
- The panel displays a source badge:
  - `Live DHIS2` when live data is loaded.
  - `Demo Data` when fallback mock data is used.

## Notes for Developers

- The indicator panel logic lives in `src/services/dhis2.ts`.
- UI rendering for the panel is in `src/App.tsx`.
- Styles are in `src/App.css`.
