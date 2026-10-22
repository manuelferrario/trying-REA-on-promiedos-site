export default function Crest({ team, size = 22 }) {
  const [c1, c2] = team.colors
  return (
    <span
      className="crest"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.34,
        background: `linear-gradient(135deg, ${c1} 0 50%, ${c2} 50% 100%)`,
      }}
      title={team.name}
      aria-hidden="true"
    >
      <span>{team.short}</span>
    </span>
  )
}
