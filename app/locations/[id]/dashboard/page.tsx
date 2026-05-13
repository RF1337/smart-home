"use client";

import { useEffect, useRef, useState } from "react";
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

type TimeRange = "1 dag" | "1 uge" | "1 måned";

export default function Dashboard() {
  const { id: locationId } = useParams<{ id: string }>();
  const router = useRouter();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const lastUpdateRef = useRef<Date | null>(null);

  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);
  const [data, setData] = useState<{ time: string; temperature: number }[]>([]);
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

  async function fetchInitialData(sensorId: string) {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { data: dbData, error } = await supabase
        .from("temperature")
        .select("id, created_at, value", { count: "exact" })
        .eq("sensor_id", sensorId)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      if (dbData) {
        setRawRowCount(dbData.length);
        const formatted = dbData
          .filter((item: TempData) => item.value !== null)
          .reverse()
          .map((item: TempData) => ({
            time: new Date(item.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
            temperature: item.value as number,
          }));
        setData(formatted);
        if (dbData.length > 0) {
          lastUpdateRef.current = new Date(dbData[0].created_at);
        }
      }
    } finally {
      setLoading(false);
    }
  }

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
        await fetchInitialData(sensorData[0].id);
      } else {
        setLoading(false);
      }
    }
    init();
  }, [locationId]);

  // Re-fetch data when selected sensor changes
  useEffect(() => {
    if (!selectedSensor) return;
    setData([]);
    lastUpdateRef.current = null;
    setSecondsSinceUpdate(null);
    fetchInitialData(selectedSensor.id);
  }, [selectedSensor?.id]);

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
          lastUpdateRef.current = new Date(newRow.created_at);
          setData((prev) => [
            ...prev.slice(-99),
            {
              time: new Date(newRow.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              }),
              temperature: Number(newRow.value),
            },
          ]);
        }
      )
      .subscribe();

    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [selectedSensor?.id]);

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
              <p className="text-sm text-gray-500">Systemstatus</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-base font-semibold text-gray-900">Online</span>
              </div>
              <p className="mt-2 text-xs text-gray-400">Ingen aktive alarmer</p>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Temperaturgraf over tid</h2>
            <div className="flex gap-1">
              {(["1 dag", "1 uge", "1 måned"] as TimeRange[]).map((range) => (
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
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    domain={[(dataMin: number) => dataMin - 0.2, (dataMax: number) => dataMax + 0.2]}
                    label={{ value: "°C", angle: -90, position: "insideLeft", fill: "#6b7280" }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      fontSize: "12px",
                    }}
                  />
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

