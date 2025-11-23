import { useState, useEffect } from "react";
import AdministrativeLayout from "@/process/administrative/AdministrativeLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  IconSettings,
  IconChartBar,
  IconTrophy,
  IconPercentage,
  IconAlertCircle,
  IconLoader,
  IconCheck,
  IconInfoCircle,
} from "@tabler/icons-react";

import { config } from "@/config/administrative-config";

interface AcademicSettings {
  id?: number;
  base_grade: number;
  min_passing_grade: number;
  absence_percentage: number;
}

export default function AcademicConfig() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [settings, setSettings] = useState<AcademicSettings>({
    base_grade: 20,
    min_passing_grade: 11,
    absence_percentage: 30.0,
  });

  const [originalSettings, setOriginalSettings] = useState<AcademicSettings>({
    base_grade: 20,
    min_passing_grade: 11,
    absence_percentage: 30.0,
  });

  // Cargar configuración desde el backend
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      console.log(
        "Cargando configuración desde:",
        `${config.apiUrl}${config.endpoints.academicSettings}`
      );

      const response = await fetch(
        `${config.apiUrl}${config.endpoints.academicSettings}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error Response:", errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Datos cargados:", data);

      const processedSettings: AcademicSettings = {
        id: data.data.id,
        base_grade: data.data.base_grade || 20,
        min_passing_grade: data.data.min_passing_grade || 11,
        absence_percentage: parseFloat(data.data.absence_percentage) || 30.0,
      };

      setSettings(processedSettings);
      setOriginalSettings(processedSettings);
      setError(null);
    } catch (err) {
      console.error("Error al cargar configuración:", err);
      setError(
        err instanceof Error ? err.message : "Error al cargar la configuración"
      );
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = () => {
    return (
      settings.base_grade !== originalSettings.base_grade ||
      settings.min_passing_grade !== originalSettings.min_passing_grade ||
      settings.absence_percentage !== originalSettings.absence_percentage
    );
  };

  const saveSettings = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Validaciones
      if (settings.base_grade < 1 || settings.base_grade > 100) {
        throw new Error("La nota base debe estar entre 1 y 100");
      }
      if (
        settings.min_passing_grade < 1 ||
        settings.min_passing_grade > settings.base_grade
      ) {
        throw new Error("La nota mínima debe estar entre 1 y la nota base");
      }
      if (
        settings.absence_percentage < 0 ||
        settings.absence_percentage > 100
      ) {
        throw new Error(
          "El porcentaje de inasistencias debe estar entre 0 y 100"
        );
      }

      // Preparar los datos
      const payload = {
        base_grade: parseInt(settings.base_grade.toString()),
        min_passing_grade: parseInt(settings.min_passing_grade.toString()),
        absence_percentage: parseFloat(settings.absence_percentage.toString()),
      };

      console.log("Enviando datos:", payload);
      console.log(
        "URL:",
        `${config.apiUrl}${config.endpoints.academicSettings}`
      );

      const response = await fetch(
        `${config.apiUrl}${config.endpoints.academicSettings}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const responseData = await response.json();
      console.log("Response:", responseData);

      if (!response.ok) {
        const errorMessage =
          responseData.message ||
          responseData.errors ||
          `Error ${response.status}: ${response.statusText}`;
        throw new Error(
          typeof errorMessage === "string"
            ? errorMessage
            : JSON.stringify(errorMessage)
        );
      }

      setOriginalSettings(settings);
      setSuccess("✅ Configuración guardada exitosamente");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error al guardar configuración:", err);
      setError(
        err instanceof Error ? err.message : "Error al guardar la configuración"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setSettings(originalSettings);
    setError(null);
    setSuccess(null);
  };

  const handleInputChange = (field: keyof AcademicSettings, value: string) => {
    const numValue = parseFloat(value) || 0;
    setSettings((prev) => ({
      ...prev,
      [field]: numValue,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <IconLoader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                Cargando configuración...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdministrativeLayout title="Estudiantes">
      <div className="min-h-screen p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* Header */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800/60 bg-gradient-to-br from-blue-600 to-blue-800 px-8 py-8 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-blue-100/90 font-semibold">
                  Administración del Sistema
                </p>
                <h1 className="mt-3 text-4xl font-bold text-white">
                  Configuración Académica
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-blue-100/80">
                  Establece los parámetros base del sistema de evaluación
                </p>
              </div>
              <div className="hidden lg:flex items-center gap-4">
                <div className="flex items-center gap-3 rounded-2xl bg-white/10 backdrop-blur-sm px-6 py-4 border border-white/20">
                  <IconSettings className="h-8 w-8 text-white/90" />
                  <div>
                    <p className="text-xs text-white/70">Escala Vigesimal</p>
                    <p className="text-2xl font-bold text-white">
                      0 - {settings.base_grade}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <Alert
              variant="destructive"
              className="animate-in slide-in-from-top-2"
            >
              <IconAlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 animate-in slide-in-from-top-2">
              <IconCheck className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Main Configuration Card */}
          <Card className="border-2 shadow-xl">
            <CardHeader className="border-b bg-slate-50 dark:bg-slate-900/50">
              <CardTitle className="text-2xl flex items-center gap-2">
                <IconSettings className="h-6 w-6 text-blue-600" />
                Parámetros del Sistema
              </CardTitle>
              <CardDescription>
                Configura los valores que regirán el sistema de evaluaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-8">
                {/* Parameters Grid */}
                <div className="grid gap-8 md:grid-cols-3">
                  {/* Base Grade */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/20 shadow-sm">
                        <IconChartBar className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <Label className="text-base font-semibold">
                          Nota Base
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Escala máxima
                        </p>
                      </div>
                    </div>
                    <Input
                      type="number"
                      value={settings.base_grade}
                      onChange={(e) =>
                        handleInputChange("base_grade", e.target.value)
                      }
                      className="h-16 text-3xl font-bold border-2 text-center focus:ring-2 focus:ring-blue-500"
                      min="1"
                      max="100"
                    />
                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                      <p className="text-xs text-blue-900 dark:text-blue-100">
                        Valor máximo de calificación en el sistema (generalmente
                        20)
                      </p>
                    </div>
                  </div>

                  {/* Minimum Passing Grade */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/20 shadow-sm">
                        <IconTrophy className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div>
                        <Label className="text-base font-semibold">
                          Nota Aprobatoria
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Mínimo para aprobar
                        </p>
                      </div>
                    </div>
                    <Input
                      type="number"
                      value={settings.min_passing_grade}
                      onChange={(e) =>
                        handleInputChange("min_passing_grade", e.target.value)
                      }
                      className="h-16 text-3xl font-bold border-2 text-center focus:ring-2 focus:ring-emerald-500"
                      min="1"
                      max={settings.base_grade}
                    />
                    <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900">
                      <p className="text-xs text-emerald-900 dark:text-emerald-100">
                        Calificación mínima requerida para aprobar un curso
                      </p>
                    </div>
                  </div>

                  {/* Max Absence Percentage */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/20 shadow-sm">
                        <IconPercentage className="h-6 w-6 text-amber-600" />
                      </div>
                      <div>
                        <Label className="text-base font-semibold">
                          Máximo de Inasistencias
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Porcentaje límite
                        </p>
                      </div>
                    </div>
                    <Input
                      type="number"
                      step="0.01"
                      value={settings.absence_percentage}
                      onChange={(e) =>
                        handleInputChange("absence_percentage", e.target.value)
                      }
                      className="h-16 text-3xl font-bold border-2 text-center focus:ring-2 focus:ring-amber-500"
                      min="0"
                      max="100"
                    />
                    <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
                      <p className="text-xs text-amber-900 dark:text-amber-100">
                        Porcentaje máximo de faltas permitidas
                      </p>
                    </div>
                  </div>
                </div>

                {/* System Preview */}
                <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-blue-50 via-violet-50 to-emerald-50 dark:from-blue-950/20 dark:via-violet-950/20 dark:to-emerald-950/20 border-2 border-blue-100 dark:border-blue-900/30 shadow-lg">
                  <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
                    <IconInfoCircle className="h-5 w-5" />
                    Resumen de Configuración
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-5 rounded-xl bg-white dark:bg-slate-900 border-2 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-center mb-2">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                          <IconChartBar className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        Escala de Notas
                      </p>
                      <p className="text-4xl font-bold text-blue-600 mb-1">
                        0 - {settings.base_grade}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Rango de calificación
                      </p>
                    </div>
                    <div className="text-center p-5 rounded-xl bg-white dark:bg-slate-900 border-2 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-center mb-2">
                        <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/20">
                          <IconTrophy className="h-5 w-5 text-emerald-600" />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        Para Aprobar
                      </p>
                      <p className="text-4xl font-bold text-emerald-600 mb-1">
                        ≥ {settings.min_passing_grade}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Nota mínima requerida
                      </p>
                    </div>
                    <div className="text-center p-5 rounded-xl bg-white dark:bg-slate-900 border-2 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-center mb-2">
                        <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/20">
                          <IconPercentage className="h-5 w-5 text-amber-600" />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        Asistencia Mínima
                      </p>
                      <p className="text-4xl font-bold text-amber-600 mb-1">
                        {(100 - settings.absence_percentage).toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Requerida para aprobar
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={saving || !hasChanges()}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={saveSettings}
                    disabled={saving || !hasChanges()}
                    className="bg-blue-600 hover:bg-blue-700 min-w-[160px] shadow-lg hover:shadow-xl transition-all"
                    size="lg"
                  >
                    {saving ? (
                      <>
                        <IconLoader className="mr-2 h-5 w-5 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <IconCheck className="mr-2 h-5 w-5" />
                        Guardar Cambios
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Information Card */}
          <Card className="border-2 shadow-lg bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-950/20 dark:to-slate-900/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20 flex-shrink-0">
                  <IconInfoCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                    Información Importante
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Estos parámetros definen cómo funcionará el sistema de
                    evaluación para todos los cursos. Los cambios se aplicarán
                    inmediatamente a todos los módulos. Asegúrate de revisar los
                    valores antes de guardar para evitar afectar el desempeño
                    académico de los estudiantes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdministrativeLayout>
  );
}
