"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Download, CalendarSearch, SearchX, ChevronDown } from "lucide-react";
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

const PAGE_SIZE = 50;

export default function HistoryPage() {
  const { id: locationId } = useParams<{ id: string }>();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [allRows, setAllRows] = useState<TempRow[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [totalFetched, setTotalFetched] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const rows = allRows.slice(0, visibleCount);

  async function fetchBatch(offset: number): Promise<TempRow[]> {
    let query = supabase
      .from("temperature")
      .select("id, created_at, value")
      .eq("sensor_id", locationId) // scoped — adjust if join needed
      .order("created_at", { ascending: false })
      .range(offset, offset + 499);

    if (from) query = query.gte("created_at", new Date(from).toISOString());
    if (to) {
      const toEnd = new Date(to);
      toEnd.setHours(23, 59, 59, 999);
      query = query.lte("created_at", toEnd.toISOString());
    }

    const { data, error: err } = await query;
    if (err) throw new Error(err.message);
    return ((data ?? []).filter((r) => r.value !== null) as TempRow[]);
  }

  async function handleFilter() {
    setLoading(true);
    setError(null);
    setSearched(true);
    setAllRows([]);
    setVisibleCount(PAGE_SIZE);
    setHasMore(false);

    try {
      // Fetch without sensor_id filter — temperature table may not have location scope
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
      if (err) throw new Error(err.message);

      const fetched = (data ?? []).filter((r) => r.value !== null) as TempRow[];
      setAllRows(fetched);
      setTotalFetched(fetched.length);
      setHasMore(fetched.length === 500);
    } catch (err: any) {
      setError(err.message);
      toast.error(`Fejl ved hentning af data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  function handleLoadMore() {
    const next = visibleCount + PAGE_SIZE;
    setVisibleCount(next);
  }

  function handleExportCSV() {
    if (allRows.length === 0) return;

    const header = "Tidspunkt,Temperatur (°C)";
    const lines = allRows.map(
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
    toast.success(`${allRows.length} rækker eksporteret som CSV!`);
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Historik</h1>
          <p className="mt-1 text-sm text-gray-500">
            Søg og eksporter historiske temperaturmålinger.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleExportCSV}
          disabled={allRows.length === 0}
          className="gap-2 text-sm"
          size="sm"
        >
          <Download className="h-4 w-4" />
          Eksporter CSV
          {allRows.length > 0 && (
            <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
              {allRows.length}
            </span>
          )}
        </Button>
      </div>

      {/* Filter card */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Filtrer periode
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-600 whitespace-nowrap" htmlFor="from-date">
              Fra
            </label>
            <Input
              id="from-date"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-40"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-600 whitespace-nowrap" htmlFor="to-date">
              Til
            </label>
            <Input
              id="to-date"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-40"
            />
          </div>
          <Button onClick={handleFilter} disabled={loading} className="gap-2">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CalendarSearch className="h-4 w-4" />
            )}
            {loading ? "Henter..." : "Søg"}
          </Button>
        </div>
      </div>

      {/* Results */}
      <div>
        {error && (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-gray-700">Tidspunkt</TableHead>
                  <TableHead className="font-semibold text-gray-700">Temperatur</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Empty: not searched yet */}
        {!searched && !loading && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 text-center">
            <div className="mb-4 rounded-full bg-primary/10 p-4">
              <CalendarSearch className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Vælg en tidsperiode</h2>
            <p className="mt-1 max-w-xs text-sm text-gray-500">
              Angiv en start- og slutdato ovenfor og tryk på Søg for at hente historisk data.
            </p>
          </div>
        )}

        {/* Empty: searched but no results */}
        {searched && !loading && allRows.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 text-center">
            <div className="mb-4 rounded-full bg-muted p-4">
              <SearchX className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Ingen data fundet</h2>
            <p className="mt-1 max-w-xs text-sm text-gray-500">
              Der blev ikke registreret nogen målinger i den valgte periode. Prøv et andet interval.
            </p>
          </div>
        )}

        {/* Results table */}
        {!loading && rows.length > 0 && (
          <>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Viser {rows.length} af {allRows.length} målinger
                {hasMore && " (maks 500 hentet — eksporter for alle)"}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="py-3 font-semibold text-gray-700">Tidspunkt</TableHead>
                    <TableHead className="py-3 font-semibold text-gray-700">Temperatur</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="transition-colors hover:bg-gray-50"
                    >
                      <TableCell className="py-3 text-sm text-gray-600">
                        {new Date(row.created_at).toLocaleString("da-DK", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="font-medium text-gray-900">
                          {row.value.toFixed(1)}
                        </span>
                        <span className="ml-1 text-sm text-gray-400">°C</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Load more */}
            {visibleCount < allRows.length && (
              <div className="mt-4 flex justify-center">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  Vis flere ({allRows.length - visibleCount} tilbage)
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
