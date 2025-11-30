import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TutoringRequestCard from "@/process/academic/dasboard/audits/components/TutoringRequestCard";
import TutoringHistoryTable from "@/process/academic/dasboard/audits/components/TutoringHistoryTable";
import AvailabilityManager from "@/process/academic/dasboard/audits/components/AvailabilityManager";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { config } from "@/config/support-config";
import { useAcademicAuth } from "@/process/academic/hooks/useAcademicAuth";

export interface TutoringRequest {
  id: number;
  student_id: number;
  teacher_id: number;
  start_time: string;
  end_time: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  rejection_reason?: string;
  student_attended?: boolean;
  meet_url?: string;
  created_at: string;
  updated_at: string;
  studentName: string;
  requested_date: string;
  requested_time: string;
  student?: {
    id: number;
    name: string;
    email: string;
  };
}

export default function TeacherTutoringView() {
  const { token, user } = useAcademicAuth();
  const [requests, setRequests] = useState<TutoringRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token && user) {
      fetchTutoringRequests();
    }
  }, [token, user]);

  const fetchTutoringRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const tokenWithoutQuotes = token?.replace(/^"|"$/g, '');
      const response = await fetch(
        `${config.apiUrl}${config.endpoints.tutoring.teacherRequests}?status=all&user_id=${user?.id}`,
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
      setRequests(data);
    } catch (err) {
      console.error("Error fetching tutoring requests:", err);
      setError("Error al cargar las solicitudes de tutoría");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: number, meetUrl?: string) => {
    try {
      const tokenWithoutQuotes = token?.replace(/^"|"$/g, '');
      const endpoint = config.endpoints.tutoring.acceptRequest.replace(':id', requestId.toString());
      
      const response = await fetch(
        `${config.apiUrl}${endpoint}?user_id=${user?.id}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${tokenWithoutQuotes}`,
            "Content-Type": "application/json",
            "X-User-Id": user?.id?.toString() || ""
          },
          credentials: "include",
          body: JSON.stringify({ meet_url: meetUrl })
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      setRequests(prev =>
        prev.map(req =>
          req.id === requestId ? { ...req, status: "accepted" as const, meet_url: meetUrl } : req
        )
      );
    } catch (err) {
      console.error("Error accepting request:", err);
      alert("Error al aceptar la solicitud");
    }
  };

  const handleReject = async (requestId: number, reason: string) => {
    try {
      const tokenWithoutQuotes = token?.replace(/^"|"$/g, '');
      const endpoint = config.endpoints.tutoring.rejectRequest.replace(':id', requestId.toString());
      
      const response = await fetch(
        `${config.apiUrl}${endpoint}?user_id=${user?.id}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${tokenWithoutQuotes}`,
            "Content-Type": "application/json",
            "X-User-Id": user?.id?.toString() || ""
          },
          credentials: "include",
          body: JSON.stringify({ rejection_reason: reason })
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      setRequests(prev =>
        prev.map(req =>
          req.id === requestId ? { ...req, status: "rejected" as const, rejection_reason: reason } : req
        )
      );
    } catch (err) {
      console.error("Error rejecting request:", err);
      alert("Error al rechazar la solicitud");
    }
  };

  const handleMarkAttendance = async (requestId: number, attended: boolean) => {
    try {
      const tokenWithoutQuotes = token?.replace(/^"|"$/g, '');
      const endpoint = config.endpoints.tutoring.markAttendance.replace(':id', requestId.toString());
      
      const response = await fetch(
        `${config.apiUrl}${endpoint}?user_id=${user?.id}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${tokenWithoutQuotes}`,
            "Content-Type": "application/json",
            "X-User-Id": user?.id?.toString() || ""
          },
          credentials: "include",
          body: JSON.stringify({ student_attended: attended })
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      setRequests(prev =>
        prev.map(req =>
          req.id === requestId
            ? { ...req, status: "completed" as const, student_attended: attended }
            : req
        )
      );
    } catch (err) {
      console.error("Error marking attendance:", err);
      alert("Error al marcar la asistencia");
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">
            Pendientes ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="accepted">
            Aceptadas ({acceptedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
          <TabsTrigger value="availability">Mi Disponibilidad</TabsTrigger>
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

        <TabsContent value="availability" className="mt-6">
          <AvailabilityManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}