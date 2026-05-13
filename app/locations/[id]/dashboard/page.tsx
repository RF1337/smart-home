"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tables } from "@/types/database.types";

type Sensor = Tables<"sensor">;

interface TempData {
  id: string;
  created_at: string;
  value: number | null;
}

type TimeRange = "1 dag" | "1 uge" | "1 måned" | "1 år";

interface DataPoint {
  iso: string;
  temperature: number;
}

const TIME_RANGES: TimeRange[] = ["1 dag", "1 uge", "1 måned", "1 år"];

function getCutoff(range: TimeRange): Date {
  const now = new Date();
  if (range === "1 dag") return new Date(now.getTime() - 24 * 60 * 60 * 1000);
  if (range === "1 uge") return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (range === "1 måned") return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
}

function formatXTick(iso: string, range: TimeRange): string {
  const d = new Date(iso);
  if (range === "1 dag")
    return d.toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" });
  if (range === "1 uge")
    return (
      d.toLocaleDateString("da-DK", { day: "2-digit", month: "2-digit" }) +
      " " +
      d.toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" })
    );
  if (range === "1 måned")
    return d.toLocaleDateString("da-DK", { day: "2-digit", month: "2-digit" });
  return d.toLocaleDateString("da-DK", { month: "short", year: "numeric" });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const point: DataPoint = payload[0].payload;
  const d = new Date(point.iso);
  const dateStr = d.toLocaleDateString("da-DK", { day: "2-digit", month: "2-digit", year: "numeric" });
  const timeStr = d.toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" });
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-sm">
      <p className="font-medium text-gray-700">{dateStr} kl. {timeStr}</p>
      <p className="mt-0.5 text-blue-600">{point.temperature.toFixed(1)} °C</p>
    </div>
  );
}

export default function Dashboard() {
  const { id: locationId } = useParams<{ id: string }>();
  const router = useRouter();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const lastUpdateRef = useRef<Date | null>(null);

  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rawRowCount, setRawRowCount] = useState(0);
  const [timeRange, setTimeRange] = useState<TimeRange>("1 dag");
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState<number | null>(null);

  const latestTemperature = data.length > 0 ? data[data.length - 1].temperature : null;
  const averageTemperature =
    data.length > 0
      ? data.reduce((sum, d) => sum + d.temperature, 0) / data.length
      : null;
  const minTemperature = data.length > 0 ? Math.min(...data.map((d) => d.temperature)) : null;
  const maxTemperature = data.length > 0 ? Math.max(...data.map((d) => d.temperature)) : null;

  const fetchData = useCallback(async (sensorId: string, range: TimeRange) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const cutoff = getCutoff(range);
      const { data: dbData, error } = await supabase
        .from("temperature")
        .select("id, created_at, value")
        .eq("sensor_id", sensorId)
        .gte("created_at", cutoff.toISOString())
        .order("created_at", { ascending: true })
        .limit(2000);

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      if (dbData) {
        setRawRowCount(dbData.length);
        const formatted: DataPoint[] = dbData
          .filter((item: TempData) => item.value !== null)
          .map((item: TempData) => ({
            iso: item.created_at,
            temperature: item.value as number,
          }));
        setData(formatted);
        if (dbData.length > 0) {
          lastUpdateRef.current = new Date(dbData[dbData.length - 1].created_at);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load: auth + sensors
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: sensorData } = await supabase
        .from("sensor")
        .select("*")
        .eq("location_id", locationId)
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (sensorData && sensorData.length > 0) {
        setSensors(sensorData);
        setSelectedSensor(sensorData[0]);
        await fetchData(sensorData[0].id, "1 dag");
      } else {
        setLoading(false);
      }
    }
    init();
  }, [locationId]);

  // Re-fetch when sensor or time range changes
  useEffect(() => {
    if (!selectedSensor) return;
    setData([]);
    lastUpdateRef.current = null;
    setSecondsSinceUpdate(null);
    fetchData(selectedSensor.id, timeRange);
  }, [selectedSensor?.id, timeRange]);

  // Realtime subscription
  useEffect(() => {
    if (!selectedSensor) return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channel = supabase
      .channel(`realtime-temperature-${selectedSensor.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "temperature" },
        (payload) => {
          const newRow = payload.new as TempData;
          if (newRow.value === null || (newRow as any).sensor_id !== selectedSensor.id) return;
          const cutoff = getCutoff(timeRange);
          if (new Date(newRow.created_at) < cutoff) return;
          lastUpdateRef.current = new Date(newRow.created_at);
          setData((prev) => [
            ...prev.slice(-1999),
            { iso: newRow.created_at, temperature: Number(newRow.value) },
          ]);
        }
      )
      .subscribe();

    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [selectedSensor?.id, timeRange]);

  // Seconds since last update ticker
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastUpdateRef.current) {
        const diff = Math.floor((Date.now() - lastUpdateRef.current.getTime()) / 1000);
        setSecondsSinceUpdate(diff);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const lastUpdatedLabel =
    secondsSinceUpdate === null
      ? "Opdaterer..."
      : secondsSinceUpdate < 60
      ? `Sidst opdateret for ${secondsSinceUpdate} sekunder siden`
      : `Sidst opdateret for ${Math.floor(secondsSinceUpdate / 60)} minutter siden`;

  return (
    <div className="min-h-[calc(100vh-57px)] bg-gray-50 px-6 py-6">
      <div className="w-full space-y-6">

        {/* Sensor selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1 text-xl font-bold text-gray-900 hover:text-gray-700">
              Sensor: {selectedSensor?.name ?? "Ingen sensorer"}
              <ChevronDown className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {sensors.map((s) => (
              <DropdownMenuItem key={s.id} onSelect={() => setSelectedSensor(s)}>
                {s.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-gray-500">Aktuel Temperatur</p>
              <p className="mt-1 text-4xl font-bold text-gray-900">
                {latestTemperature !== null ? `${latestTemperature.toFixed(1)} °C` : "--"}
              </p>
              <p className="mt-2 text-xs text-gray-400">{lastUpdatedLabel}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-blue-600 font-medium">Gennemsnitstemperatur</p>
              <p className="mt-1 text-4xl font-bold text-gray-900">
                {averageTemperature !== null ? `${averageTemperature.toFixed(1)} °C` : "--"}
              </p>
              <p className="mt-2 text-xs text-gray-400">Målt over den valgte tidsperiode</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-gray-500 font-medium">Min / Maks temperatur</p>
              <div className="mt-2 flex items-center gap-3">
                <div>
                  <p className="text-xs text-blue-500">Min</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {minTemperature !== null ? `${minTemperature.toFixed(1)} °C` : "--"}
                  </p>
                </div>
                <span className="text-gray-300 text-2xl font-light">/</span>
                <div>
                  <p className="text-xs text-orange-500">Maks</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {maxTemperature !== null ? `${maxTemperature.toFixed(1)} °C` : "--"}
                  </p>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-400">Inden for den valgte tidsperiode</p>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Temperaturgraf over tid</h2>
            <div className="flex gap-1">
              {TIME_RANGES.map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                  className="h-7 px-3 text-xs"
                >
                  {range}
                </Button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="py-16 text-center text-sm text-gray-500">Loader data...</p>
          ) : errorMessage ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Kunne ikke hente temperaturdata: {errorMessage}
            </p>
          ) : !selectedSensor ? (
            <p className="py-10 text-center text-sm text-gray-500">Ingen aktive sensorer på denne lokation.</p>
          ) : data.length === 0 ? (
            <div className="space-y-1 py-10 text-center text-sm text-gray-500">
              <p>Ingen temperaturpunkter at vise.</p>
              <p className="text-xs text-gray-400">Rækker fra Supabase: {rawRowCount}</p>
            </div>
          ) : (
            <div className="h-96 w-full sm:h-[480px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="iso"
                    tickFormatter={(v) => formatXTick(v, timeRange)}
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    interval="preserveStartEnd"
                    minTickGap={60}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    domain={[(dataMin: number) => dataMin - 0.2, (dataMax: number) => dataMax + 0.2]}
                    label={{ value: "°C", angle: -90, position: "insideLeft", fill: "#6b7280" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

