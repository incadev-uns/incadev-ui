import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { IconPlus, IconSearch } from "@tabler/icons-react"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
}

interface NewConversationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewConversationModal({ open, onOpenChange }: NewConversationModalProps) {
  const [conversationName, setConversationName] = useState("")
  const [description, setDescription] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  // Mock users - en producción esto vendría de una API
  const availableUsers: User[] = [
    {
      id: "1",
      name: "María González",
      email: "maria.gonzalez@uns.edu.pe",
      role: "Coordinadora Estratégica"
    },
    {
      id: "2",
      name: "Carlos Rodríguez",
      email: "carlos.rodriguez@uns.edu.pe",
      role: "Analista de Planificación"
    },
    {
      id: "3",
      name: "Ana Morales",
      email: "ana.morales@uns.edu.pe",
      role: "Especialista en Monitoreo"
    },
    {
      id: "4",
      name: "Luis Torres",
      email: "luis.torres@uns.edu.pe",
      role: "Director de Planificación"
    }
  ]

  const filteredUsers = availableUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleCreateConversation = () => {
    if (conversationName.trim() && selectedUsers.length > 0) {
      // Aquí iría la lógica para crear la conversación
      console.log({
        name: conversationName,
        description,
        participants: selectedUsers
      })
      
      // Resetear form
      setConversationName("")
      setDescription("")
      setSelectedUsers([])
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nueva Conversación</DialogTitle>
          <DialogDescription>
            Crea un nuevo canal de comunicación para tu equipo estratégico.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nombre de la conversación */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la conversación</Label>
            <Input
              id="name"
              placeholder="Ej: Plan Estratégico 2024-2028"
              value={conversationName}
              onChange={(e) => setConversationName(e.target.value)}
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Describe el propósito de esta conversación..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {/* Buscar participantes */}
          <div className="space-y-2">
            <Label>Participantes</Label>
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Lista de usuarios */}
          <div className="max-h-48 overflow-y-auto space-y-2 border rounded p-3">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center space-x-3 p-2 hover:bg-muted rounded">
                <Checkbox
                  id={`user-${user.id}`}
                  checked={selectedUsers.includes(user.id)}
                  onCheckedChange={() => handleUserToggle(user.id)}
                />
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.role}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Participantes seleccionados */}
          {selectedUsers.length > 0 && (
            <div className="space-y-2">
              <Label>Participantes seleccionados ({selectedUsers.length})</Label>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((userId) => {
                  const user = availableUsers.find(u => u.id === userId)
                  return user ? (
                    <div key={userId} className="flex items-center gap-2 bg-muted px-2 py-1 rounded text-sm">
                      <span>{user.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUserToggle(userId)}
                        className="h-auto p-0 text-muted-foreground hover:text-destructive"
                      >
                        ×
                      </Button>
                    </div>
                  ) : null
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleCreateConversation}
            disabled={!conversationName.trim() || selectedUsers.length === 0}
          >
            Crear Conversación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
