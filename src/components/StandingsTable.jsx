import Crest from './Crest.jsx'

function zoneFor(zones, pos, size) {
  return zones.find((z) => {
    const to = z.to > size ? size : z.to
    return pos >= z.from && pos <= to
  })
}

export default function StandingsTable({ league, group, compact = false, highlight }) {
  return (
    <div className="card">
      {group.name && <h3 className="card-title">{group.name}</h3>}
      <div className="table-wrap">
        <table className="standings">
          <thead>
            <tr>
              <th className="pos">#</th>
              <th className="team-col">Equipo</th>
              <th>Pts</th>
              <th>PJ</th>
              {!compact && (
                <>
                  <th className="hide-sm">G</th>
                  <th className="hide-sm">E</th>
                  <th className="hide-sm">P</th>
                  <th className="hide-sm">GF</th>
                  <th className="hide-sm">GC</th>
                </>
              )}
              <th>Dif</th>
              {!compact && <th className="hide-sm">Últimos</th>}
            </tr>
          </thead>
          <tbody>
            {group.rows.map((r, i) => {
              const zone = zoneFor(league.zones, i + 1, group.rows.length)
              return (
                <tr key={r.team.id} className={r.team.id === highlight ? 'highlight' : ''}>
                  <td className={`pos ${zone ? `zone-${zone.kind}` : ''}`} title={zone?.label}>
                    {i + 1}
                  </td>
                  <td className="team-col">
                    <a href={`#/equipo/${r.team.id}`}>
                      <Crest team={r.team} size={18} />
                      <span>{r.team.name}</span>
                      {r.live && <span className="live-dot" title="Jugando ahora" />}
                    </a>
                  </td>
                  <td className="pts">{r.pts}</td>
                  <td>{r.pj}</td>
                  {!compact && (
                    <>
                      <td className="hide-sm">{r.pg}</td>
                      <td className="hide-sm">{r.pe}</td>
                      <td className="hide-sm">{r.pp}</td>
                      <td className="hide-sm">{r.gf}</td>
                      <td className="hide-sm">{r.gc}</td>
                    </>
                  )}
                  <td>{r.dif > 0 ? `+${r.dif}` : r.dif}</td>
                  {!compact && (
                    <td className="hide-sm">
                      <span className="form">
                        {r.form.map((f, k) => (
                          <span key={k} className={`form-${f}`}>{f}</span>
                        ))}
                      </span>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {!compact && (
        <ul className="legend">
          {league.zones.map((z) => (
            <li key={z.label}>
              <span className={`swatch zone-${z.kind}`} /> {z.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
