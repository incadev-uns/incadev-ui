import { useState, useEffect } from "react"
import TechnologyLayout from "../TechnologyLayout"
import { useTechnologyAuth } from "../hooks/useTechnologyAuth"
import { technologyApi } from "@/services/tecnologico/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Loader2,
  Lock,
  Unlock,
  Clock,
  History,
  Shield,
  Ban,
  RefreshCw,
} from "lucide-react"
import { toast } from "sonner"

interface BlockedUser {
  id: number
  user_id: number
  user: {
    id: number
    name: string
    email: string
  }
  blocked_by: number
  blocked_by_user?: {
    id: number
    name: string
  }
  reason: string
  block_type: "automatic" | "manual"
  block_type_label: string
  ip_address?: string
  blocked_at: string
  blocked_at_human: string
  blocked_until?: string
  blocked_until_human?: string
  is_active: boolean
  is_currently_blocked: boolean
  remaining_time?: string
  unblocked_at?: string
  unblocked_by?: number
  metadata?: Record<string, any>
}

interface BlockStatistics {
  total_blocks: number
  automatic_blocks: number
  manual_blocks: number
  currently_blocked: number
  unblocked: number
}

export default function BlocksManagementPage() {
  const { user, loading: authLoading } = useTechnologyAuth()
  const [blocks, setBlocks] = useState<BlockedUser[]>([])
  const [history, setHistory] = useState<BlockedUser[]>([])
  const [statistics, setStatistics] = useState<BlockStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("active")

  // Block user dialog
  const [showBlockDialog, setShowBlockDialog] = useState(false)
  const [blockForm, setBlockForm] = useState({
    user_id: "",
    reason: "",
    duration_minutes: "60",
    permanent: false,
  })
  const [blocking, setBlocking] = useState(false)

  // Unblock dialog
  const [showUnblockDialog, setShowUnblockDialog] = useState(false)
  const [userToUnblock, setUserToUnblock] = useState<BlockedUser | null>(null)
  const [unblocking, setUnblocking] = useState(false)

  // Users for select
  const [users, setUsers] = useState<{ id: number; name: string; email: string }[]>([])

  useEffect(() => {
    if (!authLoading && user) {
      fetchData()
      fetchUsers()
    }
  }, [authLoading, user])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [blocksRes, historyRes, statsRes] = await Promise.all([
        technologyApi.security.blocks.list(),
        technologyApi.security.blocks.history(),
        technologyApi.security.blocks.statistics(),
      ])

      if (blocksRes.success) setBlocks(blocksRes.data || [])
      if (historyRes.success) setHistory(historyRes.data || [])
      if (statsRes.success) setStatistics(statsRes.data)
    } catch (error: any) {
      console.error("Error fetching blocks data:", error)
      toast.error(error.message || "Error al cargar datos de bloqueos")
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await technologyApi.users.list(1, 100)
      if (response.success && response.data) {
        setUsers(response.data.data || [])
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const handleBlockUser = async () => {
    if (!blockForm.user_id || !blockForm.reason) {
      toast.error("Por favor completa todos los campos requeridos")
      return
    }

    setBlocking(true)
    try {
      const data: any = {
        user_id: parseInt(blockForm.user_id),
        reason: blockForm.reason,
      }

      if (!blockForm.permanent && blockForm.duration_minutes) {
        data.duration_minutes = parseInt(blockForm.duration_minutes)
      }

      const response = await technologyApi.security.blocks.create(data)

      if (response.success) {
        toast.success("Usuario bloqueado exitosamente")
        setShowBlockDialog(false)
        setBlockForm({ user_id: "", reason: "", duration_minutes: "60", permanent: false })
        fetchData()
      } else {
        toast.error(response.message || "Error al bloquear usuario")
      }
    } catch (error: any) {
      console.error("Error blocking user:", error)
      toast.error(error.message || "Error al bloquear usuario")
    } finally {
      setBlocking(false)
    }
  }

  const handleUnblockUser = async () => {
    if (!userToUnblock) return

    setUnblocking(true)
    try {
      const response = await technologyApi.security.blocks.unblockByUser(userToUnblock.user_id)

      if (response.success) {
        toast.success("Usuario desbloqueado exitosamente")
        setShowUnblockDialog(false)
        setUserToUnblock(null)
        fetchData()
      } else {
        toast.error(response.message || "Error al desbloquear usuario")
      }
    } catch (error: any) {
      console.error("Error unblocking user:", error)
      toast.error(error.message || "Error al desbloquear usuario")
    } finally {
      setUnblocking(false)
    }
  }

  const openUnblockDialog = (block: BlockedUser) => {
    setUserToUnblock(block)
    setShowUnblockDialog(true)
  }

  if (authLoading) {
    return (
      <TechnologyLayout title="Usuarios Bloqueados">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </TechnologyLayout>
    )
  }

  return (
    <TechnologyLayout title="Usuarios Bloqueados">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Lock className="w-8 h-8 text-destructive" />
              Gestion de Bloqueos
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Administra los usuarios bloqueados del sistema
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={fetchData} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
            <Button onClick={() => setShowBlockDialog(true)}>
              <Ban className="w-4 h-4 mr-2" />
              Bloquear Usuario
            </Button>
          </div>
        </div>

        {/* Statistics */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Bloqueos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{statistics.total_blocks}</div>
                <p className="text-xs text-muted-foreground mt-1">ultimos 30 dias</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Automaticos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-500 dark:text-orange-400">{statistics.automatic_blocks}</div>
                <p className="text-xs text-muted-foreground mt-1">por intentos fallidos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Manuales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{statistics.manual_blocks}</div>
                <p className="text-xs text-muted-foreground mt-1">por administrador</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Actualmente Bloqueados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-destructive">{statistics.currently_blocked}</div>
                <p className="text-xs text-muted-foreground mt-1">usuarios</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Desbloqueados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500 dark:text-green-400">{statistics.unblocked}</div>
                <p className="text-xs text-muted-foreground mt-1">usuarios</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Bloqueados Activos ({blocks.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Historial
            </TabsTrigger>
          </TabsList>

          {/* Active Blocks */}
          <TabsContent value="active">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : blocks.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Usuarios Bloqueados</CardTitle>
                  <CardDescription>Lista de usuarios actualmente bloqueados</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Razon</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Bloqueado por</TableHead>
                        <TableHead>Tiempo Restante</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {blocks.map((block) => (
                        <TableRow key={block.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-foreground">{block.user?.name}</div>
                              <div className="text-sm text-muted-foreground">{block.user?.email}</div>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-foreground">{block.reason}</TableCell>
                          <TableCell>
                            <Badge variant={block.block_type === "automatic" ? "secondary" : "default"}>
                              {block.block_type_label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-foreground">
                            {block.blocked_by_user?.name || "Sistema"}
                          </TableCell>
                          <TableCell>
                            {block.remaining_time ? (
                              <span className="inline-flex items-center gap-1 text-sm text-orange-500 dark:text-orange-400">
                                <Clock className="w-4 h-4" />
                                {block.remaining_time}
                              </span>
                            ) : (
                              <span className="text-sm text-destructive font-medium">Permanente</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openUnblockDialog(block)}
                            >
                              <Unlock className="w-4 h-4 mr-1" />
                              Desbloquear
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-12">
                <Shield className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">No hay usuarios bloqueados actualmente</p>
              </div>
            )}
          </TabsContent>

          {/* History */}
          <TabsContent value="history">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : history.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Historial de Bloqueos</CardTitle>
                  <CardDescription>Registro historico de todos los bloqueos</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Razon</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Fecha Bloqueo</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history.map((block) => (
                        <TableRow key={block.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-foreground">{block.user?.name}</div>
                              <div className="text-sm text-muted-foreground">{block.user?.email}</div>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-foreground">{block.reason}</TableCell>
                          <TableCell>
                            <Badge variant={block.block_type === "automatic" ? "secondary" : "default"}>
                              {block.block_type_label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-foreground">{block.blocked_at_human}</TableCell>
                          <TableCell>
                            {block.is_currently_blocked ? (
                              <Badge variant="destructive" className="gap-1">
                                <Lock className="w-3 h-3" />
                                Bloqueado
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="gap-1 text-green-500 dark:text-green-400 border-green-500 dark:border-green-400">
                                <Unlock className="w-3 h-3" />
                                Desbloqueado
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-12">
                <History className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">No hay historial de bloqueos</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Block User Dialog */}
        <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bloquear Usuario</DialogTitle>
              <DialogDescription>
                Bloquea un usuario para impedir su acceso al sistema
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user">Usuario</Label>
                <Select
                  value={blockForm.user_id}
                  onValueChange={(value) => setBlockForm({ ...blockForm, user_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id.toString()}>
                        {u.name} ({u.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Razon del bloqueo</Label>
                <Textarea
                  id="reason"
                  placeholder="Describe la razon del bloqueo..."
                  value={blockForm.reason}
                  onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="permanent"
                  checked={blockForm.permanent}
                  onCheckedChange={(checked) => setBlockForm({ ...blockForm, permanent: checked as boolean })}
                />
                <Label htmlFor="permanent">Bloqueo permanente</Label>
              </div>

              {!blockForm.permanent && (
                <div className="space-y-2">
                  <Label htmlFor="duration">Duracion (minutos)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={blockForm.duration_minutes}
                    onChange={(e) => setBlockForm({ ...blockForm, duration_minutes: e.target.value })}
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBlockDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleBlockUser} disabled={blocking}>
                {blocking && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Bloquear Usuario
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Unblock Confirmation Dialog */}
        <Dialog open={showUnblockDialog} onOpenChange={setShowUnblockDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Desbloqueo</DialogTitle>
              <DialogDescription>
                Estas seguro de que deseas desbloquear a {userToUnblock?.user?.name}?
                El usuario podra acceder nuevamente al sistema.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUnblockDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUnblockUser} disabled={unblocking}>
                {unblocking && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Si, Desbloquear
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TechnologyLayout>
  )
}
