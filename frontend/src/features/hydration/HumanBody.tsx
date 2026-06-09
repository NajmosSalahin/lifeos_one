interface HumanBodyProps {
  fillLevel: number;
}

export function HumanBody({ fillLevel }: HumanBodyProps) {
  const clampedFill = Math.max(0, Math.min(1, fillLevel));
  const fillHeight = clampedFill * 160;
  const fillY = 180 - fillHeight;

  return (
    <svg width="100" height="200" viewBox="0 0 100 200" className="drop-shadow-sm">
      <defs>
        <linearGradient id="waterGrad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.8} />
          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0.4} />
        </linearGradient>
      </defs>

      <path
        d="M50 5 C50 5 20 40 20 80 C20 110 35 140 35 160 C35 175 42 185 50 190 C58 185 65 175 65 160 C65 140 80 110 80 80 C80 40 50 5 50 5Z"
        fill="none"
        stroke="var(--color-border)"
        strokeWidth="2"
      />

      {clampedFill > 0 && (
        <clipPath id="bodyClip">
          <path d="M50 5 C50 5 20 40 20 80 C20 110 35 140 35 160 C35 175 42 185 50 190 C58 185 65 175 65 160 C65 140 80 110 80 80 C80 40 50 5 50 5Z" />
        </clipPath>
      )}

      {clampedFill > 0 && (
        <rect
          x="15"
          y={fillY}
          width="70"
          height={fillHeight}
          fill="url(#waterGrad)"
          clipPath="url(#bodyClip)"
          style={{ transition: 'y 0.5s ease, height 0.5s ease' }}
        >
          <animate
            attributeName="opacity"
            values="0.6;0.8;0.6"
            dur="3s"
            repeatCount="indefinite"
          />
        </rect>
      )}
    </svg>
  );
}
