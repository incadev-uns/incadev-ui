import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  IconMessageCircle, 
  IconPlus, 
  IconSearch, 
  IconUsers,
  IconPin,
  IconArchive
} from "@tabler/icons-react"
import StrategicLayout from "../StrategicLayout"
import { routes } from "../strategic-site"

interface Conversation {
  id: string
  name: string
  lastMessage?: string
  lastMessageTime?: string
  unreadCount: number
  participantCount: number
  isArchived: boolean
  isPinned: boolean
}

export default function ConversationList() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carga de conversaciones
    const mockConversations: Conversation[] = [
      {
        id: "1",
        name: "Plan Estratégico 2024-2028",
        lastMessage: "¿Han revisado los objetivos del segundo trimestre?",
        lastMessageTime: "10:30 AM",
        unreadCount: 3,
        participantCount: 8,
        isArchived: false,
        isPinned: true
      },
      {
        id: "2", 
        name: "Coordinación General",
        lastMessage: "La reunión de mañana se pospone para el viernes",
        lastMessageTime: "9:15 AM",
        unreadCount: 0,
        participantCount: 15,
        isArchived: false,
        isPinned: false
      },
      {
        id: "3",
        name: "Indicadores de Calidad",
        lastMessage: "Los resultados del último trimestre están listos",
        lastMessageTime: "Ayer",
        unreadCount: 1,
        participantCount: 5,
        isArchived: false,
        isPinned: false
      }
    ]
    setConversations(mockConversations)
    setLoading(false)
  }, [])

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const pinnedConversations = filteredConversations.filter(conv => conv.isPinned)
  const regularConversations = filteredConversations.filter(conv => !conv.isPinned && !conv.isArchived)

  return (
    <StrategicLayout title="Comunicaciones - Gestión Estratégica">
      <div className="flex-1 space-y-6 p-4 md:p-6 pt-6">
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Comunicaciones</h2>
              <p className="text-muted-foreground">
                Gestiona las conversaciones y comunicación del equipo estratégico
              </p>
            </div>
            <Button>
              <IconPlus className="mr-2 h-4 w-4" />
              Nueva Conversación
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conversaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Conversaciones Activas
              </CardTitle>
              <IconMessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversations.filter(c => !c.isArchived).length}</div>
              <p className="text-xs text-muted-foreground">
                Canales de comunicación
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Mensajes sin Leer
              </CardTitle>
              <Badge variant="destructive" className="h-4 w-4 p-0 text-xs">
                {conversations.reduce((acc, conv) => acc + conv.unreadCount, 0)}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {conversations.reduce((acc, conv) => acc + conv.unreadCount, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Requieren atención
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Participantes
              </CardTitle>
              <IconUsers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                Usuarios activos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pinned Conversations */}
        {pinnedConversations.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <IconPin className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Conversaciones Fijadas</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pinnedConversations.map((conversation) => (
                <ConversationCard key={conversation.id} conversation={conversation} />
              ))}
            </div>
          </div>
        )}

        {/* Regular Conversations */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Todas las Conversaciones</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {regularConversations.map((conversation) => (
              <ConversationCard key={conversation.id} conversation={conversation} />
            ))}
          </div>
        </div>

        {filteredConversations.length === 0 && (
          <div className="text-center py-12">
            <IconMessageCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold">No se encontraron conversaciones</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Comienza creando una nueva conversación o ajusta tu búsqueda.
            </p>
          </div>
        )}
      </div>
    </StrategicLayout>
  )
}

function ConversationCard({ conversation }: { conversation: Conversation }) {
  const handleClick = () => {
    // Navegar a la conversación individual
    window.location.href = `/estrategico/conversation/${conversation.id}`;
  };

    return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleClick}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {conversation.isPinned && (
              <IconPin className="h-4 w-4 text-yellow-500" />
            )}
            <CardTitle className="text-base">{conversation.name}</CardTitle>
          </div>
          {conversation.unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {conversation.unreadCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <IconUsers className="h-3 w-3" />
          <span>{conversation.participantCount} participantes</span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {conversation.lastMessage && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {conversation.lastMessage}
            </p>
            <p className="text-xs text-muted-foreground">
              {conversation.lastMessageTime}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
