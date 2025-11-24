import { useState } from "react";
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
import { Loader2, CheckCircle2 } from "lucide-react";

interface TutoringRequestFormProps {
  onSubmit: (data: {
    teacherId: string;
    subject: string;
    topic: string;
    requestedDate: string;
    requestedTime: string;
    notes?: string;
  }) => Promise<boolean>;
}

export default function TutoringRequestForm({
  onSubmit,
}: TutoringRequestFormProps) {
  const [formData, setFormData] = useState({
    teacherId: "",
    subject: "",
    topic: "",
    requestedDate: "",
    requestedTime: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TODO: Obtener la lista de docentes desde la API
  const teachers = [
    { id: "1", name: "Dr. Roberto Sánchez", subjects: ["Cálculo I", "Cálculo II"] },
    { id: "2", name: "Dra. Ana Martínez", subjects: ["Álgebra Lineal", "Matemática Discreta"] },
    { id: "3", name: "Dr. Carlos Ruiz", subjects: ["Física I", "Física II"] },
  ];

  const availableSubjects = formData.teacherId
    ? teachers.find(t => t.id === formData.teacherId)?.subjects || []
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await onSubmit(formData);
      if (result) {
        setSuccess(true);
        setFormData({
          teacherId: "",
          subject: "",
          topic: "",
          requestedDate: "",
          requestedTime: "",
          notes: "",
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
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      if (field === "teacherId") {
        newData.subject = "";
      }
      return newData;
    });
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateString = minDate.toISOString().split("T")[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solicitar Tutoría</CardTitle>
        <CardDescription>
          Completa el formulario para solicitar una tutoría con un docente
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
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Curso</Label>
            <Select
              value={formData.subject}
              onValueChange={value => handleChange("subject", value)}
              disabled={!formData.teacherId}
              required
            >
              <SelectTrigger id="subject">
                <SelectValue placeholder="Selecciona un curso" />
              </SelectTrigger>
              <SelectContent>
                {availableSubjects.map(subject => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">Tema</Label>
            <Input
              id="topic"
              placeholder="Ej: Derivadas parciales"
              value={formData.topic}
              onChange={e => handleChange("topic", e.target.value)}
              required
            />
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="notes">Notas adicionales (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Describe brevemente qué aspectos del tema necesitas reforzar..."
              value={formData.notes}
              onChange={e => handleChange("notes", e.target.value)}
              rows={3}
            />
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