import Crest from '../components/Crest.jsx'
import { getGameCenter } from '../api/client.js'
import { usePolling } from '../lib/usePolling.js'

const ICON = { goal: '⚽', penalty: '⚽', 'own-goal': '⚽', yellow: '🟨', red: '🟥' }
const NOTE = { penalty: '(p)', 'own-goal': '(e.c.)' }
const LIVE = 2

export default function GamePage({ gameId }) {
  const { data, loading, error } = usePolling(`game/${gameId}`, () => getGameCenter(gameId))
  if (error) return <div className="panel empty">{error.message}</div>
  if (loading) return <div className="panel skeleton">Cargando partido…</div>

  const { game } = data
  const [home, away] = game.teams
  const live = game.status.enum === LIVE

  return (
    <>
      <a className="breadcrumb" href={`#/league/${game.league.url_name}/${game.league.id}`}>
        {game.league.flag} {game.league.name} · {game.stage_round_name}
      </a>

      <section className="panel scoreboard">
        <a className="sb-team" href={`#/team/${home.url_name}/${home.id}`}>
          <Crest team={home} size={56} />
          <span>{home.name}</span>
        </a>
        <div className="sb-center">
          <div className="sb-score">{game.scores ? `${game.scores[0]} - ${game.scores[1]}` : game.start_time.split(' ')[1]}</div>
          <div className={`sb-status ${live ? 'live' : ''}`}>
            {live
              ? game.game_time_to_display === 'ET'
                ? 'Entretiempo'
                : `En vivo · ${game.game_time_to_display}`
              : game.status.enum === 1
                ? game.start_time.split(' ')[0].replaceAll('-', '/')
                : 'Finalizado'}
          </div>
        </div>
        <a className="sb-team" href={`#/team/${away.url_name}/${away.id}`}>
          <Crest team={away} size={56} />
          <span>{away.name}</span>
        </a>
      </section>

      {game.status.enum === 1 ? (
        <div className="panel empty">El partido todavía no empezó.</div>
      ) : (
        <div className="game-grid">
          <section className="panel">
            <h2 className="panel-title">Incidencias</h2>
            {game.events.length === 0 ? (
              <p className="empty">Sin incidencias.</p>
            ) : (
              <ul className="timeline">
                {game.events.map((e, i) => (
                  <li key={i} className={e.team === 1 ? 'home' : 'away'}>
                    <span className="tl-min">{e.time}'</span>
                    <span>
                      {ICON[e.type]} {e.player} {NOTE[e.type] ?? ''}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="panel">
            <h2 className="panel-title">Estadísticas</h2>
            <ul className="stats">
              {game.statistics.map((s) => {
                const total = s.values[0] + s.values[1] || 1
                return (
                  <li key={s.name}>
                    <div className="stat-line">
                      <b>
                        {s.values[0]}
                        {s.unit}
                      </b>
                      <span>{s.name}</span>
                      <b>
                        {s.values[1]}
                        {s.unit}
                      </b>
                    </div>
                    <div className="stat-bar">
                      <span style={{ width: `${(s.values[0] / total) * 100}%` }} />
                      <span style={{ width: `${(s.values[1] / total) * 100}%` }} />
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        </div>
      )}
      <p className="ttl-note">↻ Esta página se vuelve a pedir cada {data.TTL} s (TTL de la respuesta).</p>
    </>
  )
}
