'use client'

import { useState, useMemo } from 'react'
import TemperatureChart from './TemperatureChart'

type Props = {
  data: any[]
}

const filters = [
  { label: '1D', days: 1 },
  { label: '1W', days: 7 },
  { label: '1M', days: 30 },
  { label: '1Y', days: 365 },
]

export default function Dashboard({ data }: Props) {
  const [selected, setSelected] = useState(1)

  // 🔥 Filter data based on time
  const filteredData = useMemo(() => {
    const now = new Date()

    return data.filter((item) => {
      const date = new Date(item.created_at)
      const diff =
        (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)

      return diff <= selected
    })
  }, [data, selected])

  // 🔥 Stats
  const stats = useMemo(() => {
    if (!filteredData.length) {
      return { min: '0', max: '0', avg: '0' }
    }

    const values = filteredData.map((d) => d.value)

    const min = Math.min(...values)
    const max = Math.max(...values)
    const avg = values.reduce((a, b) => a + b, 0) / values.length

    return {
      min: min.toFixed(1),
      max: max.toFixed(1),
      avg: avg.toFixed(1),
    }
  }, [filteredData])

  return (
    <div className="flex flex-col gap-8 w-full h-full">

      {/* 🔹 Top section */}
      <div className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-2xl shadow w-full">

        {/* Header */}
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.label}
              onClick={() => setSelected(f.days)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selected === f.days
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="w-full h-[350px] md:h-[400px]">
          <TemperatureChart data={filteredData} />
        </div>
      </div>

      {/* 🔹 Bottom section (Stats) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <StatCard title="Min Temperature" value={`${stats.min}°C`} />
        <StatCard title="Max Temperature" value={`${stats.max}°C`} />
        <StatCard title="Average Temperature" value={`${stats.avg}°C`} />
      </div>
    </div>
  )
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow w-full">
      <p className="text-zinc-500 text-sm">{title}</p>
      <h2 className="text-3xl md:text-4xl font-bold mt-2">{value}</h2>
    </div>
  )
}