export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Magnifying glass with colorful gradient */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="33%" stopColor="#6366f1" />
          <stop offset="66%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      
      {/* Glass circle */}
      <circle
        cx="17"
        cy="17"
        r="11"
        stroke="url(#logoGradient)"
        strokeWidth="3"
        fill="none"
      />
      
      {/* Handle */}
      <line
        x1="25"
        y1="25"
        x2="35"
        y2="35"
        stroke="url(#logoGradient)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      
      {/* Inner detail - blockchain blocks */}
      <rect
        x="12"
        y="12"
        width="4"
        height="4"
        rx="0.5"
        fill="url(#logoGradient)"
        opacity="0.7"
      />
      <rect
        x="18"
        y="12"
        width="4"
        height="4"
        rx="0.5"
        fill="url(#logoGradient)"
        opacity="0.5"
      />
      <rect
        x="12"
        y="18"
        width="4"
        height="4"
        rx="0.5"
        fill="url(#logoGradient)"
        opacity="0.5"
      />
      <rect
        x="18"
        y="18"
        width="4"
        height="4"
        rx="0.5"
        fill="url(#logoGradient)"
        opacity="0.3"
      />
    </svg>
  )
}
