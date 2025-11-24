import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  IconUsers, 
  IconShieldLock, 
  IconKey, 
  IconActivity,
  IconBuilding,
  IconFileText,
  IconTarget,
  IconChartBar,
  IconMap,
  IconCalendar
} from "@tabler/icons-react"
import StrategicLayout from "../StrategicLayout"

export default function StrategicDashboard() {
  return (
    <StrategicLayout title="Dashboard - Gestión Estratégica">
      <div className="flex-1 space-y-6 p-4 md:p-6 pt-6">
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Panel de Gestión Estratégica</h2>
          <p className="text-muted-foreground">
            Bienvenido al sistema de gestión estratégica de la Universidad Nacional del Santa.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Planes Estratégicos
              </CardTitle>
              <IconMap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                Planes activos en desarrollo
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Objetivos
              </CardTitle>
              <IconTarget className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">48</div>
              <p className="text-xs text-muted-foreground">
                Objetivos estratégicos definidos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Indicadores
              </CardTitle>
              <IconChartBar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">127</div>
              <p className="text-xs text-muted-foreground">
                Indicadores de seguimiento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Organizaciones
              </CardTitle>
              <IconBuilding className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                Organizaciones vinculadas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Actividad Estratégica Reciente</CardTitle>
              <CardDescription>
                Últimas actualizaciones en planes y objetivos estratégicos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-4 rounded-md border p-4">
                  <IconTarget className="h-5 w-5 text-blue-500" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Nuevo objetivo estratégico agregado
                    </p>
                    <p className="text-xs text-muted-foreground">
                      "Mejorar la calidad educativa" - Plan 2024-2028
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">Hace 2 horas</p>
                </div>
                
                <div className="flex items-center space-x-4 rounded-md border p-4">
                  <IconChartBar className="h-5 w-5 text-green-500" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Indicador actualizado
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Tasa de graduación incrementó al 85%
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">Hace 4 horas</p>
                </div>

                <div className="flex items-center space-x-4 rounded-md border p-4">
                  <IconFileText className="h-5 w-5 text-orange-500" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Convenio firmado
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Nuevo convenio con Universidad Nacional de Trujillo
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">Ayer</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Accesos Rápidos</CardTitle>
              <CardDescription>
                Gestiona los componentes estratégicos del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <a
                href="/estrategico/admin/usuarios"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors border"
              >
                <IconUsers className="h-5 w-5 text-blue-500" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Gestionar Usuarios</p>
                  <p className="text-xs text-muted-foreground">Administrar usuarios del sistema</p>
                </div>
              </a>

              <a
                href="/estrategico/admin/organizaciones"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors border"
              >
                <IconBuilding className="h-5 w-5 text-green-500" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Organizaciones</p>
                  <p className="text-xs text-muted-foreground">Gestionar organizaciones vinculadas</p>
                </div>
              </a>

              <a
                href="/estrategico/admin/convenios"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors border"
              >
                <IconFileText className="h-5 w-5 text-purple-500" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Convenios</p>
                  <p className="text-xs text-muted-foreground">Administrar convenios estratégicos</p>
                </div>
              </a>

              <a
                href="/estrategico/planning/planes-estrategicos"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors border"
              >
                <IconMap className="h-5 w-5 text-orange-500" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Planes Estratégicos</p>
                  <p className="text-xs text-muted-foreground">Crear y gestionar planes</p>
                </div>
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <Card>
          <CardHeader>
            <CardTitle>Estado del Sistema Estratégico</CardTitle>
            <CardDescription>
              Información general del sistema de gestión estratégica
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">Sistema</p>
                    <p className="text-xs text-muted-foreground">Gestión Estratégica v2.1</p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                    Activo
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">Base de Datos</p>
                    <p className="text-xs text-muted-foreground">Conexión estable</p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                    Conectado
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">Usuarios Activos</p>
                    <p className="text-xs text-muted-foreground">Sesiones en las últimas 24h</p>
                  </div>
                  <span className="text-sm font-bold">127</span>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">Próximas Reuniones</p>
                    <p className="text-xs text-muted-foreground">Esta semana</p>
                  </div>
                  <span className="text-sm font-bold">5</span>
                </div>
              </div>
              

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">Reportes Pendientes</p>
                    <p className="text-xs text-muted-foreground">Por revisar</p>
                  </div>
                  <span className="text-sm font-bold text-orange-600">3</span>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">Alertas</p>
                    <p className="text-xs text-muted-foreground">Indicadores críticos</p>
                  </div>
                  <span className="text-sm font-bold text-red-600">2</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </StrategicLayout>
  )
}
