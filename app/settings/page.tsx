"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { LogOut, User, Thermometer } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [tempUnit, setTempUnit] = useState<"C" | "F">("C");
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
