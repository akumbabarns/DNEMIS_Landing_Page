import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { getDhis2IndicatorPanelData, type IndicatorValue } from './services/dhis2'

interface ModuleCardProps {
  title: string
  subtitle: string
  icon: string
  href: string
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

const FALLBACK_PANEL: IndicatorValue[] = [
  { id: 'dh9fliYibms', label: 'Primary Schools', value: '--' },
  { id: 'S2cH9F1T7MU', label: 'JS Schools', value: '--' },
  { id: 'jZtYw0T5xJl', label: 'SS Schools', value: '--' },
  { id: 'stoCrMx0ED1', label: 'Sci & Tech Schools', value: '--' },
  { id: 'BWLfuuEdRZM', label: 'Total Number of Schools', value: '--' },
  { id: 'ERcw4yZuSSd', label: 'Teachers in school', value: '--' },
]

function App() {
  const [indicators, setIndicators] = useState<IndicatorValue[]>(FALLBACK_PANEL)
  const [isLoading, setIsLoading] = useState(true)
  const [dataSource, setDataSource] = useState<'dhis2' | 'mock'>('mock')
  const [updatedAt, setUpdatedAt] = useState<string>('')

  useEffect(() => {
    const loadIndicators = async () => {
      setIsLoading(true)
      const panelData = await getDhis2IndicatorPanelData()
      setIndicators(panelData.indicators.slice(0, 6))
      setDataSource(panelData.source)
      setUpdatedAt(panelData.updatedAt)
      setIsLoading(false)
    }

    loadIndicators()
  }, [])

  const lastUpdated = useMemo(() => {
    if (!updatedAt) {
      return 'N/A'
    }

    return new Date(updatedAt).toLocaleString('en-NG', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }, [updatedAt])

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

      <section className="indicator-panel" aria-labelledby="indicator-panel-title">
        <div className="indicator-panel-header">
          <div>
            <h2 id="indicator-panel-title" className="indicator-title">Key Indicators</h2>
            <p className="indicator-subtitle">Six priority metrics from the DHIS2 education dataset</p>
          </div>
          <div className={`indicator-source source-${dataSource}`}>
            {isLoading ? 'Loading...' : dataSource === 'dhis2' ? 'Live DHIS2' : 'Demo Data'}
          </div>
        </div>

        <div className="indicator-grid">
          {indicators.map((indicator) => (
            <article key={indicator.id} className="indicator-card">
              <p className="indicator-label">{indicator.label}</p>
              <p className="indicator-value">{isLoading ? '...' : indicator.value}</p>
            </article>
          ))}
        </div>

        <p className="indicator-footnote">Last updated: {lastUpdated}</p>
      </section>
    </div>
  )
}

export default App
