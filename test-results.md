# Testing – Smart Room

---

## Test 1 – Komponent-test (Button) ✅

### Hvad testes
| Test | Beskrivelse |
|------|-------------|
| 1 | Knappen renderer med korrekt tekst |
| 2 | `onClick` kaldes præcis én gang ved klik |
| 3 | `onClick` kaldes **ikke**, når `disabled={true}` |

### Oprettede filer
- `vitest.config.ts` — Vitest-konfiguration (jsdom, path aliases, setup-fil)
- `tests/setup.ts` — Importerer `@testing-library/jest-dom`-matchers
- `tests/components/Button.test.tsx` — Selve komponent-testen

### Install commands
```bash
npm install -D @vitejs/plugin-react
```
*(Vitest, jsdom og Testing Library er allerede i projektet)*

### Test-kode

```tsx
// tests/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Button } from '@/components/ui/button'

describe('Button komponent', () => {
  it('renderer knappen med korrekt tekst', () => {
    render(<Button>Log ind</Button>)
    expect(screen.getByRole('button', { name: 'Log ind' })).toBeInTheDocument()
  })

  it('kalder onClick, når man klikker', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Klik her</Button>)
    fireEvent.click(screen.getByRole('button', { name: 'Klik her' }))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('kalder IKKE onClick, når knappen er disabled', () => {
    const handleClick = vi.fn()
    render(<Button disabled onClick={handleClick}>Deaktiveret</Button>)
    fireEvent.click(screen.getByRole('button', { name: 'Deaktiveret' }))
    expect(handleClick).not.toHaveBeenCalled()
  })
})
```

### Tekst til rapport
> *Test 1 er en komponent-test af projektets genbrugelige `Button`-komponent. Testen verificerer tre adfærdsscenarier: at komponenten renderer tekst korrekt, at et klik aktiverer den tilknyttede handler, og at en deaktiveret knap ignorerer klik. Der bruges `@testing-library/react` til rendering og `vi.fn()` fra Vitest til at oprette mock-funktioner, som gør det muligt at tjekke om og hvor mange gange en funktion er kaldt.*

---

## Test 2 – Supabase-test (signIn + getUser) ✅

### Hvad testes
| Test | Beskrivelse |
|------|-------------|
| 2a | `signIn` returnerer bruger-data ved korrekte credentials (succes) |
| 2b | `signIn` kaster en fejl, når Supabase returnerer en fejlbesked |
| 2c | `getUser` returnerer den aktuelle bruger fra sessionen |

### Oprettede filer
- `tests/lib/auth.test.ts` — Supabase auth-testen

### Install commands
```bash
# Ingen ekstra pakker – Vitest og supabase-js er allerede installeret
```

### Sådan mockes Supabase
Supabase-klienten (`lib/supabase.ts`) erstattes med en mock via `vi.mock()`.  
Det betyder, at ingen rigtig database rammes under testen.

### Test-kode

```ts
// tests/lib/auth.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { signIn, getUser } from '@/lib/auth'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      getUser: vi.fn(),
    },
  },
}))

import { supabase } from '@/lib/supabase'

const mockSignIn = supabase.auth.signInWithPassword as ReturnType<typeof vi.fn>
const mockGetUser = supabase.auth.getUser as ReturnType<typeof vi.fn>

describe('Supabase auth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('signIn returnerer data ved korrekte credentials', async () => {
    const fakeUser = { id: 'abc-123', email: 'test@example.com' }
    mockSignIn.mockResolvedValueOnce({
      data: { user: fakeUser, session: {} },
      error: null,
    })

    const result = await signIn('test@example.com', 'hemligt123')

    expect(result.user).toEqual(fakeUser)
    expect(mockSignIn).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'hemligt123',
    })
  })

  it('signIn kaster en fejl ved forkerte credentials', async () => {
    mockSignIn.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' },
    })

    await expect(signIn('test@example.com', 'forkert')).rejects.toThrow(
      'Invalid login credentials',
    )
  })

  it('getUser returnerer den aktuelle bruger', async () => {
    const fakeUser = { id: 'abc-123', email: 'test@example.com' }
    mockGetUser.mockResolvedValueOnce({ data: { user: fakeUser } })

    const user = await getUser()

    expect(user).toEqual(fakeUser)
  })
})
```

### Tekst til rapport
> *Test 2 er en unit-test af projektets Supabase-autentificeringsfunktioner `signIn` og `getUser` fra `lib/auth.ts`. Supabase-klienten mockes med `vi.mock()`, så testen aldrig rammer den rigtige database. Testen dækker både succes-scenariet (korrekte credentials returnerer bruger-data), fejl-scenariet (forkerte credentials kaster en fejl med den forventede besked) og hentning af den aktuelle bruger. `beforeEach` nulstiller alle mocks mellem testene for at undgå, at én tests opsætning påvirker en anden.*

---

## Test 3 – Form/login-test (LoginPage validering) ✅

### Hvad testes
| Test | Beskrivelse |
|------|-------------|
| 3a | Tom email-felt viser fejlbesked "Email må ikke være tom." |
| 3b | Ugyldig email-format viser "Indtast en gyldig email-adresse." |
| 3c | Tomt password-felt viser "Adgangskode må ikke være tom." |
| 3d | Gyldige credentials kalder `signIn` med korrekt email og password |
| 3e | Fejl fra `signIn` vises som fejlbesked i formularen |

### Oprettede filer
- `tests/login/LoginPage.test.tsx` — Formvaliderings-testen

### Mocks brugt
| Mock | Formål |
|------|--------|
| `vi.mock('next/navigation')` | Forhindrer `useRouter` i at crashe uden for Next.js |
| `vi.mock('sonner')` | Undertrykker toast-notifikationer under test |
| `vi.mock('@/lib/auth')` | Styrer hvad `signIn` returnerer |

### Test-kode

```tsx
// tests/login/LoginPage.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import LoginPage from '@/app/login/page'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('@/lib/auth', () => ({
  signIn: vi.fn(),
}))

import { signIn } from '@/lib/auth'
const mockSignIn = signIn as ReturnType<typeof vi.fn>

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

  it('viser fejl, når email-feltet er tomt', async () => {
    render(<LoginPage />)
    const { submitButton } = getFormElements()
    fireEvent.click(submitButton)
    await waitFor(() => {
      expect(screen.getByText('Email må ikke være tom.')).toBeInTheDocument()
    })
  })

  it('viser fejl ved ugyldig email-format', async () => {
    render(<LoginPage />)
    const { emailInput, submitButton } = getFormElements()
    fireEvent.change(emailInput, { target: { value: 'ikke-en-email' } })
    fireEvent.click(submitButton)
    await waitFor(() => {
      expect(screen.getByText('Indtast en gyldig email-adresse.')).toBeInTheDocument()
    })
  })

  it('viser fejl, når password-feltet er tomt', async () => {
    render(<LoginPage />)
    const { emailInput, submitButton } = getFormElements()
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.click(submitButton)
    await waitFor(() => {
      expect(screen.getByText('Adgangskode må ikke være tom.')).toBeInTheDocument()
    })
  })

  it('kalder signIn med korrekt email og password ved valid submit', async () => {
    mockSignIn.mockResolvedValueOnce({})
    render(<LoginPage />)
    const { emailInput, passwordInput, submitButton } = getFormElements()
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'hemligt123' } })
    fireEvent.click(submitButton)
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'hemligt123')
    })
  })

  it('viser fejlbesked, når signIn fejler', async () => {
    mockSignIn.mockRejectedValueOnce(new Error('Invalid login credentials'))
    render(<LoginPage />)
    const { emailInput, passwordInput, submitButton } = getFormElements()
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'forkert' } })
    fireEvent.click(submitButton)
    await waitFor(() => {
      expect(screen.getByText('Invalid login credentials')).toBeInTheDocument()
    })
  })
})
```

### Tekst til rapport
> *Test 3 er en integrations-test af login-formularens validerings- og submitlogik i `app/login/page.tsx`. Testen verificerer, at tomme felter og ugyldigt email-format giver de korrekte danske fejlbeskeder direkte i UI'et, at en valid formular kalder `signIn` med de rigtige argumenter, og at en fejl fra Supabase vises synligt i formularen. `next/navigation`, `sonner` og `@/lib/auth` er alle mocket, så testen er fuldstændig isoleret fra Next.js runtime og den rigtige database. `waitFor` bruges, fordi submit-logikken er asynkron.*

---

## Samlet resultat

| Test | Fil | Tests | Status |
|------|-----|-------|--------|
| 1 – Komponent | `tests/components/Button.test.tsx` | 3 | ✅ |
| 2 – Supabase | `tests/lib/auth.test.ts` | 3 | ✅ |
| 3 – Form/login | `tests/login/LoginPage.test.tsx` | 5 | ✅ |
| **Total** | | **11** | **✅ Alle bestået** |
