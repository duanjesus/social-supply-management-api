import { useState } from "react";

import type { MonthlyTrendEntry } from "@/utils/aggregate";

// Validated categorical palette (see dataviz skill): slot 1 blue = doações,
// slot 2 aqua = distribuições. Fixed order, never cycled/reassigned.
const DONATIONS_COLOR = "#2a78d6";
const DISTRIBUTIONS_COLOR = "#1baf7a";

const WIDTH = 640;
const HEIGHT = 220;
const PADDING_LEFT = 28;
const PADDING_RIGHT = 12;
const PADDING_TOP = 12;
const PADDING_BOTTOM = 24;
const PLOT_WIDTH = WIDTH - PADDING_LEFT - PADDING_RIGHT;
const PLOT_HEIGHT = HEIGHT - PADDING_TOP - PADDING_BOTTOM;

function roundedTopBarPath(x: number, y: number, w: number, h: number, r: number): string {
  if (h <= 0) return "";
  const radius = Math.min(r, h, w / 2);
  return `M${x},${y + h} L${x},${y + radius} Q${x},${y} ${x + radius},${y} L${x + w - radius},${y} Q${x + w},${y} ${x + w},${y + radius} L${x + w},${y + h} Z`;
}

interface TrendChartProps {
  data: MonthlyTrendEntry[];
}

export function TrendChart({ data }: TrendChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const maxValue = Math.max(1, ...data.flatMap((entry) => [entry.donations, entry.distributions]));
  const niceMax = Math.ceil(maxValue / 5) * 5 || 5;
  const gridSteps = [0, 0.25, 0.5, 0.75, 1].map((fraction) => Math.round(niceMax * fraction));

  function yFor(value: number): number {
    return PADDING_TOP + PLOT_HEIGHT - (value / niceMax) * PLOT_HEIGHT;
  }

  const groupWidth = PLOT_WIDTH / data.length;
  const barWidth = Math.min(20, groupWidth * 0.28);
  const gap = 3;

  return (
    <div className="px-4 py-4">
      <div className="mb-2 flex items-center gap-4 text-xs text-slate-600">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: DONATIONS_COLOR }} aria-hidden="true" />
          Doações
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: DISTRIBUTIONS_COLOR }}
            aria-hidden="true"
          />
          Distribuições
        </span>
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        role="img"
        aria-label="Doações e distribuições por mês, últimos 6 meses"
      >
        {gridSteps.map((step) => (
          <g key={step}>
            <line
              x1={PADDING_LEFT}
              x2={WIDTH - PADDING_RIGHT}
              y1={yFor(step)}
              y2={yFor(step)}
              stroke={step === 0 ? "#c3c2b7" : "#e1e0d9"}
              strokeWidth={1}
            />
            <text x={PADDING_LEFT - 6} y={yFor(step)} textAnchor="end" dy="0.32em" fontSize={10} fill="#898781">
              {step}
            </text>
          </g>
        ))}

        {data.map((entry, index) => {
          const groupX = PADDING_LEFT + index * groupWidth;
          const donationsX = groupX + groupWidth / 2 - barWidth - gap / 2;
          const distributionsX = groupX + groupWidth / 2 + gap / 2;
          const isHovered = hovered === index;

          return (
            <g
              key={entry.monthKey}
              tabIndex={0}
              onMouseEnter={() => setHovered(index)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(index)}
              onBlur={() => setHovered(null)}
              style={{ cursor: "pointer" }}
            >
              <rect
                x={groupX}
                y={PADDING_TOP}
                width={groupWidth}
                height={PLOT_HEIGHT}
                fill="transparent"
              />
              <path
                d={roundedTopBarPath(donationsX, yFor(entry.donations), barWidth, PLOT_HEIGHT - (yFor(entry.donations) - PADDING_TOP), 3)}
                fill={DONATIONS_COLOR}
                opacity={isHovered ? 1 : 0.9}
              />
              <path
                d={roundedTopBarPath(distributionsX, yFor(entry.distributions), barWidth, PLOT_HEIGHT - (yFor(entry.distributions) - PADDING_TOP), 3)}
                fill={DISTRIBUTIONS_COLOR}
                opacity={isHovered ? 1 : 0.9}
              />
              <text
                x={groupX + groupWidth / 2}
                y={HEIGHT - PADDING_BOTTOM + 16}
                textAnchor="middle"
                fontSize={11}
                fill={isHovered ? "#0b0b0b" : "#52514e"}
              >
                {entry.monthLabel}
              </text>
            </g>
          );
        })}
      </svg>

      <p className="mt-1 h-4 text-center text-xs text-slate-600">
        {hovered !== null &&
          `${data[hovered].monthLabel}: ${data[hovered].donations} doações · ${data[hovered].distributions} distribuições`}
      </p>
    </div>
  );
}
