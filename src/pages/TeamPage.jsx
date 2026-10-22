import Crest from '../components/Crest.jsx'
import GameRow from '../components/GameRow.jsx'
import StandingsTable from '../components/StandingsTable.jsx'
import { getTeam } from '../api/client.js'
import { usePolling } from '../lib/usePolling.js'

export default function TeamPage({ teamId }) {
  const { data, loading, error } = usePolling(`team/${teamId}`, () => getTeam(teamId))
  if (error) return <div className="panel empty">{error.message}</div>
  if (loading) return <div className="panel skeleton">Cargando equipo…</div>

  const { competitor: team, league } = data
  const pos = data.table.table.rows.find((r) => r.entity.object.id === team.id)?.num

  return (
    <>
      <div className="team-hero">
        <Crest team={team} size={64} />
        <div>
          <h1 className="page-title left">{team.name}</h1>
          <a href={`#/league/${league.url_name}/${league.id}`}>
            {league.flag} {league.name} · {data.table.name} · {pos}º
          </a>
        </div>
      </div>

      <div className="team-grid">
        <div className="team-col-main">
          <section className="panel">
            <h2 className="panel-title">Próximos partidos</h2>
            {data.next.length === 0 && <p className="empty">No hay partidos programados.</p>}
            {data.next.map((g) => (
              <GameRow key={g.id} game={g} showDate />
            ))}
          </section>
          <section className="panel">
            <h2 className="panel-title">Últimos resultados</h2>
            {data.last.map((g) => (
              <GameRow key={g.id} game={g} showDate />
            ))}
          </section>
        </div>
        <section className="panel">
          <h2 className="panel-title">Plantel</h2>
          <ul className="squad">
            {data.squad.map((p, i) => (
              <li key={p}>
                <span className="squad-num">{i + 1}</span> {p}
                {i === 0 && <small>Arquero</small>}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="panel">
        <StandingsTable name={data.table.name} table={data.table.table} highlight={team.id} />
      </section>
    </>
  )
}
