"use client";

export interface FluxPhase {
  at: number;
  label: string;
}

/**
 * A 9:16 frame with a glowing blue stroke that traces its perimeter to show
 * progress (0–100), a big percentage readout and the current phase label.
 * Children render inside the frame (e.g. the Game of Life loader).
 */
export function ProgressiveFluxLoader({
  value,
  phases = [],
  children,
}: {
  value: number;
  phases?: FluxPhase[];
  children?: React.ReactNode;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const phase = [...phases].reverse().find((p) => clamped >= p.at)?.label ?? "";

  return (
    <div className="relative aspect-[9/16] w-full overflow-hidden rounded-[20px]">
      <div className="absolute inset-0">{children}</div>

      {/* blue tracing border */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 90 160"
        preserveAspectRatio="none"
        fill="none"
      >
        <rect
          x="1.5"
          y="1.5"
          width="87"
          height="157"
          rx="9"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        <rect
          x="1.5"
          y="1.5"
          width="87"
          height="157"
          rx="9"
          pathLength={100}
          stroke="var(--accent-blue-glow)"
          strokeWidth="2.5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          strokeDasharray="100"
          strokeDashoffset={100 - clamped}
          style={{
            transition: "stroke-dashoffset 0.4s ease-out",
            filter: "drop-shadow(0 0 4px rgba(96,165,250,0.9))",
          }}
        />
      </svg>

      {/* center readout */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-center">
        <span
          className="text-4xl font-semibold tracking-tight tabular-nums"
          style={{ textShadow: "0 0 20px rgba(96,165,250,0.5)" }}
        >
          {Math.round(clamped)}
          <span className="text-lg text-muted">%</span>
        </span>
        {phase && (
          <span key={phase} className="animate-rise text-xs tracking-widest text-muted">
            {phase.toUpperCase()}
          </span>
        )}
      </div>
    </div>
  );
}
