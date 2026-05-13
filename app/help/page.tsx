"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp, LifeBuoy, BookOpen, MessageCircleQuestion } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "Hvordan tilføjer jeg en ny enhed?",
    answer:
      'Gå til siden "Enheder" og klik på knappen "Tilføj enhed" øverst til højre. Følg derefter opsætningsguiden for at forbinde din enhed til strøm og WiFi, og tildel en lokation.',
  },
  {
    question: "Hvorfor vises min enhed som offline?",
    answer:
      "En enhed vises som offline, hvis den ikke har sendt data inden for det forventede interval. Kontrollér at enheden er tilsluttet strøm og at WiFi-forbindelsen er aktiv. Genstart enheden, og vent et minut.",
  },
  {
    question: "Hvordan ændrer jeg alarmgrænsen for temperatur?",
    answer:
      'Gå til "Indstillinger" → "Alarmer" og juster tærskelværdien. Husk at alarmer skal være aktiverede for at notifikationer sendes.',
  },
  {
    question: "Kan jeg se historiske data for en bestemt dag?",
    answer:
      'Ja. Gå til "Historik", vælg en Fra- og Til-dato i filteret, og tryk "Filtrer". Du kan eksportere resultaterne som CSV ved at trykke på knappen øverst til højre.',
  },
  {
    question: "Hvad betyder de forskellige alarmtyper?",
    answer:
      '"Høj temperatur" udløses, når temperaturen overstiger din konfigurerede tærskel. "Lav temperatur" udløses ved unormalt lave værdier. "Enhed offline" betyder, at en sensor ikke længere sender data.',
  },
  {
    question: "Hvordan logger jeg ud?",
    answer: 'Gå til "Indstillinger" og klik på den røde "Log ud" knap nederst på siden.',
  },
];

const GUIDES = [
  {
    icon: "🔌",
    title: "Kom i gang",
    description: "Tilslut din første sensor og få live temperaturdata på få minutter.",
  },
  {
    icon: "📊",
    title: "Forstå dashboardet",
    description: "Lær hvad de tre statuskort viser, og hvordan du bruger tidsinterval-knapperne i grafen.",
  },
  {
    icon: "🔔",
    title: "Opsæt alarmer",
    description: "Konfigurér tærskelværdier, så du altid bliver advaret ved unormal temperatur.",
  },
];

function FAQRow({ item }: { item: FAQItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border-b border-gray-100 last:border-0 cursor-pointer select-none"
      onClick={() => setOpen((v) => !v)}
    >
      <div className="flex items-center justify-between px-5 py-4">
        <p className="text-sm font-medium text-gray-800">{item.question}</p>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
        )}
      </div>
      {open && (
        <p className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">{item.answer}</p>
      )}
    </div>
  );
}

export default function HelpPage() {
  return (
    <div className="w-full max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hjælp</h1>
        <p className="mt-1 text-sm text-gray-500">
          Find svar på de mest stillede spørgsmål og guides til at komme i gang.
        </p>
      </div>

      <section className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-400">
          <BookOpen className="h-4 w-4" />
          Guides
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {GUIDES.map((g) => (
            <Card key={g.title} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-5 space-y-2">
                <span className="text-2xl">{g.icon}</span>
                <p className="font-semibold text-gray-900 text-sm">{g.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{g.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-400">
          <MessageCircleQuestion className="h-4 w-4" />
          Ofte stillede spørgsmål
        </div>
        <Card>
          <CardContent className="p-0 divide-y divide-gray-100">
            {FAQ_ITEMS.map((item) => (
              <FAQRow key={item.question} item={item} />
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-400">
          <LifeBuoy className="h-4 w-4" />
          Support
        </div>
        <Card>
          <CardContent className="p-5 flex flex-col gap-1">
            <p className="text-sm font-medium text-gray-800">Har du stadig brug for hjælp?</p>
            <p className="text-sm text-gray-500">
              Kontakt support på{" "}
              <a href="mailto:support@smartroom.dk" className="text-blue-600 hover:underline">
                support@smartroom.dk
              </a>
              , eller tjek dokumentationen på GitHub.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
