import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Button } from '@/components/ui/button'

// ─────────────────────────────────────────────────────────────────────────────
// Test 1 – Komponent-test: Button
//
// Hvad testes her?
//   1. At knappen renderer med den tekst vi sender ind som children.
//   2. At onClick-handleren kaldes, når brugeren klikker på knappen.
//   3. At knappen er deaktiveret (og ikke kalder onClick) når disabled={true}.
// ─────────────────────────────────────────────────────────────────────────────

describe('Button komponent', () => {
  it('renderer knappen med korrekt tekst', () => {
    // Arranger: render knappen med en tekst
    render(<Button>Log ind</Button>)

    // Assert: teksten er synlig i DOM'en
    expect(screen.getByRole('button', { name: 'Log ind' })).toBeInTheDocument()
  })

  it('kalder onClick, når man klikker', () => {
    // Arranger: opret en mock-funktion og render knappen
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Klik her</Button>)

    // Agér: klik på knappen
    fireEvent.click(screen.getByRole('button', { name: 'Klik her' }))

    // Assert: mock-funktionen er kaldt præcis én gang
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('kalder IKKE onClick, når knappen er disabled', () => {
    // Arranger: render en deaktiveret knap
    const handleClick = vi.fn()
    render(
      <Button disabled onClick={handleClick}>
        Deaktiveret
      </Button>,
    )

    // Agér: forsøg at klikke på den deaktiverede knap
    fireEvent.click(screen.getByRole('button', { name: 'Deaktiveret' }))

    // Assert: onClick er IKKE kaldt
    expect(handleClick).not.toHaveBeenCalled()
  })
})
