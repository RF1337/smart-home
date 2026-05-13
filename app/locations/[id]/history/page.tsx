"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TempRow {
  id: string;
  created_at: string;
  value: number;
}

export default function HistoryPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rows, setRows] = useState<TempRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  async function handleFilter() {
    setLoading(true);
    setError(null);
    setSearched(true);

    let query = supabase
      .from("temperature")
      .select("id, created_at, value")
      .order("created_at", { ascending: false })
      .limit(500);

    if (from) query = query.gte("created_at", new Date(from).toISOString());
    if (to) {
      const toEnd = new Date(to);
      toEnd.setHours(23, 59, 59, 999);
      query = query.lte("created_at", toEnd.toISOString());
    }

    const { data, error: err } = await query;

    if (err) {
      setError(err.message);
      toast.error(`Fejl ved hentning af data: ${err.message}`);
    } else {
      setRows((data ?? []).filter((r) => r.value !== null) as TempRow[]);
    }

    setLoading(false);
  }

  function handleExportCSV() {
    if (rows.length === 0) return;

    const header = "Tidspunkt,Temperatur (°C)";
    const lines = rows.map(
      (r) =>
        `"${new Date(r.created_at).toLocaleString("da-DK")}","${r.value.toFixed(1)}"`
    );
    const csv = [header, ...lines].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "temperatur-historik.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${rows.length} rækker eksporteret som CSV!`);
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Historik</h1>
        <Button
          variant="default"
          onClick={handleExportCSV}
          disabled={rows.length === 0}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Eksporter som CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-gray-600">Fra:</label>
        <Input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="w-40"
        />
        <label className="text-sm text-gray-600">Til:</label>
        <Input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="w-40"
        />
        <Button onClick={handleFilter} disabled={loading} className="gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Henter..." : "Filtrer"}
        </Button>
      </div>

      {/* Table */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-gray-900">Historisk data</h2>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {!searched && !loading && (
          <p className="text-sm text-gray-400">
            Vælg en tidsperiode og tryk Filtrer for at se data.
          </p>
        )}

        {searched && !loading && rows.length === 0 && !error && (
          <p className="text-sm text-gray-500">Ingen data fundet for den valgte periode.</p>
        )}

        {rows.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-gray-700">Tidspunkt</TableHead>
                  <TableHead className="font-semibold text-gray-700">Temperatur</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="text-gray-600">
                      {new Date(row.created_at).toLocaleString("da-DK", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="text-gray-900">
                      {row.value.toFixed(1)} °C
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
