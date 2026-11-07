/**
 * The app's mark: the tomato-shaped kitchen timer the Pomodoro technique is
 * named after. Pure SVG so it stays crisp at any size and needs no asset.
 */
export default function Tomato({ className = '', spinning = false }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`${className} ${spinning ? 'tomato-spin' : ''}`}
      role="img"
      aria-label="Tomato"
    >
      <defs>
        <radialGradient id="tomatoBody" cx="34%" cy="30%" r="78%">
          <stop offset="0%" stopColor="#ff6b57" />
          <stop offset="45%" stopColor="#e63a28" />
          <stop offset="100%" stopColor="#a81d14" />
        </radialGradient>
        <radialGradient id="tomatoLeaf" cx="30%" cy="25%" r="80%">
          <stop offset="0%" stopColor="#5cc24a" />
          <stop offset="100%" stopColor="#2f7a2a" />
        </radialGradient>
      </defs>

      {/* body, very slightly wider than tall like a real tomato */}
      <ellipse cx="50" cy="57" rx="35" ry="32" fill="url(#tomatoBody)" />

      {/* lobe shading */}
      <ellipse cx="50" cy="57" rx="35" ry="32" fill="none" stroke="#7d1510" strokeOpacity="0.18" strokeWidth="1" />
      <path d="M28 36 Q22 57 30 79" fill="none" stroke="#8e1a12" strokeOpacity="0.22" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M72 36 Q78 57 70 79" fill="none" stroke="#8e1a12" strokeOpacity="0.22" strokeWidth="2.5" strokeLinecap="round" />

      {/* specular highlight */}
      <ellipse cx="37" cy="44" rx="11" ry="7" fill="#fff" opacity="0.28" transform="rotate(-28 37 44)" />

      {/* calyx */}
      <g transform="translate(50 28)">
        {[0, 60, 120, 180, 240, 300].map(a => (
          <ellipse
            key={a}
            cx="9"
            cy="0"
            rx="9.5"
            ry="3.8"
            fill="url(#tomatoLeaf)"
            transform={`rotate(${a})`}
          />
        ))}
        <circle r="4.5" fill="#43932f" />
        <rect x="-2.2" y="-13" width="4.4" height="11" rx="2.2" fill="#3f7d34" />
      </g>
    </svg>
  )
}
