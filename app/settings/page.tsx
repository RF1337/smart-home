"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { LogOut, User, Bell, Thermometer } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [tempUnit, setTempUnit] = useState<"C" | "F">("C");
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [alertThreshold, setAlertThreshold] = useState("28");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email);
    });
  }, []);

  async function handleLogOut() {
    setLoggingOut(true);
    await signOut();
    router.push("/login");
  }

  return (
    <div className="w-full max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Indstillinger</h1>

      {/* Account */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-400">
          <User className="h-4 w-4" />
          Konto
        </div>
        <Card>
          <CardContent className="divide-y p-0">
            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm font-medium text-gray-700">E-mail</p>
                <p className="mt-0.5 text-sm text-gray-500">{email || "—"}</p>
              </div>
            </div>
            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Adgangskode</p>
                <p className="mt-0.5 text-sm text-gray-500">Skift din adgangskode</p>
              </div>
              <Button variant="outline" size="sm">Skift</Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Display */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-400">
          <Thermometer className="h-4 w-4" />
          Visning
        </div>
        <Card>
          <CardContent className="px-5 py-4">
            <p className="text-sm font-medium text-gray-700">Temperaturenhed</p>
            <div className="mt-2 flex gap-2">
              {(["C", "F"] as const).map((unit) => (
                <Button
                  key={unit}
                  variant={tempUnit === unit ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTempUnit(unit)}
                  className="w-16"
                >
                  °{unit}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Alerts */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-400">
          <Bell className="h-4 w-4" />
          Alarmer
        </div>
        <Card>
          <CardContent className="divide-y p-0">
            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Aktivér alarmer</p>
                <p className="mt-0.5 text-sm text-gray-500">Modtag notifikationer ved unormal temperatur</p>
              </div>
              <button
                onClick={() => setAlertsEnabled((v) => !v)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  alertsEnabled ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 translate-x-1 transform rounded-full bg-white shadow transition-transform ${
                    alertsEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between gap-4 px-5 py-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Tærskelværdi (°C)</p>
                <p className="mt-0.5 text-sm text-gray-500">Alarm udløses hvis temperaturen overstiger denne værdi</p>
              </div>
              <Input
                type="number"
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(e.target.value)}
                className="w-20 text-center"
                disabled={!alertsEnabled}
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Log out */}
      <section>
        <Button
          variant="destructive"
          className="gap-2"
          onClick={handleLogOut}
          disabled={loggingOut}
        >
          <LogOut className="h-4 w-4" />
          {loggingOut ? "Logger ud..." : "Log ud"}
        </Button>
      </section>
    </div>
  );
}
