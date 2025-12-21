import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import {
  IconMessageCircle,
  IconPlus,
  IconSearch,
  IconUsers,
  IconPin,
  IconArchive,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react"
import StrategicLayout from "../StrategicLayout"
import { config } from "@/config/strategic-config"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

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

interface PlanningUser {
  id: string | number
  name: string
  email: string
  avatar?: string
}

export default function ConversationList() {
  const [conversations, setConversations] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [planningUsers, setPlanningUsers] = useState<PlanningUser[]>([])

  // Dialog estados
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Form estados
  const [newConversationName, setNewConversationName] = useState("")
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string | number>>(new Set())
  const [editingConversation, setEditingConversation] = useState<any | null>(null)
  const [deletingConversation, setDeletingConversation] = useState<any | null>(null)

  // Loading estados
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Error estados
  const [createError, setCreateError] = useState<string | null>(null)
  const [editError, setEditError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      // Fetch conversations
      const conversationsRes = await fetch(
        `${config.apiUrl}${config.endpoints.conversation.list}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      )
      const conversationsData = await conversationsRes.json()
      console.log("[ConversationList] GET /conversation response:", conversationsData)

      if (!conversationsRes.ok) {
        throw new Error(conversationsData?.message || "No se pudieron cargar las conversaciones")
      }

      // Fetch planning users
      const planningUsersRes = await fetch(
        `${config.apiUrl}${config.endpoints.planningUsers}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      )
      const planningUsersData = await planningUsersRes.json()
      console.log("[ConversationList] GET /planning-users response:", planningUsersData)

      if (planningUsersRes.ok) {
        const users = Array.isArray(planningUsersData?.data)
          ? planningUsersData.data
          : Array.isArray(planningUsersData)
            ? planningUsersData
            : []
        setPlanningUsers(users)
        console.log("[ConversationList] Planning users count:", users.length)
      }

      const items = Array.isArray(conversationsData)
        ? conversationsData
        : Array.isArray(conversationsData?.data)
          ? conversationsData.data
          : []

      const mappedConversations: Conversation[] = items.map((conv: any) => ({
        id: conv.id?.toString() ?? crypto.randomUUID(),
        name: conv.name ?? `Conversación ${conv.id}`,
        lastMessage: conv.last_message ?? "",
        lastMessageTime: conv.updated_at ?? conv.created_at ?? "",
        unreadCount: conv.unread_count ?? 0,
        participantCount: conv.participants_count ?? 0,
        isArchived: Boolean(conv.is_archived),
        isPinned: Boolean(conv.is_pinned),
      }))

      setConversations(mappedConversations)
    } catch (err: any) {
      console.error("[ConversationList] Error:", err)
      setError(err?.message || "Error al cargar conversaciones")
      setConversations([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleCreateConversation = async () => {
    const name = newConversationName.trim()
    if (!name) {
      setCreateError("Ingresa un nombre para la conversación")
      return
    }

    if (selectedParticipants.size === 0) {
      setCreateError("Selecciona al menos un participante")
      return
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) {
      setCreateError("No se encontró sesión activa")
      return
    }

    setCreating(true)
    setCreateError(null)
    try {
      const participantIds = Array.from(selectedParticipants).map(id => Number(id))
      
      const res = await fetch(
        `${config.apiUrl}${config.endpoints.conversation.create}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            participant_ids: participantIds,
          }),
        }
      )

      const data = await res.json()
      console.log("[ConversationList] POST /conversation response:", data)
      
      if (!res.ok) {
        throw new Error(data?.message || "No se pudo crear la conversación")
      }

      const newConversationId = data?.data?.id ?? data?.id
      
      setIsCreateDialogOpen(false)
      setNewConversationName("")
      setSelectedParticipants(new Set())
      
      await fetchData()
      
      // Redirigir al chat de la nueva conversación
      if (newConversationId) {
        window.location.href = `/estrategico/conversation/${newConversationId}`
      }
    } catch (err: any) {
      console.error("[ConversationList] Create error:", err)
      setCreateError(err?.message || "Error al crear la conversación")
    } finally {
      setCreating(false)
    }
  }

  const handleEditConversation = async () => {
    if (!editingConversation) return

    const name = editingConversation.name.trim()
    if (!name) {
      setEditError("Ingresa un nombre para la conversación")
      return
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) {
      setEditError("No se encontró sesión activa")
      return
    }

    setUpdating(true)
    setEditError(null)
    try {
      const url = `${config.apiUrl}${config.endpoints.conversation.update(editingConversation.id)}`
      const res = await fetch(url, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: editingConversation.name }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.message || "No se pudo actualizar la conversación")
      }

      setIsEditDialogOpen(false)
      setEditingConversation(null)
      await fetchData()
    } catch (err: any) {
      console.error("[ConversationList] Edit error:", err)
      setEditError(err?.message || "Error al actualizar la conversación")
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteConversation = async () => {
    if (!deletingConversation) return

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) {
      setDeleteError("No se encontró sesión activa")
      return
    }

    setDeleting(true)
    setDeleteError(null)
    try {
      const url = `${config.apiUrl}${config.endpoints.conversation.delete(deletingConversation.id)}`
      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data?.message || "No se pudo eliminar la conversación")
      }

      setIsDeleteDialogOpen(false)
      setDeletingConversation(null)
      await fetchData()
    } catch (err: any) {
      console.error("[ConversationList] Delete error:", err)
      setDeleteError(err?.message || "Error al eliminar la conversación")
    } finally {
      setDeleting(false)
    }
  }

  const toggleParticipant = (userId: string | number) => {
    const newSelected = new Set(selectedParticipants)
    if (newSelected.has(userId)) {
      newSelected.delete(userId)
    } else {
      newSelected.add(userId)
    }
    setSelectedParticipants(newSelected)
  }

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const pinnedConversations = filteredConversations.filter(conv => conv.isPinned)
  const regularConversations = filteredConversations.filter(conv => !conv.isPinned && !conv.isArchived)

  if (loading) {
    return (
      <StrategicLayout title="Comunicaciones - Gestión Estratégica">
        <div className="p-6 text-muted-foreground">Cargando conversaciones...</div>
      </StrategicLayout>
    )
  }

  return (
    <>
      <StrategicLayout title="Comunicaciones - Gestión Estratégica">
        <div className="flex-1 space-y-6 p-4 md:p-6 pt-6">
          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 text-destructive px-4 py-2 text-sm">
              {error}
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Comunicaciones</h2>
                <p className="text-muted-foreground">
                  Gestiona las conversaciones y comunicación del equipo estratégico
                </p>
              </div>

              <Button onClick={() => setIsCreateDialogOpen(true)}>
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
                <div className="text-2xl font-bold">{planningUsers.length}</div>
                <p className="text-xs text-muted-foreground">
                  Usuarios de planificación
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
                  <ConversationCard
                    key={conversation.id}
                    conversation={conversation}
                    onEdit={(conv) => {
                      setEditingConversation(conv)
                      setIsEditDialogOpen(true)
                    }}
                    onDelete={(conv) => {
                      setDeletingConversation(conv)
                      setIsDeleteDialogOpen(true)
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Regular Conversations */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Todas las Conversaciones</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {regularConversations.map((conversation) => (
                <ConversationCard
                  key={conversation.id}
                  conversation={conversation}
                  onEdit={(conv) => {
                    setEditingConversation(conv)
                    setIsEditDialogOpen(true)
                  }}
                  onDelete={(conv) => {
                    setDeletingConversation(conv)
                    setIsDeleteDialogOpen(true)
                  }}
                />
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

      {/* Dialog: Crear Conversación con Participantes */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva conversación</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nombre de la conversación</label>
              <Input
                autoFocus
                placeholder="Ej: Equipo de Estrategia"
                value={newConversationName}
                onChange={(e) => setNewConversationName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-3 block">
                Selecciona participantes ({selectedParticipants.size})
              </label>
              <div className="space-y-2 border rounded-lg p-3 max-h-[300px] overflow-y-auto">
                {planningUsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay usuarios disponibles</p>
                ) : (
                  planningUsers.map((user) => (
                    <div key={user.id} className="flex items-center gap-3 p-2 hover:bg-muted rounded">
                      <Checkbox
                        checked={selectedParticipants.has(user.id)}
                        onCheckedChange={() => toggleParticipant(user.id)}
                      />
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {createError && (
              <p className="text-sm text-destructive">{createError}</p>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => {
              setIsCreateDialogOpen(false)
              setNewConversationName("")
              setSelectedParticipants(new Set())
              setCreateError(null)
            }} disabled={creating}>
              Cancelar
            </Button>
            <Button onClick={handleCreateConversation} disabled={creating || selectedParticipants.size === 0}>
              {creating ? "Creando..." : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Editar Conversación */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar conversación</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Input
              autoFocus
              placeholder="Nombre de la conversación"
              value={editingConversation?.name || ""}
              onChange={(e) => {
                if (editingConversation) {
                  setEditingConversation({ ...editingConversation, name: e.target.value })
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleEditConversation()
                }
              }}
            />
            {editError && (
              <p className="text-sm text-destructive">{editError}</p>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={updating}>
              Cancelar
            </Button>
            <Button onClick={handleEditConversation} disabled={updating}>
              {updating ? "Actualizando..." : "Actualizar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Confirmar Eliminación */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar conversación</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              ¿Estás seguro de que deseas eliminar la conversación "<strong>{deletingConversation?.name}</strong>"? Esta acción no se puede deshacer.
            </p>
            {deleteError && (
              <p className="text-sm text-destructive">{deleteError}</p>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={deleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteConversation} disabled={deleting}>
              {deleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function ConversationCard({
  conversation,
  onEdit,
  onDelete,
}: {
  conversation: Conversation
  onEdit: (conv: Conversation) => void
  onDelete: (conv: Conversation) => void
}) {
  const handleClick = () => {
    window.location.href = `/estrategico/conversation/${conversation.id}`
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit(conversation)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(conversation)
  }

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
          <div className="flex items-center gap-1">
            {conversation.unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {conversation.unreadCount}
              </Badge>
            )}
          </div>
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
        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={handleEditClick}
          >
            <IconEdit className="h-4 w-4 mr-1" />
            Editar
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-destructive hover:text-destructive"
            onClick={handleDeleteClick}
          >
            <IconTrash className="h-4 w-4 mr-1" />
            Eliminar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
