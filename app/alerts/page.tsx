"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TriangleAlert, ThermometerSun, WifiOff } from "lucide-react";

interface Alert {
  id: string;
  created_at: string;
  type: "high_temp" | "low_temp" | "offline";
  device: string;
  location: string;
  value: number | null;
  resolved: boolean;
}

// Hardcoded demo alerts until a real alerts table exists
const DEMO_ALERTS: Alert[] = [
  {
    id: "1",
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    type: "high_temp",
    device: "Arduino Stue",
    location: "Stue",
    value: 29.4,
    resolved: false,
  },
  {
    id: "2",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    type: "offline",
    device: "Arduino Køkken",
    location: "Køkken",
    value: null,
    resolved: true,
  },
  {
    id: "3",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    type: "high_temp",
    device: "Arduino Stue",
    location: "Stue",
    value: 31.1,
    resolved: true,
  },
  {
    id: "4",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    type: "low_temp",
    device: "Arduino Stue",
    location: "Stue",
    value: 14.2,
    resolved: true,
  },
];

const TYPE_META = {
  high_temp: {
    label: "Høj temperatur",
    icon: ThermometerSun,
    color: "text-orange-600",
  },
  low_temp: {
    label: "Lav temperatur",
    icon: ThermometerSun,
    color: "text-blue-600",
  },
  offline: {
    label: "Enhed offline",
    icon: WifiOff,
    color: "text-red-600",
  },
};

export default function AlertsPage() {
  const alerts = DEMO_ALERTS;
  const activeCount = alerts.filter((a) => !a.resolved).length;

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
            {activeCount} aktiv alarm{activeCount !== 1 ? "er" : ""}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-700">Tidspunkt</TableHead>
              <TableHead className="font-semibold text-gray-700">Type</TableHead>
              <TableHead className="font-semibold text-gray-700">Enhed</TableHead>
              <TableHead className="font-semibold text-gray-700">Lokation</TableHead>
              <TableHead className="font-semibold text-gray-700">Værdi</TableHead>
              <TableHead className="font-semibold text-gray-700">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts.map((alert) => {
              const meta = TYPE_META[alert.type];
              const Icon = meta.icon;
              return (
                <TableRow key={alert.id}>
                  <TableCell className="text-sm text-gray-600 whitespace-nowrap">
                    {new Date(alert.created_at).toLocaleString("da-DK", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>
                    <span className={`flex items-center gap-1.5 text-sm font-medium ${meta.color}`}>
                      <Icon className="h-4 w-4" />
                      {meta.label}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-700">{alert.device}</TableCell>
                  <TableCell className="text-sm text-gray-600">{alert.location}</TableCell>
                  <TableCell className="text-sm text-gray-700">
                    {alert.value !== null ? `${alert.value.toFixed(1)} °C` : "—"}
                  </TableCell>
                  <TableCell>
                    {alert.resolved ? (
                      <Badge variant="secondary">Løst</Badge>
                    ) : (
                      <Badge variant="destructive">Aktiv</Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
