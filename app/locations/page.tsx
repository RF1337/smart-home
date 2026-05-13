"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Tables } from "@/types/database.types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { MapPin, Plus } from "lucide-react"

type Location = Tables<"location">

export default function LocationsPage() {
  const router = useRouter()
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  async function loadLocations(userId: string) {
    const { data, error } = await supabase
      .from("user_location")
      .select("location:location_id ( id, name, address, created_at, join_code )")
      .eq("user_id", userId)

    if (error) {
      console.error(error)
      return
    }

    const locs = (data ?? [])
      .map((row) => row.location)
      .filter(Boolean) as Location[]

    setLocations(locs)
  }

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace("/login")
        return
      }
      await loadLocations(user.id)
      setLoading(false)
    }
    init()
  }, [router])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setCreateError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.replace("/login")
      return
    }

    // Generate the ID client-side so we don't need to SELECT the row back
    // (which would fail RLS before the user_location link exists)
    const locationId = crypto.randomUUID()

    const { error: locError } = await supabase
      .from("location")
      .insert({ id: locationId, name: name.trim(), address: address.trim() || null })

    if (locError) {
      setCreateError(locError.message)
      setCreating(false)
      return
    }

    // Link the user to the new location
    const { error: linkError } = await supabase
      .from("user_location")
      .insert({ user_id: user.id, location_id: locationId })

    if (linkError) {
      setCreateError(linkError.message)
      setCreating(false)
      return
    }

    setName("")
    setAddress("")
    setSheetOpen(false)
    await loadLocations(user.id)
    setCreating(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Indlæser lokationer...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dine lokationer</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Vælg en lokation for at se dens dashboard.
          </p>
        </div>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Opret lokation
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Opret ny lokation</SheetTitle>
            </SheetHeader>

            <form onSubmit={handleCreate} className="mt-6 space-y-4 px-4">
              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="loc-name">
                  Navn <span className="text-destructive">*</span>
                </label>
                <Input
                  id="loc-name"
                  placeholder="f.eks. Hjemmekontor"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="loc-address">
                  Adresse
                </label>
                <Input
                  id="loc-address"
                  placeholder="f.eks. Strandvejen 1, 2100 København"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              {createError && (
                <p className="text-sm text-destructive">{createError}</p>
              )}

              <Button type="submit" className="w-full" disabled={creating}>
                {creating ? "Opretter..." : "Opret"}
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      {locations.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Du har ingen lokationer tilknyttet endnu.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((loc) => (
            <Link key={loc.id} href={`/locations/${loc.id}/dashboard`}>
              <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                <CardContent className="flex items-start gap-4 p-5">
                  <div className="mt-0.5 rounded-md bg-primary/10 p-2">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{loc.name}</p>
                    {loc.address && (
                      <p className="text-sm text-muted-foreground truncate">
                        {loc.address}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
