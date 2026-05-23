/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DHIS2_BASE_URL?: string
  readonly VITE_DHIS2_API_TOKEN?: string
  readonly VITE_DHIS2_AUTH_MODE?: 'bearer' | 'apiToken'
  readonly VITE_DHIS2_USERNAME?: string
  readonly VITE_DHIS2_PASSWORD?: string
  readonly VITE_DHIS2_INDICATOR_IDS?: string
  readonly VITE_DHIS2_INDICATOR_LABELS?: string
  readonly VITE_DHIS2_INDICATOR_UNITS?: string
  readonly VITE_DHIS2_CLASSROOMS_VISUALIZATION_ID?: string
  readonly VITE_DHIS2_ORG_UNIT?: string
  readonly VITE_DHIS2_PERIOD?: string
  readonly VITE_DHIS2_USE_MOCK?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
