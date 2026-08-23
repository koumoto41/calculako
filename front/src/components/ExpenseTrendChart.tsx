import { useId, useState, type MouseEvent } from 'react'
import type { MonthPoint } from '../api/months'

interface ExpenseTrendChartProps {
  points: MonthPoint[]
}

const WIDTH = 600
const HEIGHT = 200
const PAD_LEFT = 48
const PAD_RIGHT = 16
const PAD_TOP = 28
const BASELINE_Y = 150
const AXIS_LABEL_Y = 178

export function ExpenseTrendChart({ points }: ExpenseTrendChartProps) {
  const gradientId = useId()
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  if (points.length === 0) {
    return null
  }

  const max = Math.max(...points.map((point) => point.expenseTotal), 1)
  const plotWidth = WIDTH - PAD_LEFT - PAD_RIGHT
  const step = points.length > 1 ? plotWidth / (points.length - 1) : 0

  const xAt = (index: number) => PAD_LEFT + step * index
  const yAt = (value: number) => BASELINE_Y - (value / max) * (BASELINE_Y - PAD_TOP)

  const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${xAt(index)} ${yAt(point.expenseTotal)}`).join(' ')
  const areaPath = `${linePath} L ${xAt(points.length - 1)} ${BASELINE_Y} L ${xAt(0)} ${BASELINE_Y} Z`

  const gridValues = [0, max / 2, max]
  const lastIndex = points.length - 1
  const lastPoint = points[lastIndex]

  function handleMove(event: MouseEvent<SVGSVGElement>) {
    const svg = event.currentTarget
    const rect = svg.getBoundingClientRect()
    const relativeX = ((event.clientX - rect.left) / rect.width) * WIDTH
    const index = Math.round((relativeX - PAD_LEFT) / (step || 1))
    setHoverIndex(Math.min(Math.max(index, 0), lastIndex))
  }

  const hovered = hoverIndex !== null ? points[hoverIndex] : null

  return (
    <div className="trend-chart">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`直近${points.length}か月の経費合計の推移。今月は${lastPoint.expenseTotal.toLocaleString()}円`}
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.16" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {gridValues.map((value) => (
          <g key={value}>
            <line
              x1={PAD_LEFT}
              x2={WIDTH - PAD_RIGHT}
              y1={yAt(value)}
              y2={yAt(value)}
              stroke="var(--border)"
              strokeWidth={1}
            />
            <text x={PAD_LEFT - 8} y={yAt(value) + 4} textAnchor="end" className="trend-chart-tick">
              {Math.round(value).toLocaleString()}
            </text>
          </g>
        ))}

        <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
        <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {points.map((point, index) => (
          <circle
            key={`${point.year}-${point.month}`}
            cx={xAt(index)}
            cy={yAt(point.expenseTotal)}
            r={index === hoverIndex ? 5 : 4}
            fill="var(--accent)"
            stroke="var(--surface)"
            strokeWidth={2}
          />
        ))}

        {hoverIndex !== null && (
          <line
            x1={xAt(hoverIndex)}
            x2={xAt(hoverIndex)}
            y1={PAD_TOP}
            y2={BASELINE_Y}
            stroke="var(--border)"
            strokeWidth={1}
          />
        )}

        {/* Value at the end, per the "label the endpoint" rule - not every point. */}
        <text x={xAt(lastIndex)} y={yAt(lastPoint.expenseTotal) - 12} textAnchor="middle" className="trend-chart-endpoint">
          {lastPoint.expenseTotal.toLocaleString()}円
        </text>

        {points.map((point, index) => (
          <text key={`${point.year}-${point.month}-label`} x={xAt(index)} y={AXIS_LABEL_Y} textAnchor="middle" className="trend-chart-tick">
            {point.month}月
          </text>
        ))}
      </svg>

      {hovered && (
        <p className="trend-chart-status" role="status">
          {hovered.year}年{hovered.month}月: {hovered.expenseTotal.toLocaleString()}円
        </p>
      )}
    </div>
  )
}
