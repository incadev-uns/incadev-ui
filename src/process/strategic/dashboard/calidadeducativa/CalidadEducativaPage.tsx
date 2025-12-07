import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import StrategicLayout from "../../StrategicLayout";
import {
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  ArrowUp,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { config } from "@/config/strategic-config";

export const CalidadEducativaPage = () => {
  // 🟦 Estado del formulario
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [meta, setMeta] = useState(3.5);
  const [publico, setPublico] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // 📊 Datos API
  const [estandares, setEstandares] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔔 Estado de notificación
  const [notification, setNotification] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  // Mostrar notificación
  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: null, message: "" }), 3500);
  };

  const fetchEstandares = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return console.error("No se encontró token en localStorage");

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

      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      const json = await response.json();
      setEstandares(json.data || []);
    } catch (err) {
      console.error("Error al obtener estándares:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstandares();
  }, []);

  // 🧩 Guardar
  const handleGuardar = async () => {
    if (!nombre || !categoria || !descripcion) {
      showNotification("error", "Por favor completa todos los campos.");
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showNotification("error", "No se encontró un token de autenticación.");
        return;
      }

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
          publico.length > 0 ? publico.map((r) => roleMap[r]) : null,
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

      if (!response.ok) throw new Error("Error al guardar estándar");

      showNotification("success", "✅ Estándar guardado correctamente.");
      fetchEstandares();

      // Reset formulario
      setNombre("");
      setCategoria("");
      setDescripcion("");
      setMeta(3.5);
      setPublico([]);
    } catch (err) {
      console.error("Error al guardar:", err);
      showNotification("error", "❌ Error al guardar el estándar.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelar = () => {
    if (confirm("¿Seguro que desea cancelar y borrar todo?")) {
      setNombre("");
      setCategoria("");
      setDescripcion("");
      setMeta(3.5);
      setPublico([]);
    }
  };

  // 📈 KPIs
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
    <StrategicLayout title="Dashboard - Calidad Educativa">
      {/* 🔔 Notificación flotante */}
      {notification.type && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-md shadow-lg border text-sm flex items-center gap-2 transition-all duration-300 ${
            notification.type === "success"
              ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700"
              : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      <div className="p-6 md:p-8 space-y-10">
        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Módulo de Calidad Educativa
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Flujo de Evaluación de Estándares Institucionales
          </p>
        </div>

        {/* FORMULARIO */}
        <section className="space-y-6">
          <Card className="bg-white dark:bg-[#0f0f0f] rounded-lg shadow p-6 space-y-6 border border-gray-200 dark:border-[#2a2a2a]">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Crear Nuevo Estándar de Calidad
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Define qué aspecto de la institución se evaluará.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">
                  Nombre del Estándar
                </Label>
                <Input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Conectividad en Laboratorios"
                  className="bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-[#333] text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">
                  Categoría
                </Label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-[#333] rounded-md bg-white dark:bg-[#1a1a1a] text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                >
                  <option value="">Seleccionar</option>
                  <option>INFRAESTRUCTURA</option>
                  <option>SERVICIOS</option>
                  <option>PROCESOS</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300">
                Descripción (Visible para el usuario)
              </Label>
              <Textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
                className="resize-none bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-[#333] text-gray-900 dark:text-gray-100"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">
                  Meta de Aprobación (1.0 - 5.0)
                </Label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={0.1}
                    value={meta}
                    onChange={(e) => setMeta(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-[#333] rounded-lg accent-gray-900 dark:accent-gray-100 cursor-pointer"
                  />
                  <span className="text-xl font-bold text-gray-900 dark:text-gray-100 w-12 text-right">
                    {meta.toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">
                  Público Objetivo
                </Label>
                <div className="flex gap-4 flex-wrap">
                  {["Estudiantes", "Docentes", "Admin"].map((rol) => (
                    <label
                      key={rol}
                      className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
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

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-[#2a2a2a]">
              <Button variant="outline" onClick={handleCancelar}>
                Cancelar
              </Button>
              <Button
                className="bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                onClick={handleGuardar}
                disabled={isSaving}
              >
                {isSaving ? "Guardando..." : "Guardar Estándar"}
              </Button>
            </div>
          </Card>
        </section>

        {/* KPIs */}
        <section className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Tablero de Control
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Promedio */}
            <div className="bg-white dark:bg-[#111] p-4 rounded-lg border border-gray-200 dark:border-[#2a2a2a] shadow-sm">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Calidad Global
              </p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {promedio.toFixed(1)}
              </h3>
              <p className="text-xs text-green-600 dark:text-green-500 flex items-center gap-1 mt-1">
                <ArrowUp className="w-3 h-3" /> +0.3 vs mes anterior
              </p>
            </div>

            {/* Cumplimiento */}
            <div className="bg-white dark:bg-[#111] p-4 rounded-lg border border-gray-200 dark:border-[#2a2a2a] shadow-sm">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Cumplimiento
              </p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {cumplimiento.toFixed(0)}%
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {cumplidos} de {estandares.length} estándares cumplen meta
              </p>
            </div>

            {/* Alertas */}
            <div className="bg-white dark:bg-[#111] p-4 rounded-lg border border-gray-200 dark:border-[#2a2a2a] shadow-sm">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Alertas
              </p>
              <h3 className="text-2xl font-bold text-red-600 dark:text-red-500">
                {alertas}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Requiere atención inmediata
              </p>
            </div>
          </div>
        </section>
      </div>
    </StrategicLayout>
  );
};
