import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Stethoscope,
  Brain,
  Smile,
  HeartHandshake,
  UtensilsCrossed,
  Coffee,
  Apple,
  CalendarDays,
  Clock,
  MapPin,
  Phone,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/")({
  component: Index,
});

const servicios = [
  {
    id: "medica",
    nombre: "Hora Médica",
    descripcion: "Consultas con médico general para atención primaria.",
    icon: Stethoscope,
    color: "bg-blue-100 text-blue-700",
  },
  {
    id: "psicologica",
    nombre: "Hora Psicológica",
    descripcion: "Apoyo psicológico individual con profesionales de la salud mental.",
    icon: Brain,
    color: "bg-purple-100 text-purple-700",
  },
  {
    id: "dental",
    nombre: "Hora Dental",
    descripcion: "Consultas odontológicas, controles y urgencias dentales.",
    icon: Smile,
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "social",
    nombre: "Asistente Social",
    descripcion: "Orientación sobre beneficios, becas y apoyo socioeconómico.",
    icon: HeartHandshake,
    color: "bg-rose-100 text-rose-700",
  },
];

const horarios = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
];

const reservaSchema = z.object({
  nombre: z.string().trim().min(2, "Mínimo 2 caracteres").max(100),
  email: z.string().trim().email("Email inválido").max(255),
  rut: z.string().trim().max(20).optional().or(z.literal("")),
  servicio: z.string().min(1, "Selecciona un servicio"),
  hora: z.string().min(1, "Selecciona una hora"),
  notas: z.string().max(500).optional().or(z.literal("")),
});

function Index() {
  const [fecha, setFecha] = useState<Date | undefined>(new Date());
  const [servicio, setServicio] = useState<string>("");
  const [hora, setHora] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = {
      nombre: String(form.get("nombre") ?? ""),
      email: String(form.get("email") ?? ""),
      rut: String(form.get("rut") ?? ""),
      servicio,
      hora,
      notas: String(form.get("notas") ?? ""),
    };

    if (!fecha) {
      toast.error("Selecciona una fecha");
      return;
    }

    const parsed = reservaSchema.safeParse(data);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Datos inválidos");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("reservas").insert({
      nombre: parsed.data.nombre,
      email: parsed.data.email,
      rut: parsed.data.rut || null,
      servicio: parsed.data.servicio,
      fecha: format(fecha, "yyyy-MM-dd"),
      hora: parsed.data.hora,
      notas: parsed.data.notas || null,
    });
    setLoading(false);

    if (error) {
      toast.error("No se pudo crear la reserva. Intenta nuevamente.");
      return;
    }

    toast.success(
      `Reserva confirmada para el ${format(fecha, "PPP", { locale: es })} a las ${hora}`,
    );
    (e.target as HTMLFormElement).reset();
    setServicio("");
    setHora("");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Toaster richColors position="top-center" />

      {/* Hero */}
      <header className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Reserva de Horas Universitarias
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-blue-100">
            Agenda tu hora médica, psicológica, dental o con asistente social.
            Conoce además los servicios de alimentación disponibles en el campus.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
              <MapPin className="h-4 w-4" /> Edificio de Bienestar
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
              <Clock className="h-4 w-4" /> Lun a Vie · 09:00–17:00
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
              <Phone className="h-4 w-4" /> +56 2 1234 5678
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <Tabs defaultValue="reservar" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="reservar">Reservar</TabsTrigger>
            <TabsTrigger value="servicios">Servicios</TabsTrigger>
            <TabsTrigger value="alimentacion">Alimentación</TabsTrigger>
          </TabsList>

          {/* RESERVAR */}
          <TabsContent value="reservar" className="mt-8">
            <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" /> Elige fecha
                  </CardTitle>
                  <CardDescription>
                    Selecciona el día en el que quieres ser atendido.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={fecha}
                    onSelect={setFecha}
                    disabled={(d) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return d < today || d.getDay() === 0 || d.getDay() === 6;
                    }}
                    locale={es}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Datos de la reserva</CardTitle>
                  <CardDescription>
                    Completa el formulario para confirmar tu hora.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="nombre">Nombre completo</Label>
                      <Input id="nombre" name="nombre" required maxLength={100} />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" required maxLength={255} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="rut">RUT (opcional)</Label>
                        <Input id="rut" name="rut" maxLength={20} placeholder="12.345.678-9" />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label>Servicio</Label>
                        <Select value={servicio} onValueChange={setServicio}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona" />
                          </SelectTrigger>
                          <SelectContent>
                            {servicios.map((s) => (
                              <SelectItem key={s.id} value={s.nombre}>
                                {s.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Hora</Label>
                        <Select value={hora} onValueChange={setHora}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona" />
                          </SelectTrigger>
                          <SelectContent>
                            {horarios.map((h) => (
                              <SelectItem key={h} value={h}>
                                {h}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="notas">Notas (opcional)</Label>
                      <Textarea
                        id="notas"
                        name="notas"
                        rows={3}
                        maxLength={500}
                        placeholder="Motivo de la consulta u observaciones"
                      />
                    </div>

                    {fecha && (
                      <div className="rounded-md bg-slate-50 border border-slate-200 p-3 text-sm text-slate-700">
                        Reservando para el{" "}
                        <strong>{format(fecha, "PPP", { locale: es })}</strong>
                        {hora && (
                          <>
                            {" "}a las <strong>{hora}</strong>
                          </>
                        )}
                      </div>
                    )}

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Guardando..." : "Confirmar reserva"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* SERVICIOS */}
          <TabsContent value="servicios" className="mt-8">
            <div className="grid gap-6 sm:grid-cols-2">
              {servicios.map((s) => {
                const Icon = s.icon;
                return (
                  <Card key={s.id}>
                    <CardHeader>
                      <div
                        className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${s.color}`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="mt-4">{s.nombre}</CardTitle>
                      <CardDescription>{s.descripcion}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-slate-600 space-y-2">
                      <p className="flex items-center gap-2">
                        <Clock className="h-4 w-4" /> Duración aprox: 30 min
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" /> Edificio de Bienestar, piso 2
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* ALIMENTACION */}
          <TabsContent value="alimentacion" className="mt-8">
            <div className="grid gap-6 sm:grid-cols-3">
              <Card>
                <CardHeader>
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                    <UtensilsCrossed className="h-6 w-6" />
                  </div>
                  <CardTitle className="mt-4">Casino Central</CardTitle>
                  <CardDescription>
                    Almuerzo balanceado con menú diario, vegetariano y especial.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-slate-600">
                  <p>Horario: 12:00 – 15:00</p>
                  <p>Ubicación: Edificio Central, piso 1</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
                    <Coffee className="h-6 w-6" />
                  </div>
                  <CardTitle className="mt-4">Cafetería</CardTitle>
                  <CardDescription>
                    Café, snacks y sándwiches durante toda la jornada.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-slate-600">
                  <p>Horario: 08:00 – 19:00</p>
                  <p>Ubicación: Biblioteca, piso 1</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-700">
                    <Apple className="h-6 w-6" />
                  </div>
                  <CardTitle className="mt-4">Quiosco saludable</CardTitle>
                  <CardDescription>
                    Frutas, jugos naturales y opciones sin azúcar añadida.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-slate-600">
                  <p>Horario: 09:00 – 17:00</p>
                  <p>Ubicación: Patio Norte</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t bg-white py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Bienestar Universitario · Todos los derechos reservados
      </footer>
    </div>
  );
}
