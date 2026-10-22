import { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import { useHashRoute } from './lib/hooks.js'
import GamePage from './pages/GamePage.jsx'
import GamesPage from './pages/GamesPage.jsx'
import LeaguePage from './pages/LeaguePage.jsx'
import TeamPage from './pages/TeamPage.jsx'
import { DAY, formatDateKey } from './api/client.js'
import { startOfDay } from './data/engine.js'

function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('theme')
    } catch {
      return null
    }
  })
  useEffect(() => {
    if (theme) document.documentElement.dataset.theme = theme
    else delete document.documentElement.dataset.theme
    try {
      if (theme) localStorage.setItem('theme', theme)
    } catch {
      /* storage unavailable */
    }
  }, [theme])
  const toggle = () => {
    const dark = theme ? theme === 'dark' : !window.matchMedia('(prefers-color-scheme: light)').matches
    setTheme(dark ? 'light' : 'dark')
  }
  return toggle
}

function pageFor(route) {
  const [section, a, b] = route
  const today = startOfDay(Date.now())
  switch (section) {
    case undefined:
      return <GamesPage key="today" dateKey="today" />
    case 'ayer':
      return <GamesPage key="ayer" dateKey={formatDateKey(today - DAY)} />
    case 'man':
      return <GamesPage key="man" dateKey={formatDateKey(today + DAY)} />
    case 'games':
      return <GamesPage key={a} dateKey={a === 'today' ? 'today' : a} />
    case 'league':
      return <LeaguePage key={b} leagueId={b} />
    case 'game':
      return <GamePage key={b} gameId={b} />
    case 'team':
      return <TeamPage key={b} teamId={b} />
    default:
      return <div className="panel empty">Página no encontrada.</div>
  }
}

export default function App() {
  const route = useHashRoute()
  const toggleTheme = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const path = `/${route.join('/')}`

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <button type="button" className="menu-btn" aria-label="Abrir menú" aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)}>
            ☰
          </button>
          <a href="#/" className="logo" aria-label="Promiedos v2, inicio">
            PR<span className="logo-ball">⚽</span>MIEDOS<sup>v2</sup>
          </a>
          <button type="button" className="theme-btn" onClick={toggleTheme} aria-label="Cambiar tema">
            ☾
          </button>
        </div>
      </header>

      <div className="layout">
        <aside className={`side ${menuOpen ? 'open' : ''}`}>
          <Sidebar currentPath={path} onNavigate={() => setMenuOpen(false)} />
        </aside>
        <main>{pageFor(route)}</main>
      </div>

      <footer className="footer">
        Promiedos v2 · reconstruido con ingeniería inversa (REA) a partir de promiedos.com.ar. Datos simulados: no son
        resultados reales.
      </footer>
    </div>
  )
}
