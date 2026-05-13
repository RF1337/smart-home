"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const resolveSession = async () => {
      const { data } = await supabase.auth.getUser();

      router.replace(data.user ? "/locations" : "/login");
    };

    resolveSession();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <p className="text-sm text-slate-600">Checking session...</p>
    </div>
  );
}
