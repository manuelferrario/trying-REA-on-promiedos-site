import { useState } from 'react'
import Crest from '../components/Crest.jsx'
import GameRow from '../components/GameRow.jsx'
import StandingsTable from '../components/StandingsTable.jsx'
import { getLeague, getLeagueGames } from '../api/client.js'
import { usePolling } from '../lib/usePolling.js'

const TABS = [
  { id: 'fixture', label: 'Fixture y tablas' },
  { id: 'stats', label: 'Equipos y estadísticas' },
]

function Fixture({ leagueId, filters }) {
  const [key, setKey] = useState('latest')
  const { data, loading } = usePolling(`league-games/${leagueId}/${key}`, () => getLeagueGames(leagueId, key))
  const groups = [...new Set((data?.games ?? []).map((g) => g.group ?? ''))]

  return (
    <section className="panel">
      <div className="fixture-head">
        <h2>Fixture</h2>
        <select id="fixture-filter" value={key} onChange={(e) => setKey(e.target.value)} aria-label="Fecha">
          {filters.map((f) => (
            <option key={f.key} value={f.key}>
              {f.name}
            </option>
          ))}
        </select>
      </div>
      {loading && <div className="skeleton">Cargando…</div>}
      {data &&
        groups.map((group) => (
          <div key={group}>
            {group && <h3 className="group-name">{group}</h3>}
            {data.games
              .filter((g) => (g.group ?? '') === group)
              .map((g) => (
                <GameRow key={g.id} game={g} showDate />
              ))}
          </div>
        ))}
      {data?.free.length > 0 && <p className="free">Libre: {data.free.map((t) => t.name).join(', ')}</p>}
    </section>
  )
}

function PlayerStats({ tables }) {
  return (
    <div className="stats-grid">
      {tables.map((t) => (
        <section key={t.name} className="panel">
          <h2 className="panel-title">{t.name}</h2>
          {t.rows.length === 0 ? (
            <p className="empty">Sin datos todavía.</p>
          ) : (
            <table className="standings players">
              <thead>
                <tr>
                  <th className="num">#</th>
                  <th className="team-col">Jugador</th>
                  {t.columns.map((c) => (
                    <th key={c.key} className="bold">
                      {c.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {t.rows.map((r) => (
                  <tr key={`${r.entity.object.team_id}-${r.entity.object.name}`}>
                    <td className="num">{r.num}</td>
                    <td className="team-col">
                      <a href={`#/team/${r.entity.object.team.url_name}/${r.entity.object.team_id}`}>
                        <Crest team={r.entity.object.team} size={18} />
                        <span>
                          {r.entity.object.name}
                          <small>{r.entity.object.team.name}</small>
                        </span>
                      </a>
                    </td>
                    {r.values.map((v) => (
                      <td key={v.key} className="bold">
                        {v.value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      ))}
    </div>
  )
}

export default function LeaguePage({ leagueId }) {
  const [tab, setTab] = useState('fixture')
  const { data, loading, error } = usePolling(`league/${leagueId}`, () => getLeague(leagueId))

  if (error) return <div className="panel empty">{error.message}</div>
  if (loading) return <div className="panel skeleton">Cargando liga…</div>

  return (
    <>
      <h1 className="page-title">
        {data.league.flag} {data.league.name}
      </h1>
      <nav className="page-tabs" role="tablist">
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
        <div className="league-grid">
          <div className="tables-col">
            {data.tables_groups.map((group) => (
              <section key={group.name} className="panel">
                <h2 className="panel-title">{group.name}</h2>
                {group.tables.map((t) => (
                  <StandingsTable key={t.name} name={t.name} table={t.table} />
                ))}
              </section>
            ))}
          </div>
          <Fixture leagueId={leagueId} filters={data.games.filters} />
        </div>
      )}

      {tab === 'stats' && <PlayerStats tables={data.players_statistics.tables} />}
    </>
  )
}
