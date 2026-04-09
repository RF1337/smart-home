'use client'

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

export default function TemperatureChart({ data }: Props) {
  const formattedData = data.map((item) => ({
    ...item,
    time: new Date(item.created_at).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  }))

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData}>
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip 
            contentStyle={{
                backgroundColor: '#18181b', // dark bg (zinc-900)
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
            }}
            labelStyle={{ color: '#a1a1aa' }} // lighter gray for timestamp
            itemStyle={{ color: '#fff' }} // value text
          />
          <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}