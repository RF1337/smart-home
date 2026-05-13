"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Tables } from "@/types/database.types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Bell, TriangleAlert, ThermometerSun, Check, Loader2, ShieldCheck, ShieldOff } from "lucide-react"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

type Alert = Tables<"alerts"> & { sensor: Pick<Tables<"sensor">, "name"> | null }
type Sensor = Tables<"sensor">

const TYPE_META: Record<string, { label: string; badgeClass: string }> = {
  above_max: {
    label: "Over maksimum",
    badgeClass: "bg-orange-50 text-orange-700 border border-orange-200",
  },
  below_min: {
    label: "Under minimum",
    badgeClass: "bg-blue-50 text-blue-700 border border-blue-200",
  },
}

function AlertRow({ alert }: { alert: Alert }) {
  const meta = TYPE_META[alert.type] ?? {
    label: alert.type,
    badgeClass: "bg-gray-100 text-gray-600 border border-gray-200",
  }
  return (
    <TableRow className="hover:bg-gray-50 transition-colors">
      <TableCell className="py-3 text-sm text-gray-600 whitespace-nowrap">
        {alert.created_at
          ? new Date(alert.created_at).toLocaleString("da-DK", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "—"}
      </TableCell>
      <TableCell className="py-3">
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.badgeClass}`}>
          {meta.label}
        </span>
      </TableCell>
      <TableCell className="py-3 text-sm font-medium text-gray-800">
        {alert.sensor?.name ?? "—"}
      </TableCell>
      <TableCell className="py-3 text-sm text-gray-500 max-w-xs truncate">
        {alert.message}
      </TableCell>
      <TableCell className="py-3 text-sm font-semibold text-gray-900">
        {alert.value.toFixed(1)} °C
      </TableCell>
      <TableCell className="py-3 text-sm text-gray-500">
        {alert.threshold.toFixed(1)} °C
      </TableCell>
      <TableCell className="py-3">
        {alert.email_sent ? (
          <Badge variant="secondary" className="text-xs">Sendt</Badge>
        ) : (
          <Badge variant="outline" className="text-xs">Afventer</Badge>
        )}
      </TableCell>
    </TableRow>
  )
}

export default function AlertsPage() {
  const { id: locationId } = useParams<{ id: string }>()

  const [alerts, setAlerts] = useState<Alert[]>([])
  const [sensors, setSensors] = useState<Sensor[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [thresholdErrors, setThresholdErrors] = useState<Record<string, string | null>>({})

  const [edits, setEdits] = useState<
    Record<string, { min: string; max: string; enabled: boolean }>
  >({})

  const fetchData = useCallback(async () => {
    const { data: sensorData } = await supabase
      .from("sensor")
      .select("*")
      .eq("location_id", locationId)
      .eq("is_active", true)

    if (sensorData) {
      setSensors(sensorData)
      const initial: typeof edits = {}
      sensorData.forEach((s) => {
        initial[s.id] = {
          min: s.min_threshold?.toString() ?? "",
          max: s.max_threshold?.toString() ?? "",
          enabled: s.alerts_enabled ?? false,
        }
      })
      setEdits(initial)
    }

    const sensorIds = sensorData?.map((s) => s.id) ?? []
    if (sensorIds.length > 0) {
      const { data: alertData } = await supabase
        .from("alerts")
        .select("*, sensor:sensor_id(name)")
        .in("sensor_id", sensorIds)
        .order("created_at", { ascending: false })
        .limit(100)

      if (alertData) setAlerts(alertData as Alert[])
    } else {
      setAlerts([])
    }

    setLoading(false)
  }, [locationId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    const channel = supabase
      .channel("alerts-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "alerts" }, () =>
        fetchData()
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchData])

  async function saveSensor(sensorId: string) {
    const e = edits[sensorId]
    setThresholdErrors((prev) => ({ ...prev, [sensorId]: null }))

    if (e.enabled) {
      const minVal = e.min !== "" ? parseFloat(e.min) : null
      const maxVal = e.max !== "" ? parseFloat(e.max) : null

      if (minVal !== null && (minVal < -50 || minVal > 100)) {
        setThresholdErrors((prev) => ({ ...prev, [sensorId]: "Min-værdien skal være mellem -50 og 100 °C." }))
        return
      }
      if (maxVal !== null && (maxVal < -50 || maxVal > 100)) {
        setThresholdErrors((prev) => ({ ...prev, [sensorId]: "Maks-værdien skal være mellem -50 og 100 °C." }))
        return
      }
      if (minVal !== null && maxVal !== null && minVal >= maxVal) {
        setThresholdErrors((prev) => ({ ...prev, [sensorId]: "Min-værdien skal være lavere end maks-værdien." }))
        return
      }
    }

    setSaving(sensorId)
    const { data, error } = await supabase
      .from("sensor")
      .update({
        min_threshold: e.min !== "" ? parseFloat(e.min) : null,
        max_threshold: e.max !== "" ? parseFloat(e.max) : null,
        alerts_enabled: e.enabled,
      })
      .eq("id", sensorId)
      .eq("location_id", locationId)
      .select("id")

    if (error) {
      toast.error(`Kunne ikke gemme: ${error.message}`)
    } else if (!data || data.length === 0) {
      toast.error("Ingen rækker opdateret — tjek RLS-politikker i Supabase")
    } else {
      setSaved(sensorId)
      toast.success("Alarmgrænser gemt!")
      setTimeout(() => setSaved(null), 2000)
    }
    setSaving(null)
  }

  const activeCount = alerts.filter((a) => !a.email_sent).length

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alarmer</h1>
          <p className="mt-1 text-sm text-gray-500">
            Oversigt over hændelser fra dine enheder
          </p>
        </div>
        {activeCount > 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-medium text-red-600 border border-red-200">
            <TriangleAlert className="h-4 w-4" />
            {activeCount} ny alarm{activeCount !== 1 ? "er" : ""}
          </div>
        )}
      </div>

      <Card>
        <CardHeader className="border-b pb-4">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Alarmkonfiguration</CardTitle>
          </div>
          <CardDescription>
            Indstil temperaturgrænser per sensor og slå alarmer til eller fra.
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-y p-0">
          {loading && (
            <p className="px-5 py-4 text-sm text-gray-400">Indlæser...</p>
          )}
          {!loading && sensors.length === 0 && (
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <div className="mb-3 rounded-full bg-primary/10 p-3">
                <Bell className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-semibold text-gray-800">Ingen aktive sensorer</p>
              <p className="mt-1 max-w-xs text-xs text-gray-400">
                Tilføj og aktiver en enhed under{" "}
                <a href="../devices" className="text-primary underline underline-offset-2">
                  Enheder
                </a>{" "}
                for at opsætte alarmgrænser.
              </p>
            </div>
          )}
          {sensors.map((sensor) => {
            const e = edits[sensor.id]
            if (!e) return null
            return (
              <div key={sensor.id} className="px-5 py-5 space-y-4">
                {/* Row 1: sensor identity + toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{sensor.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{sensor.type ?? "sensor"}</p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    {e.enabled ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 border border-green-200">
                        <ShieldCheck className="h-3 w-3" />
                        Aktiv
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 border border-gray-200">
                        <ShieldOff className="h-3 w-3" />
                        Inaktiv
                      </span>
                    )}
                    <button
                      onClick={() =>
                        setEdits((prev) => ({
                          ...prev,
                          [sensor.id]: { ...prev[sensor.id], enabled: !prev[sensor.id].enabled },
                        }))
                      }
                      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                        e.enabled ? "bg-blue-600" : "bg-gray-200"
                      }`}
                      aria-label={e.enabled ? "Deaktiver alarm" : "Aktiver alarm"}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                          e.enabled ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Row 2: threshold inputs + save */}
                <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-dashed border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <ThermometerSun className="h-4 w-4 text-blue-400" />
                    <span className="text-xs text-gray-500">Min</span>
                    <Input
                      type="number"
                      placeholder="C"
                      value={e.min}
                      onChange={(ev) => {
                        setEdits((prev) => ({
                          ...prev,
                          [sensor.id]: { ...prev[sensor.id], min: ev.target.value },
                        }))
                        setThresholdErrors((prev) => ({ ...prev, [sensor.id]: null }))
                      }}
                      disabled={!e.enabled}
                      className={`w-24 text-center ${
                        thresholdErrors[sensor.id] ? "border-red-400 focus-visible:ring-red-300" : ""
                      }`}
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ThermometerSun className="h-4 w-4 text-orange-400" />
                    <span className="text-xs text-gray-500">Maks</span>
                    <Input
                      type="number"
                      placeholder="C"
                      value={e.max}
                      onChange={(ev) => {
                        setEdits((prev) => ({
                          ...prev,
                          [sensor.id]: { ...prev[sensor.id], max: ev.target.value },
                        }))
                        setThresholdErrors((prev) => ({ ...prev, [sensor.id]: null }))
                      }}
                      disabled={!e.enabled}
                      className={`w-24 text-center ${
                        thresholdErrors[sensor.id] ? "border-red-400 focus-visible:ring-red-300" : ""
                      }`}
                    />
                  </div>
                  <Button
                    size="sm"
                    variant={saved === sensor.id ? "default" : "outline"}
                    onClick={() => saveSensor(sensor.id)}
                    disabled={saving === sensor.id || !e.enabled}
                    className="gap-1"
                  >
                    {saving === sensor.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                    {saving === sensor.id ? "Gemmer..." : saved === sensor.id ? "Gemt" : "Gem"}
                  </Button>
                </div>
                {thresholdErrors[sensor.id] && (
                  <p className="text-xs text-red-600">{thresholdErrors[sensor.id]}</p>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
          Alarmhistorik
        </h2>
        <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
          {!loading && alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-3 rounded-full bg-muted p-3">
                <TriangleAlert className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold text-gray-800">Ingen alarmer endnu</p>
              <p className="mt-1 max-w-xs text-xs text-gray-400">
                Alarmer udløses automatisk, når en sensor overskrider dine opsatte grænser.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-gray-700">Tidspunkt</TableHead>
                  <TableHead className="font-semibold text-gray-700">Type</TableHead>
                  <TableHead className="font-semibold text-gray-700">Sensor</TableHead>
                  <TableHead className="font-semibold text-gray-700">Besked</TableHead>
                  <TableHead className="font-semibold text-gray-700">Værdi</TableHead>
                  <TableHead className="font-semibold text-gray-700">Grænse</TableHead>
                  <TableHead className="font-semibold text-gray-700">Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 7 }).map((__, j) => (
                          <TableCell key={j} className="py-3">
                            <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : alerts.map((alert) => <AlertRow key={alert.id} alert={alert} />)}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  )
}