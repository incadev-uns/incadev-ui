import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TutoringRequestForm from "@/process/academic/dasboard/audits/components/TutoringRequestForm";
import StudentTutoringList from "@/process/academic/dasboard/audits/components/StudentTutoringList";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { config } from "@/config/support-config";
import { useAcademicAuth } from "@/process/academic/hooks/useAcademicAuth";

export interface StudentTutoring {
  id: number;
  student_id: number;
  teacher_id: number;
  subject: string;
  topic: string;
  requested_date: string;
  requested_time: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  notes?: string;
  rejection_reason?: string;
  student_attended?: boolean;
  meet_url?: string;
  created_at: string;
  updated_at: string;
  studentName?: string;
  studentId?: string;
  teacherName?: string;
  requestedDate?: string;
  requestedTime?: string;
  teacher?: {
    id: number;
    name: string;
    email: string;
  };
}

export default function StudentTutoringView() {
  const { token, user } = useAcademicAuth();
  const [tutorings, setTutorings] = useState<StudentTutoring[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token && user) {
      fetchStudentTutorings();
    }
  }, [token, user]);

  const fetchStudentTutorings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const tokenWithoutQuotes = token?.replace(/^"|"/g, '');
      const response = await fetch(
        `${config.apiUrl}${config.endpoints.tutoring.studentRequests}?user_id=${user?.id}`,
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
      setTutorings(data);
    } catch (err) {
      console.error("Error fetching student tutorings:", err);
      setError("Error al cargar tus tutorías");
    } finally {
      setLoading(false);
    }
  };

  const handleNewRequest = async (data: {
    teacherId: string;
    requestedDate: string;
    requestedTime: string;
  }) => {
    try {
      const tokenWithoutQuotes = token?.replace(/^"|"/g, '');
      const url = `${config.apiUrl}${config.endpoints.tutoring.createRequest}?user_id=${user?.id}`;
      
      const response = await fetch(url, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${tokenWithoutQuotes}`,
            "Content-Type": "application/json",
            "X-User-Id": user?.id?.toString() || ""
          },
          credentials: "include",
          body: JSON.stringify({
            teacher_id: Number(data.teacherId),
            requested_date: data.requestedDate,
            requested_time: data.requestedTime,
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const newTutoring = result.data || result;
      setTutorings(prev => [newTutoring, ...prev]);
      return true;
    } catch (err) {
      console.error("Error al crear la solicitud:", err);
      setError(err instanceof Error ? err.message : "Error al crear la solicitud");
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