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
  IconUserPlus,
  IconShieldLock,
  IconKey
} from "@tabler/icons-react"
import { technologyApi, type User, type ApiResponse, type PaginatedResponse } from "@/services/tecnologico/api"
import { toast } from "sonner"

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const perPage = 10

  useEffect(() => {
    loadUsers()
  }, [currentPage, search])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await technologyApi.users.list(currentPage, perPage, search)

      if (response.success && response.data) {
        setUsers(response.data.data)
        setTotalPages(response.data.last_page)
        setTotal(response.data.total)
      } else {
        toast.error("Error al cargar usuarios", {
          description: response.message || "No se pudieron cargar los usuarios"
        })
      }
    } catch (error) {
      console.error("Error loading users:", error)
      toast.error("Error de conexión", {
        description: "No se pudo conectar con el servidor"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar al usuario "${name}"?`)) {
      return
    }

    try {
      const response = await technologyApi.users.delete(id)

      if (response.success) {
        toast.success("Usuario eliminado", {
          description: `El usuario ${name} ha sido eliminado exitosamente`
        })
        loadUsers()
      } else {
        toast.error("Error al eliminar", {
          description: response.message || "No se pudo eliminar el usuario"
        })
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      toast.error("Error de conexión", {
        description: "No se pudo conectar con el servidor"
      })
    }
  }

  return (
    <TechnologyLayout title="Gestión de Usuarios">
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Gestión de Usuarios</h2>
              <p className="text-muted-foreground">
                Administra los usuarios del sistema ({total} usuarios)
              </p>
            </div>
            <Button asChild>
              <a href="/tecnologico/admin/usuarios/crear">
                <IconPlus className="mr-2 h-4 w-4" />
                Crear Usuario
              </a>
            </Button>
          </div>

          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle>Buscar Usuarios</CardTitle>
              <CardDescription>
                Busca usuarios por nombre, email o DNI
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
                <Button onClick={() => loadUsers()}>Buscar</Button>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Usuarios</CardTitle>
              <CardDescription>
                Todos los usuarios registrados en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-[400px]">
                  <p className="text-muted-foreground">Cargando usuarios...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="flex items-center justify-center h-[400px]">
                  <p className="text-muted-foreground">No se encontraron usuarios</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium">ID</th>
                          <th className="text-left p-3 font-medium">Nombre</th>
                          <th className="text-left p-3 font-medium">Email</th>
                          <th className="text-left p-3 font-medium">DNI</th>
                          <th className="text-left p-3 font-medium">Roles</th>
                          <th className="text-left p-3 font-medium">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id} className="border-b hover:bg-accent/50">
                            <td className="p-3">{user.id}</td>
                            <td className="p-3">
                              <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-xs text-muted-foreground">{user.fullname}</p>
                              </div>
                            </td>
                            <td className="p-3">{user.email}</td>
                            <td className="p-3">{user.dni || "-"}</td>
                            <td className="p-3">
                              {user.roles && user.roles.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {user.roles.map((role) => (
                                    <span
                                      key={role}
                                      className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20"
                                    >
                                      {role}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">Sin roles</span>
                              )}
                            </td>
                            <td className="p-3">
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  asChild
                                  title="Editar usuario"
                                >
                                  <a href={`/tecnologico/admin/usuarios/editar?id=${user.id}`}>
                                    <IconEdit className="h-4 w-4" />
                                  </a>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  asChild
                                  title="Asignar roles"
                                >
                                  <a href={`/tecnologico/admin/usuarios/roles?id=${user.id}`}>
                                    <IconShieldLock className="h-4 w-4" />
                                  </a>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  asChild
                                  title="Asignar permisos"
                                >
                                  <a href={`/tecnologico/admin/usuarios/permisos?id=${user.id}`}>
                                    <IconKey className="h-4 w-4" />
                                  </a>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(user.id, user.name)}
                                  title="Eliminar usuario"
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
                      Mostrando {users.length} de {total} usuarios
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
