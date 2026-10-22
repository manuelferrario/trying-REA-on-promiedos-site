/** Team badge drawn from the team colours (the real site loads /images/team/{id}/{size}). */
export default function Crest({ team, size = 22 }) {
  const { color, text_color: text } = team.colors
  return (
    <span
      className="crest"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.34,
        background: `linear-gradient(135deg, ${color} 0 50%, ${text} 50% 100%)`,
      }}
      title={team.name}
      aria-hidden="true"
    >
      <span>{team.abbr}</span>
    </span>
  )
}
