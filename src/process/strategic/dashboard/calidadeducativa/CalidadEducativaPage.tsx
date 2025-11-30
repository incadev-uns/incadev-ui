import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import StrategicLayout from "../../StrategicLayout";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Star,
  CheckCircle,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  ArrowUp,
} from "lucide-react";
import { config } from "@/config/strategic-config";

export const CalidadEducativaPage = () => {
  // 🟦 Formulario (Pantalla 1)
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [meta, setMeta] = useState(3.5);
  const [publico, setPublico] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // 📊 Datos traídos de la API
  const [estandares, setEstandares] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchEstandares = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("❌ No se encontró token en localStorage");
        return;
      }

      const response = await fetch(
        `${config.apiUrl}${config.endpoints.qualityStandards.list}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok)
        throw new Error(
          `Error HTTP: ${response.status} (${response.statusText})`
        );

      const json = await response.json();
      setEstandares(json.data || []);
    } catch (error) {
      console.error("Error al obtener estándares:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstandares();
  }, []);

  // 🧩 Guardar nuevo estándar
  const handleGuardar = async () => {
    if (!nombre || !categoria || !descripcion) {
      alert("Por favor completa todos los campos antes de guardar.");
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No se encontró un token de autenticación.");
        return;
      }

      // 🔄 Mapeo entre español y clave esperada por el backend
      const roleMap: Record<string, string> = {
        Estudiantes: "student",
        Docentes: "teacher",
        Admin: "admin",
      };

      const body = {
        name: nombre,
        category: categoria,
        description: descripcion,
        target_score: meta,
        target_roles:
          publico.length > 0 ? publico.map((r) => roleMap[r]) : null, // 👈 aquí el cambio clave
        is_active: true,
      };

      const response = await fetch(
        `${config.apiUrl}${config.endpoints.qualityStandards.create}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Error ${response.status}: ${errorText || "Error al guardar"}`
        );
      }

      const result = await response.json();
      alert("✅ Estándar guardado correctamente.");
      console.log("📦 Respuesta:", result);

      // Recargar lista
      fetchEstandares();

      // Reset formulario
      setNombre("");
      setCategoria("");
      setDescripcion("");
      setMeta(3.5);
      setPublico([]);
    } catch (error) {
      console.error("❌ Error al guardar estándar:", error);
      alert("Error al guardar el estándar. Revisa la consola.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelar = () => {
    const confirmar = confirm("¿Seguro que desea cancelar y borrar todo?");
    if (confirmar) {
      setNombre("");
      setCategoria("");
      setDescripcion("");
      setMeta(3.5);
      setPublico([]);
    }
  };

  // 📈 KPIs dinámicos
  const promedio =
    estandares.length > 0
      ? estandares.reduce((a, e) => a + e.current_score, 0) / estandares.length
      : 0;
  const cumplidos = estandares.filter(
    (e) => e.current_score >= e.target_score
  ).length;
  const cumplimiento =
    estandares.length > 0 ? (cumplidos / estandares.length) * 100 : 0;
  const alertas = estandares.length - cumplidos;

  return (
    <StrategicLayout title="Dashboard - Gestión de Organizaciones">
      <div className="min-h-screen bg-slate-50 pt-12 pb-16 px-4 sm:px-6 lg:px-8 space-y-12">
      {/* HEADER */}
      <header className="text-center space-y-2 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold">Módulo de Calidad Educativa</h1>
        <p className="text-slate-500">
          Flujo de Evaluación de Estándares
        </p>
      </header>

      {/* 🟦 PANTALLA 1 */}
      <section className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-semibold">
            Gestión de Estándares
          </h2>
        </div>

        <Card className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div className="border-b pb-4 mb-4">
            <h3 className="text-lg font-semibold">
              Crear Nuevo Estándar de Calidad
            </h3>
            <p className="text-sm text-slate-500">
              Define qué aspecto de la institución se evaluará.
            </p>
          </div>

          {/* FORMULARIO */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Nombre del Estándar</Label>
              <Input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Conectividad en Laboratorios"
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-white text-sm"
              >
                <option value="">Seleccionar</option>
                <option>INFRAESTRUCTURA</option>
                <option>SERVICIOS</option>
                <option>PROCESOS</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descripción (Visible para el usuario)</Label>
            <Textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              className="resize-none text-sm"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Meta de Aprobación (1.0 - 5.0)</Label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={0.1}
                  value={meta}
                  onChange={(e) => setMeta(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg accent-blue-600 cursor-pointer"
                />
                <span className="text-xl font-bold text-blue-600 w-12 text-right">
                  {meta.toFixed(1)}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Público Objetivo (Target)</Label>
              <div className="flex gap-4 mt-2 flex-wrap">
                {["Estudiantes", "Docentes", "Admin"].map((rol) => (
                  <label
                    key={rol}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <Checkbox
                      checked={publico.includes(rol)}
                      onCheckedChange={(checked) =>
                        setPublico((prev) =>
                          checked
                            ? [...prev, rol]
                            : prev.filter((r) => r !== rol)
                        )
                      }
                    />
                    {rol}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleCancelar}>
              Cancelar
            </Button>
            <Button
              className="bg-slate-900 hover:bg-slate-800 text-white"
              onClick={handleGuardar}
              disabled={isSaving}
            >
              {isSaving ? "Guardando..." : "Guardar Estándar"}
            </Button>
          </div>
        </Card>
      </section>

      {/* 🟩 PANTALLA 2 - PANEL DEL ESTUDIANTE */}
      <section className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-semibold">
            Panel del Estudiante (Widget de Votación)
          </h2>
        </div>

        {loading ? (
          <p className="text-center text-slate-500">Cargando estándares...</p>
        ) : estandares.length === 0 ? (
          <p className="text-center text-slate-400">
            No hay estándares disponibles.
          </p>
        ) : (
          <div className="overflow-hidden">
            {/* 🔹 Contenedor con scroll solo si hay muchas tarjetas */}
            <div
              className="
          flex gap-6 overflow-x-auto 
          scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100
          scroll-smooth pb-2
        "
            >
              {estandares.map((e) => {
                const progreso = Math.min(
                  (e.current_score / e.target_score) * 100,
                  100
                );
                const color =
                  progreso >= 90 ? "green" : progreso >= 70 ? "amber" : "red";

                return (
                  <div key={e.id} className="flex-none w-80 snap-start">
                    <Card
                      className={`rounded-xl shadow-md border-t-4 border-t-${color}-600 p-0 overflow-hidden`}
                    >
                      <div className="p-5 pb-2">
                        <div className="flex justify-between items-start mb-2">
                          <span
                            className={`text-[10px] font-bold uppercase bg-${color}-50 text-${color}-700 px-2 py-1 rounded-full tracking-wide`}
                          >
                            {e.category || "GENERAL"}
                          </span>
                          <div className="text-right">
                            <span
                              className={`text-2xl font-bold text-${color}-600`}
                            >
                              {e.current_score.toFixed(1)}
                            </span>
                            <span className="text-xs text-gray-400 block font-medium">
                              Meta: {e.target_score}
                            </span>
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-1">
                          {e.name}
                        </h3>
                        <p className="text-sm text-slate-500 line-clamp-2 h-10">
                          {e.description}
                        </p>
                      </div>

                      <div className="px-5 pb-4">
                        <div className="flex justify-between text-xs mb-1 font-medium text-slate-600">
                          <span>Progreso actual</span>
                          <span>{progreso.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-${color}-500 transition-all`}
                            style={{ width: `${progreso}%` }}
                          />
                        </div>
                      </div>

                      <div
                        className={`p-4 text-center border-t ${
                          color === "green" ? "bg-green-50" : "bg-slate-50"
                        }`}
                      >
                        {color === "green" ? (
                          <div className="flex items-center justify-center gap-2 text-green-700 font-medium text-sm">
                            <CheckCircle className="w-4 h-4" /> ¡Meta alcanzada!
                          </div>
                        ) : (
                          <>
                            <p className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                              ¡Danos tu opinión!
                            </p>
                            <div className="flex justify-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <button
                                  key={i}
                                  className="p-1 hover:scale-125 transition-transform"
                                >
                                  <Star className="w-6 h-6 text-slate-300 hover:text-yellow-400" />
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* 🟪 PANTALLA 3 - TABLERO DE CONTROL (KPIs) */}
      <section className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-semibold">
            Tablero de Control Visual (KPIs)
          </h2>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-xl border shadow-sm text-slate-800">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-500 font-medium">
                  Calidad Global
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {promedio.toFixed(1)}
                </h3>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-green-600 font-medium mt-2 flex items-center gap-1">
              <ArrowUp className="w-3 h-3" /> +0.3 vs mes anterior
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border shadow-sm text-slate-800">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-500 font-medium">
                  Cumplimiento
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {cumplimiento.toFixed(0)}%
                </h3>
              </div>
              <div className="p-2 bg-green-50 rounded-lg text-green-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-2">
              {cumplidos} de {estandares.length} estándares cumplen meta
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border shadow-sm text-slate-800">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-500 font-medium">Alertas</p>
                <h3 className="text-2xl font-bold mt-1 text-red-600">
                  {alertas}
                </h3>
              </div>
              <div className="p-2 bg-red-50 rounded-lg text-red-600">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-2">
              Requiere atención inmediata
            </p>
          </div>
        </div>

        {/* 🧩 Análisis de Brechas */}
        <Card className="bg-white p-6 rounded-xl border shadow-sm space-y-6 mt-8">
          <div className="border-b pb-4 mb-4">
            <h3 className="text-lg font-semibold">Análisis de Brechas</h3>
            <p className="text-sm text-slate-500">
              Comparativa entre el puntaje actual y la meta establecida por
              estándar.
            </p>
          </div>

          {estandares.map((e) => {
            const progreso = Math.min(
              (e.current_score / e.target_score) * 100,
              100
            );
            const color =
              progreso >= 90 ? "green" : progreso >= 70 ? "amber" : "red";

            return (
              <div key={e.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">{e.name}</span>
                  <span className={`font-bold text-${color}-600`}>
                    {e.current_score.toFixed(1)}
                    <span className="text-slate-400 font-normal text-xs">
                      {" "}
                      / Meta {e.target_score}
                    </span>
                  </span>
                </div>
                <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-slate-400 z-10 opacity-50"
                    style={{ left: `${(e.target_score / 5) * 100}%` }}
                  />
                  <div
                    className={`absolute top-0 left-0 h-full bg-${color}-500 rounded-full`}
                    style={{ width: `${progreso}%` }}
                  />
                </div>
              </div>
            );
          })}
        </Card>
      </section>
    </div>
    </StrategicLayout>
    
  );
};
