"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Tables } from "@/types/database.types"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Bell, TriangleAlert, ThermometerSun, Check, Loader2 } from "lucide-react"
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

const TYPE_META: Record<string, { label: string; color: string }> = {
  above_max: { label: "Over maksimum", color: "text-orange-600" },
  below_min: { label: "Under minimum", color: "text-blue-600" },
}

export default function AlertsPage() {
  const { id: locationId } = useParams<{ id: string }>()

  const [alerts, setAlerts] = useState<Alert[]>([])
  const [sensors, setSensors] = useState<Sensor[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

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
    setSaving(sensorId)
    setSaveError(null)
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
    if (error) setSaveError(error.message)
    else if (!data || data.length === 0) setSaveError("Ingen rækker opdateret — tjek RLS-politikker i Supabase")
    else {
      setSaved(sensorId)
      setTimeout(() => setSaved(null), 2000)
    }
    setSaving(null)
  }

  const activeCount = alerts.filter((a) => !a.email_sent).length

  return (
    <div className="w-full space-y-6">
      {/* Header */}
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

      {/* Per-sensor threshold config */}
      <Card>
        <CardContent className="divide-y p-0">
          <div className="flex items-center gap-2 px-5 py-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
            <Bell className="h-4 w-4" />
            Tærskelværdier per sensor
          </div>
          {saveError && (
            <p className="px-5 py-2 text-sm text-red-500 bg-red-50">Fejl: {saveError}</p>
          )}
          {loading && (
            <p className="px-5 py-4 text-sm text-gray-400">Indlæser...</p>
          )}
          {!loading && sensors.length === 0 && (
            <p className="px-5 py-4 text-sm text-gray-400">
              Ingen aktive sensorer på denne lokation.
            </p>
          )}
          {sensors.map((sensor) => {
            const e = edits[sensor.id]
            if (!e) return null
            return (
              <div
                key={sensor.id}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
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
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        e.enabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{sensor.name}</p>
                    <p className="text-xs text-gray-400">{sensor.type ?? "sensor"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <ThermometerSun className="h-4 w-4 text-blue-400" />
                    <span className="text-xs text-gray-500">Min</span>
                    <Input
                      type="number"
                      placeholder="°C"
                      value={e.min}
                      onChange={(ev) =>
                        setEdits((prev) => ({
                          ...prev,
                          [sensor.id]: { ...prev[sensor.id], min: ev.target.value },
                        }))
                      }
                      disabled={!e.enabled}
                      className="w-24 text-center"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ThermometerSun className="h-4 w-4 text-orange-400" />
                    <span className="text-xs text-gray-500">Maks</span>
                    <Input
                      type="number"
                      placeholder="°C"
                      value={e.max}
                      onChange={(ev) =>
                        setEdits((prev) => ({
                          ...prev,
                          [sensor.id]: { ...prev[sensor.id], max: ev.target.value },
                        }))
                      }
                      disabled={!e.enabled}
                      className="w-24 text-center"
                    />
                  </div>
                  <Button
                    size="sm"
                    variant={saved === sensor.id ? "default" : "outline"}
                    onClick={() => saveSensor(sensor.id)}
                    disabled={saving === sensor.id}
                    className="gap-1"
                  >
                    {saving === sensor.id
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <Check className="h-3.5 w-3.5" />
                    }
                    {saving === sensor.id ? "Gemmer..." : saved === sensor.id ? "Gemt" : "Gem"}
                  </Button>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Alerts table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
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
            {!loading && alerts.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-sm text-gray-400 py-8">
                  Ingen alarmer endnu
                </TableCell>
              </TableRow>
            )}
            {alerts.map((alert) => {
              const meta = TYPE_META[alert.type] ?? { label: alert.type, color: "text-gray-600" }
              return (
                <TableRow key={alert.id}>
                  <TableCell className="text-sm text-gray-600 whitespace-nowrap">
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
                  <TableCell>
                    <span className={`text-sm font-medium ${meta.color}`}>{meta.label}</span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-700">
                    {alert.sensor?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500 max-w-xs truncate">
                    {alert.message}
                  </TableCell>
                  <TableCell className="text-sm text-gray-700">
                    {alert.value.toFixed(1)} °C
                  </TableCell>
                  <TableCell className="text-sm text-gray-700">
                    {alert.threshold.toFixed(1)} °C
                  </TableCell>
                  <TableCell>
                    {alert.email_sent ? (
                      <Badge variant="secondary">Sendt</Badge>
                    ) : (
                      <Badge variant="outline">Afventer</Badge>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
