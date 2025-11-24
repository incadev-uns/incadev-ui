import { useState, useEffect } from "react"
import TechnologyLayout from "@/process/technology/TechnologyLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Award, TrendingUp, Target, AlertTriangle, RefreshCw } from "lucide-react"
import { technologyApi } from "@/services/tecnologico/api"
import type { 
  PerformanceResponse, 
  GradeDistributionResponse,
  AttendanceGradeCorrelationResponse,
  GroupPerformanceResponse,
  ChartFilters 
} from "@/types/academic-analysis"
import { 
  EnrollmentStatusLabels, 
  EnrollmentStatusColors
} from "@/types/academic-analysis"
import { BarChartComponent } from "../components/charts/BarChart"
import { ScatterChartComponent } from "../components/charts/ScatterChart"
import { RadarChartComponent } from "../components/charts/RadarChart"
import { StatsCard } from "../components/StatsCard"
import { DataTable } from "../components/DataTable"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { PerformanceFilters } from "../components/filters/PerformanceFilters"

export default function PerformancePage() {
  const [performanceData, setPerformanceData] = useState<PerformanceResponse | null>(null)
  const [gradeDistribution, setGradeDistribution] = useState<GradeDistributionResponse | null>(null)
  const [correlationData, setCorrelationData] = useState<AttendanceGradeCorrelationResponse | null>(null)
  const [groupPerformance, setGroupPerformance] = useState<GroupPerformanceResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [exportLoading, setExportLoading] = useState(false)
  const [filters, setFilters] = useState<ChartFilters>({})
  const [lastUpdate, setLastUpdate] = useState<string>('')

  // Cargar datos iniciales al montar el componente
  useEffect(() => {
    loadAllPerformanceData()
  }, [])

  // Función para cargar TODOS los datos con filtros
  const loadAllPerformanceData = async (currentFilters: ChartFilters = {}) => {
    try {
      setLoading(true)
      
      // Realizar TODAS las llamadas API con los mismos filtros
      const [
        performanceResponse, 
        distributionResponse, 
        correlationResponse, 
        groupResponse
      ] = await Promise.all([
        technologyApi.academicAnalysis.performance.general(currentFilters),
        technologyApi.academicAnalysis.performanceCharts.gradeDistribution(currentFilters),
        technologyApi.academicAnalysis.performanceCharts.attendanceGradeCorrelation(currentFilters),
        technologyApi.academicAnalysis.performanceCharts.groupPerformance(currentFilters)
      ])

      // Procesar todas las respuestas
      if (performanceResponse.success) {
        setPerformanceData(performanceResponse)
      }

      if (distributionResponse.success) {
        setGradeDistribution(distributionResponse.data ?? null)
      }

      if (correlationResponse.success) {
        setCorrelationData(correlationResponse.data ?? null)
      }

      if (groupResponse.success) {
        setGroupPerformance(groupResponse.data ?? null)
      }

      // Actualizar timestamp
      setLastUpdate(new Date().toLocaleTimeString())

    } catch (error) {
      console.error("Error al cargar datos de rendimiento:", error)
      toast.error("Error al cargar datos de rendimiento")
    } finally {
      setLoading(false)
    }
  }

  // Función para aplicar filtros (se llama desde el componente de filtros)
  const handleApplyFilters = (newFilters: ChartFilters) => {
    setFilters(newFilters)
    loadAllPerformanceData(newFilters)
  }

  // Función para recargar manualmente
  const handleRefresh = () => {
    loadAllPerformanceData(filters)
    toast.success("Datos actualizados")
  }

  // Función para exportar reportes
  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      setExportLoading(true)
      
      const blob = await technologyApi.academicAnalysis.performance.export(filters, format)
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      
      const timestamp = new Date().toISOString().slice(0, 10)
      const extension = format === 'pdf' ? 'pdf' : 'xlsx'
      
      // Incluir información de filtros en el nombre del archivo
      let fileName = `reporte_rendimiento_${timestamp}`
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
  const barChartData = gradeDistribution?.grade_distribution?.map(item => ({
    name: item.grade_range,
    estudiantes: item.student_count,
    status: item.status
  })) || []

  const scatterData = correlationData?.scatter_data?.map(item => ({
    x: item.attendance_rate,
    y: item.avg_grade,
    name: item.student_name,
    group: item.group_name,
    status: item.academic_status
  })) || []

  // Calcular métricas para las cards
  const approvalRate = performanceData?.data?.summary?.overall_approval_rate || 0
  const totalStudents = performanceData?.data?.summary?.total_students || 0
  const avgGrade = performanceData?.data?.summary?.overall_avg_grade || 0
  const hasLowApproval = approvalRate < 70

  // Información de filtros aplicados
  const hasActiveFilters = filters.group_id || filters.start_date || filters.end_date
  const filtersInfo = hasActiveFilters ? 
    `Filtros aplicados: ${filters.group_id ? `Grupo ${filters.group_id}` : ''} ${filters.start_date ? `Desde ${filters.start_date}` : ''} ${filters.end_date ? `Hasta ${filters.end_date}` : ''}` 
    : 'Mostrando todos los datos'

  if (loading && !performanceData) {
    return (
      <TechnologyLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="text-muted-foreground">Cargando datos de rendimiento...</p>
          </div>
        </div>
      </TechnologyLayout>
    )
  }

  return (
    <TechnologyLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-purple-600 to-purple-400 p-6 text-white">
          <div className="relative z-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Análisis de Rendimiento</h1>
                <p className="mt-1 text-purple-100">
                  Evaluación integral del rendimiento académico y calificaciones
                </p>
                {lastUpdate && (
                  <p className="text-purple-200 text-sm mt-2">
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
                      disabled={exportLoading || loading}
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
                      disabled={exportLoading || loading}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Exportar como PDF
                    </DropdownMenuItem>
                    {/*<DropdownMenuItem 
                      onClick={() => handleExport('excel')}
                      disabled={exportLoading || loading}
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
        <PerformanceFilters 
          filters={filters}
          onFiltersChange={setFilters}
          onApplyFilters={handleApplyFilters}
          loading={loading}
        />

        {/* Información de filtros */}
        {hasActiveFilters && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Filtros aplicados</AlertTitle>
            <AlertDescription>
              {filtersInfo}
            </AlertDescription>
          </Alert>
        )}

        {/* Alerta de aprobación baja */}
        {hasLowApproval && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Tasa de aprobación por debajo del objetivo</AlertTitle>
            <AlertDescription>
              La tasa de aprobación general ({approvalRate}%) está por debajo del objetivo mínimo de 70%. 
              Se recomienda implementar estrategias de mejora.
            </AlertDescription>
          </Alert>
        )}

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatsCard
            title="Total Estudiantes"
            value={totalStudents}
            icon={Award}
            variant="info"
            subtitle="Estudiantes evaluados"
            loading={loading}
          />
          <StatsCard
            title="Tasa de Aprobación"
            value={`${approvalRate}%`}
            icon={Target}
            variant={approvalRate >= 70 ? "success" : "danger"}
            subtitle="Objetivo: ≥70%"
            loading={loading}
          />
          <StatsCard
            title="Promedio General"
            value={avgGrade.toFixed(2)}
            icon={TrendingUp}
            variant={avgGrade >= 14 ? "success" : "warning"}
            subtitle="Escala vigesimal"
            loading={loading}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="graficas" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="graficas">Gráficas</TabsTrigger>
            <TabsTrigger value="estudiantes">Estudiantes</TabsTrigger>
            <TabsTrigger value="cursos">Cursos</TabsTrigger>
          </TabsList>

          <TabsContent value="graficas" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Distribución de Calificaciones */}
              {barChartData.length > 0 && (
                <BarChartComponent 
                  data={barChartData}
                  bars={[
                    { key: 'estudiantes', name: 'Estudiantes', color: 'hsl(var(--chart-1))' }
                  ]}
                  title="Distribución de Calificaciones"
                  description={filtersInfo}
                />
              )}

              {/* Correlación */}
              {scatterData.length > 0 && (
                <ScatterChartComponent 
                  data={scatterData}
                  xAxis={{ key: 'x', name: 'Tasa de Asistencia (%)' }}
                  yAxis={{ key: 'y', name: 'Calificación Promedio' }}
                  title="Correlación Asistencia vs Calificación"
                  description={
                    <div className="flex items-center gap-2">
                      {filtersInfo}
                      {correlationData?.correlation && (
                        <Badge variant="outline" className="ml-2">
                          Coef. correlación: {correlationData.correlation.toFixed(3)}
                        </Badge>
                      )}
                    </div>
                  }
                />
              )}
            </div>

            {/* Radar Chart */}
            {groupPerformance?.group_performance && groupPerformance.group_performance.length > 0 && (
              <RadarChartComponent 
                data={groupPerformance.group_performance}
                title="Rendimiento Comparativo por Grupo"
                description={filtersInfo}
              />
            )}
          </TabsContent>

          <TabsContent value="estudiantes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Rendimiento Estudiantil Detallado</CardTitle>
                <CardDescription>
                  {filtersInfo}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {performanceData?.data?.student_performance && performanceData.data.student_performance.length > 0 ? (
                  <DataTable
                    data={performanceData.data.student_performance}
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
                        key: 'final_grade',
                        label: 'Nota Final',
                        sortable: true,
                        className: "text-center",
                        render: (value) => (
                          <span className="text-lg font-bold">
                            {value !== null ? value.toFixed(2) : 'N/A'}
                          </span>
                        )
                      },
                      {
                        key: 'attendance_percentage',
                        label: 'Asistencia',
                        sortable: true,
                        className: "text-center",
                        render: (value) => (
                          <Badge variant="outline" className={
                            value >= 80 ? "bg-green-500/10 text-green-600 border-green-500/20" :
                            value >= 60 ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" :
                            "bg-red-500/10 text-red-600 border-red-500/20"
                          }>
                            {value !== null ? `${value}%` : 'N/A'}
                          </Badge>
                        )
                      },
                      {
                        key: 'total_exams_taken',
                        label: 'Exámenes',
                        sortable: true,
                        className: "text-center"
                      },
                      {
                        key: 'enrollment_status',
                        label: 'Estado',
                        sortable: true,
                        className: "text-center",
                        render: (value) => {
                          if (!value) return <Badge variant="secondary">Pendiente</Badge>
                          const statusKey = value as keyof typeof EnrollmentStatusLabels
                          return (
                            <Badge 
                              variant="outline" 
                              className={EnrollmentStatusColors[statusKey] || "bg-gray-500/10 text-gray-600 border-gray-200"}
                            >
                              {EnrollmentStatusLabels[statusKey] || value}
                            </Badge>
                          )
                        }
                      }
                    ]}
                  />
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    {loading ? 'Cargando datos...' : 'No hay datos de estudiantes disponibles'}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cursos" className="space-y-4">
            <div className="grid gap-4">
              {performanceData?.data?.course_performance && performanceData.data.course_performance.map((course) => (
                <Card key={course.group_id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{course.group_name}</CardTitle>
                        <CardDescription className="mt-1">
                          {course.course_name} • {course.course_version}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={
                          course.approval_rate >= 70 ? "bg-green-500/10 text-green-600 border-green-500/20" :
                          course.approval_rate >= 50 ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" :
                          "bg-red-500/10 text-red-600 border-red-500/20"
                        }
                      >
                        {course.approval_rate}% Aprobación
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Estudiantes</p>
                        <p className="text-2xl font-bold">{course.total_students}</p>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Promedio</p>
                        <p className="text-2xl font-bold">
                          {course.avg_final_grade ? course.avg_final_grade.toFixed(2) : 'N/A'}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Asistencia</p>
                        <p className="text-2xl font-bold">
                          {course.avg_attendance ? `${course.avg_attendance}%` : 'N/A'}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Aprobados</p>
                        <p className="text-2xl font-bold text-green-600">
                          {course.approved_students}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {(!performanceData?.data.course_performance || performanceData.data.course_performance.length === 0) && (
                <Card>
                  <CardContent className="py-8">
                    <p className="text-center text-muted-foreground">
                      {loading ? 'Cargando datos...' : 'No hay datos de cursos disponibles'}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </TechnologyLayout>
  )
}