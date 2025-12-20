import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Clock, User, FileText, Check, X, Video, MessageSquareX } from "lucide-react";
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
  // Estados para los modales
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [meetUrl, setMeetUrl] = useState("");
  const [rejectError, setRejectError] = useState("");

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

  const handleRejectSubmit = () => {
    if (rejectReason.trim().length < 10) {
      setRejectError("El motivo debe tener al menos 10 caracteres");
      return;
    }
    onReject?.(request.id, rejectReason.trim());
    setShowRejectModal(false);
    setRejectReason("");
    setRejectError("");
  };

  const handleAcceptSubmit = () => {
    let finalUrl = meetUrl.trim();
    if (finalUrl && !finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }
    onAccept?.(request.id, finalUrl || undefined);
    setShowAcceptModal(false);
    setMeetUrl("");
  };

  const handleRejectModalClose = (open: boolean) => {
    if (!open) {
      setRejectReason("");
      setRejectError("");
    }
    setShowRejectModal(open);
  };

  const handleAcceptModalClose = (open: boolean) => {
    if (!open) {
      setMeetUrl("");
    }
    setShowAcceptModal(open);
  };

  return (
    <>
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
              onClick={() => setShowRejectModal(true)}
              variant="outline"
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Rechazar
            </Button>
            <Button
              onClick={() => setShowAcceptModal(true)}
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

      {/* Modal para Rechazar Tutoría */}
      <Dialog open={showRejectModal} onOpenChange={handleRejectModalClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <MessageSquareX className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <DialogTitle>Rechazar Tutoría</DialogTitle>
                <DialogDescription>
                  Solicitud de {request.studentName}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-muted/50 p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(request.requested_date)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{request.requested_time}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="reject-reason" className="text-sm font-medium">
                Motivo del rechazo <span className="text-red-500">*</span>
              </label>
              <textarea
                id="reject-reason"
                value={rejectReason}
                onChange={(e) => {
                  setRejectReason(e.target.value);
                  if (e.target.value.trim().length >= 10) {
                    setRejectError("");
                  }
                }}
                placeholder="Explica brevemente el motivo del rechazo (mínimo 10 caracteres)"
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
              {rejectError && (
                <p className="text-sm text-red-500">{rejectError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {rejectReason.length}/10 caracteres mínimo
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => handleRejectModalClose(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectSubmit}
              disabled={rejectReason.trim().length < 10}
            >
              <X className="h-4 w-4 mr-2" />
              Confirmar Rechazo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para Aceptar Tutoría */}
      <Dialog open={showAcceptModal} onOpenChange={handleAcceptModalClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <Video className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <DialogTitle>Aceptar Tutoría</DialogTitle>
                <DialogDescription>
                  Solicitud de {request.studentName}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-muted/50 p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(request.requested_date)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{request.requested_time}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="meet-url" className="text-sm font-medium">
                Enlace de la reunión <span className="text-muted-foreground">(opcional)</span>
              </label>
              <Input
                id="meet-url"
                value={meetUrl}
                onChange={(e) => setMeetUrl(e.target.value)}
                placeholder="https://meet.google.com/abc-defg-hij"
                type="url"
              />
              <p className="text-xs text-muted-foreground">
                Puedes agregar un enlace de Google Meet, Zoom u otra plataforma
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => handleAcceptModalClose(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAcceptSubmit}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Check className="h-4 w-4 mr-2" />
              Confirmar Aceptación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
