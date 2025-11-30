import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Plus, Trash2, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { config } from "@/config/support-config";
import { useAcademicAuth } from "@/process/academic/hooks/useAcademicAuth";

interface Availability {
  id?: number;
  user_id?: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  created_at?: string;
  updated_at?: string;
}

const DAYS_OF_WEEK = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 0, label: "Domingo" },
];

export default function AvailabilityManager() {
  const { token, user } = useAcademicAuth();
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [dayOfWeek, setDayOfWeek] = useState<string>("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (token) {
      fetchAvailabilities();
    }
  }, [token]);

  const fetchAvailabilities = async () => {
    try {
      setLoading(true);
      const tokenWithoutQuotes = token?.replace(/^"|"/g, '');
      
      const response = await fetch(
        `${config.apiUrl}${config.endpoints.tutoring.myAvailability}?user_id=${user?.id}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${tokenWithoutQuotes}`,
            "Content-Type": "application/json",
            "X-User-Id": user?.id?.toString() || ""
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
      setError(null);
    } catch (err) {
      setError("Error al cargar la disponibilidad");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAvailability = async () => {
    if (!dayOfWeek || !startTime || !endTime) {
      setError("Por favor completa todos los campos");
      return;
    }

    try {
      setSubmitting(true);
      const tokenWithoutQuotes = token?.replace(/^"|"$/g, '');
      
      const response = await fetch(
        `${config.apiUrl}${config.endpoints.tutoring.createAvailability}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${tokenWithoutQuotes}`,
            "Content-Type": "application/json",
            "X-User-Id": user?.id?.toString() || ""
          },
          credentials: "include",
          body: JSON.stringify({
            user_id: user?.id,
            day_of_week: parseInt(dayOfWeek),
            start_time: startTime,
            end_time: endTime,
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const newAvailability = result.data || result;
      
      setAvailabilities([...availabilities, newAvailability]);
      setIsDialogOpen(false);
      
      setDayOfWeek("");
      setStartTime("");
      setEndTime("");
      setError(null);
    } catch (err: any) {
      setError(err.message || "Error al agregar disponibilidad");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAvailability = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar esta disponibilidad?")) return;

    try {
      const tokenWithoutQuotes = token?.replace(/^"|"/g, '');
      const endpoint = config.endpoints.tutoring.deleteAvailability.replace(':id', id.toString());
      
      const response = await fetch(
        `${config.apiUrl}${endpoint}?user_id=${user?.id}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${tokenWithoutQuotes}`,
            "Content-Type": "application/json",
            "X-User-Id": user?.id?.toString() || ""
          },
          credentials: "include"
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      setAvailabilities(availabilities.filter(a => a.id !== id));
      setError(null);
    } catch (err) {
      setError("Error al eliminar disponibilidad");
      console.error(err);
    }
  };

  const groupByDay = () => {
    const grouped: { [key: number]: Availability[] } = {};
    availabilities.forEach(availability => {
      if (!grouped[availability.day_of_week]) {
        grouped[availability.day_of_week] = [];
      }
      grouped[availability.day_of_week].push(availability);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const groupedAvailabilities = groupByDay();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Mi Disponibilidad</h2>
          <p className="text-muted-foreground">
            Gestiona los horarios en los que estás disponible para tutorías
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Horario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Disponibilidad</DialogTitle>
              <DialogDescription>
                Define un nuevo horario en el que estarás disponible para dar tutorías
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="day">Día de la semana</Label>
                <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                  <SelectTrigger id="day">
                    <SelectValue placeholder="Selecciona un día" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map(day => (
                      <SelectItem key={day.value} value={day.value.toString()}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="start-time">Hora de inicio</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="end-time">Hora de fin</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button onClick={handleAddAvailability} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Agregar"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {availabilities.length === 0 ? (
        <Alert>
          <AlertDescription>
            No has configurado tu disponibilidad. Agrega los horarios en los que estás disponible para dar tutorías.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {DAYS_OF_WEEK.map(day => {
            const dayAvailabilities = groupedAvailabilities[day.value] || [];
            if (dayAvailabilities.length === 0) return null;

            return (
              <Card key={day.value}>
                <CardHeader>
                  <CardTitle className="text-lg">{day.label}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {dayAvailabilities.map(availability => (
                    <div
                      key={availability.id}
                      className="flex items-center justify-between p-2 border rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {availability.start_time} - {availability.end_time}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteAvailability(availability.id!)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
