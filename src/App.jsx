import { useCallback, useEffect, useState } from 'react'
import MatchModal from './components/MatchModal.jsx'
import StandingsTable from './components/StandingsTable.jsx'
import { standings } from './data/engine.js'
import { LEAGUES, LEAGUE_BY_ID } from './data/leagues.js'
import { useHashRoute, useNow } from './lib/hooks.js'
import Home from './pages/Home.jsx'
import LeaguePage from './pages/LeaguePage.jsx'
import TeamPage from './pages/TeamPage.jsx'

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
    const dark = theme ? theme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
    setTheme(dark ? 'light' : 'dark')
  }
  return toggle
}

export default function App() {
  const now = useNow()
  const route = useHashRoute()
  const toggleTheme = useTheme()
  const [openMatch, setOpenMatch] = useState(null)
  const closeMatch = useCallback(() => setOpenMatch(null), [])

  const [section, id] = route
  const league = section === 'liga' ? LEAGUE_BY_ID[id] : null
  const team =
    section === 'equipo' ? LEAGUES.flatMap((l) => l.teams).find((t) => t.id === id) : null

  let page
  if (league) page = <LeaguePage key={league.id} league={league} now={now} onOpen={setOpenMatch} />
  else if (team)
    page = <TeamPage key={team.id} team={team} league={LEAGUE_BY_ID[team.leagueId]} now={now} onOpen={setOpenMatch} />
  else page = <Home now={now} onOpen={setOpenMatch} />

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <a href="#/" className="logo">
            <span className="logo-ball">⚽</span> promiedos<sup>v2</sup>
          </a>
          <button type="button" className="icon-btn theme-btn" onClick={toggleTheme} aria-label="Cambiar tema">
            ☾
          </button>
        </div>
        <nav className="league-nav">
          <a href="#/" className={!league && !team ? 'active' : ''}>
            Partidos
          </a>
          {LEAGUES.map((l) => (
            <a
              key={l.id}
              href={`#/liga/${l.id}`}
              className={league?.id === l.id || team?.leagueId === l.id ? 'active' : ''}
            >
              {l.flag} {l.name}
            </a>
          ))}
        </nav>
      </header>

      <div className="layout">
        <main>{page}</main>
        {!league && !team && (
          <aside className="sidebar">
            <h3 className="section-title">Liga Profesional</h3>
            {standings(LEAGUE_BY_ID.lpf, now, true).map((g, i) => (
              <StandingsTable key={i} league={LEAGUE_BY_ID.lpf} group={g} compact />
            ))}
          </aside>
        )}
      </div>

      <footer className="footer">
        Promiedos v2 · proyecto de práctica en React. Datos simulados: no son resultados reales.
      </footer>

      {openMatch && <MatchModal match={openMatch} now={now} onClose={closeMatch} />}
    </>
  )
}
