import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  User,
  BookOpen,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
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
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
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
        if (tutoring.studentAttended === true) {
          return {
            icon: <CheckCircle2 className="h-5 w-5" />,
            badge: <Badge className="bg-green-600">Completada - Asistió</Badge>,
            color: "text-green-600",
            bgColor: "bg-green-50",
          };
        }
        if (tutoring.studentAttended === false) {
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
                    <h3 className="font-semibold">{tutoring.teacherName}</h3>
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
                  <span className="text-sm">{tutoring.subject}</span>
                </div>

                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Tema:</span>
                  <span className="text-sm">{tutoring.topic}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Fecha:</span>
                  <span className="text-sm">
                    {formatDate(tutoring.requestedDate)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Hora:</span>
                  <span className="text-sm">{tutoring.requestedTime}</span>
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
                <div className="pt-2 border-t">
                  <p className="text-sm text-green-700 font-medium">
                    Tu tutoría ha sido confirmada. No olvides asistir en la
                    fecha y hora programada.
                  </p>
                </div>
              )}

              {tutoring.status === "rejected" && tutoring.rejectionReason && (
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium text-red-700">
                    Motivo del rechazo:
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {tutoring.rejectionReason}
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