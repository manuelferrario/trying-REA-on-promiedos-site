import { useState } from 'react'
import MatchRow from '../components/MatchRow.jsx'
import { SEASON, matchState, matchesOnDay } from '../data/engine.js'
import { LEAGUES } from '../data/leagues.js'

const DAY = 24 * 60 * 60 * 1000
const OFFSETS = [-3, -2, -1, 0, 1, 2, 3]

function dayLabel(offset, ts) {
  if (offset === -1) return 'Ayer'
  if (offset === 0) return 'Hoy'
  if (offset === 1) return 'Mañana'
  return new Date(ts).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric' })
}

export default function Home({ now, onOpen }) {
  const [offset, setOffset] = useState(0)
  const [liveOnly, setLiveOnly] = useState(false)
  const day = SEASON.anchor + offset * DAY

  let matches = matchesOnDay(day)
  const liveCount = SEASON.matches.filter((m) => matchState(m, now).status === 'live').length
  if (liveOnly) matches = SEASON.matches.filter((m) => matchState(m, now).status === 'live')

  const byLeague = LEAGUES.map((league) => ({
    league,
    matches: matches.filter((m) => m.leagueId === league.id),
  })).filter((g) => g.matches.length > 0)

  return (
    <>
      <div className="toolbar">
        <nav className="date-bar" aria-label="Elegir fecha">
          {OFFSETS.map((o) => (
            <button
              key={o}
              type="button"
              className={!liveOnly && o === offset ? 'active' : ''}
              onClick={() => {
                setOffset(o)
                setLiveOnly(false)
              }}
            >
              {dayLabel(o, SEASON.anchor + o * DAY)}
            </button>
          ))}
        </nav>
        <button
          type="button"
          className={`live-toggle ${liveOnly ? 'active' : ''}`}
          onClick={() => setLiveOnly((v) => !v)}
        >
          <span className="live-dot" /> En vivo <b>{liveCount}</b>
        </button>
      </div>

      {byLeague.length === 0 && (
        <p className="empty card">{liveOnly ? 'No hay partidos en vivo en este momento.' : 'No hay partidos para esta fecha.'}</p>
      )}

      {byLeague.map(({ league, matches: list }) => (
        <section key={league.id} className="card league-block">
          <a className="card-title league-title" href={`#/liga/${league.id}`}>
            <span>
              {league.flag} {league.name}
            </span>
            <small>Fecha {list[0].round} ›</small>
          </a>
          {list.map((m) => (
            <MatchRow key={m.id} match={m} now={now} onOpen={onOpen} />
          ))}
        </section>
      ))}
    </>
  )
}
