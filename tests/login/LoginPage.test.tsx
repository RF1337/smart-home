import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import LoginPage from '@/app/login/page'

// ─────────────────────────────────────────────────────────────────────────────
// Test 3 – Form/login-test: LoginPage validering og submit
//
// Hvad testes her?
//   1. Tom email-felt viser fejlbesked "Email må ikke være tom."
//   2. Ugyldig email-format viser fejlbesked "Indtast en gyldig email-adresse."
//   3. Tomt password-felt viser fejlbesked "Adgangskode må ikke være tom."
//   4. Gyldige credentials kalder signIn med korrekt email og password.
//   5. Fejl fra signIn vises som en fejlbesked i formularen.
// ─────────────────────────────────────────────────────────────────────────────

// Mock next/navigation, så useRouter ikke crasher uden for Next.js
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

// Mock sonner toast, så vi ikke får UI-advarsler under test
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

// Mock signIn fra lib/auth – vi styrer hvad den returnerer
vi.mock('@/lib/auth', () => ({
  signIn: vi.fn(),
}))

import { signIn } from '@/lib/auth'
const mockSignIn = signIn as ReturnType<typeof vi.fn>

// Hjælpefunktion: hent de to inputfelter og submit-knappen
function getFormElements() {
  const emailInput = screen.getByPlaceholderText('Email')
  const passwordInput = screen.getByPlaceholderText('Adgangskode')
  const submitButton = screen.getByRole('button', { name: 'Log ind' })
  return { emailInput, passwordInput, submitButton }
}

describe('LoginPage – formvalidering', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Test 3a: Tom email ──────────────────────────────────────────────────
  it('viser fejl, når email-feltet er tomt', async () => {
    render(<LoginPage />)
    const { submitButton } = getFormElements()

    // Agér: klik submit uden at udfylde noget
    fireEvent.click(submitButton)

    // Assert: fejlbesked for email vises
    await waitFor(() => {
      expect(screen.getByText('Email må ikke være tom.')).toBeInTheDocument()
    })
  })

  // ── Test 3b: Ugyldig email ──────────────────────────────────────────────
  it('viser fejl ved ugyldig email-format', async () => {
    render(<LoginPage />)
    const { emailInput, submitButton } = getFormElements()

    // Agér: skriv en ugyldig email og klik submit
    fireEvent.change(emailInput, { target: { value: 'ikke-en-email' } })
    fireEvent.click(submitButton)

    // Assert: fejlbesked for ugyldigt format vises
    await waitFor(() => {
      expect(
        screen.getByText('Indtast en gyldig email-adresse.'),
      ).toBeInTheDocument()
    })
  })

  // ── Test 3c: Tomt password ──────────────────────────────────────────────
  it('viser fejl, når password-feltet er tomt', async () => {
    render(<LoginPage />)
    const { emailInput, submitButton } = getFormElements()

    // Agér: udfyld kun email og klik submit
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.click(submitButton)

    // Assert: fejlbesked for tomt password vises
    await waitFor(() => {
      expect(
        screen.getByText('Adgangskode må ikke være tom.'),
      ).toBeInTheDocument()
    })
  })

  // ── Test 3d: Korrekt submit kalder signIn med rigtige værdier ───────────
  it('kalder signIn med korrekt email og password ved valid submit', async () => {
    mockSignIn.mockResolvedValueOnce({}) // simulér succes
    render(<LoginPage />)
    const { emailInput, passwordInput, submitButton } = getFormElements()

    // Agér: udfyld begge felter og klik submit
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'hemligt123' } })
    fireEvent.click(submitButton)

    // Assert: signIn er kaldt med de korrekte værdier
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'hemligt123')
    })
  })

  // ── Test 3e: Fejl fra signIn vises i formularen ─────────────────────────
  it('viser fejlbesked, når signIn fejler', async () => {
    mockSignIn.mockRejectedValueOnce(new Error('Invalid login credentials'))
    render(<LoginPage />)
    const { emailInput, passwordInput, submitButton } = getFormElements()

    // Agér: udfyld formularen og klik submit
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'forkert' } })
    fireEvent.click(submitButton)

    // Assert: fejlbeskeden fra signIn vises i formularen
    await waitFor(() => {
      expect(
        screen.getByText('Invalid login credentials'),
      ).toBeInTheDocument()
    })
  })
})
