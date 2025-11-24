import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, Calendar } from "lucide-react";
import { config } from "@/config/support-config";
import { useAcademicAuth } from "@/process/academic/hooks/useAcademicAuth";

interface Teacher {
  id: number;
  name: string;
  email: string;
}

interface Availability {
  id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface TutoringRequestFormProps {
  onSubmit: (data: {
    teacherId: string;
    requestedDate: string;
    requestedTime: string;
  }) => Promise<boolean>;
}

const DAYS_MAP: { [key: number]: string } = {
  0: "Domingo",
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado"
};

export default function TutoringRequestForm({
  onSubmit,
}: TutoringRequestFormProps) {
  const { token } = useAcademicAuth();
  const [formData, setFormData] = useState({
    teacherId: "",
    requestedDate: "",
    requestedTime: "",
  });
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [loadingAvailabilities, setLoadingAvailabilities] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar lista de profesores al montar el componente
  useEffect(() => {
    fetchTeachers();
  }, [token]);

  // Cargar disponibilidad cuando se selecciona un profesor
  useEffect(() => {
    if (formData.teacherId) {
      fetchTeacherAvailability(formData.teacherId);
    } else {
      setAvailabilities([]);
    }
  }, [formData.teacherId]);

  const fetchTeachers = async () => {
    try {
      setLoadingTeachers(true);
      const tokenWithoutQuotes = token?.replace(/^"|"/g, '');
      const response = await fetch(
        `${config.apiUrl}${config.endpoints.tutoring.teachers}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${tokenWithoutQuotes}`,
            "Content-Type": "application/json"
          },
          credentials: "include"
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const data = result.data || result;
      setTeachers(data);
    } catch (err) {
      console.error("Error fetching teachers:", err);
      setError("Error al cargar la lista de profesores");
    } finally {
      setLoadingTeachers(false);
    }
  };

  const fetchTeacherAvailability = async (teacherId: string) => {
    try {
      setLoadingAvailabilities(true);
      const tokenWithoutQuotes = token?.replace(/^"|"/g, '');
      const endpoint = config.endpoints.tutoring.teacherAvailability.replace(':teacherId', teacherId);
      const response = await fetch(
        `${config.apiUrl}${endpoint}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${tokenWithoutQuotes}`,
            "Content-Type": "application/json"
          },
          credentials: "include"
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const data = result.data || result;
      setAvailabilities(data);
    } catch (err) {
      console.error("Error fetching availability:", err);
      setAvailabilities([]);
    } finally {
      setLoadingAvailabilities(false);
    }
  };

  const validateAvailability = (): boolean => {
    if (!formData.requestedDate || !formData.requestedTime || availabilities.length === 0) {
      return true; // Si no hay disponibilidad configurada, permitir cualquier horario
    }

    // Obtener el día de la semana de la fecha seleccionada (0=Domingo, 1=Lunes, etc.)
    const selectedDate = new Date(formData.requestedDate + 'T00:00:00');
    const dayOfWeek = selectedDate.getDay();

    // Buscar si el tutor tiene disponibilidad ese día
    const dayAvailability = availabilities.filter(av => av.day_of_week === dayOfWeek);

    if (dayAvailability.length === 0) {
      setError(`El tutor no tiene disponibilidad los ${DAYS_MAP[dayOfWeek]}s. Por favor elige otro día.`);
      return false;
    }

    // Validar que la hora esté dentro del rango
    const requestedTime = formData.requestedTime;
    const isTimeValid = dayAvailability.some(av => {
      const startTime = av.start_time.substring(0, 5); // HH:MM
      const endTime = av.end_time.substring(0, 5);
      return requestedTime >= startTime && requestedTime <= endTime;
    });

    if (!isTimeValid) {
      const timeRanges = dayAvailability.map(av => 
        `${av.start_time.substring(0, 5)} - ${av.end_time.substring(0, 5)}`
      ).join(', ');
      setError(`La hora seleccionada no está dentro de la disponibilidad del tutor para ese día (${timeRanges}).`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validar disponibilidad antes de enviar
    if (!validateAvailability()) {
      setLoading(false);
      return;
    }

    try {
      const result = await onSubmit(formData);
      if (result) {
        setSuccess(true);
        setFormData({
          teacherId: "",
          requestedDate: "",
          requestedTime: "",
        });
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError("No se pudo enviar la solicitud. Intenta nuevamente.");
      }
    } catch (err) {
      setError("Ocurrió un error al enviar la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const minDateString = `${year}-${month}-${day}`;

  if (loadingTeachers) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solicitar Tutoría</CardTitle>
        <CardDescription>
          Selecciona un docente, fecha y hora para tu sesión de tutoría
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success && (
          <Alert className="mb-6 border-green-600 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-900">
              Solicitud enviada exitosamente. El docente revisará tu petición.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="teacher">Docente</Label>
            <Select
              value={formData.teacherId}
              onValueChange={value => handleChange("teacherId", value)}
              required
            >
              <SelectTrigger id="teacher">
                <SelectValue placeholder="Selecciona un docente" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map(teacher => (
                  <SelectItem key={teacher.id} value={teacher.id.toString()}>
                    {teacher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.teacherId && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Disponibilidad del profesor
              </Label>
              {loadingAvailabilities ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando disponibilidad...
                </div>
              ) : availabilities.length > 0 ? (
                <div className="rounded-md border p-3 bg-blue-50 border-blue-200">
                  <p className="text-xs font-medium text-blue-900 mb-2">
                    📅 Horarios disponibles del tutor:
                  </p>
                  <div className="space-y-1 mb-3">
                    {availabilities.map((av) => (
                      <div key={av.id} className="text-sm text-blue-800">
                        <span className="font-medium">{DAYS_MAP[av.day_of_week]}</span>
                        {": "}
                        <span>{av.start_time.substring(0, 5)} - {av.end_time.substring(0, 5)}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-blue-700 italic">
                    ⚠️ Solo puedes solicitar tutorías en estos días y horarios
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Este tutor aún no ha configurado su disponibilidad.
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                min={minDateString}
                value={formData.requestedDate}
                onChange={e => handleChange("requestedDate", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Hora</Label>
              <Input
                id="time"
                type="time"
                value={formData.requestedTime}
                onChange={e => handleChange("requestedTime", e.target.value)}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar Solicitud"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}