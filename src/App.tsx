import './App.css'
import { useEffect, useMemo, useState } from 'react'

interface ModuleCardProps {
  title: string
  subtitle: string
  icon: string
  href: string
}

interface IndicatorData {
  id: string
  name: string
  description: string
  value: string
  hasError: boolean
}

const ModuleCard = ({ title, subtitle, icon, href }: ModuleCardProps) => {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="module-card">
      <div className="module-icon">{icon}</div>
      <h3 className="module-title">{title}</h3>
      <p className="module-subtitle">{subtitle}</p>
    </a>
  )
}

const modules = [
  {
    title: 'ASC',
    subtitle: 'Annual School Census',
    icon: '📊✓',
    href: 'https://emis.dhis2nigeria.org.ng'
  },
  {
    title: 'Learner Registry',
    subtitle: 'Manage Student Records',
    icon: '🎓',
    href: 'https://registry.dhis2nigeria.org.ng/dhis'
  },
  {
    title: 'Knowledgebase',
    subtitle: 'Access Educational Resources',
    icon: '📚',
    href: ''
  },
  {
    title: 'Safe Schools Tool',
    subtitle: 'Security Status of Schools',
    icon: '🛡️',
    href: 'https://emis.dhis2nigeria.org.ng'
  },
]

const DEFAULT_INDICATOR_IDS = [
  'dh9fliYibms',
  'S2cH9F1T7MU',
  'jZtYw0T5xJl',
  'stoCrMx0ED1',
  'BWLfuuEdRZM',
  'ERcw4yZuSSd',
]

const INDICATOR_FIELDS = 'id,displayName,description'

const getConfiguredIndicatorIds = (): string[] => {
  const configuredIds = (import.meta.env.VITE_DHIS2_INDICATOR_IDS || '')
    .split(',')
    .map((id: string) => id.trim())
    .filter(Boolean)

  if (configuredIds.length === 6) {
    return configuredIds
  }

  return DEFAULT_INDICATOR_IDS
}

const formatValue = (rawValue: unknown) => {
  if (rawValue === undefined || rawValue === null || rawValue === '') {
    return 'No data'
  }

  const valueAsNumber = Number(rawValue)
  if (!Number.isNaN(valueAsNumber)) {
    return valueAsNumber.toLocaleString()
  }

  return String(rawValue)
}

const createFallbackIndicator = (id: string): IndicatorData => ({
  id,
  name: `Indicator ${id}`,
  description: 'Unable to retrieve indicator details.',
  value: 'Unavailable',
  hasError: true,
})

function App() {
  const indicatorIds = useMemo<string[]>(() => getConfiguredIndicatorIds(), [])
  const [indicators, setIndicators] = useState<IndicatorData[]>(() =>
    indicatorIds.map((id) => ({
      id,
      name: `Indicator ${id}`,
      description: 'Loading indicator details...',
      value: 'Loading...',
      hasError: false,
    })),
  )
  const [isLoadingIndicators, setIsLoadingIndicators] = useState(true)
  const [indicatorLoadError, setIndicatorLoadError] = useState<string | null>(null)

  useEffect(() => {
    const proxyBaseUrl = (import.meta.env.VITE_DHIS2_PROXY_URL || '/dhis2').replace(/\/$/, '')
    const abortController = new AbortController()

    const fetchIndicators = async () => {
      setIsLoadingIndicators(true)
      setIndicatorLoadError(null)

      try {
        const fetchedIndicators = await Promise.all(
          indicatorIds.map(async (id) => {
            try {
              const [indicatorResponse, analyticsResponse] = await Promise.all([
                fetch(
                  `${proxyBaseUrl}/api/indicators/${id}.json?fields=${INDICATOR_FIELDS}`,
                  { signal: abortController.signal },
                ),
                fetch(
                  `${proxyBaseUrl}/api/analytics.json?dimension=dx:${id}&dimension=pe:LAST_12_MONTHS&dimension=ou:USER_ORGUNIT;USER_ORGUNIT_CHILDREN&skipMeta=true`,
                  { signal: abortController.signal },
                ),
              ])

              if (!indicatorResponse.ok) {
                throw new Error(`Indicator metadata request failed for ${id}`)
              }

              const indicatorPayload = await indicatorResponse.json()

              let value = 'No data'
              if (analyticsResponse.ok) {
                const analyticsPayload = await analyticsResponse.json()
                const firstRow = Array.isArray(analyticsPayload.rows)
                  ? analyticsPayload.rows[0]
                  : undefined
                if (Array.isArray(firstRow) && firstRow.length > 0) {
                  value = formatValue(firstRow[firstRow.length - 1])
                }
              }

              return {
                id,
                name: indicatorPayload.displayName || `Indicator ${id}`,
                description: indicatorPayload.description || 'No description available.',
                value,
                hasError: false,
              } as IndicatorData
            } catch {
              return createFallbackIndicator(id)
            }
          }),
        )

        setIndicators(fetchedIndicators)

        const failedRequests = fetchedIndicators.some((indicator) => indicator.hasError)
        if (failedRequests) {
          setIndicatorLoadError('Some indicators could not be loaded. Check DHIS2 proxy configuration.')
        }
      } catch {
        setIndicators(indicatorIds.map((id) => createFallbackIndicator(id)))
        setIndicatorLoadError('Unable to connect to DHIS2. Check DHIS2 proxy configuration.')
      } finally {
        setIsLoadingIndicators(false)
      }
    }

    void fetchIndicators()

    return () => {
      abortController.abort()
    }
  }, [indicatorIds])

  return (
    <div className="app-container">
      <div className="background-overlay"></div>
      
      <header className="header">
        <img
          src="/top.png"
          alt="Nigerian Coat of Arms"
          className="coat-of-arms"
        />
        <h1 className="main-title">Education Data Platform</h1>
        <p className="main-subtitle">Enhancing Education for a Brighter Future</p>
      </header>

      <div className="modules-grid">
        {modules.map((module, index) => (
          <ModuleCard
            key={index}
            title={module.title}
            subtitle={module.subtitle}
            icon={module.icon}
            href={module.href}
          />
        ))}
      </div>

      <section className="indicators-panel" aria-label="DHIS2 key indicators">
        <div className="indicators-panel-header">
          <h2>DHIS2 Key Indicators</h2>
          <p>
            Source: {import.meta.env.VITE_DHIS2_BASE_URL || 'https://emistraining.dhis2nigeria.org.ng/semis'}
          </p>
        </div>

        {indicatorLoadError && <p className="indicators-panel-message">{indicatorLoadError}</p>}
        {isLoadingIndicators && <p className="indicators-panel-message">Loading indicators...</p>}

        <div className="indicators-grid">
          {indicators.map((indicator) => (
            <article key={indicator.id} className="indicator-card">
              <p className="indicator-id">{indicator.id}</p>
              <h3 className="indicator-name">{indicator.name}</h3>
              <p className="indicator-value">{indicator.value}</p>
              <p className="indicator-description">{indicator.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default App
