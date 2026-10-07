import { useEffect, useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Syringe, Stethoscope, AlertTriangle, CalendarClock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAppointments, getVaccines, Appointment, Vaccine } from "@/lib/api";

interface SmartCalendarProps {
  onBack: () => void;
  petName: string;
}

type CalEvent = {
  id: string;
  date: string; // yyyy-mm-dd
  label: string;
  kind: "appointment" | "vaccine" | "reminder";
};

function daysUntil(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export default function SmartCalendar({ onBack, petName }: SmartCalendarProps) {
  const { t } = useLanguage();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [selected, setSelected] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [a, v] = await Promise.all([getAppointments(), getVaccines()]);
        setAppointments(a);
        setVaccines(v);
      } catch {
        // Backend unreachable in this preview — calendar still renders empty/local
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const events: CalEvent[] = useMemo(() => {
    const apptEvents: CalEvent[] = appointments.map((a) => ({
      id: `appt-${a.id}`,
      date: a.date,
      label: `${a.type} · ${a.veterinarian || "Veterinario"}`,
      kind: "appointment",
    }));
    const vaxEvents: CalEvent[] = vaccines.map((v) => ({
      id: `vax-${v.id}`,
      date: v.nextDue,
      label: `Próxima dosis: ${v.name}`,
      kind: "vaccine",
    }));
    return [...apptEvents, ...vaxEvents].filter((e) => e.date);
  }, [appointments, vaccines]);

  const eventDates = events.map((e) => new Date(e.date));

  const selectedKey = selected ? selected.toISOString().slice(0, 10) : "";
  const eventsForSelectedDay = events.filter((e) => e.date === selectedKey);

  // "Smart" suggestions: anything due within 7 days, sorted soonest first
  const upcomingSmart = useMemo(
    () =>
      events
        .map((e) => ({ ...e, delta: daysUntil(e.date) }))
        .filter((e) => e.delta >= 0 && e.delta <= 7)
        .sort((a, b) => a.delta - b.delta),
    [events]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50" style={{ fontFamily: "'Geist', sans-serif" }}>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
            {t("nav.smartCalendar")}
          </h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 bg-white border-gray-100">
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={setSelected}
            modifiers={{ hasEvent: eventDates }}
            modifiersClassNames={{ hasEvent: "bg-purple-100 text-purple-700 font-bold rounded-full" }}
          />
          <div className="mt-6 border-t pt-4">
            <h3 className="font-bold text-gray-900 mb-3">
              {selected?.toLocaleDateString("es-PA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </h3>
            {eventsForSelectedDay.length === 0 ? (
              <p className="text-sm text-gray-500">Sin eventos este día para {petName}.</p>
            ) : (
              <div className="space-y-2">
                {eventsForSelectedDay.map((e) => (
                  <div key={e.id} className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 border border-purple-100">
                    {e.kind === "vaccine" ? <Syringe className="text-purple-600" size={18} /> : <Stethoscope className="text-purple-600" size={18} />}
                    <p className="text-sm font-medium text-gray-800">{e.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6 bg-white border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CalendarClock className="text-amber-500" size={20} />
              Recordatorios inteligentes
            </h3>
            {loading ? (
              <p className="text-sm text-gray-500">Cargando...</p>
            ) : upcomingSmart.length === 0 ? (
              <p className="text-sm text-gray-500">No hay nada pendiente en los próximos 7 días. 🎉</p>
            ) : (
              <div className="space-y-3">
                {upcomingSmart.map((e) => (
                  <div key={e.id} className="p-3 rounded-lg bg-amber-50 border border-amber-100 flex items-start gap-2">
                    <AlertTriangle className="text-amber-500 mt-0.5" size={16} />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{e.label}</p>
                      <p className="text-xs text-gray-600">{e.delta === 0 ? "Hoy" : `En ${e.delta} día${e.delta === 1 ? "" : "s"}`}</p>
                    </div>
                    <Badge className="ml-auto" variant={e.delta <= 1 ? "destructive" : "secondary"}>
                      {e.kind === "vaccine" ? "Vacuna" : "Cita"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6 bg-white border-gray-100 text-sm text-gray-600">
            Este calendario combina automáticamente tus citas veterinarias y las próximas dosis de vacunas de <b>{petName}</b>, y te avisa con anticipación cuando algo se acerca.
          </Card>
        </div>
      </main>
    </div>
  );
}
