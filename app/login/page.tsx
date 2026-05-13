'use client'

import { useState } from 'react'
import { signIn } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleLogin = async () => {
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      await signIn(email, password)
      toast.success('Logget ind!')
      router.push('/locations')
    } catch (err: any) {
      const msg = err?.message ?? 'Kunne ikke logge ind'
      setErrorMessage(msg)
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex w-full max-w-3xl items-center justify-center">
        <main className="w-full max-w-md rounded-2xl bg-white p-8 shadow-[0_18px_50px_-32px_rgba(0,0,0,0.12)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
            Smart Room
          </p>
          <h1 className="mt-3 text-3xl font-bold text-black">Log ind</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Få adgang til dit live dashboard.
          </p>

          <form
            className="mt-7 space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              handleLogin()
            }}
          >
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-black outline-none transition placeholder:text-zinc-400 focus:border-blue-600"
              required
            />

            <input
              type="password"
              placeholder="Adgangskode"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-black outline-none transition placeholder:text-zinc-400 focus:border-blue-600"
              required
            />

            {errorMessage ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {errorMessage}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Logger ind...' : 'Log ind'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-600">
            Ingen konto endnu?{' '}
            <button
              onClick={() => router.push('/sign-up')}
              className="font-semibold text-blue-600 underline-offset-4 hover:underline"
            >
              Opret bruger
            </button>
          </p>
        </main>
      </div>
    </div>
  )
}