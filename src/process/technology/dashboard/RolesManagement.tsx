import { useState, useEffect } from "react"
import TechnologyLayout from "@/process/technology/TechnologyLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconTrash,
  IconKey
} from "@tabler/icons-react"
import { technologyApi, type Role, type ApiResponse, type PaginatedResponse } from "@/services/tecnologico/api"
import { toast } from "sonner"

export default function RolesManagement() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const perPage = 10

  useEffect(() => {
    loadRoles()
  }, [currentPage, search])

  const loadRoles = async () => {
    try {
      setLoading(true)
      const response = await technologyApi.roles.list(currentPage, perPage, search)

      if (response.success && response.data) {
        setRoles(response.data.data)
        setTotalPages(response.data.last_page)
        setTotal(response.data.total)
      } else {
        toast.error("Error al cargar roles", {
          description: response.message || "No se pudieron cargar los roles"
        })
      }
    } catch (error) {
      console.error("Error loading roles:", error)
      toast.error("Error de conexión", {
        description: "No se pudo conectar con el servidor"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar el rol "${name}"?`)) {
      return
    }

    try {
      const response = await technologyApi.roles.delete(id)

      if (response.success) {
        toast.success("Rol eliminado", {
          description: `El rol ${name} ha sido eliminado exitosamente`
        })
        loadRoles()
      } else {
        toast.error("Error al eliminar", {
          description: response.message || "No se pudo eliminar el rol"
        })
      }
    } catch (error) {
      console.error("Error deleting role:", error)
      toast.error("Error de conexión", {
        description: "No se pudo conectar con el servidor"
      })
    }
  }

  return (
    <TechnologyLayout title="Gestión de Roles">
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Gestión de Roles</h2>
              <p className="text-muted-foreground">
                Administra los roles del sistema ({total} roles)
              </p>
            </div>
            <Button asChild>
              <a href="/tecnologico/admin/roles/crear">
                <IconPlus className="mr-2 h-4 w-4" />
                Crear Rol
              </a>
            </Button>
          </div>

          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle>Buscar Roles</CardTitle>
              <CardDescription>
                Busca roles por nombre o descripción
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Buscar..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button onClick={() => loadRoles()}>Buscar</Button>
              </div>
            </CardContent>
          </Card>

          {/* Roles Table */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Roles</CardTitle>
              <CardDescription>
                Todos los roles registrados en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-[400px]">
                  <p className="text-muted-foreground">Cargando roles...</p>
                </div>
              ) : roles.length === 0 ? (
                <div className="flex items-center justify-center h-[400px]">
                  <p className="text-muted-foreground">No se encontraron roles</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium">ID</th>
                          <th className="text-left p-3 font-medium">Nombre</th>
                          <th className="text-left p-3 font-medium">Descripción</th>
                          <th className="text-left p-3 font-medium">Permisos</th>
                          <th className="text-left p-3 font-medium">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {roles.map((role) => (
                          <tr key={role.id} className="border-b hover:bg-accent/50">
                            <td className="p-3">{role.id}</td>
                            <td className="p-3">
                              <p className="font-medium">{role.name}</p>
                            </td>
                            <td className="p-3">
                              <p className="text-sm text-muted-foreground">
                                {role.description || "-"}
                              </p>
                            </td>
                            <td className="p-3">
                              {role.permissions && role.permissions.length > 0 ? (
                                <span className="text-sm">
                                  {role.permissions.length} permisos
                                </span>
                              ) : (
                                <span className="text-sm text-muted-foreground">Sin permisos</span>
                              )}
                            </td>
                            <td className="p-3">
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  asChild
                                  title="Editar rol"
                                >
                                  <a href={`/tecnologico/admin/roles/${role.id}/editar`}>
                                    <IconEdit className="h-4 w-4" />
                                  </a>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  asChild
                                  title="Asignar permisos"
                                >
                                  <a href={`/tecnologico/admin/roles/${role.id}/permisos`}>
                                    <IconKey className="h-4 w-4" />
                                  </a>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(role.id, role.name)}
                                  title="Eliminar rol"
                                  className="hover:bg-destructive/10 hover:text-destructive"
                                >
                                  <IconTrash className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Mostrando {roles.length} de {total} roles
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Anterior
                      </Button>
                      <div className="flex items-center gap-2 px-3">
                        <span className="text-sm">
                          Página {currentPage} de {totalPages}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </TechnologyLayout>
  )
}
