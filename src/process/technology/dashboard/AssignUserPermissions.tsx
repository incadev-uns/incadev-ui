import { useState, useEffect } from "react"
import TechnologyLayout from "@/process/technology/TechnologyLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IconArrowLeft, IconDeviceFloppy } from "@tabler/icons-react"
import { technologyApi, type User, type Permission } from "@/services/tecnologico/api"
import { toast } from "sonner"

export default function AssignUserPermissions() {
  const [userId, setUserId] = useState<number | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([])
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Obtener el ID del usuario desde la URL (query param ?id=123)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const id = params.get("id")
      if (id) {
        setUserId(parseInt(id, 10))
      } else {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    if (userId) {
      loadData()
    }
  }, [userId])

  const loadData = async () => {
    try {
      setLoading(true)

      // Load user
      const userResponse = await technologyApi.users.getById(userId)
      if (userResponse.success && userResponse.data) {
        setUser(userResponse.data)
        setSelectedPermissions(userResponse.data.permissions || [])
      }

      // Load available permissions
      const permissionsResponse = await technologyApi.permissions.list()
      if (permissionsResponse.success && permissionsResponse.data) {
        setAvailablePermissions(permissionsResponse.data.data)
      }
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Error de conexión", {
        description: "No se pudo cargar la información"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePermission = (permissionName: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionName)
        ? prev.filter(p => p !== permissionName)
        : [...prev, permissionName]
    )
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      const response = await technologyApi.users.assignPermissions(userId, selectedPermissions)

      if (response.success) {
        toast.success("Permisos asignados", {
          description: "Los permisos han sido asignados exitosamente"
        })

        setTimeout(() => {
          window.location.href = "/tecnologico/admin/usuarios"
        }, 1500)
      } else {
        toast.error("Error al asignar permisos", {
          description: response.message || "No se pudieron asignar los permisos"
        })
      }
    } catch (error) {
      console.error("Error assigning permissions:", error)
      toast.error("Error de conexión", {
        description: "No se pudo conectar con el servidor"
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <TechnologyLayout title="Asignar Permisos">
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </TechnologyLayout>
    )
  }

  return (
    <TechnologyLayout title="Asignar Permisos">
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <a href="/tecnologico/admin/usuarios">
                <IconArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </a>
            </Button>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Asignar Permisos</h2>
              <p className="text-muted-foreground">
                Asigna permisos al usuario: {user?.name} ({user?.email})
              </p>
            </div>
          </div>

          {/* Permissions Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Permisos Disponibles</CardTitle>
              <CardDescription>
                Selecciona los permisos que deseas asignar al usuario
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {availablePermissions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No hay permisos disponibles
                  </p>
                ) : (
                  availablePermissions.map((permission) => (
                    <label
                      key={permission.id}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(permission.name)}
                        onChange={() => handleTogglePermission(permission.name)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{permission.name}</p>
                        {permission.description && (
                          <p className="text-xs text-muted-foreground">{permission.description}</p>
                        )}
                      </div>
                    </label>
                  ))
                )}
              </div>

              {selectedPermissions.length > 0 && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm font-medium mb-2">Permisos seleccionados:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedPermissions.map((permission) => (
                      <span
                        key={permission}
                        className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900 px-3 py-1 text-xs font-medium text-green-700 dark:text-green-300"
                      >
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4 mt-4 border-t">
                <Button onClick={handleSave} disabled={saving}>
                  <IconDeviceFloppy className="mr-2 h-4 w-4" />
                  {saving ? "Guardando..." : "Guardar Permisos"}
                </Button>
                <Button variant="outline" asChild>
                  <a href="/tecnologico/admin/usuarios">Cancelar</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TechnologyLayout>
  )
}
