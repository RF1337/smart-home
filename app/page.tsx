import Dashboard from '@/components/Dashboard'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('temperature')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error(error)
  }

  return (
    <div className="w-full">
        <Dashboard data={data || []} />
    </div>
  )
}