import Crest from './Crest.jsx'

const TREND = { 1: ['V', 'win'], 2: ['E', 'draw'], 3: ['D', 'loss'] }

/** Renders one table exactly as the API describes it: columns, rows and destination colours. */
export default function StandingsTable({ name, table, highlight, compact = false }) {
  const columns = compact
    ? table.columns.filter((c) => ['Points', 'GamePlayed', 'Ratio'].includes(c.key))
    : table.columns
  const used = new Set(table.rows.map((r) => r.destination_color).filter(Boolean))

  return (
    <div className="table-card">
      <h3 className="table-name">
        {name}
        {table.is_live && <span className="live-pill">EN VIVO</span>}
      </h3>
      <div className="table-scroll">
        <table className="standings">
          <thead>
            <tr>
              <th className="num">#</th>
              <th className="team-col">Equipos</th>
              {columns.map((c) => (
                <th key={c.key} className={c.type === 3 ? 'trend-col' : c.is_bold ? 'bold' : ''}>
                  {c.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row) => {
              const team = row.entity.object
              const values = Object.fromEntries(row.values.map((v) => [v.key, v.value]))
              return (
                <tr key={team.id} className={team.id === highlight ? 'highlight' : ''}>
                  <td className="num" style={row.destination_color ? { background: row.destination_color, color: '#fff' } : undefined}>
                    {row.num}
                  </td>
                  <td className="team-col">
                    <a href={`#/team/${team.url_name}/${team.id}`}>
                      <Crest team={team} size={18} />
                      <span>{team.name}</span>
                      {team.playing_now && <span className="live-dot" title="Jugando ahora" />}
                    </a>
                  </td>
                  {columns.map((c) =>
                    c.type === 3 ? (
                      <td key={c.key} className="trend-col">
                        <span className="trend">
                          {values[c.key].map((t, i) => (
                            <span key={i} className={`trend-${TREND[t][1]}`}>
                              {TREND[t][0]}
                            </span>
                          ))}
                        </span>
                      </td>
                    ) : (
                      <td key={c.key} className={c.is_bold ? 'bold' : ''}>
                        {values[c.key]}
                      </td>
                    ),
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {!compact && used.size > 0 && (
        <ul className="destinations">
          {table.destinations
            .filter((d) => used.has(d.color))
            .map((d) => (
              <li key={d.num}>
                <span className="dot" style={{ background: d.color }} /> {d.name}
              </li>
            ))}
        </ul>
      )}
    </div>
  )
}
