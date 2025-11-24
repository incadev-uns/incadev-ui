import { useState, useEffect } from "react"
import TechnologyLayout from "@/process/technology/TechnologyLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Download, Users, TrendingUp, AlertCircle, RefreshCw, FileText, BarChart3 } from "lucide-react"
import { technologyApi } from "@/services/tecnologico/api"
import type {
  AttendanceResponse,
  AttendanceStatusResponse,
  WeeklyTrendsResponse,
  AttendanceCalendarResponse,
  ChartFilters
} from "@/types/academic-analysis"
import { PieChartComponent } from "../components/charts/PieChart"
import { LineChartComponent } from "../components/charts/LineChart"
import { AttendanceCalendarHeatmap } from "../components/charts/AttendanceCalendarHeatmap"
import { StatsCard } from "../components/StatsCard"
import { DataTable } from "../components/DataTable"
import { AttendanceStatusColors, AttendanceStatusLabels } from "@/types/academic-analysis"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { AttendanceFilters } from "../components/filters/AttendanceFilters"

// Componente para mostrar estado vacío
function EmptyState({ 
  title, 
  description, 
  icon: Icon = FileText 
}: { 
  title: string; 
  description: string; 
  icon?: React.ComponentType<any> 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md">{description}</p>
    </div>
  )
}

export default function AttendancePage() {
  const [attendanceData, setAttendanceData] = useState<AttendanceResponse | null>(null)
  const [statusDistribution, setStatusDistribution] = useState<AttendanceStatusResponse | null>(null)
  const [weeklyTrends, setWeeklyTrends] = useState<WeeklyTrendsResponse | null>(null)
  const [attendanceCalendar, setAttendanceCalendar] = useState<AttendanceCalendarResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [exportLoading, setExportLoading] = useState(false)
  const [filters, setFilters] = useState<ChartFilters>({})
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [hasData, setHasData] = useState(true)

  // Cargar datos iniciales al montar el componente
  useEffect(() => {
    loadAllAttendanceData()
  }, [])

  // Función para cargar TODOS los datos con filtros
  const loadAllAttendanceData = async (currentFilters: ChartFilters = {}) => {
    try {
      setLoading(true)
      
      // Realizar TODAS las llamadas API con los mismos filtros (sin la API local)
      const [
        attendanceResponse, 
        statusResponse, 
        trendsResponse, 
        calendarResponse
      ] = await Promise.all([
        technologyApi.academicAnalysis.attendance.general(currentFilters),
        technologyApi.academicAnalysis.attendanceCharts.statusDistribution(currentFilters),
        technologyApi.academicAnalysis.attendanceCharts.weeklyTrends(currentFilters),
        technologyApi.academicAnalysis.attendanceCharts.attendanceCalendar(currentFilters)
      ])

      // Procesar todas las respuestas
      if (attendanceResponse.success) {
        setAttendanceData(attendanceResponse)
        
        // Verificar si hay datos
        const hasStudents = attendanceResponse.data?.student_level?.length > 0
        const hasGroups = attendanceResponse.data?.group_level?.length > 0
        const hasSummaryData = attendanceResponse.data?.summary?.total_students > 0
        
        setHasData(hasStudents || hasGroups || hasSummaryData)
      }

      if (statusResponse.success) {
        setStatusDistribution(statusResponse.data ?? null)
      }

      if (trendsResponse.success) {
        setWeeklyTrends(trendsResponse.data ?? null)
      }

      if (calendarResponse.success) {
        setAttendanceCalendar(calendarResponse.data ?? null)
      }

      // Actualizar timestamp
      setLastUpdate(new Date().toLocaleTimeString())

    } catch (error) {
      console.error("Error al cargar datos de asistencia:", error)
      toast.error("Error al cargar datos de asistencia")
      setHasData(false)
    } finally {
      setLoading(false)
    }
  }

  // Función para aplicar filtros (se llama desde el componente de filtros)
  const handleApplyFilters = (newFilters: ChartFilters) => {
    setFilters(newFilters)
    loadAllAttendanceData(newFilters)
  }

  // Función para recargar manualmente
  const handleRefresh = () => {
    loadAllAttendanceData(filters)
    toast.success("Datos actualizados")
  }

  // Función para exportar reportes
  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      setExportLoading(true)
      
      const blob = await technologyApi.academicAnalysis.attendance.export(filters, format)
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      
      const timestamp = new Date().toISOString().slice(0, 10)
      const extension = format === 'pdf' ? 'pdf' : 'xlsx'
      
      // Incluir información de filtros en el nombre del archivo
      let fileName = `reporte_asistencia_${timestamp}`
      if (filters.group_id) {
        fileName += `_grupo_${filters.group_id}`
      }
      if (filters.start_date || filters.end_date) {
        fileName += `_${filters.start_date || 'inicio'}_a_${filters.end_date || 'fin'}`
      }
      
      a.download = `${fileName}.${extension}`
      
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      toast.success(`Reporte exportado correctamente en formato ${format.toUpperCase()}`)
    } catch (error) {
      console.error('Error exportando reporte:', error)
      toast.error('Error al exportar el reporte')
    } finally {
      setExportLoading(false)
    }
  }

  // Procesar datos para gráficos
  const pieChartData = statusDistribution?.status_distribution?.flatMap(group => 
    group.statuses?.map(item => ({
      name: `${AttendanceStatusLabels[item.status as keyof typeof AttendanceStatusLabels] || item.status} - ${group.group_name}`,
      value: item.count,
      percentage: item.percentage,
      color: AttendanceStatusColors[item.status as keyof typeof AttendanceStatusColors]?.split(' ')[2] || '#6b7280'
    })) || []
  ) || []

  const lineChartData = weeklyTrends?.weekly_trends?.map(item => ({
    name: item.week_label,
    ausencias: item.absence_count,
    tasa: item.absence_rate
  })) || []

  // Calcular métricas para las cards
  const attendanceRate = attendanceData?.data?.summary?.avg_attendance_rate || 0
  const totalStudents = attendanceData?.data?.summary?.total_students || 0
  const totalSessions = attendanceData?.data?.summary?.total_sessions || 0
  const hasLowAttendance = attendanceRate < 80 && hasData

  // Información de filtros aplicados
  const hasActiveFilters = filters.group_id || filters.start_date || filters.end_date
  const filtersInfo = hasActiveFilters ? 
    `Filtros aplicados: ${filters.group_id ? `Grupo ${filters.group_id}` : ''} ${filters.start_date ? `Desde ${filters.start_date}` : ''} ${filters.end_date ? `Hasta ${filters.end_date}` : ''}` 
    : 'Mostrando todos los datos'

  if (loading && !attendanceData) {
    return (
      <TechnologyLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="text-muted-foreground">Cargando datos de asistencia...</p>
          </div>
        </div>
      </TechnologyLayout>
    )
  }

  return (
    <TechnologyLayout>
      <div className="space-y-6">
        {/* Header con gradiente */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-blue-400 p-6 text-white">
          <div className="relative z-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Análisis de Asistencia</h1>
                <p className="mt-1 text-blue-100">
                  Control y análisis detallado de la asistencia académica
                </p>
                {lastUpdate && (
                  <p className="text-blue-200 text-sm mt-2">
                    Última actualización: {lastUpdate}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {/* Botón de actualizar */}
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Actualizando...' : 'Actualizar'}
                </Button>

                {/* Dropdown para exportar */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      disabled={exportLoading || loading || !hasData}
                    >
                      {exportLoading ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Exportando...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          Exportar
                        </>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => handleExport('pdf')}
                      disabled={exportLoading || loading || !hasData}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Exportar como PDF
                    </DropdownMenuItem>
                    {/*<DropdownMenuItem 
                      onClick={() => handleExport('excel')}
                      disabled={exportLoading || loading || !hasData}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Exportar como Excel
                    </DropdownMenuItem>*/}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
          <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 backdrop-blur-3xl" />
        </div>

        {/* Filtros */}
        <AttendanceFilters 
          filters={filters}
          onFiltersChange={setFilters}
          onApplyFilters={handleApplyFilters}
          loading={loading}
        />

        {/* Estado sin datos */}
        {!hasData && !loading && (
          <Alert className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">No se encontraron datos</AlertTitle>
            <AlertDescription className="text-amber-700">
              No hay datos de asistencia disponibles para los filtros aplicados. 
              {hasActiveFilters && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-2 border-amber-300 text-amber-700 hover:bg-amber-100"
                  onClick={() => handleApplyFilters({})}
                >
                  Ver todos los datos
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Información de filtros */}
        {hasActiveFilters && hasData && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Filtros aplicados</AlertTitle>
            <AlertDescription>
              {filtersInfo}
            </AlertDescription>
          </Alert>
        )}

        {/* Alerta de asistencia baja */}
        {hasLowAttendance && hasData && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Atención requerida</AlertTitle>
            <AlertDescription>
              La tasa de asistencia promedio ({attendanceRate}%) está por debajo del objetivo mínimo de 80%.
            </AlertDescription>
          </Alert>
        )}

        {/* KPI Cards - Solo mostrar si hay datos */}
        {hasData && (
          <div className="grid gap-4 md:grid-cols-3">
            <StatsCard
              title="Total Estudiantes"
              value={totalStudents}
              icon={Users}
              variant="info"
              subtitle="Estudiantes registrados"
              loading={loading}
            />
            <StatsCard
              title="Tasa de Asistencia"
              value={`${attendanceRate}%`}
              icon={TrendingUp}
              variant={attendanceRate >= 80 ? "success" : "warning"}
              subtitle="Promedio general"
              loading={loading}
            />
            <StatsCard
              title="Total Sesiones"
              value={totalSessions}
              icon={Calendar}
              variant="default"
              subtitle="Clases registradas"
              loading={loading}
            />
          </div>
        )}

        {/* Tabs para organizar contenido - Solo mostrar si hay datos */}
        {hasData ? (
          <Tabs defaultValue="graficas" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
              <TabsTrigger value="graficas">Gráficas</TabsTrigger>
              <TabsTrigger value="estudiantes">Estudiantes</TabsTrigger>
              <TabsTrigger value="grupos">Grupos</TabsTrigger>
            </TabsList>

            <TabsContent value="graficas" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Distribución de Estados */}
                {pieChartData.length > 0 ? (
                  <PieChartComponent
                    data={pieChartData}
                    title="Distribución de Estados de Asistencia"
                    description={filtersInfo}
                    height={350}
                  />
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Distribución de Estados de Asistencia</CardTitle>
                      <CardDescription>
                        {filtersInfo}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <EmptyState
                        title="No hay datos para mostrar"
                        description="No se encontraron datos de distribución de estados para los filtros aplicados."
                        icon={BarChart3}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Tendencia Semanal */}
                {lineChartData.length > 0 ? (
                  <LineChartComponent
                    data={lineChartData}
                    lines={[
                      { key: 'ausencias', name: 'Número de Ausencias', color: '#ef4444' },
                      { key: 'tasa', name: 'Tasa de Ausencia (%)', color: '#f59e0b' }
                    ]}
                    title="Tendencia Semanal de Ausencias"
                    description={filtersInfo}
                  />
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Tendencia Semanal de Ausencias</CardTitle>
                      <CardDescription>
                        {filtersInfo}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <EmptyState
                        title="No hay datos para mostrar"
                        description="No se encontraron datos de tendencias semanales para los filtros aplicados."
                        icon={BarChart3}
                      />
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Calendario Heatmap */}
              {attendanceCalendar?.attendance_calendar && attendanceCalendar.attendance_calendar.length > 0 ? (
                <AttendanceCalendarHeatmap
                  data={attendanceCalendar.attendance_calendar}
                  title="Calendario de Asistencia"
                  description={filtersInfo}
                />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Calendario de Asistencia</CardTitle>
                    <CardDescription>
                      {filtersInfo}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <EmptyState
                      title="No hay datos para mostrar"
                      description="No se encontraron datos de calendario para los filtros aplicados."
                      icon={Calendar}
                    />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="estudiantes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Asistencia por Estudiante</CardTitle>
                  <CardDescription>
                    {filtersInfo}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {attendanceData?.data?.student_level && attendanceData.data.student_level.length > 0 ? (
                    <DataTable
                      data={attendanceData.data.student_level}
                      searchable
                      searchPlaceholder="Buscar estudiante..."
                      columns={[
                        {
                          key: 'student_name',
                          label: 'Estudiante',
                          sortable: true,
                          render: (value, item) => (
                            <div>
                              <p className="font-medium">{value}</p>
                              <p className="text-xs text-muted-foreground">{item.group_name}</p>
                            </div>
                          )
                        },
                        {
                          key: 'total_sessions',
                          label: 'Sesiones',
                          sortable: true,
                          className: "text-center"
                        },
                        {
                          key: 'present_count',
                          label: 'Presentes',
                          sortable: true,
                          className: "text-center",
                          render: (value) => (
                            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                              {value}
                            </Badge>
                          )
                        },
                        {
                          key: 'absent_count',
                          label: 'Ausentes',
                          sortable: true,
                          className: "text-center",
                          render: (value) => (
                            <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
                              {value}
                            </Badge>
                          )
                        },
                        {
                          key: 'attendance_rate',
                          label: 'Tasa',
                          sortable: true,
                          className: "text-right",
                          render: (value) => (
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${value >= 80 ? 'bg-green-500' : value >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                  style={{ width: `${value}%` }}
                                />
                              </div>
                              <span className="font-medium">{value}%</span>
                            </div>
                          )
                        }
                      ]}
                    />
                  ) : (
                    <EmptyState
                      title="No hay estudiantes para mostrar"
                      description="No se encontraron datos de estudiantes para los filtros aplicados."
                      icon={Users}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="grupos" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Asistencia por Grupo</CardTitle>
                  <CardDescription>
                    {filtersInfo}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {attendanceData?.data?.group_level && attendanceData.data.group_level.length > 0 ? (
                    <div className="space-y-4">
                      {attendanceData.data.group_level.map((group) => (
                        <div 
                          key={group.group_id} 
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-lg">{group.group_name}</p>
                            <p className="text-sm text-muted-foreground">{group.course_name}</p>
                            <p className="text-xs text-muted-foreground mt-1">{group.course_version}</p>
                          </div>
                          <div className="text-right space-y-2">
                            <div>
                              <p className="text-2xl font-bold text-primary">
                                {group.avg_attendance_rate}%
                              </p>
                              <p className="text-xs text-muted-foreground">Asistencia promedio</p>
                            </div>
                            <Badge variant="secondary">
                              {group.total_students} estudiantes
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="No hay grupos para mostrar"
                      description="No se encontraron datos de grupos para los filtros aplicados."
                      icon={Users}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          // Estado vacío general cuando no hay datos
          !loading && (
            <Card>
              <CardContent className="pt-6">
                <EmptyState
                  title="No hay datos de asistencia"
                  description="No se encontraron registros de asistencia para los criterios seleccionados. Intenta con otros filtros o verifica la configuración."
                  icon={BarChart3}
                />
                {hasActiveFilters && (
                  <div className="text-center mt-4">
                    <Button 
                      onClick={() => handleApplyFilters({})}
                      variant="outline"
                    >
                      Ver todos los datos
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        )}
      </div>
    </TechnologyLayout>
  )
}