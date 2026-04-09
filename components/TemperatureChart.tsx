'use client'

import { useEffect, useMemo, useState } from 'react'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

type Props = {
  data: any[]
}

const POINTS_PER_VIEW = 10

export default function TemperatureChart({ data }: Props) {
  const formattedData = useMemo(
    () =>
      data.map((item) => {
        const date = new Date(item.created_at)

        return {
          ...item,
          time: date.toLocaleString([], {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
        }
      }),
    [data]
  )

  const totalPages = Math.max(1, Math.ceil(formattedData.length / POINTS_PER_VIEW))
  const [page, setPage] = useState(0)

  useEffect(() => {
    setPage(0)
  }, [totalPages])

  const pagedData = useMemo(() => {
    const start = page * POINTS_PER_VIEW
    return formattedData.slice(start, start + POINTS_PER_VIEW)
  }, [formattedData, page])

  const canGoPrev = page > 0
  const canGoNext = page < totalPages - 1

  return (
    <div className="w-full h-[300px] flex flex-col gap-3">
      <div className="w-full flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={pagedData}>
            <XAxis dataKey="time" tick={{ fontSize: 12 }} minTickGap={20} />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: '#18181b',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
              }}
              labelStyle={{ color: '#a1a1aa' }}
              itemStyle={{ color: '#fff' }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#8884d8"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={!canGoPrev}
            className="px-3 py-1.5 text-sm rounded-md bg-zinc-200 text-zinc-900 hover:bg-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
          >
            Previous
          </button>

          <span className="text-sm text-zinc-600 dark:text-zinc-300">
            View {page + 1} of {totalPages} (max {POINTS_PER_VIEW} values)
          </span>

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={!canGoNext}
            className="px-3 py-1.5 text-sm rounded-md bg-zinc-200 text-zinc-900 hover:bg-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}