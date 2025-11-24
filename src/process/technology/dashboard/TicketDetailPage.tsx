import { useState, useEffect, useRef } from "react"
import TechnologyLayout from "../TechnologyLayout"
import { useTechnologyAuth } from "../hooks/useTechnologyAuth"
import { technologyApi, getStoredUser } from "@/services/tecnologico/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Loader2,
  ArrowLeft,
  Send,
  Paperclip,
  X,
  Download,
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertCircle,
  FileText,
  Image as ImageIcon,
} from "lucide-react"
import { toast } from "sonner"
import type { Ticket, TicketReply, TicketStatus, TicketPriority, TicketType } from "@/types/support"
import {
  TicketStatusLabels,
  TicketPriorityLabels,
  TicketTypeLabels,
  TicketStatusColors,
  TicketPriorityColors,
  TicketTypeColors,
} from "@/types/support"

export default function TicketDetailPage() {
  const { user, loading: authLoading } = useTechnologyAuth()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [submittingReply, setSubmittingReply] = useState(false)
  const [ticketId, setTicketId] = useState<number | null>(null)

  // Obtener el ID del ticket desde la URL (query param ?id=123)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const id = params.get("id")
      if (id) {
        setTicketId(parseInt(id, 10))
      }
    }
  }, [])

  // Reply form
  const [replyContent, setReplyContent] = useState("")
  const [attachments, setAttachments] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check if user is support/admin
  const currentUser = getStoredUser()
  const isSupport = currentUser?.roles?.includes("support") || currentUser?.roles?.includes("admin")

  useEffect(() => {
    if (!authLoading && user && ticketId) {
      fetchTicket()
    }
  }, [ticketId, authLoading, user])

  const fetchTicket = async () => {
    if (!ticketId) return
    setLoading(true)
    try {
      const response = await technologyApi.support.tickets.getById(ticketId)
      if (response.status === "success" && response.data) {
        setTicket(response.data.ticket)
      } else {
        toast.error("Error al cargar el ticket")
      }
    } catch (error: any) {
      console.error("Error fetching ticket:", error)
      toast.error(error.message || "Error al cargar el ticket")
    } finally {
      setLoading(false)
    }
  }

  const handleAddReply = async () => {
    if (!replyContent.trim()) {
      toast.error("El contenido de la respuesta no puede estar vacío")
      return
    }

    if (replyContent.trim().length < 5) {
      toast.error("La respuesta debe tener al menos 5 caracteres")
      return
    }

    setSubmittingReply(true)
    try {
      const response = await technologyApi.support.replies.create(
        ticketId,
        replyContent.trim(),
        attachments
      )

      if (response.status === "success") {
        toast.success("Respuesta agregada exitosamente")
        setReplyContent("")
        setAttachments([])
        fetchTicket() // Reload ticket with new reply
      } else {
        toast.error(response.message || "Error al agregar respuesta")
      }
    } catch (error: any) {
      console.error("Error adding reply:", error)
      toast.error(error.message || "Error al agregar respuesta")
    } finally {
      setSubmittingReply(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    if (files.length + attachments.length > 5) {
      toast.error("Máximo 5 archivos permitidos")
      return
    }

    // Validate file sizes (10MB max per file)
    const invalidFiles = files.filter(file => file.size > 10 * 1024 * 1024)
    if (invalidFiles.length > 0) {
      toast.error("Cada archivo debe ser menor a 10MB")
      return
    }

    setAttachments([...attachments, ...files])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index))
  }

  const handleCloseTicket = async () => {
    try {
      const response = await technologyApi.support.tickets.close(ticketId)
      if (response.status === "success") {
        toast.success("Ticket cerrado exitosamente")
        fetchTicket()
      } else {
        toast.error(response.message || "Error al cerrar ticket")
      }
    } catch (error: any) {
      toast.error(error.message || "Error al cerrar ticket")
    }
  }

  const handleReopenTicket = async () => {
    try {
      const response = await technologyApi.support.tickets.reopen(ticketId)
      if (response.status === "success") {
        toast.success("Ticket reabierto exitosamente")
        fetchTicket()
      } else {
        toast.error(response.message || "Error al reabrir ticket")
      }
    } catch (error: any) {
      toast.error(error.message || "Error al reabrir ticket")
    }
  }

  const handleDownloadAttachment = async (attachmentId: number, filename: string) => {
    try {
      const blob = await technologyApi.support.attachments.download(attachmentId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename || `attachment-${attachmentId}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success("Archivo descargado")
    } catch (error: any) {
      toast.error("Error al descargar archivo")
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase()
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) {
      return <ImageIcon className="w-4 h-4" />
    }
    return <FileText className="w-4 h-4" />
  }

  if (authLoading || (loading && ticketId)) {
    return (
      <TechnologyLayout title="Cargando...">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </TechnologyLayout>
    )
  }

  if (!ticketId) {
    return (
      <TechnologyLayout title="ID de ticket no especificado">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">ID de ticket no especificado</p>
          <p className="text-sm text-muted-foreground mt-2">
            Accede desde la lista de tickets o usa la URL correcta: /tecnologico/support/tickets/detail?id=123
          </p>
          <Button className="mt-4" onClick={() => window.location.href = "/tecnologico/support/tickets"}>
            Ir a Tickets
          </Button>
        </div>
      </TechnologyLayout>
    )
  }

  if (!ticket) {
    return (
      <TechnologyLayout title="Ticket no encontrado">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">Ticket no encontrado</p>
          <Button className="mt-4" onClick={() => window.location.href = "/tecnologico/support/tickets"}>
            Volver a Tickets
          </Button>
        </div>
      </TechnologyLayout>
    )
  }

  const canRespond = ticket.status !== "closed"

  return (
    <TechnologyLayout title={`Ticket #${ticket.id}`}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = "/tecnologico/support/tickets"}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Volver
              </Button>
              <span className="text-sm text-muted-foreground">Ticket #{ticket.id}</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{ticket.title}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <Badge
                variant="outline"
                className={TicketStatusColors[ticket.status as TicketStatus]}
              >
                {TicketStatusLabels[ticket.status as TicketStatus]}
              </Badge>
              <Badge
                variant="outline"
                className={TicketPriorityColors[ticket.priority as TicketPriority]}
              >
                {TicketPriorityLabels[ticket.priority as TicketPriority]}
              </Badge>
              {ticket.type && (
                <Badge
                  variant="outline"
                  className={TicketTypeColors[ticket.type as TicketType]}
                >
                  {TicketTypeLabels[ticket.type as TicketType]}
                </Badge>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {ticket.status === "closed" ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reabrir Ticket
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Reabrir este ticket?</AlertDialogTitle>
                    <AlertDialogDescription>
                      El ticket volverá al estado "Abierto" y podrás agregar más respuestas.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleReopenTicket}>
                      Reabrir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Cerrar Ticket
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Cerrar este ticket?</AlertDialogTitle>
                    <AlertDialogDescription>
                      El ticket se marcará como resuelto. Podrás reabrirlo más tarde si es necesario.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCloseTicket}>
                      Cerrar Ticket
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        {/* Ticket Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400">
                    {getInitials(ticket.user.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{ticket.user.name}</p>
                  <p className="text-sm text-muted-foreground">{ticket.user.email}</p>
                </div>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>Creado: {formatDate(ticket.created_at)}</p>
                <p>Actualizado: {formatDate(ticket.updated_at)}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Replies Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Respuestas ({ticket.replies?.length || 0})</CardTitle>
            <CardDescription>Historial de conversación</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {ticket.replies && ticket.replies.length > 0 ? (
              ticket.replies.map((reply: TicketReply, index: number) => (
                <div key={reply.id} className="border-l-2 border-border pl-4 pb-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="mt-1">
                      <AvatarFallback className="bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 text-xs">
                        {getInitials(reply.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-foreground">{reply.user.name}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(reply.created_at)}</p>
                        </div>
                        {index === 0 && (
                          <Badge variant="outline" className="text-xs">
                            Descripción inicial
                          </Badge>
                        )}
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-foreground whitespace-pre-wrap">{reply.content}</p>
                      </div>

                      {/* Attachments */}
                      {reply.attachments && reply.attachments.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">
                            Archivos adjuntos ({reply.attachments.length}):
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {reply.attachments.map((attachment) => (
                              <Button
                                key={attachment.id}
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadAttachment(
                                  attachment.id,
                                  attachment.path.split("/").pop() || "attachment"
                                )}
                                className="text-xs"
                              >
                                {getFileIcon(attachment.path)}
                                <span className="ml-1 max-w-[150px] truncate">
                                  {attachment.path.split("/").pop()}
                                </span>
                                <Download className="w-3 h-3 ml-1" />
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No hay respuestas aún</p>
            )}
          </CardContent>
        </Card>

        {/* Reply Form */}
        {canRespond ? (
          <Card>
            <CardHeader>
              <CardTitle>Agregar Respuesta</CardTitle>
              <CardDescription>
                Responde al ticket o proporciona información adicional
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reply-content">Contenido</Label>
                <Textarea
                  id="reply-content"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Escribe tu respuesta aquí..."
                  rows={6}
                  disabled={submittingReply}
                />
                <p className="text-xs text-muted-foreground">Mínimo 5 caracteres</p>
              </div>

              {/* Attachments */}
              <div className="space-y-2">
                <Label>Archivos Adjuntos (opcional)</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={submittingReply || attachments.length >= 5}
                  >
                    <Paperclip className="w-4 h-4 mr-2" />
                    Adjuntar Archivos
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {attachments.length}/5 archivos (máx 10MB cada uno)
                  </span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.txt,.zip"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* Selected Files */}
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-muted rounded-md px-3 py-2 text-sm"
                      >
                        {getFileIcon(file.name)}
                        <span className="max-w-[150px] truncate text-foreground">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(index)}
                          className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleAddReply}
                  disabled={submittingReply || !replyContent.trim()}
                >
                  {submittingReply ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Respuesta
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Alert>
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Este ticket está cerrado. No se pueden agregar más respuestas.
              {(ticket.user_id === currentUser?.id || isSupport) && " Puedes reabrirlo si necesitas continuar la conversación."}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </TechnologyLayout>
  )
}
