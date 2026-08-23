import { render, screen, fireEvent } from '@testing-library/react'
import { ExpenseTrendChart } from './ExpenseTrendChart'
import type { MonthPoint } from '../api/months'

const points: MonthPoint[] = [
  { year: 2026, month: 5, expenseTotal: 10000 },
  { year: 2026, month: 6, expenseTotal: 20000 },
  { year: 2026, month: 7, expenseTotal: 5000 },
  { year: 2026, month: 8, expenseTotal: 30000 },
]

beforeAll(() => {
  // jsdom doesn't lay out SVG, so give the chart a realistic bounding box
  // for the hover math to work against.
  jest.spyOn(SVGSVGElement.prototype, 'getBoundingClientRect').mockReturnValue({
    width: 600,
    height: 200,
    left: 0,
    top: 0,
    right: 600,
    bottom: 200,
    x: 0,
    y: 0,
    toJSON: () => {},
  })
})

test('labels the endpoint value directly, without hovering', () => {
  render(<ExpenseTrendChart points={points} />)

  expect(screen.getByText('30,000円')).toBeInTheDocument()
})

test('hovering over an earlier point shows its month and value', () => {
  render(<ExpenseTrendChart points={points} />)

  const svg = document.querySelector('svg') as unknown as SVGSVGElement
  // The chart plots 4 points evenly across its width; aim near the second one.
  fireEvent.mouseMove(svg, { clientX: 48 + (600 - 48 - 16) / 3, clientY: 100 })

  expect(screen.getByText('2026年6月: 20,000円')).toBeInTheDocument()
})

test('renders nothing for an empty trend', () => {
  const { container } = render(<ExpenseTrendChart points={[]} />)

  expect(container).toBeEmptyDOMElement()
})
