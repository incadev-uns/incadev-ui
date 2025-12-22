import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  IconSend,
  IconPaperclip,
  IconUsers,
  IconArrowLeft,
  IconFile,
  IconX,
  IconLoader,
  IconTrash,
  IconEdit,
} from "@tabler/icons-react"
import StrategicLayout from "../StrategicLayout"
import { config } from "@/config/strategic-config"

interface Message {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  timestamp: string
  files?: MessageFile[]
}

interface MessageFile {
  id: string
  name: string
  type: string
  size: string
  url: string
}

interface Participant {
  id: string
  name: string
  email: string
  avatar?: string
  isOnline: boolean
}

function formatTimestamp(timestamp: string): string {
  if (!timestamp) return ""
  
  try {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffDays === 0) {
      return date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
    
    if (diffDays === 1) {
      return `Ayer ${date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`
    }
    
    if (diffDays < 7) {
      return date.toLocaleDateString('es-ES', { 
        weekday: 'short', 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
    
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    })
  } catch (error) {
    console.error('Error formatting timestamp:', error)
    return timestamp
  }
}

function getMimeType(file: File): string {
  return file.type || 'application/octet-stream'
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

export default function ConversationChat({ conversationId = "1" }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [participants, setParticipants] = useState<Participant[]>([])
  const [conversationName, setConversationName] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  
  // Dialog states
  const [deleteMessageDialogOpen, setDeleteMessageDialogOpen] = useState(false)
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null)
  const [conversationSettingsOpen, setConversationSettingsOpen] = useState(false)
  const [editedConversationName, setEditedConversationName] = useState("")
  const [deletingConversation, setDeletingConversation] = useState(false)
  const [updatingConversation, setUpdatingConversation] = useState(false)
  const [conversationActionError, setConversationActionError] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  const fetchMessages = useCallback(async (pageNum: number = 1) => {
    if (!token || !conversationId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      
      const url = new URL(`${config.apiUrl}${config.endpoints.messages.list}`)
      url.searchParams.append("conversation_id", conversationId)
      url.searchParams.append("page", pageNum.toString())
      url.searchParams.append("per_page", "20")

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      const contentType = res.headers.get("content-type")
      if (!contentType?.includes("application/json")) {
        throw new Error(`Respuesta no es JSON. Status: ${res.status}`)
      }

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.message || "Error al cargar mensajes")
      }

      const items: any[] = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
      const mapped: Message[] = items.map((msg) => ({
        id: msg.id?.toString() ?? crypto.randomUUID(),
        userId: msg.user_id?.toString() ?? msg.userId ?? "unknown",
        userName: msg.user?.name ?? msg.user_name ?? "Usuario",
        userAvatar: msg.user?.avatar ?? "",
        content: msg.content ?? "",
        timestamp: msg.created_at ?? msg.timestamp ?? "",
        files: Array.isArray(msg.files)
          ? msg.files.map((f: any) => ({
            id: f.id?.toString() ?? crypto.randomUUID(),
            name: f.name ?? f.filename ?? "archivo",
            type: f.type ?? "file",
            size: f.size ?? "",
            url: f.url ?? "#",
          }))
          : [],
      }))

      if (pageNum === 1) {
        setMessages(mapped)
      } else {
        setMessages(prev => [...prev, ...mapped])
      }

      setConversationName(
        data?.meta?.conversation?.name ??
        items[0]?.conversation?.name ??
        items[0]?.conversation_name ??
        `Conversación ${conversationId}`
      )

      const participantMap = new Map<string, Participant>()
      const backendParticipants: any[] =
        data?.meta?.participants ??
        items[0]?.conversation?.participants ??
        []

      backendParticipants.forEach((p) => {
        participantMap.set(p.id?.toString(), {
          id: p.id?.toString(),
          name: p.name,
          email: p.email ?? "",
          avatar: p.avatar ?? "",
          isOnline: Boolean(p.is_online ?? p.isOnline),
        })
      })

      mapped.forEach((msg) => {
        if (!participantMap.has(msg.userId)) {
          participantMap.set(msg.userId, {
            id: msg.userId,
            name: msg.userName,
            email: "",
            avatar: msg.userAvatar ?? "",
            isOnline: false,
          })
        }
      })

      setParticipants(Array.from(participantMap.values()))
      setHasMore(items.length === 20)
      setPage(pageNum)
    } catch (err: any) {
      console.error("[ConversationChat] Error:", err)
      if (page === 1) setMessages([])
    } finally {
      setLoading(false)
    }
  }, [token, conversationId, page])

  useEffect(() => {
    fetchMessages(1)
  }, [conversationId, token])

  useEffect(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }, [messages])

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) return

      try {
        const res = await fetch(`${config.apiUrl}${config.endpoints.user.me}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        })

        const contentType = res.headers.get("content-type")
        if (!contentType?.includes("application/json")) return

        const data = await res.json()
        if (res.ok) {
          setCurrentUserId(data?.data?.id?.toString() ?? data?.id?.toString())
        }
      } catch (err) {
        console.error("[ConversationChat] Error fetching user:", err)
      }
    }

    fetchCurrentUser()
  }, [token])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSelectedFiles(prev => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async (messageId: string): Promise<MessageFile[]> => {
    const uploadedFiles: MessageFile[] = []

    for (const file of selectedFiles) {
      try {
        const filePath = `conversations/${conversationId}/${Date.now()}_${file.name}`

        const payload = {
          message_id: messageId,
          type: getMimeType(file),
          path: filePath,
        }

        const res = await fetch(`${config.apiUrl}${config.endpoints.messageFiles.list}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })

        const contentType = res.headers.get("content-type")
        if (!contentType?.includes("application/json")) {
          continue
        }

        const data = await res.json()

        if (!res.ok) {
          continue
        }

        const uploaded = data?.data ?? data
        uploadedFiles.push({
          id: uploaded.id?.toString() ?? crypto.randomUUID(),
          name: uploaded.name ?? file.name,
          type: uploaded.type ?? getMimeType(file),
          size: formatFileSize(uploaded.size ?? file.size),
          url: uploaded.path ?? filePath ?? "#",
        })
      } catch (err) {
        console.error("[ConversationChat] Error uploading file:", err)
      }
    }

    return uploadedFiles
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() && selectedFiles.length === 0) {
      setConversationActionError("Debes escribir un mensaje o adjuntar archivos")
      return
    }

    if (!token || !currentUserId) {
      setConversationActionError("Error: Sesión no inicializada")
      return
    }

    setSending(true)
    setConversationActionError(null)

    try {
      const messageContent = newMessage.trim() || (selectedFiles.length > 0 ? "[Archivos adjuntos]" : "")

      const res = await fetch(`${config.apiUrl}${config.endpoints.messages.create}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          user_id: currentUserId,
          content: messageContent,
        }),
      })

      const contentType = res.headers.get("content-type")
      if (!contentType?.includes("application/json")) {
        const text = await res.text()
        throw new Error(`Respuesta no es JSON. Status: ${res.status}`)
      }

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.message || "No se pudo enviar el mensaje")
      }

      const saved = data?.data ?? data
      const messageId = saved.id?.toString()

      let uploadedFiles: MessageFile[] = []
      if (selectedFiles.length > 0 && messageId) {
        uploadedFiles = await uploadFiles(messageId)
      }

      const newMsg: Message = {
        id: messageId ?? Date.now().toString(),
        userId: saved.user_id?.toString() ?? currentUserId,
        userName: saved.user?.name ?? "Tú",
        userAvatar: saved.user?.avatar ?? "",
        content: saved.content ?? messageContent,
        timestamp: saved.created_at ?? new Date().toISOString(),
        files: uploadedFiles.length > 0 ? uploadedFiles : (Array.isArray(saved.files)
          ? saved.files.map((f: any) => ({
            id: f.id?.toString() ?? crypto.randomUUID(),
            name: f.name ?? f.filename ?? "archivo",
            type: f.type ?? "file",
            size: formatFileSize(parseInt(f.size) || 0),
            url: f.url ?? f.path ?? "#",
          }))
          : []),
      }

      setMessages(prev => [...prev, newMsg])
      setNewMessage("")
      setSelectedFiles([])
    } catch (err: any) {
      console.error("[ConversationChat] Error:", err)
      setConversationActionError(err?.message || "Error al enviar el mensaje")
    } finally {
      setSending(false)
    }
  }

  const handleDeleteMessage = async () => {
    if (!token || !messageToDelete) return

    setDeletingId(messageToDelete)
    try {
      const res = await fetch(
        `${config.apiUrl}${config.endpoints.messages.delete(messageToDelete)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      )

      if (res.status === 204 || res.ok) {
        setMessages(prev => prev.filter(m => m.id !== messageToDelete))
        setDeleteMessageDialogOpen(false)
        setMessageToDelete(null)
      } else {
        const contentType = res.headers.get("content-type")
        if (contentType?.includes("application/json")) {
          const data = await res.json()
          throw new Error(data?.message || "Error al eliminar")
        } else {
          throw new Error(`Error ${res.status}: No se pudo eliminar`)
        }
      }
    } catch (err: any) {
      console.error("[ConversationChat] Delete error:", err)
      setConversationActionError(err?.message || "Error al eliminar el mensaje")
    } finally {
      setDeletingId(null)
    }
  }

  const handleUpdateConversation = async () => {
    if (!token || !editedConversationName.trim()) return

    setUpdatingConversation(true)
    setConversationActionError(null)

    try {
      const res = await fetch(
        `${config.apiUrl}${config.endpoints.conversation.update(conversationId)}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: editedConversationName,
          }),
        }
      )

      const contentType = res.headers.get("content-type")
      if (!contentType?.includes("application/json")) {
        throw new Error(`Respuesta no es JSON. Status: ${res.status}`)
      }

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.message || "Error al actualizar")
      }

      setConversationName(editedConversationName)
      setConversationSettingsOpen(false)
    } catch (err: any) {
      console.error("[ConversationChat] Update error:", err)
      setConversationActionError(err?.message || "Error al actualizar la conversación")
    } finally {
      setUpdatingConversation(false)
    }
  }

  const handleDeleteConversation = async () => {
    if (!token) return

    setDeletingConversation(true)
    setConversationActionError(null)

    try {
      const res = await fetch(
        `${config.apiUrl}${config.endpoints.conversation.delete(conversationId)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      )

      if (res.status === 204 || res.ok) {
        window.location.href = "/estrategico/conversation/list"
      } else {
        const contentType = res.headers.get("content-type")
        if (contentType?.includes("application/json")) {
          const data = await res.json()
          throw new Error(data?.message || "Error al eliminar")
        } else {
          throw new Error(`Error ${res.status}: No se pudo eliminar`)
        }
      }
    } catch (err: any) {
      console.error("[ConversationChat] Delete conversation error:", err)
      setConversationActionError(err?.message || "Error al eliminar la conversación")
      setDeletingConversation(false)
    }
  }

  const loadMoreMessages = () => {
    if (hasMore && !loading) {
      fetchMessages(page + 1)
    }
  }

  const openConversationSettings = () => {
    setEditedConversationName(conversationName)
    setConversationSettingsOpen(true)
  }

  return (
    <StrategicLayout title={`Chat: ${conversationName}`}>
      <div className="flex h-[90vh] bg-background">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="border-b p-4 flex items-center justify-between bg-background flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = "/estrategico/conversation/list"}
              >
                <IconArrowLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold truncate">{conversationName}</h3>
                
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={openConversationSettings}
                title="Editar conversación"
              >
                <IconEdit className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Error Dialog */}
          {conversationActionError && (
            <Dialog open={!!conversationActionError} onOpenChange={() => setConversationActionError(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Error</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">{conversationActionError}</p>
                <DialogFooter>
                  <Button onClick={() => setConversationActionError(null)}>Cerrar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* Messages Container */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col"
          >
            {loading && page === 1 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <IconLoader className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Cargando mensajes...</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-center text-sm text-muted-foreground">
                  No hay mensajes en esta conversación. ¡Sé el primero en escribir!
                </p>
              </div>
            ) : (
              <>
                {hasMore && page === 1 && (
                  <div className="flex justify-center py-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={loadMoreMessages}
                      disabled={loading}
                    >
                      {loading ? "Cargando..." : "Cargar más mensajes"}
                    </Button>
                  </div>
                )}

                <div className="space-y-4 flex-1 flex flex-col justify-end">
                  {messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      currentUserId={currentUserId}
                      isDeleting={deletingId === message.id}
                      onDelete={() => {
                        setMessageToDelete(message.id)
                        setDeleteMessageDialogOpen(true)
                      }}
                    />
                  ))}
                </div>
              </>
            )}
            <div ref={messagesEndRef} className="h-1" />
          </div>

          {/* File Preview */}
          {selectedFiles.length > 0 && (
            <div className="border-t p-4 bg-muted/50 flex-shrink-0 max-h-[150px] overflow-y-auto">
              <p className="text-xs font-semibold mb-2 text-muted-foreground">
                Archivos adjuntos ({selectedFiles.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-background p-2 rounded border text-xs"
                  >
                    <IconFile className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate max-w-[150px]">{file.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      disabled={sending}
                      className="h-5 w-5 p-0"
                    >
                      <IconX className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message Input */}
          <div className="border-t p-4 bg-background flex-shrink-0">
            <div className="flex items-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={sending}
                title="Adjuntar archivos"
              >
                <IconPaperclip className="h-4 w-4" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              <div className="flex-1 min-w-0">
                <Textarea
                  placeholder="Escribe un mensaje..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && !sending) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  className="min-h-[40px] max-h-[120px] resize-none"
                  disabled={sending}
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={sending}
                title={sending ? "Enviando..." : "Enviar mensaje"}
                size="sm"
                className="flex-shrink-0"
              >
                {sending ? (
                  <IconLoader className="h-4 w-4 animate-spin" />
                ) : (
                  <IconSend className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar - Participants */}
        <div className="w-80 border-l bg-muted/30 hidden lg:flex flex-col">
          <div className="p-4 border-b flex-shrink-0">
            <h4 className="font-semibold">Participantes ({participants.length})</h4>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center gap-3 p-2 rounded hover:bg-background/50 transition-colors"
              >
                <div className="relative flex-shrink-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={participant.avatar} />
                    <AvatarFallback className="text-xs">
                      {participant.name
                        .split(' ')
                        .map((n: any) => n[0])
                        .join('')
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {participant.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{participant.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{participant.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delete Message Dialog */}
        <Dialog open={deleteMessageDialogOpen} onOpenChange={setDeleteMessageDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Eliminar mensaje</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas eliminar este mensaje? Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteMessageDialogOpen(false)}
                disabled={deletingId !== null}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteMessage}
                disabled={deletingId !== null}
              >
                {deletingId !== null ? (
                  <>
                    <IconLoader className="h-4 w-4 animate-spin mr-2" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <IconTrash className="h-4 w-4 mr-2" />
                    Eliminar
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Conversation Settings Dialog */}
        <Dialog open={conversationSettingsOpen} onOpenChange={setConversationSettingsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configuración de la conversación</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre de la conversación</label>
                <Input
                  value={editedConversationName}
                  onChange={(e) => setEditedConversationName(e.target.value)}
                  placeholder="Nombre de la conversación"
                />
              </div>
            </div>
            <DialogFooter className="flex gap-2 pt-4 border-t">
              <Button
                variant="destructive"
                onClick={() => handleDeleteConversation()}
                disabled={deletingConversation || updatingConversation}
              >
                {deletingConversation ? (
                  <>
                    <IconLoader className="h-4 w-4 animate-spin mr-2" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <IconTrash className="h-4 w-4 mr-2" />
                    Eliminar conversación
                  </>
                )}
              </Button>
              <div className="flex-1" />
              <Button
                variant="outline"
                onClick={() => setConversationSettingsOpen(false)}
                disabled={updatingConversation || deletingConversation}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUpdateConversation}
                disabled={updatingConversation || deletingConversation || !editedConversationName.trim()}
              >
                {updatingConversation ? (
                  <>
                    <IconLoader className="h-4 w-4 animate-spin mr-2" />
                    Guardando...
                  </>
                ) : (
                  "Guardar"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </StrategicLayout>
  )
}

interface MessageBubbleProps {
  message: Message
  currentUserId: string | null
  isDeleting: boolean
  onDelete: () => void
}

function MessageBubble({ message, currentUserId, isDeleting, onDelete }: MessageBubbleProps) {
  const isCurrentUser = currentUserId && message.userId === currentUserId

  return (
    <div className={`flex gap-3 group ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
      <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
        <AvatarImage src={message.userAvatar} />
        <AvatarFallback className="text-xs">
          {message.userName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className={`flex-1 max-w-[70%] flex ${isCurrentUser ? 'flex-row-reverse' : ''} items-start gap-2`}>
        <div className="flex-1">
          <div
            className={`flex items-center gap-2 mb-1 ${
              isCurrentUser ? 'flex-row-reverse justify-end' : ''
            }`}
          >
            <span className="text-sm font-medium">{message.userName}</span>
            <span className="text-xs text-muted-foreground">{formatTimestamp(message.timestamp)}</span>
          </div>

          <div
            className={`rounded-lg p-3 ${
              isCurrentUser
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted'
            }`}
          >
            {message.content && message.content !== '[Archivos adjuntos]' && (
              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
            )}

            {message.files && message.files.length > 0 && (
              <div className={`mt-2 space-y-2 ${message.content ? 'pt-2 border-t border-current border-opacity-20' : ''}`}>
                {message.files.map((file) => (
                  <a
                    key={file.id}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 p-2 rounded border transition-colors ${
                      isCurrentUser
                        ? 'bg-primary-foreground/10 border-primary-foreground/30 hover:bg-primary-foreground/20'
                        : 'bg-background/20 border-current border-opacity-20 hover:bg-background/30'
                    }`}
                  >
                    <IconFile className="h-4 w-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{file.name}</p>
                      <p className="text-xs opacity-70">{file.size}</p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Delete Button */}
        {isCurrentUser && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            disabled={isDeleting}
            className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
            title="Eliminar mensaje"
          >
            {isDeleting ? (
              <IconLoader className="h-4 w-4 animate-spin" />
            ) : (
              <IconTrash className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
