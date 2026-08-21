import { useEffect, useMemo, useState } from 'react'
import { PolarGrid, RadialBar, RadialBarChart } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { adminApi, getErrorMessage, unwrapList } from '@/src/lib/api'

const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

const buildChartModel = (rows) => {
  const sorted = [...rows]
    .sort((a, b) => Number(b.usage || 0) - Number(a.usage || 0))
    .slice(0, 5)

  const chartData = sorted.map((row, index) => {
    const key = `c${index}`
    return {
      key,
      charger: row.charger || 'Unknown',
      usage: Number(row.usage || 0),
      fill: `var(--color-${key})`,
    }
  })

  const chartConfig = {
    usage: {
      label: 'Sessions',
    },
  }

  chartData.forEach((row, index) => {
    chartConfig[row.key] = {
      label: row.charger,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }
  })

  return { chartData, chartConfig }
}

const ChargerUtilizationChart = ({ data: dataProp, loading: loadingProp, className = '' }) => {
  const [data, setData] = useState(dataProp ?? [])
  const [loading, setLoading] = useState(loadingProp ?? !dataProp)
  const [error, setError] = useState('')

  useEffect(() => {
    if (dataProp) {
      setData(dataProp)
      setLoading(Boolean(loadingProp))
      return undefined
    }

    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const response = await adminApi.getChargerUtilization()
        if (cancelled) return
        setData(unwrapList(response.data, ['chargers', 'report']))
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err, 'Failed to load utilization data'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [dataProp, loadingProp])

  const { chartData, chartConfig } = useMemo(() => buildChartModel(data), [data])

  return (
    <Card className={`admin-panel flex flex-col border shadow-none ${className}`}>
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-gray-900">Charger utilization</CardTitle>
        <CardDescription>
          Top chargers by non-cancelled booking sessions
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {error && <p className="err-text mb-4 text-center text-sm">{error}</p>}
        {loading ? (
          <Skeleton className="mx-auto aspect-square max-h-[250px] w-full max-w-[250px] rounded-full" />
        ) : chartData.length === 0 ? (
          <p className="py-16 text-center text-sm text-gray-400">No utilization data yet.</p>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <RadialBarChart data={chartData} innerRadius={30} outerRadius={100}>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel nameKey="key" />}
              />
              <PolarGrid gridType="circle" />
              <RadialBar dataKey="usage" background cornerRadius={4} />
            </RadialBarChart>
          </ChartContainer>
        )}
      </CardContent>
      {!loading && chartData.length > 0 && (
        <ul className="mt-4 grid grid-cols-1 gap-2 px-6 pb-6 sm:grid-cols-2">
          {chartData.map((row) => (
            <li key={row.key} className="flex items-center justify-between gap-2 text-xs">
              <span className="flex min-w-0 items-center gap-2 text-gray-600">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: row.fill }}
                />
                <span className="mono truncate">{row.charger}</span>
              </span>
              <span className="mono shrink-0 font-medium text-gray-900">{row.usage}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

export default ChargerUtilizationChart
