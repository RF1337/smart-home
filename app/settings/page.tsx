"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LogOut, User, Thermometer, Info } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [tempUnit, setTempUnit] = useState<"C" | "F">("C");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email);
      if (data.user?.created_at) setCreatedAt(data.user.created_at);
    });
  }, []);

  async function handleLogOut() {
    setLoggingOut(true);
    await signOut();
    router.push("/login");
  }

  const memberSince = createdAt
    ? new Date(createdAt).toLocaleDateString("da-DK", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="w-full space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Indstillinger</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
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

          <section className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-400">
              <Thermometer className="h-4 w-4" />
              Visning
            </div>
            <Card>
              <CardContent className="px-5 py-4">
                <p className="text-sm font-medium text-gray-700">Temperaturenhed</p>
                <p className="mt-0.5 text-xs text-gray-400">Vælg hvilken enhed temperaturer vises i</p>
                <div className="mt-3 flex gap-2">
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
        </div>

        {/* Sidebar column */}
        <div className="space-y-4">
          {/* Account summary */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-400">
                <User className="h-4 w-4" />
                Din profil
              </div>
              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-xs text-gray-400">Logget ind som</p>
                  <p className="mt-0.5 text-sm font-medium text-gray-800 break-all">{email || "—"}</p>
                </div>
                {memberSince && (
                  <div>
                    <p className="text-xs text-gray-400">Medlem siden</p>
                    <p className="mt-0.5 text-sm font-medium text-gray-800">{memberSince}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* App info */}
          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-400">
                <Info className="h-4 w-4" />
                Om appen
              </div>
              <ul className="space-y-2">
                {[
                  { label: "Appnavn", value: "SmartHome" },
                  { label: "Version", value: "1.0.0" },
                  { label: "Platform", value: "Web" },
                ].map(({ label, value }) => (
                  <li key={label} className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{label}</span>
                    <span className="text-xs font-medium text-gray-800">{value}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Danger zone */}
          <Card className="border-red-100">
            <CardContent className="p-5 space-y-3">
              <p className="text-sm font-semibold uppercase tracking-wider text-red-400">Farezone</p>
              <p className="text-xs text-gray-500">Afslut din session. Du skal logge ind igen for at få adgang.</p>
              <Button
                variant="destructive"
                size="sm"
                className="w-full gap-2"
                onClick={handleLogOut}
                disabled={loggingOut}
              >
                <LogOut className="h-4 w-4" />
                {loggingOut ? "Logger ud..." : "Log ud"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

