import { useState } from 'react'
import GameRow from '../components/GameRow.jsx'
import { DATE_RANGE_DAYS, DAY, formatDateKey, getGames, parseDateKey } from '../api/client.js'
import { startOfDay } from '../data/engine.js'
import { usePolling } from '../lib/usePolling.js'

const LIVE = 2

/** Route segment for a day offset, as on promiedos.com.ar: '', 'ayer', 'man' or 'games/dd-mm-yyyy'. */
function pathFor(offset, today) {
  if (offset === 0) return ''
  if (offset === -1) return 'ayer'
  if (offset === 1) return 'man'
  return `games/${formatDateKey(today + offset * DAY)}`
}

function titleFor(offset, day) {
  if (offset === 0) return 'Partidos de hoy'
  if (offset === -1) return 'Partidos de ayer'
  if (offset === 1) return 'Partidos de mañana'
  return new Date(day).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function GamesPage({ dateKey }) {
  const [today] = useState(() => startOfDay(Date.now()))
  const day = dateKey === 'today' ? today : parseDateKey(dateKey)
  const offset = Math.round((day - today) / DAY)

  const { data, loading } = usePolling(`games/${dateKey}`, () => getGames(dateKey))
  const [liveOnly, setLiveOnly] = useState(false)
  const [collapsed, setCollapsed] = useState({})

  const leagues = (data?.leagues ?? [])
    .map((l) => ({ ...l, games: liveOnly ? l.games.filter((g) => g.status.enum === LIVE) : l.games }))
    .filter((l) => l.games.length > 0)
  const liveCount = (data?.leagues ?? []).flatMap((l) => l.games).filter((g) => g.status.enum === LIVE).length

  return (
    <>
      <section className="panel day-panel">
        <div className="day-nav">
          <a
            className="arrow"
            aria-label="Día anterior"
            aria-disabled={offset <= -DATE_RANGE_DAYS}
            href={offset > -DATE_RANGE_DAYS ? `#/${pathFor(offset - 1, today)}` : undefined}
          >
            ‹
          </a>
          <h1>{titleFor(offset, day)}</h1>
          <a
            className="arrow"
            aria-label="Día siguiente"
            aria-disabled={offset >= DATE_RANGE_DAYS}
            href={offset < DATE_RANGE_DAYS ? `#/${pathFor(offset + 1, today)}` : undefined}
          >
            ›
          </a>
        </div>
        <div className="filter-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={!liveOnly} className={!liveOnly ? 'active' : ''} onClick={() => setLiveOnly(false)}>
            Todos
          </button>
          <button type="button" role="tab" aria-selected={liveOnly} className={liveOnly ? 'active live' : ''} onClick={() => setLiveOnly(true)}>
            Vivo ({liveCount})
          </button>
          {data && <span className="ttl" title="Cada cuánto se vuelve a pedir la información, según el TTL de la respuesta">↻ {data.TTL}s</span>}
        </div>
      </section>

      <p className="tagline">Resultados, tabla de posiciones y promedios de fútbol</p>

      {loading && <div className="panel skeleton" aria-busy="true">Cargando partidos…</div>}

      {!loading && leagues.length === 0 && (
        <div className="panel empty">{liveOnly ? 'No hay partidos en vivo.' : 'No hay partidos este día.'}</div>
      )}

      {leagues.map((league) => (
        <section key={league.id} className="panel league-block">
          <header className="league-head">
            <span>
              {league.flag} {league.name}
            </span>
            <button
              type="button"
              className={`chevron ${collapsed[league.id] ? '' : 'up'}`}
              aria-label={collapsed[league.id] ? 'Mostrar partidos' : 'Ocultar partidos'}
              onClick={() => setCollapsed((c) => ({ ...c, [league.id]: !c[league.id] }))}
            />
          </header>
          {!collapsed[league.id] && (
            <>
              {league.games.map((g) => (
                <GameRow key={g.id} game={g} />
              ))}
              <a className="section-link" href={`#/league/${league.url_name}/${league.id}`}>
                Sección de {league.name} ›
              </a>
            </>
          )}
        </section>
      ))}
    </>
  )
}
