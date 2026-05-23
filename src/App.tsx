import './App.css'
import { useEffect, useMemo, useState } from 'react'

interface ModuleCardProps {
  title: string
  subtitle: string
  icon: string
  href: string
}

interface IndicatorDefinition {
  id: string
  label: string
  unit: string
}

interface IndicatorValue extends IndicatorDefinition {
  value: string
}

interface Dhis2AnalyticsResponse {
  rows?: string[][]
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

const defaultIndicatorDefinitions: IndicatorDefinition[] = [
  { id: 'IND_1', label: 'Enrollment Rate', unit: '%' },
  { id: 'IND_2', label: 'Attendance Rate', unit: '%' },
  { id: 'IND_3', label: 'Completion Rate', unit: '%' },
  { id: 'IND_4', label: 'Girl/Boy Parity', unit: '' },
  { id: 'IND_5', label: 'Qualified Teachers', unit: '%' },
  { id: 'IND_6', label: 'Safe Schools Coverage', unit: '%' },
]

const fallbackIndicatorValues: string[] = ['82.4', '88.1', '74.9', '0.97', '69.3', '61.5']

const createFallbackIndicators = (definitions: IndicatorDefinition[]): IndicatorValue[] => {
  return definitions.map((definition, index) => ({
    ...definition,
    value: fallbackIndicatorValues[index] ?? 'N/A',
  }))
}

function App() {
  const configuredIndicatorIds = (import.meta.env.VITE_DHIS2_INDICATOR_IDS ?? '')
    .split(',')
    .map((id: string) => id.trim())
    .filter(Boolean)

  const indicatorDefinitions = useMemo(() => {
    return defaultIndicatorDefinitions.map((definition, index) => ({
      ...definition,
      id: configuredIndicatorIds[index] ?? definition.id,
    }))
  }, [configuredIndicatorIds])

  const [indicators, setIndicators] = useState<IndicatorValue[]>(createFallbackIndicators(indicatorDefinitions))
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isLiveData, setIsLiveData] = useState<boolean>(false)

  useEffect(() => {
    const dhis2BaseUrl = import.meta.env.VITE_DHIS2_BASE_URL?.trim()
    const dhis2Username = import.meta.env.VITE_DHIS2_USERNAME?.trim()
    const dhis2Password = import.meta.env.VITE_DHIS2_PASSWORD?.trim()
    const fallbackIndicators = createFallbackIndicators(indicatorDefinitions)

    if (!dhis2BaseUrl) {
      setIndicators(fallbackIndicators)
      setIsLiveData(false)
      setIsLoading(false)
      return
    }

    const indicatorIds = indicatorDefinitions.map((indicator) => indicator.id).join(';')
    const query = new URLSearchParams({
      dimension: `dx:${indicatorIds}`,
      filter: 'pe:LAST_12_MONTHS',
    })
    query.append('dimension', 'ou:USER_ORGUNIT')
    query.append('displayProperty', 'NAME')

    const headers: HeadersInit = {}
    if (dhis2Username && dhis2Password) {
      headers.Authorization = `Basic ${btoa(`${dhis2Username}:${dhis2Password}`)}`
    }

    let cancelled = false

    const fetchIndicators = async () => {
      setIsLoading(true)

      try {
        const response = await fetch(`${dhis2BaseUrl.replace(/\/$/, '')}/api/analytics.json?${query.toString()}`, {
          headers,
        })

        if (!response.ok) {
          throw new Error(`DHIS2 request failed: ${response.status}`)
        }

        const data: Dhis2AnalyticsResponse = await response.json()
        const valuesByIndicator = new Map<string, string>()

        for (const row of data.rows ?? []) {
          const [dx, period, , value] = row
          if (!dx || !period || !value) {
            continue
          }

          const current = valuesByIndicator.get(dx)
          if (!current || period >= current.split('|')[0]) {
            valuesByIndicator.set(dx, `${period}|${value}`)
          }
        }

        const liveIndicators = indicatorDefinitions.map((definition, index) => {
          const latest = valuesByIndicator.get(definition.id)
          const value = latest ? latest.split('|')[1] : fallbackIndicatorValues[index] ?? 'N/A'
          return { ...definition, value }
        })

        if (!cancelled) {
          setIndicators(liveIndicators)
          setIsLiveData(true)
        }
      } catch {
        if (!cancelled) {
          setIndicators(fallbackIndicators)
          setIsLiveData(false)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchIndicators()

    return () => {
      cancelled = true
    }
  }, [indicatorDefinitions])

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

      <section className="indicator-panel" aria-labelledby="indicator-panel-heading">
        <div className="indicator-panel-header">
          <h2 id="indicator-panel-heading">DHIS2 Key Indicators</h2>
          <p>{isLoading ? 'Loading indicators…' : isLiveData ? 'Source: DHIS2 instance' : 'Source: Demo fallback data'}</p>
        </div>
        <div className="indicator-grid">
          {indicators.map((indicator) => (
            <article key={indicator.label} className="indicator-card">
              <p className="indicator-label">{indicator.label}</p>
              <p className="indicator-value">
                {indicator.value}
                {indicator.unit && <span>{indicator.unit}</span>}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default App
