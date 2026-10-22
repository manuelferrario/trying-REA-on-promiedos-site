import { useEffect } from 'react'
import Crest from './Crest.jsx'
import { formatTime, matchState } from '../data/engine.js'
import { LEAGUE_BY_ID } from '../data/leagues.js'

const EVENT_ICON = { goal: '⚽', penalty: '⚽', 'own-goal': '⚽', yellow: '🟨', red: '🟥' }
const EVENT_NOTE = { penalty: '(p)', 'own-goal': '(e.c.)' }

export default function MatchModal({ match, now, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const st = matchState(match, now)
  const league = LEAGUE_BY_ID[match.leagueId]
  const group = league.groups[match.group].name

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <header className="modal-head">
          <span>
            {league.flag} {league.name} · Fecha {match.round}
            {group ? ` · ${group}` : ''}
          </span>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </header>

        <div className="scoreboard">
          <a className="sb-team" href={`#/equipo/${match.home.id}`} onClick={onClose}>
            <Crest team={match.home} size={52} />
            <span>{match.home.name}</span>
          </a>
          <div className="sb-center">
            <div className="sb-score">{st.score ? `${st.score.home} - ${st.score.away}` : formatTime(match.kickoff)}</div>
            <div className={`sb-status ${st.status}`}>
              {st.status === 'scheduled' &&
                new Date(match.kickoff).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
              {st.status === 'live' && (st.clock === 'ET' ? 'Entretiempo' : `En vivo · ${st.clock}`)}
              {st.status === 'finished' && 'Finalizado'}
            </div>
          </div>
          <a className="sb-team" href={`#/equipo/${match.away.id}`} onClick={onClose}>
            <Crest team={match.away} size={52} />
            <span>{match.away.name}</span>
          </a>
        </div>

        {st.status === 'scheduled' ? (
          <p className="empty">El partido todavía no comenzó.</p>
        ) : (
          <>
            <section>
              <h3 className="section-title">Incidencias</h3>
              {st.events.length === 0 ? (
                <p className="empty">Sin incidencias.</p>
              ) : (
                <ul className="timeline">
                  {st.events.map((e, i) => (
                    <li key={i} className={e.side}>
                      <span className="tl-min">{e.minute}'</span>
                      <span className="tl-text">
                        {EVENT_ICON[e.type]} {e.player} {EVENT_NOTE[e.type] ?? ''}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section>
              <h3 className="section-title">Estadísticas</h3>
              <ul className="stats">
                {st.stats.map((s) => {
                  const total = s.home + s.away || 1
                  return (
                    <li key={s.label}>
                      <div className="stat-line">
                        <b>{s.home}{s.unit}</b>
                        <span>{s.label}</span>
                        <b>{s.away}{s.unit}</b>
                      </div>
                      <div className="stat-bar">
                        <span style={{ width: `${(s.home / total) * 100}%` }} />
                        <span style={{ width: `${(s.away / total) * 100}%` }} />
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          </>
        )}
      </div>
    </div>
  )
}
