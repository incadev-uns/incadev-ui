import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  IconSend,
  IconPaperclip,
  IconUsers,
  IconSettings,
  IconArrowLeft,
  IconFile,
  IconX
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

export default function ConversationChat({ conversationId = "1" }) {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [participants, setParticipants] = useState<any[]>([])
  const [conversationName, setConversationName] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  useEffect(() => {
    const fetchMessages = async () => {
      if (!token) {
        setLoading(false)
        setError("No hay token de autenticación")
        return
      }

      setLoading(true)
      setError(null)
      try {
        const res = await fetch(
          `${config.apiUrl}${config.endpoints.messages.list}?conversation_id=${conversationId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        )
        const data = await res.json()
        console.log("[ConversationChat] GET /messages response:", data)

        if (!res.ok) {
          throw new Error(data?.message || "No se pudieron cargar los mensajes")
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

        setMessages(mapped)
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
      } catch (err: any) {
        console.error("[ConversationChat] Error:", err)
        setError(err?.message || "Error al cargar la conversación")
        setMessages([])
        setParticipants([])
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [conversationId, token])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSelectedFiles(prev => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() && selectedFiles.length === 0) return
    if (!token) {
      setError("No hay token de autenticación")
      return
    }

    setSending(true)
    setError(null)

    try {
      const hasFiles = selectedFiles.length > 0
      const url = `${config.apiUrl}${config.endpoints.messages.create}`
      let body: BodyInit
      let headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      }

      if (hasFiles) {
        const form = new FormData()
        form.append("conversation_id", conversationId)
        form.append("content", newMessage)
        selectedFiles.forEach((file) => form.append("files[]", file))
        body = form
      } else {
        headers["Content-Type"] = "application/json"
        body = JSON.stringify({
          conversation_id: conversationId,
          content: newMessage,
        })
      }

      const res = await fetch(url, {
        method: "POST",
        headers,
        body,
      })
      const data = await res.json()
      console.log("[ConversationChat] POST /messages response:", data)

      if (!res.ok) {
        throw new Error(data?.message || "No se pudo enviar el mensaje")
      }

      const saved = data?.data ?? data
      const appended: Message = {
        id: saved.id?.toString() ?? Date.now().toString(),
        userId: saved.user_id?.toString() ?? "current-user",
        userName: saved.user?.name ?? "Tú",
        userAvatar: saved.user?.avatar ?? "",
        content: saved.content ?? newMessage,
        timestamp:
          saved.created_at ??
          new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        files: Array.isArray(saved.files)
          ? saved.files.map((f: any) => ({
              id: f.id?.toString() ?? crypto.randomUUID(),
              name: f.name ?? f.filename ?? "archivo",
              type: f.type ?? "file",
              size: f.size ?? "",
              url: f.url ?? "#",
            }))
          : [],
      }

      setMessages((prev) => [...prev, appended])
      setNewMessage("")
      setSelectedFiles([])
    } catch (err: any) {
      console.error("[ConversationChat] Error al enviar:", err)
      setError(err?.message || "Error al enviar el mensaje")
    } finally {
      setSending(false)
    }
  }

  return (
    <StrategicLayout title={`Chat: ${conversationName}`}>
      <div className="flex-1 h-screen flex">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="border-b p-4 flex items-center justify-between bg-background">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm">
                <IconArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h3 className="font-semibold">{conversationName}</h3>
                <p className="text-sm text-muted-foreground">
                  {participants.length} participantes • {participants.filter(p => p.isOnline).length} en línea
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <IconUsers className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <IconSettings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="text-sm text-muted-foreground">Cargando mensajes...</div>
            ) : (
              messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* File Preview */}
          {selectedFiles.length > 0 && (
            <div className="border-t p-4 bg-muted/50">
              <div className="flex flex-wrap gap-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 bg-background p-2 rounded border">
                    <IconFile className="h-4 w-4" />
                    <span className="text-sm">{file.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <IconX className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message Input */}
          <div className="border-t p-4">
            <div className="flex items-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={sending}
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
              <div className="flex-1">
                <Textarea
                  placeholder="Escribe un mensaje..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  className="min-h-[40px] max-h-[120px] resize-none"
                  disabled={sending}
                />
              </div>
              <Button onClick={handleSendMessage} disabled={sending}>
                <IconSend className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar - Participants */}
        <div className="w-80 border-l bg-muted/30">
          <div className="p-4">
            <h4 className="font-semibold mb-3">Participantes ({participants.length})</h4>
            <div className="space-y-2">
              {participants.map((participant) => (
                <div key={participant.id} className="flex items-center gap-3 p-2 rounded hover:bg-background/50">
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={participant.avatar} />
                      <AvatarFallback>
                        {participant.name.split(' ').map((n:any) => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {participant.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{participant.name}</p>
                    <p className="text-xs text-muted-foreground">{participant.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </StrategicLayout>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const isCurrentUser = message.userId === "current-user"

  return (
    <div className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
      <Avatar className="h-8 w-8">
        <AvatarImage src={message.userAvatar} />
        <AvatarFallback>
          {message.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className={`flex-1 max-w-[70%] ${isCurrentUser ? 'text-right' : ''}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium">{message.userName}</span>
          <span className="text-xs text-muted-foreground">{message.timestamp}</span>
        </div>
        <div className={`rounded-lg p-3 ${
          isCurrentUser 
            ? 'bg-primary text-primary-foreground ml-auto' 
            : 'bg-muted'
        }`}>
          {message.content && (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          )}
          {message.files && message.files.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.files.map((file) => (
                <div key={file.id} className="flex items-center gap-2 p-2 rounded border bg-background/20">
                  <IconFile className="h-4 w-4" />
                  <div className="flex-1">
                    <p className="text-xs font-medium">{file.name}</p>
                    <p className="text-xs opacity-70">{file.size}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
