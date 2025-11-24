import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TutoringRequestForm from "@/process/academic/dasboard/audits/components/TutoringRequestForm";
import StudentTutoringList from "@/process/academic/dasboard/audits/components/StudentTutoringList";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export interface StudentTutoring {
  id: string;
  teacherName: string;
  subject: string;
  topic: string;
  requestedDate: string;
  requestedTime: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  studentAttended?: boolean;
  rejectionReason?: string;
  createdAt: string;
}

export default function StudentTutoringView() {
  const [tutorings, setTutorings] = useState<StudentTutoring[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStudentTutorings();
  }, []);

  const fetchStudentTutorings = async () => {
    try {
      setLoading(true);
      // TODO: Reemplazar con la llamada real a tu API
      // const response = await fetch('/api/tutoring/my-requests');
      // const data = await response.json();

      // Datos de ejemplo
      const mockData: StudentTutoring[] = [
        {
          id: "1",
          teacherName: "Dr. Roberto Sánchez",
          subject: "Cálculo I",
          topic: "Integrales definidas",
          requestedDate: "2025-11-12",
          requestedTime: "16:00",
          status: "pending",
          createdAt: "2025-11-05T10:00:00",
        },
        {
          id: "2",
          teacherName: "Dra. Ana Martínez",
          subject: "Álgebra Lineal",
          topic: "Matrices y determinantes",
          requestedDate: "2025-11-06",
          requestedTime: "14:00",
          status: "accepted",
          createdAt: "2025-11-04T15:30:00",
        },
        {
          id: "3",
          teacherName: "Dr. Roberto Sánchez",
          subject: "Cálculo I",
          topic: "Límites",
          requestedDate: "2025-11-01",
          requestedTime: "15:00",
          status: "completed",
          studentAttended: true,
          createdAt: "2025-10-28T09:00:00",
        },
      ];

      setTutorings(mockData);
      setError(null);
    } catch (err) {
      setError("Error al cargar tus tutorías");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewRequest = async (data: {
    teacherId: string;
    subject: string;
    topic: string;
    requestedDate: string;
    requestedTime: string;
    notes?: string;
  }) => {
    try {
      // TODO: Llamada a la API para crear la solicitud
      // const response = await fetch('/api/tutoring/requests', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });
      // const newTutoring = await response.json();

      // Simulación de respuesta exitosa
      const newTutoring: StudentTutoring = {
        id: Date.now().toString(),
        teacherName: "Docente Seleccionado",
        subject: data.subject,
        topic: data.topic,
        requestedDate: data.requestedDate,
        requestedTime: data.requestedTime,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      setTutorings(prev => [newTutoring, ...prev]);
      return true;
    } catch (err) {
      console.error("Error al crear la solicitud:", err);
      return false;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const activeTutorings = tutorings.filter(
    t => t.status === "pending" || t.status === "accepted"
  );
  const historyTutorings = tutorings.filter(
    t => t.status === "completed" || t.status === "rejected"
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Mis Tutorías</h2>
        <p className="text-muted-foreground">
          Solicita tutorías con tus docentes y revisa el estado de tus
          solicitudes
        </p>
      </div>

      <Tabs defaultValue="request" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="request">Nueva Solicitud</TabsTrigger>
          <TabsTrigger value="active">
            Activas ({activeTutorings.length})
          </TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="request" className="mt-6">
          <TutoringRequestForm onSubmit={handleNewRequest} />
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <StudentTutoringList tutorings={activeTutorings} />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <StudentTutoringList tutorings={historyTutorings} showHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}