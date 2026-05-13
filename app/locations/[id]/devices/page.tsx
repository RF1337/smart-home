"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Tables } from "@/types/database.types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Plus, Loader2, Cpu } from "lucide-react"
import { toast } from "sonner"

type Sensor = Tables<"sensor">

const SETUP_STEPS = [
  {
    step: 1,
    title: "Tilslut enheden til strøm",
    description: "Sørg for, at din enhed er korrekt tilsluttet en strømkilde.",
  },
  {
    step: 2,
    title: "Find aktiveringskoden",
    description: "Aktiveringskoden vises på enhedens display eller medfølgende kort.",
  },
  {
    step: 3,
    title: "Registrer enheden",
    description: 'Klik på "Tilføj enhed", indtast koden og giv enheden et navn.',
  },
]

export default function DevicesPage() {
  const { id: locationId } = useParams<{ id: string }>()
  const router = useRouter()

  const [sensors, setSensors] = useState<Sensor[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [activationCode, setActivationCode] = useState("")
  const [deviceName, setDeviceName] = useState("")
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  async function fetchSensors() {
    const { data, error } = await supabase
      .from("sensor")
      .select("*")
      .eq("location_id", locationId)
      .order("created_at", { ascending: true })

    if (!error && data) setSensors(data)
  }

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace("/login"); return }
      setUserId(user.id)
      await fetchSensors()
      setLoading(false)
    }
    init()
  }, [locationId])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setAdding(true)
    setAddError(null)

    const code = activationCode.trim().toUpperCase()

    // Find sensor by activation code
    const { data: matches, error: findError } = await supabase
      .from("sensor")
      .select("*")
      .eq("activation_code", code)
      .limit(1)

    if (findError) {
      const msg = `Søgningsfejl: ${findError.message}`
      setAddError(msg)
      toast.error(msg)
      setAdding(false)
      return
    }

    if (!matches || matches.length === 0) {
      const msg = "Ingen enhed fundet med den kode."
      setAddError(msg)
      toast.error(msg)
      setAdding(false)
      return
    }

    const sensor = matches[0]

    const { data: updated, error: updateError } = await supabase
      .from("sensor")
      .update({
        name: deviceName.trim(),
        location_id: locationId,
        is_active: true,
        activated_at: new Date().toISOString(),
        activated_by: userId,
      })
      .eq("id", sensor.id)
      .select()

    if (updateError) {
      const msg = `Opdateringsfejl: ${updateError.message}`
      setAddError(msg)
      toast.error(msg)
      setAdding(false)
      return
    }

    if (!updated || updated.length === 0) {
      const msg = `Opdatering blokeret af RLS — sensorens location_id matcher muligvis ikke din lokation. Sensor-id: ${sensor.id}`
      setAddError(msg)
      toast.error('Kunne ikke tilføje enheden — tjek RLS-politikker.')
      setAdding(false)
      return
    }

    setActivationCode("")
    setDeviceName("")
    setSheetOpen(false)
    await fetchSensors()
    setAdding(false)
    toast.success(`Enhed "${deviceName.trim()}" tilføjet!`)
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">

        {/* Left: device list */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Dine Enheder</h1>

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Tilføj enhed
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Tilføj enhed</SheetTitle>
                </SheetHeader>

                <form onSubmit={handleAdd} className="mt-6 space-y-4 px-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium" htmlFor="activation-code">
                      Aktiveringskode <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="activation-code"
                      placeholder="f.eks. AB12CD34"
                      value={activationCode}
                      onChange={(e) => setActivationCode(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium" htmlFor="device-name">
                      Enhedsnavn <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="device-name"
                      placeholder="f.eks. Stue sensor"
                      value={deviceName}
                      onChange={(e) => setDeviceName(e.target.value)}
                      required
                    />
                  </div>

                  {addError && (
                    <p className="text-sm text-destructive">{addError}</p>
                  )}

                  <Button type="submit" className="w-full" disabled={adding}>
                    {adding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {adding ? "Tilføjer..." : "Tilføj"}
                  </Button>
                </form>
              </SheetContent>
            </Sheet>
          </div>

          {!loading && sensors.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-4">
                <Cpu className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Ingen enheder tilknyttet</h2>
              <p className="mt-1 max-w-xs text-sm text-gray-500">
                Tilføj din første enhed ved at indtaste aktiveringskoden fra sensoren.
              </p>
              <Button className="mt-6 gap-2" onClick={() => setSheetOpen(true)}>
                <Plus className="h-4 w-4" />
                Tilføj enhed
              </Button>
            </div>
          ) : (
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Enhedsnavn</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                      Indlæser...
                    </TableCell>
                  </TableRow>
                ) : (
                  sensors.map((sensor) => (
                    <TableRow key={sensor.id}>
                      <TableCell className="font-medium">{sensor.name}</TableCell>
                      <TableCell className="text-muted-foreground">{sensor.type ?? "—"}</TableCell>
                      <TableCell>
                        {sensor.is_active ? (
                          <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                            <span className="h-2 w-2 rounded-full bg-green-500" />
                            Online
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                            <span className="h-2 w-2 rounded-full bg-gray-400" />
                            Inaktiv
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>          )}        </div>

        {/* Right: setup guide */}
        <div className="rounded-xl border bg-card p-8">
          <h2 className="mb-8 text-center text-xl font-bold">Opsætningsguide</h2>
          <ol className="space-y-8">
            {SETUP_STEPS.map(({ step, title, description }) => (
              <li key={step} className="flex flex-col items-center text-center">
                <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {step}
                </span>
                <p className="font-semibold">{title}</p>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">{description}</p>
              </li>
            ))}
          </ol>
        </div>

      </div>
    </div>
  )
}

