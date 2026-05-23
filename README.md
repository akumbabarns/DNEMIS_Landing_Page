# DNEMIS Landing Page

Landing page for the Education Data Platform with quick-access modules and a DHIS2 indicator panel.

## Run locally

```bash
npm install
npm run dev
```

## DHIS2 indicator panel configuration

The landing page shows exactly **6** key indicators in the `DHIS2 Key Indicators` panel.

1. Copy `.env.example` to `.env`
2. Configure the DHIS2 values:

   - `VITE_DHIS2_BASE_URL`: DHIS2 server base URL (without `/api`)
   - `VITE_DHIS2_AUTH_TOKEN`: optional bearer token (preferred when available)
   - `VITE_DHIS2_ENABLE_BASIC_AUTH`: set to `true` only for local/demo usage when using username/password (**never for production deployments**)
   - `VITE_DHIS2_USERNAME`: DHIS2 username (used only when basic auth is enabled)
   - `VITE_DHIS2_PASSWORD`: DHIS2 password (used only when basic auth is enabled)
   - `VITE_DHIS2_INDICATOR_IDS`: comma-separated 6 indicator IDs in display order

When DHIS2 is not configured or unavailable, the panel automatically falls back to demo values so the feature is still demonstrable. In production, route DHIS2 requests through a backend/proxy and do not use frontend basic-auth credentials.

## Build

```bash
npm run build
```
