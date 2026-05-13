'use client'

import { useState } from 'react'
import { signIn } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const handleLogin = async () => {
    let valid = true
    setEmailError(null)
    setPasswordError(null)
    setErrorMessage(null)

    if (!email.trim()) {
      setEmailError('Email må ikke være tom.')
      valid = false
    } else if (!EMAIL_RE.test(email.trim())) {
      setEmailError('Indtast en gyldig email-adresse.')
      valid = false
    }
    if (!password) {
      setPasswordError('Adgangskode må ikke være tom.')
      valid = false
    }
    if (!valid) return

    setIsSubmitting(true)
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
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              handleLogin()
            }}
          >
            <div className="space-y-1">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(null) }}
                className={`w-full rounded-xl border bg-white px-4 py-3 text-black outline-none transition placeholder:text-zinc-400 focus:border-blue-600 ${
                  emailError ? 'border-red-400 focus:border-red-500' : 'border-zinc-200'
                }`}
              />
              {emailError && <p className="pl-1 text-xs text-red-600">{emailError}</p>}
            </div>

            <div className="space-y-1">
              <input
                type="password"
                placeholder="Adgangskode"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPasswordError(null) }}
                className={`w-full rounded-xl border bg-white px-4 py-3 text-black outline-none transition placeholder:text-zinc-400 focus:border-blue-600 ${
                  passwordError ? 'border-red-400 focus:border-red-500' : 'border-zinc-200'
                }`}
              />
              {passwordError && <p className="pl-1 text-xs text-red-600">{passwordError}</p>}
            </div>

            {errorMessage && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {errorMessage}
              </p>
            )}

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