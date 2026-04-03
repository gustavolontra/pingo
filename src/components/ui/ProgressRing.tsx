interface Props {
  value: number   // 0-100
  size?: number
  strokeWidth?: number
  color?: string
  children?: React.ReactNode
}

export default function ProgressRing({
  value, size = 80, strokeWidth = 7, color = '#6270f5', children,
}: Props) {
  const r = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="progress-ring">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="rgba(99,143,255,0.12)" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}
