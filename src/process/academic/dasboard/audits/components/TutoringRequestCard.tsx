import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, BookOpen, FileText, Check, X } from "lucide-react";
import { type TutoringRequest } from "@/process/academic/dasboard/audits/components/TeacherTutoringView";

interface TutoringRequestCardProps {
  request: TutoringRequest;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onMarkAttendance?: (id: string, attended: boolean) => void;
}

export default function TutoringRequestCard({
  request,
  onAccept,
  onReject,
  onMarkAttendance,
}: TutoringRequestCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      pending: { variant: "secondary", label: "Pendiente" },
      accepted: { variant: "default", label: "Aceptada" },
      rejected: { variant: "destructive", label: "Rechazada" },
      completed: { variant: "outline", label: "Completada" },
    };

    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">{request.studentName}</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Código: {request.studentId}
            </p>
          </div>
          {getStatusBadge(request.status)}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Curso:</span>
            <span className="text-sm">{request.subject}</span>
          </div>

          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Tema:</span>
            <span className="text-sm">{request.topic}</span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Fecha:</span>
            <span className="text-sm">{formatDate(request.requestedDate)}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Hora:</span>
            <span className="text-sm">{request.requestedTime}</span>
          </div>
        </div>

        {request.notes && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground">{request.notes}</p>
          </div>
        )}

        {request.status === "completed" && request.studentAttended !== undefined && (
          <div className="pt-2 border-t">
            <p className="text-sm font-medium">
              Asistencia:{" "}
              <span
                className={
                  request.studentAttended ? "text-green-600" : "text-red-600"
                }
              >
                {request.studentAttended ? "Asistió" : "No asistió"}
              </span>
            </p>
          </div>
        )}
      </CardContent>

      {request.status === "pending" && onAccept && onReject && (
        <CardFooter className="flex gap-2">
          <Button
            onClick={() => onReject(request.id)}
            variant="outline"
            className="flex-1"
          >
            <X className="h-4 w-4 mr-2" />
            Rechazar
          </Button>
          <Button onClick={() => onAccept(request.id)} className="flex-1">
            <Check className="h-4 w-4 mr-2" />
            Aceptar
          </Button>
        </CardFooter>
      )}

      {request.status === "accepted" && onMarkAttendance && (
        <CardFooter className="flex gap-2">
          <Button
            onClick={() => onMarkAttendance(request.id, false)}
            variant="outline"
            className="flex-1"
          >
            No asistió
          </Button>
          <Button
            onClick={() => onMarkAttendance(request.id, true)}
            className="flex-1"
          >
            Asistió
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}