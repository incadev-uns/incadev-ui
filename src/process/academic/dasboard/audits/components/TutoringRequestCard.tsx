import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, FileText, Check, X } from "lucide-react";
import { type TutoringRequest } from "@/process/academic/dasboard/audits/components/TeacherTutoringView";

interface TutoringRequestCardProps {
  request: TutoringRequest;
  onAccept?: (id: number, meetUrl?: string) => void;
  onReject?: (id: number, reason: string) => void;
  onMarkAttendance?: (id: number, attended: boolean) => void;
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
            {request.student?.email && (
              <p className="text-sm text-muted-foreground">
                {request.student.email}
              </p>
            )}
          </div>
          {getStatusBadge(request.status)}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Fecha:</span>
            <span className="text-sm">{formatDate(request.requested_date)}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Hora:</span>
            <span className="text-sm">{request.requested_time}</span>
          </div>
          
          {request.meet_url && (
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Enlace:</span>
              <a href={request.meet_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                Ir a la reunión
              </a>
            </div>
          )}
        </div>

        {request.status === "completed" && request.student_attended !== undefined && (
          <div className="pt-2 border-t">
            <p className="text-sm font-medium">
              Asistencia:{" "}
              <span
                className={
                  request.student_attended ? "text-green-600" : "text-red-600"
                }
              >
                {request.student_attended ? "Asistió" : "No asistió"}
              </span>
            </p>
          </div>
        )}
      </CardContent>

      {request.status === "pending" && onAccept && onReject && (
        <CardFooter className="flex gap-2">
          <Button
            onClick={() => {
              const reason = prompt("Motivo del rechazo:");
              if (reason) onReject(request.id, reason);
            }}
            variant="outline"
            className="flex-1"
          >
            <X className="h-4 w-4 mr-2" />
            Rechazar
          </Button>
          <Button 
            onClick={() => {
              let meetUrl = prompt("URL de la reunión (opcional):");
              if (meetUrl && meetUrl.trim()) {
                // Agregar https:// si no tiene protocolo
                if (!meetUrl.startsWith('http://') && !meetUrl.startsWith('https://')) {
                  meetUrl = 'https://' + meetUrl;
                }
                onAccept(request.id, meetUrl);
              } else {
                onAccept(request.id, undefined);
              }
            }} 
            className="flex-1"
          >
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