import { useState } from 'react'
import Crest from '../components/Crest.jsx'
import MatchRow from '../components/MatchRow.jsx'
import StandingsTable from '../components/StandingsTable.jsx'
import { matchesOfRound, standings, topScorers } from '../data/engine.js'

const TABS = [
  { id: 'fixture', label: 'Fixture' },
  { id: 'tabla', label: 'Tabla' },
  { id: 'goleadores', label: 'Goleadores' },
]

export default function LeaguePage({ league, now, onOpen }) {
  const [tab, setTab] = useState('fixture')
  const [round, setRound] = useState(league.currentRound)
  const [liveTable, setLiveTable] = useState(true)

  return (
    <>
      <div className="league-hero">
        <h1>
          {league.flag} {league.name}
        </h1>
        <span>
          {league.country} · {league.season}
        </span>
      </div>

      <nav className="tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={tab === t.id ? 'active' : ''}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'fixture' && (
        <section className="card">
          <div className="round-picker">
            <button type="button" className="icon-btn" disabled={round <= 1} onClick={() => setRound(round - 1)} aria-label="Fecha anterior">
              ‹
            </button>
            <select value={round} onChange={(e) => setRound(Number(e.target.value))} aria-label="Fecha">
              {Array.from({ length: league.rounds }, (_, i) => i + 1).map((r) => (
                <option key={r} value={r}>
                  Fecha {r}
                  {r === league.currentRound ? ' (actual)' : ''}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="icon-btn"
              disabled={round >= league.rounds}
              onClick={() => setRound(round + 1)}
              aria-label="Fecha siguiente"
            >
              ›
            </button>
          </div>
          {league.groups.map((g, gi) => {
            const list = matchesOfRound(league.id, round).filter((m) => m.group === gi)
            const playing = new Set(list.flatMap((m) => [m.home.id, m.away.id]))
            const free = g.teams.filter((t) => !playing.has(t.id))
            return (
              <div key={gi}>
                {g.name && <h3 className="subhead">{g.name}</h3>}
                {list.map((m) => (
                  <MatchRow key={m.id} match={m} now={now} onOpen={onOpen} showDate />
                ))}
                {free.length > 0 && <p className="free">Libre: {free.map((t) => t.name).join(', ')}</p>}
              </div>
            )
          })}
        </section>
      )}

      {tab === 'tabla' && (
        <>
          <label className="switch">
            <input type="checkbox" checked={liveTable} onChange={(e) => setLiveTable(e.target.checked)} />
            Tabla en vivo (incluye partidos en juego)
          </label>
          <div className="groups">
            {standings(league, now, liveTable).map((g, i) => (
              <StandingsTable key={i} league={league} group={g} />
            ))}
          </div>
        </>
      )}

      {tab === 'goleadores' && (
        <section className="card">
          <table className="standings scorers">
            <thead>
              <tr>
                <th className="pos">#</th>
                <th className="team-col">Jugador</th>
                <th className="team-col hide-sm">Equipo</th>
                <th>Goles</th>
              </tr>
            </thead>
            <tbody>
              {topScorers(league, now).map((s, i) => (
                <tr key={`${s.team.id}-${s.player}`}>
                  <td className="pos">{i + 1}</td>
                  <td className="team-col">
                    <Crest team={s.team} size={18} /> {s.player}
                  </td>
                  <td className="team-col hide-sm">
                    <a href={`#/equipo/${s.team.id}`}>{s.team.name}</a>
                  </td>
                  <td className="pts">
                    {s.goals}
                    {s.penalties > 0 && <small> ({s.penalties} p)</small>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </>
  )
}
