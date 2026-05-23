export interface IndicatorDefinition {
  id: string
  label: string
  unit?: string
}

export interface IndicatorValue {
  id: string
  label: string
  value: string
  unit?: string
}

export interface Dhis2PanelData {
  indicators: IndicatorValue[]
  source: 'dhis2' | 'mock'
  updatedAt: string
}

const FALLBACK_INDICATORS: IndicatorDefinition[] = [
  { id: 'dh9fliYibms', label: 'Primary Schools' },
  { id: 'S2cH9F1T7MU', label: 'JS Schools' },
  { id: 'jZtYw0T5xJl', label: 'SS Schools' },
  { id: 'stoCrMx0ED1', label: 'Sci & Tech Schools' },
  { id: 'BWLfuuEdRZM', label: 'Total Number of Schools' },
  { id: 'ERcw4yZuSSd', label: 'Teachers in school' },
]

const FALLBACK_MOCK_VALUES: Record<string, number> = {
  dh9fliYibms: 18475,
  S2cH9F1T7MU: 6352,
  jZtYw0T5xJl: 4298,
  stoCrMx0ED1: 1160,
  BWLfuuEdRZM: 30285,
  ERcw4yZuSSd: 128944,
}

const toNumber = (value: string): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const formatIndicatorValue = (value: number, unit?: string): string => {
  if (unit === '%') {
    return `${value.toFixed(1)}${unit}`
  }

  if (Math.abs(value) >= 1000) {
    return Intl.NumberFormat('en-NG').format(Math.round(value))
  }

  return value.toFixed(1)
}

const readIndicatorDefinitions = (): IndicatorDefinition[] => {
  const ids = import.meta.env.VITE_DHIS2_INDICATOR_IDS
  const labels = import.meta.env.VITE_DHIS2_INDICATOR_LABELS
  const units = import.meta.env.VITE_DHIS2_INDICATOR_UNITS

  if (!ids) {
    return FALLBACK_INDICATORS
  }

  const parsedIds = ids
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6)

  if (parsedIds.length !== 6) {
    return FALLBACK_INDICATORS
  }

  const parsedLabels = labels
    ? labels.split(',').map((item) => item.trim())
    : []

  const parsedUnits = units
    ? units.split(',').map((item) => item.trim())
    : []

  return parsedIds.map((id, index) => ({
    id,
    label: parsedLabels[index] || `Indicator ${index + 1}`,
    unit: parsedUnits[index],
  }))
}

const createMockData = (definitions: IndicatorDefinition[]): Dhis2PanelData => ({
  indicators: definitions.map((item) => {
    const fallback = FALLBACK_MOCK_VALUES[item.id] ?? 0
    return {
      id: item.id,
      label: item.label,
      value: formatIndicatorValue(fallback, item.unit),
      unit: item.unit,
    }
  }),
  source: 'mock',
  updatedAt: new Date().toISOString(),
})

const getHeaders = (): HeadersInit => {
  const token = import.meta.env.VITE_DHIS2_API_TOKEN
  const username = import.meta.env.VITE_DHIS2_USERNAME
  const password = import.meta.env.VITE_DHIS2_PASSWORD

  const headers: HeadersInit = {
    Accept: 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  } else if (username && password) {
    headers.Authorization = `Basic ${btoa(`${username}:${password}`)}`
  }

  return headers
}

const buildAnalyticsUrl = (definitions: IndicatorDefinition[]): string | null => {
  const baseUrl = import.meta.env.VITE_DHIS2_BASE_URL?.trim()

  if (!baseUrl) {
    return null
  }

  const cleanBase = baseUrl.replace(/\/$/, '')
  const orgUnit = import.meta.env.VITE_DHIS2_ORG_UNIT || 'USER_ORGUNIT'
  const period = import.meta.env.VITE_DHIS2_PERIOD || 'LAST_12_MONTHS'

  const url = new URL(`${cleanBase}/api/analytics.json`)
  url.searchParams.set('dimension', `dx:${definitions.map((item) => item.id).join(';')}`)
  url.searchParams.append('dimension', `ou:${orgUnit}`)
  url.searchParams.append('filter', `pe:${period}`)

  return url.toString()
}

interface AnalyticsResponse {
  rows?: string[][]
  metaData?: {
    items?: Record<string, { name?: string }>
  }
}

const parseAnalytics = (
  data: AnalyticsResponse,
  definitions: IndicatorDefinition[],
): IndicatorValue[] => {
  const totals = new Map<string, number>()

  for (const row of data.rows ?? []) {
    const dx = row[0]
    const value = row[row.length - 1]

    if (!dx) {
      continue
    }

    totals.set(dx, (totals.get(dx) ?? 0) + toNumber(value))
  }

  return definitions.map((item) => {
    const labelFromMetadata = data.metaData?.items?.[item.id]?.name
    const numericValue = totals.get(item.id) ?? 0

    return {
      id: item.id,
      label: labelFromMetadata || item.label,
      value: formatIndicatorValue(numericValue, item.unit),
      unit: item.unit,
    }
  })
}

export const getDhis2IndicatorPanelData = async (): Promise<Dhis2PanelData> => {
  const definitions = readIndicatorDefinitions()
  const useMock = import.meta.env.VITE_DHIS2_USE_MOCK === 'true'

  if (useMock) {
    return createMockData(definitions)
  }

  const url = buildAnalyticsUrl(definitions)

  if (!url) {
    return createMockData(definitions)
  }

  try {
    const response = await fetch(url, {
      headers: getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`DHIS2 request failed with status ${response.status}`)
    }

    const payload = (await response.json()) as AnalyticsResponse

    return {
      indicators: parseAnalytics(payload, definitions),
      source: 'dhis2',
      updatedAt: new Date().toISOString(),
    }
  } catch {
    return createMockData(definitions)
  }
}
