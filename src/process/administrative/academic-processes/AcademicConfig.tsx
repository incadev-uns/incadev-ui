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
  IconDeviceFloppy,
  IconX,
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

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
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
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

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

      const payload = {
        base_grade: parseInt(settings.base_grade.toString()),
        min_passing_grade: parseInt(settings.min_passing_grade.toString()),
        absence_percentage: parseFloat(settings.absence_percentage.toString()),
      };

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
      <AdministrativeLayout title="Configuración Académica">
        <div className="min-h-screen p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-blue-500"></div>
                <p className="text-sm text-muted-foreground">
                  Cargando configuración...
                </p>
              </div>
            </div>
          </div>
        </div>
      </AdministrativeLayout>
    );
  }

  return (
    <AdministrativeLayout title="Configuración Académica">
      <div className="min-h-screen p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800/60 bg-gradient-to-br from-sky-500 to-sky-700 px-6 py-7 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-blue-100/90">
                  ÁREA ADMINISTRATIVA
                </p>
                <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
                  Configuración Académica
                </h1>
                <p className="mt-2 max-w-xl text-sm text-blue-100/80">
                  Establece los parámetros base del sistema de evaluación
                </p>
              </div>
              <div className="hidden lg:block">
                <div className="rounded-2xl bg-white/10 backdrop-blur-sm px-6 py-4 border border-white/20">
                  <div className="flex items-center gap-3">
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
          </div>

          {/* Alerts */}
          {error && (
            <Alert variant="destructive">
              <IconAlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
              <IconCheck className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Stats Cards - Vista previa actual */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Nota Base
                    </p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {settings.base_grade}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Escala máxima
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                    <IconChartBar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Nota Aprobatoria
                    </p>
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                      {settings.min_passing_grade}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Mínimo para aprobar
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/20">
                    <IconTrophy className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Asistencia Mínima
                    </p>
                    <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                      {(100 - settings.absence_percentage).toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {settings.absence_percentage}% máx. inasistencias
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20">
                    <IconPercentage className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Configuration Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconSettings className="h-5 w-5 text-blue-600" />
                Parámetros del Sistema
              </CardTitle>
              <CardDescription>
                Configura los valores que regirán el sistema de evaluaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Parameters Grid */}
              <div className="grid gap-6 md:grid-cols-3">
                {/* Base Grade */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                      <IconChartBar className="h-4 w-4 text-blue-600" />
                    </div>
                    Nota Base
                  </Label>
                  <Input
                    type="number"
                    value={settings.base_grade}
                    onChange={(e) =>
                      handleInputChange("base_grade", e.target.value)
                    }
                    className="h-14 text-2xl font-bold text-center"
                    min="1"
                    max="100"
                  />
                  <p className="text-xs text-muted-foreground px-2">
                    Valor máximo de calificación en el sistema (generalmente 20)
                  </p>
                </div>

                {/* Minimum Passing Grade */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/20">
                      <IconTrophy className="h-4 w-4 text-emerald-600" />
                    </div>
                    Nota Aprobatoria
                  </Label>
                  <Input
                    type="number"
                    value={settings.min_passing_grade}
                    onChange={(e) =>
                      handleInputChange("min_passing_grade", e.target.value)
                    }
                    className="h-14 text-2xl font-bold text-center"
                    min="1"
                    max={settings.base_grade}
                  />
                  <p className="text-xs text-muted-foreground px-2">
                    Calificación mínima requerida para aprobar un curso
                  </p>
                </div>

                {/* Max Absence Percentage */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/20">
                      <IconPercentage className="h-4 w-4 text-amber-600" />
                    </div>
                    Máximo de Inasistencias
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={settings.absence_percentage}
                    onChange={(e) =>
                      handleInputChange("absence_percentage", e.target.value)
                    }
                    className="h-14 text-2xl font-bold text-center"
                    min="0"
                    max="100"
                  />
                  <p className="text-xs text-muted-foreground px-2">
                    Porcentaje máximo de faltas permitidas
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saving || !hasChanges()}
                  className="gap-2"
                >
                  <IconX className="h-4 w-4" />
                  Cancelar
                </Button>
                <Button
                  onClick={saveSettings}
                  disabled={saving || !hasChanges()}
                  className="bg-blue-600 hover:bg-blue-700 gap-2"
                >
                  {saving ? (
                    <>
                      <IconLoader className="h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <IconDeviceFloppy className="h-4 w-4" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Information Card */}
          <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
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
