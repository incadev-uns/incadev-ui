import TechnologyLayout from "@/process/technology/TechnologyLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { IconUsers, IconShieldLock, IconKey, IconActivity } from "@tabler/icons-react"

export default function AdminDashboard() {
  return (
    <TechnologyLayout title="Dashboard - Administración">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight">Bienvenido al Panel de Administración</h2>
        <p className="text-muted-foreground">
          Gestiona usuarios, roles y permisos del sistema de procesos tecnológicos.
        </p>
      </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Usuarios
                </CardTitle>
                <IconUsers className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">
                  Usuarios registrados en el sistema
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Roles Activos
                </CardTitle>
                <IconShieldLock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">
                  Roles configurados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Permisos
                </CardTitle>
                <IconKey className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">
                  Permisos del sistema
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Actividad
                </CardTitle>
                <IconActivity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">
                  Sesiones activas
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
                <CardDescription>
                  Últimas acciones realizadas en el sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  <p>No hay actividad reciente para mostrar</p>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Accesos Rápidos</CardTitle>
                <CardDescription>
                  Gestiona los recursos del sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <a
                  href="/tecnologico/admin/usuarios"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <IconUsers className="h-5 w-5" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Gestionar Usuarios</p>
                    <p className="text-xs text-muted-foreground">Crear, editar y eliminar usuarios</p>
                  </div>
                </a>

                <a
                  href="/tecnologico/admin/roles"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <IconShieldLock className="h-5 w-5" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Gestionar Roles</p>
                    <p className="text-xs text-muted-foreground">Configurar roles del sistema</p>
                  </div>
                </a>

                <a
                  href="/tecnologico/admin/permisos"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <IconKey className="h-5 w-5" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Gestionar Permisos</p>
                    <p className="text-xs text-muted-foreground">Administrar permisos de acceso</p>
                  </div>
                </a>
              </CardContent>
            </Card>
          </div>

          {/* Info Section */}
          <Card>
            <CardHeader>
              <CardTitle>Estado del Sistema</CardTitle>
              <CardDescription>
                Información general del sistema de procesos tecnológicos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Versión del Sistema</p>
                    <p className="text-xs text-muted-foreground">Sistema en desarrollo</p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                    Activo
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">API REST</p>
                    <p className="text-xs text-muted-foreground">Conectado al backend de Laravel</p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                    Conectado
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Autenticación</p>
                    <p className="text-xs text-muted-foreground">Laravel Sanctum + 2FA</p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                    Configurado
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
    </TechnologyLayout>
  )
}