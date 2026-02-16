'use client';

interface CompletenessRingProps {
  value: number; // 0-100
  size?: number;
}

export default function CompletenessRing({ value, size = 20 }: CompletenessRingProps) {
  const strokeWidth = 2.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  const color =
    value >= 80 ? '#16a34a' : // green-600
    value >= 50 ? '#ca8a04' : // yellow-600
    '#dc2626';                // red-600

  return (
    <div className="relative" style={{ width: size, height: size }} title={`${value}% completo`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e5e5"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center text-neutral-500 font-medium"
        style={{ fontSize: size * 0.32 }}
      >
        {value}
      </span>
    </div>
  );
}
