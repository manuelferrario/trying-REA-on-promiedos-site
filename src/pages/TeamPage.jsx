import Crest from '../components/Crest.jsx'
import MatchRow from '../components/MatchRow.jsx'
import StandingsTable from '../components/StandingsTable.jsx'
import { matchState, standings, teamMatches } from '../data/engine.js'

export default function TeamPage({ team, league, now, onOpen }) {
  const matches = teamMatches(team.id)
  const played = matches.filter((m) => matchState(m, now).status !== 'scheduled')
  const upcoming = matches.filter((m) => matchState(m, now).status === 'scheduled')
  const group = standings(league, now, true)[team.group]
  const pos = group.rows.findIndex((r) => r.team.id === team.id) + 1

  return (
    <>
      <div className="league-hero team-hero">
        <Crest team={team} size={64} />
        <div>
          <h1>{team.name}</h1>
          <a href={`#/liga/${league.id}`}>
            {league.flag} {league.name}
            {group.name ? ` · ${group.name}` : ''} · {pos}º
          </a>
        </div>
      </div>

      <div className="team-grid">
        <div>
          <section className="card">
            <h3 className="card-title">Próximos partidos</h3>
            {upcoming.slice(0, 5).map((m) => (
              <MatchRow key={m.id} match={m} now={now} onOpen={onOpen} showDate />
            ))}
            {upcoming.length === 0 && <p className="empty">No hay partidos programados.</p>}
          </section>
          <section className="card">
            <h3 className="card-title">Últimos resultados</h3>
            {played
              .slice(-8)
              .reverse()
              .map((m) => (
                <MatchRow key={m.id} match={m} now={now} onOpen={onOpen} showDate />
              ))}
          </section>
        </div>
        <section>
          <h3 className="section-title">Plantel</h3>
          <ul className="card squad">
            {team.squad.map((p, i) => (
              <li key={p}>
                <span className="num">{i + 1}</span> {p}
                {i === 0 && <small>Arquero</small>}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <StandingsTable league={league} group={group} highlight={team.id} />
    </>
  )
}
