import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TutoringRequestCard from "@/process/academic/dasboard/audits/components/TutoringRequestCard";
import TutoringHistoryTable from "@/process/academic/dasboard/audits/components/TutoringHistoryTable";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export interface TutoringRequest {
  id: string;
  studentName: string;
  studentId: string;
  subject: string;
  topic: string;
  requestedDate: string;
  requestedTime: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  studentAttended?: boolean;
  notes?: string;
}

export default function TeacherTutoringView() {
  const [requests, setRequests] = useState<TutoringRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTutoringRequests();
  }, []);

  const fetchTutoringRequests = async () => {
    try {
      setLoading(true);
      // TODO: Reemplazar con la llamada real a tu API
      // const response = await fetch('/api/tutoring/requests');
      // const data = await response.json();
      
      // Datos de ejemplo
      const mockData: TutoringRequest[] = [
        {
          id: "1",
          studentName: "Juan Pérez",
          studentId: "20201234",
          subject: "Cálculo I",
          topic: "Derivadas parciales",
          requestedDate: "2025-11-10",
          requestedTime: "14:00",
          status: "pending",
        },
        {
          id: "2",
          studentName: "María García",
          studentId: "20201235",
          subject: "Álgebra Lineal",
          topic: "Espacios vectoriales",
          requestedDate: "2025-11-11",
          requestedTime: "15:00",
          status: "pending",
        },
        {
          id: "3",
          studentName: "Carlos López",
          studentId: "20201236",
          subject: "Física I",
          topic: "Cinemática",
          requestedDate: "2025-11-08",
          requestedTime: "10:00",
          status: "accepted",
        },
      ];
      
      setRequests(mockData);
      setError(null);
    } catch (err) {
      setError("Error al cargar las solicitudes de tutoría");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      // TODO: Llamada a la API para aceptar
      // await fetch(`/api/tutoring/requests/${requestId}/accept`, { method: 'POST' });
      
      setRequests(prev =>
        prev.map(req =>
          req.id === requestId ? { ...req, status: "accepted" as const } : req
        )
      );
    } catch (err) {
      console.error("Error al aceptar la solicitud:", err);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      // TODO: Llamada a la API para rechazar
      // await fetch(`/api/tutoring/requests/${requestId}/reject`, { method: 'POST' });
      
      setRequests(prev =>
        prev.map(req =>
          req.id === requestId ? { ...req, status: "rejected" as const } : req
        )
      );
    } catch (err) {
      console.error("Error al rechazar la solicitud:", err);
    }
  };

  const handleMarkAttendance = async (requestId: string, attended: boolean) => {
    try {
      // TODO: Llamada a la API para marcar asistencia
      // await fetch(`/api/tutoring/requests/${requestId}/attendance`, {
      //   method: 'POST',
      //   body: JSON.stringify({ attended })
      // });
      
      setRequests(prev =>
        prev.map(req =>
          req.id === requestId
            ? { ...req, status: "completed" as const, studentAttended: attended }
            : req
        )
      );
    } catch (err) {
      console.error("Error al marcar asistencia:", err);
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

  const pendingRequests = requests.filter(r => r.status === "pending");
  const acceptedRequests = requests.filter(r => r.status === "accepted");
  const completedRequests = requests.filter(
    r => r.status === "completed" || r.status === "rejected"
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Gestión de Tutorías
        </h2>
        <p className="text-muted-foreground">
          Administra las solicitudes de tutoría de tus estudiantes
        </p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            Pendientes ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="accepted">
            Aceptadas ({acceptedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-6">
          {pendingRequests.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay solicitudes pendientes
            </p>
          ) : (
            pendingRequests.map(request => (
              <TutoringRequestCard
                key={request.id}
                request={request}
                onAccept={handleAccept}
                onReject={handleReject}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="accepted" className="space-y-4 mt-6">
          {acceptedRequests.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay tutorías aceptadas programadas
            </p>
          ) : (
            acceptedRequests.map(request => (
              <TutoringRequestCard
                key={request.id}
                request={request}
                onMarkAttendance={handleMarkAttendance}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <TutoringHistoryTable requests={completedRequests} />
        </TabsContent>
      </Tabs>
    </div>
  );
}