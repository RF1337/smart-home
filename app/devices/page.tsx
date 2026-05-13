"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

interface Device {
  id: number;
  name: string;
  sensorType: string;
  location: string;
  online: boolean;
}

const INITIAL_DEVICES: Device[] = [
  { id: 1, name: "Arduino Stue", sensorType: "Temperatur", location: "Stue", online: true },
  { id: 2, name: "Arduino Køkken", sensorType: "Temperatur", location: "Køkken", online: false },
];

const SETUP_STEPS = [
  {
    step: 1,
    title: "Tilslut enheden til strøm",
    description: "Sørg for, at din enhed er korrekt tilsluttet en strømkilde.",
  },
  {
    step: 2,
    title: "Forbind til WiFi",
    description: "Følg instruktionerne for at forbinde din enhed til dit hjemmenetværk.",
  },
  {
    step: 3,
    title: "Vælg lokation",
    description: 'Tildel en lokation til din enhed, f.eks. "Stue" eller "Køkken".',
  },
  {
    step: 4,
    title: "Bekræft opsætning",
    description: "Gennemgå dine indstillinger og bekræft opsætningen.",
  },
];

export default function DevicesPage() {
  const [devices] = useState<Device[]>(INITIAL_DEVICES);

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">

        {/* Left: device list */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Dine Enheder</h1>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Tilføj enhed
            </Button>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-gray-700">Enhedsnavn</TableHead>
                  <TableHead className="font-semibold text-gray-700">Sensortype</TableHead>
                  <TableHead className="font-semibold text-gray-700">Lokation</TableHead>
                  <TableHead className="font-semibold text-gray-700">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell className="font-medium text-blue-600">{device.name}</TableCell>
                    <TableCell className="text-gray-600">{device.sensorType}</TableCell>
                    <TableCell className="text-blue-600">{device.location}</TableCell>
                    <TableCell>
                      {device.online ? (
                        <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                          <span className="h-2 w-2 rounded-full bg-green-500" />
                          Online
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-sm font-medium text-red-500">
                          <span className="h-2 w-2 rounded-full bg-red-500" />
                          Offline
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Right: setup guide */}
        <div className="rounded-xl border border-gray-200 bg-white p-8">
          <h2 className="mb-8 text-center text-xl font-bold text-gray-900">Opsætningsguide</h2>
          <ol className="space-y-8">
            {SETUP_STEPS.map(({ step, title, description }) => (
              <li key={step} className="flex flex-col items-center text-center">
                <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {step}
                </span>
                <p className="font-semibold text-gray-900">{title}</p>
                <p className="mt-1 max-w-xs text-sm text-gray-500">{description}</p>
              </li>
            ))}
          </ol>
        </div>

      </div>
    </div>
  );
}
