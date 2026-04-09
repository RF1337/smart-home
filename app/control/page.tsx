'use client'

import { useState } from 'react'

export default function Control() {
  const [temperatureLimit, setTemperatureLimit] = useState('')
  const [interval, setInterval] = useState('')

  const handleSave = () => {
    console.log({
      temperatureLimit,
      interval,
    })

    // 🔥 later: send to Supabase / API / Arduino
    alert('Due to limited time, this functionality has not been implemented.')
  }

  return (
    <div className="w-full max-w-2xl">
      <h1 className="text-2xl text-black font-bold mb-6">Control</h1>

      <div className="flex flex-col gap-6">

        {/* Temperature limit */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-black">
            Temperature limit (°C)
          </label>
          <input
            type="number"
            placeholder="e.g. 30"
            value={temperatureLimit}
            onChange={(e) => setTemperatureLimit(e.target.value)}
            className="px-4 py-2 rounded-lg bg-gray-200 text-black placeholder:text-black"
          />
        </div>

        {/* Interval */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-black">
            Data interval (seconds)
          </label>
          <input
            type="number"
            placeholder="e.g. 60"
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
            className="px-4 py-2 rounded-lg bg-gray-200 text-black placeholder:text-black"
          />
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          className="mt-4 bg-zinc-900 text-white py-2 rounded-lg hover:bg-zinc-800 transition"
        >
          Save
        </button>

      </div>
    </div>
  )
}