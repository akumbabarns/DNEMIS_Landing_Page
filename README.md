# DNEMIS Landing Page

## DHIS2 indicator panel configuration

This landing page includes a **DHIS2 Key Indicators** panel with exactly 6 indicator cards.

- DHIS2 instance URL (user supplied): `https://emistraining.dhis2nigeria.org.ng/semis`
- Authentication method: Personal Access Token (PAT)
- Indicator IDs (user supplied):
  1. `dh9fliYibms`
  2. `S2cH9F1T7MU`
  3. `jZtYw0T5xJl`
  4. `stoCrMx0ED1`
  5. `BWLfuuEdRZM`
  6. `ERcw4yZuSSd`

### Security model

Do **not** store PAT values in source-controlled files.  
This project uses a Vite development proxy that injects the PAT server-side, so the token is not exposed in frontend code.

### Setup

1. Copy environment template:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` and set:
   - `DHIS2_BASE_URL` (defaults to the supplied instance URL)
   - `DHIS2_PAT` (your real DHIS2 PAT, keep secret)
   - `VITE_DHIS2_PROXY_URL` (default: `/dhis2`)
   - `VITE_DHIS2_BASE_URL` (displayed on the panel)
   - `VITE_DHIS2_INDICATOR_IDS` (comma-separated list of exactly 6 IDs)
3. Install and run:
   ```bash
   npm ci
   npm run dev
   ```

### Changing indicator IDs

Set `VITE_DHIS2_INDICATOR_IDS` to a comma-separated list of **exactly 6** indicator IDs:

```env
VITE_DHIS2_INDICATOR_IDS=id1,id2,id3,id4,id5,id6
```

If the value is missing or not exactly 6 IDs, the app falls back to the supplied 6 IDs listed above.

### Production deployment note

For static hosting, add a backend/API proxy route for `/dhis2/*` that forwards to DHIS2 and injects `Authorization: ApiToken <PAT>`.  
Do not expose PATs in browser-visible environment variables.
