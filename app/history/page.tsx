import { createClient } from '@/lib/supabase/server'

export default async function History() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('temperature')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error(error)
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl text-black font-bold mb-6">History</h1>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow overflow-hidden">
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            
            {/* Header */}
            <thead className="bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-600 dark:text-zinc-300">
              <tr>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Temperature</th>
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {data?.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                >
                  <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-300">
                    {new Date(item.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {item.value}°C
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  )
}