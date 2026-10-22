import Crest from './Crest.jsx'
import { formatTime, matchState } from '../data/engine.js'

export default function MatchRow({ match, now, onOpen, showDate = false }) {
  const st = matchState(match, now)
  const homeWins = st.score && st.status === 'finished' && st.score.home > st.score.away
  const awayWins = st.score && st.status === 'finished' && st.score.away > st.score.home
  const reds = (side) => st.events.filter((e) => e.type === 'red' && e.side === side).length

  return (
    <button type="button" className={`match-row ${st.status}`} onClick={() => onOpen(match)}>
      <span className="match-status">
        {st.status === 'scheduled' && (
          <>
            {showDate && (
              <small>{new Date(match.day).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}</small>
            )}
            {formatTime(match.kickoff)}
          </>
        )}
        {st.status === 'live' && <span className="live-clock">{st.clock}</span>}
        {st.status === 'finished' && (
          <>
            {showDate && (
              <small>{new Date(match.day).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}</small>
            )}
            Final
          </>
        )}
      </span>
      <span className={`team home ${homeWins ? 'winner' : ''}`}>
        {reds('home') > 0 && <span className="red-card" title="Expulsados">{reds('home')}</span>}
        <span className="team-name">{match.home.name}</span>
        <Crest team={match.home} />
      </span>
      <span className="score">
        {st.score ? (
          <>
            <b>{st.score.home}</b>
            <i>-</i>
            <b>{st.score.away}</b>
          </>
        ) : (
          <i>vs</i>
        )}
      </span>
      <span className={`team away ${awayWins ? 'winner' : ''}`}>
        <Crest team={match.away} />
        <span className="team-name">{match.away.name}</span>
        {reds('away') > 0 && <span className="red-card" title="Expulsados">{reds('away')}</span>}
      </span>
    </button>
  )
}
