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
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [participants, setParticipants] = useState<Participant[]>([])
  const [conversationName, setConversationName] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Simular carga de datos
    const mockMessages: Message[] = [
      {
        id: "1",
        userId: "user1",
        userName: "María González",
        userAvatar: "",
        content: "Buenos días equipo. ¿Han revisado los objetivos del segundo trimestre?",
        timestamp: "10:30 AM",
        files: []
      },
      {
        id: "2",
        userId: "user2", 
        userName: "Carlos Rodríguez",
        userAvatar: "",
        content: "Sí, los revisé anoche. Tengo algunas observaciones sobre los indicadores de calidad.",
        timestamp: "10:35 AM",
        files: [
          {
            id: "f1",
            name: "observaciones-q2.pdf",
            type: "application/pdf",
            size: "2.3 MB",
            url: "#"
          }
        ]
      },
      {
        id: "3",
        userId: "user3",
        userName: "Ana Morales", 
        userAvatar: "",
        content: "Perfecto. ¿Podemos programar una reunión para esta semana?",
        timestamp: "10:40 AM",
        files: []
      }
    ]

    const mockParticipants: Participant[] = [
      {
        id: "user1",
        name: "María González",
        email: "maria.gonzalez@uns.edu.pe",
        avatar: "",
        isOnline: true
      },
      {
        id: "user2", 
        name: "Carlos Rodríguez",
        email: "carlos.rodriguez@uns.edu.pe",
        avatar: "",
        isOnline: true
      },
      {
        id: "user3",
        name: "Ana Morales",
        email: "ana.morales@uns.edu.pe", 
        avatar: "",
        isOnline: false
      }
    ]

    setMessages(mockMessages)
    setParticipants(mockParticipants)
    setConversationName("Plan Estratégico 2024-2028")
  }, [conversationId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = () => {
    if (newMessage.trim() || selectedFiles.length > 0) {
      const message: Message = {
        id: Date.now().toString(),
        userId: "current-user",
        userName: "Tú",
        content: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        files: selectedFiles.map(file => ({
          id: Date.now().toString() + Math.random(),
          name: file.name,
          type: file.type,
          size: (file.size / 1024 / 1024).toFixed(1) + " MB",
          url: "#"
        }))
      }
      
      setMessages(prev => [...prev, message])
      setNewMessage("")
      setSelectedFiles([])
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSelectedFiles(prev => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
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
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
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
                />
              </div>
              <Button onClick={handleSendMessage}>
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
                        {participant.name.split(' ').map(n => n[0]).join('').toUpperCase()}
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
