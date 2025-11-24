import { useState, useEffect } from "react"
import TechnologyLayout from "@/process/technology/TechnologyLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IconArrowLeft, IconDeviceFloppy } from "@tabler/icons-react"
import { technologyApi, type User, type Role } from "@/services/tecnologico/api"
import { toast } from "sonner"

export default function AssignUserRoles() {
  const [userId, setUserId] = useState<number | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [availableRoles, setAvailableRoles] = useState<Role[]>([])
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
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
        setSelectedRoles(userResponse.data.roles || [])
      }

      // Load available roles
      const rolesResponse = await technologyApi.roles.list()
      if (rolesResponse.success && rolesResponse.data) {
        setAvailableRoles(rolesResponse.data.data)
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

  const handleToggleRole = (roleName: string) => {
    setSelectedRoles(prev =>
      prev.includes(roleName)
        ? prev.filter(r => r !== roleName)
        : [...prev, roleName]
    )
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      const response = await technologyApi.users.assignRoles(userId, selectedRoles)

      if (response.success) {
        toast.success("Roles asignados", {
          description: "Los roles han sido asignados exitosamente"
        })

        setTimeout(() => {
          window.location.href = "/tecnologico/admin/usuarios"
        }, 1500)
      } else {
        toast.error("Error al asignar roles", {
          description: response.message || "No se pudieron asignar los roles"
        })
      }
    } catch (error) {
      console.error("Error assigning roles:", error)
      toast.error("Error de conexión", {
        description: "No se pudo conectar con el servidor"
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <TechnologyLayout title="Asignar Roles">
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </TechnologyLayout>
    )
  }

  return (
    <TechnologyLayout title="Asignar Roles">
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
              <h2 className="text-2xl font-bold tracking-tight">Asignar Roles</h2>
              <p className="text-muted-foreground">
                Asigna roles al usuario: {user?.name} ({user?.email})
              </p>
            </div>
          </div>

          {/* Roles Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Roles Disponibles</CardTitle>
              <CardDescription>
                Selecciona los roles que deseas asignar al usuario
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {availableRoles.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No hay roles disponibles
                  </p>
                ) : (
                  availableRoles.map((role) => (
                    <label
                      key={role.id}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedRoles.includes(role.name)}
                        onChange={() => handleToggleRole(role.name)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{role.name}</p>
                        {role.description && (
                          <p className="text-xs text-muted-foreground">{role.description}</p>
                        )}
                      </div>
                    </label>
                  ))
                )}
              </div>

              {selectedRoles.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-medium mb-2">Roles seleccionados:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedRoles.map((role) => (
                      <span
                        key={role}
                        className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-300"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4 mt-4 border-t">
                <Button onClick={handleSave} disabled={saving}>
                  <IconDeviceFloppy className="mr-2 h-4 w-4" />
                  {saving ? "Guardando..." : "Guardar Roles"}
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
