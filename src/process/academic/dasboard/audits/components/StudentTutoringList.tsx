import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  User,
  BookOpen,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { type StudentTutoring } from "@/process/academic/dasboard/audits/components/StudentTutoringView";

interface StudentTutoringListProps {
  tutorings: StudentTutoring[];
  showHistory?: boolean;
}

export default function StudentTutoringList({
  tutorings,
  showHistory = false,
}: StudentTutoringListProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "N/A";
    // Si viene en formato HH:MM:SS, tomar solo HH:MM
    return timeString.substring(0, 5);
  };

  const getStatusConfig = (tutoring: StudentTutoring) => {
    switch (tutoring.status) {
      case "pending":
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          badge: <Badge variant="secondary">Pendiente</Badge>,
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
        };
      case "accepted":
        return {
          icon: <CheckCircle2 className="h-5 w-5" />,
          badge: <Badge>Aceptada</Badge>,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
        };
      case "rejected":
        return {
          icon: <XCircle className="h-5 w-5" />,
          badge: <Badge variant="destructive">Rechazada</Badge>,
          color: "text-red-600",
          bgColor: "bg-red-50",
        };
      case "completed":
        if (tutoring.student_attended === true) {
          return {
            icon: <CheckCircle2 className="h-5 w-5" />,
            badge: <Badge className="bg-green-600">Completada - Asistió</Badge>,
            color: "text-green-600",
            bgColor: "bg-green-50",
          };
        }
        if (tutoring.student_attended === false) {
          return {
            icon: <XCircle className="h-5 w-5" />,
            badge: <Badge variant="secondary">Completada - No asistió</Badge>,
            color: "text-gray-600",
            bgColor: "bg-gray-50",
          };
        }
        return {
          icon: <CheckCircle2 className="h-5 w-5" />,
          badge: <Badge variant="outline">Completada</Badge>,
          color: "text-gray-600",
          bgColor: "bg-gray-50",
        };
      default:
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          badge: <Badge variant="outline">Desconocido</Badge>,
          color: "text-gray-600",
          bgColor: "bg-gray-50",
        };
    }
  };

  if (tutorings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          {showHistory
            ? "No tienes tutorías en el historial"
            : "No tienes tutorías activas en este momento"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tutorings.map(tutoring => {
        const statusConfig = getStatusConfig(tutoring);

        return (
          <Card key={tutoring.id} className="overflow-hidden">
            <div className={`h-1 ${statusConfig.bgColor}`} />
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold">
                      {tutoring.teacher?.name || tutoring.teacherName || "Profesor"}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className={statusConfig.color}>
                      {statusConfig.icon}
                    </span>
                  </div>
                </div>
                {statusConfig.badge}
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="grid gap-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Curso:</span>
                  <span className="text-sm">{tutoring.subject || "Tutoría Académica"}</span>
                </div>

                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Tema:</span>
                  <span className="text-sm">{tutoring.topic || "Asesoría general"}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Fecha:</span>
                  <span className="text-sm">
                    {formatDate(tutoring.requested_date)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Hora:</span>
                  <span className="text-sm">{formatTime(tutoring.requested_time)}</span>
                </div>
              </div>

              {tutoring.status === "pending" && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">
                    Tu solicitud está siendo revisada por el docente. Recibirás
                    una notificación cuando sea aceptada o rechazada.
                  </p>
                </div>
              )}

              {tutoring.status === "accepted" && (
                <div className="pt-2 border-t space-y-2">
                  <p className="text-sm text-green-700 font-medium">
                    ✓ Tu tutoría ha sido confirmada
                  </p>
                  {tutoring.meet_url && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(tutoring.meet_url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Unirse a la reunión
                    </Button>
                  )}
                  {!tutoring.meet_url && (
                    <p className="text-xs text-muted-foreground">
                      El profesor agregará el enlace de la reunión pronto.
                    </p>
                  )}
                </div>
              )}

              {tutoring.status === "rejected" && tutoring.rejection_reason && (
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium text-red-700">
                    Motivo del rechazo:
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {tutoring.rejection_reason}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}