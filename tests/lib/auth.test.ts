import { describe, it, expect, vi, beforeEach } from 'vitest'
import { signIn, getUser } from '@/lib/auth'

// ─────────────────────────────────────────────────────────────────────────────
// Test 2 – Supabase-test: signIn og getUser
//
// Hvad testes her?
//   1. signIn returnerer bruger-data ved korrekte credentials (succes).
//   2. signIn kaster en fejl, når Supabase returnerer en fejlbesked.
//   3. getUser returnerer den aktuelle bruger fra Supabase-sessionen.
//
// Supabase-klienten er mocket via vi.mock(), så ingen rigtig database rammes.
// ─────────────────────────────────────────────────────────────────────────────

// Mock hele supabase-modulet, så auth-metoderne er under vores kontrol
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      getUser: vi.fn(),
    },
  },
}))

// Importer den mockede klient EFTER vi.mock()
import { supabase } from '@/lib/supabase'

// Hjælpefunktion til at sætte mock-returværdi for signInWithPassword
const mockSignIn = supabase.auth.signInWithPassword as ReturnType<typeof vi.fn>
const mockGetUser = supabase.auth.getUser as ReturnType<typeof vi.fn>

describe('Supabase auth', () => {
  beforeEach(() => {
    vi.clearAllMocks() // nulstil alle mocks mellem hver test
  })

  // ── Test 2a: signIn succes ──────────────────────────────────────────────
  it('signIn returnerer data ved korrekte credentials', async () => {
    // Arranger: Supabase svarer med en bruger (ingen fejl)
    const fakeUser = { id: 'abc-123', email: 'test@example.com' }
    mockSignIn.mockResolvedValueOnce({
      data: { user: fakeUser, session: {} },
      error: null,
    })

    // Agér: kald signIn med gyldige credentials
    const result = await signIn('test@example.com', 'hemligt123')

    // Assert: vi får data tilbage og signInWithPassword er kaldt med de rigtige værdier
    expect(result.user).toEqual(fakeUser)
    expect(mockSignIn).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'hemligt123',
    })
  })

  // ── Test 2b: signIn fejl ────────────────────────────────────────────────
  it('signIn kaster en fejl ved forkerte credentials', async () => {
    // Arranger: Supabase svarer med en fejl
    mockSignIn.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' },
    })

    // Assert: signIn kaster en fejl med den rigtige besked
    await expect(signIn('test@example.com', 'forkert')).rejects.toThrow(
      'Invalid login credentials',
    )
  })

  // ── Test 2c: getUser returnerer bruger ──────────────────────────────────
  it('getUser returnerer den aktuelle bruger', async () => {
    // Arranger: Supabase svarer med en bruger
    const fakeUser = { id: 'abc-123', email: 'test@example.com' }
    mockGetUser.mockResolvedValueOnce({ data: { user: fakeUser } })

    // Agér
    const user = await getUser()

    // Assert
    expect(user).toEqual(fakeUser)
  })
})
