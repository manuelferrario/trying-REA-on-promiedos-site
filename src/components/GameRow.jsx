import Crest from './Crest.jsx'

const LIVE = 2
const FINISHED = 3

export default function GameRow({ game, showDate = false, label }) {
  const [home, away] = game.teams
  const [date, time] = game.start_time.split(' ')
  const live = game.status.enum === LIVE

  return (
    <a className={`game-row ${live ? 'live' : ''}`} href={`#/game/${game.url_name}/${game.id}`}>
      <span className="game-time">
        {showDate && <small>{date.slice(0, 5).replace('-', '/')}</small>}
        {live ? (
          <span className="live-clock">{game.game_time_to_display}</span>
        ) : game.status.enum === FINISHED ? (
          'Final'
        ) : (
          time
        )}
      </span>
      <span className={`game-team home ${game.winner === 1 ? 'winner' : ''}`}>
        {home.red_cards > 0 && <span className="red-card">{home.red_cards}</span>}
        <span className="team-name">{home.name}</span>
        <Crest team={home} />
      </span>
      <span className="game-score">
        {game.scores ? (
          <>
            <b>{game.scores[0]}</b>
            <b>{game.scores[1]}</b>
          </>
        ) : (
          <i>-</i>
        )}
        {label && <small>{label}</small>}
      </span>
      <span className={`game-team away ${game.winner === 2 ? 'winner' : ''}`}>
        <Crest team={away} />
        <span className="team-name">{away.name}</span>
        {away.red_cards > 0 && <span className="red-card">{away.red_cards}</span>}
      </span>
    </a>
  )
}
