import { useEffect, useMemo, useState } from 'react'
import { TrendingUp } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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

const chartConfig = {
  bookings: {
    label: 'Bookings',
    color: 'var(--chart-1)',
  },
}

const shortenLabel = (value, max = 14) => {
  const text = String(value || '')
  if (text.length <= max) return text
  return `${text.slice(0, max - 1)}…`
}

const BookingsByStationChart = ({ data: dataProp, loading: loadingProp, className = '' }) => {
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
        const response = await adminApi.getBookingsByStation()
        if (cancelled) return
        setData(unwrapList(response.data, ['stations', 'report']))
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err, 'Failed to load chart data'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [dataProp, loadingProp])

  const chartData = useMemo(
    () =>
      [...data]
        .sort((a, b) => Number(b.bookings || 0) - Number(a.bookings || 0))
        .map((row) => ({
          station: row.station || 'Unknown',
          bookings: Number(row.bookings || 0),
        })),
    [data],
  )

  const totalBookings = useMemo(
    () => chartData.reduce((sum, row) => sum + row.bookings, 0),
    [chartData],
  )

  const topStation = chartData[0]

  return (
    <Card className={`admin-panel border shadow-none ${className}`}>
      <CardHeader>
        <CardTitle className="text-gray-900">Bookings by station</CardTitle>
        <CardDescription>
          Total bookings across all charging stations
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && <p className="err-text mb-4 text-sm">{error}</p>}
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-[280px] w-full rounded-xl" />
          </div>
        ) : chartData.length === 0 ? (
          <p className="py-16 text-center text-sm text-gray-400">No booking data yet.</p>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
            <BarChart accessibilityLayer data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="station"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                interval={0}
                angle={chartData.length > 4 ? -24 : 0}
                textAnchor={chartData.length > 4 ? 'end' : 'middle'}
                height={chartData.length > 4 ? 56 : 32}
                tickFormatter={(value) => shortenLabel(value)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent labelKey="station" />}
              />
              <Bar dataKey="bookings" fill="var(--color-bookings)" radius={8} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
      {!loading && chartData.length > 0 && (
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 font-medium leading-none text-gray-900">
            {topStation.station} leads with {topStation.bookings} bookings
            <TrendingUp className="size-4 text-emerald-600" />
          </div>
          <div className="leading-none text-muted-foreground">
            {totalBookings} total bookings across {chartData.length} station
            {chartData.length === 1 ? '' : 's'}
          </div>
        </CardFooter>
      )}
    </Card>
  )
}

export default BookingsByStationChart
