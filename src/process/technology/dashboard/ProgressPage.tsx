import { useState, useEffect } from "react"
import TechnologyLayout from "@/process/technology/TechnologyLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, TrendingUp, BookOpen, CheckCircle, Activity, Clock, Users, Target, RefreshCw, AlertCircle } from "lucide-react"
import { technologyApi } from "@/services/tecnologico/api"
import type { 
  ProgressResponse,
  GradeEvolutionResponse,
  ChartFilters 
} from "@/types/academic-analysis"
import { LineChartComponent } from "../components/charts/LineChart"
import { StatsCard } from "../components/StatsCard"
import { DataTable } from "../components/DataTable"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { ProgressFilters } from "../components/filters/ProgressFilters"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ProgressPage() {
  const [progressData, setProgressData] = useState<ProgressResponse | null>(null)
  const [gradeEvolution, setGradeEvolution] = useState<GradeEvolutionResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [exportLoading, setExportLoading] = useState(false)
  const [filters, setFilters] = useState<ChartFilters>({})
  const [viewMode, setViewMode] = useState<"grouped" | "individual">("grouped")
  const [lastUpdate, setLastUpdate] = useState<string>('')

  // Cargar datos iniciales al montar el componente
  useEffect(() => {
    loadAllProgressData()
  }, [])

  // Función para cargar TODOS los datos con filtros
  const loadAllProgressData = async (currentFilters: ChartFilters = {}) => {
    try {
      setLoading(true)
      
      // Realizar TODAS las llamadas API con los mismos filtros
      const [progressResponse, evolutionResponse] = await Promise.all([
        technologyApi.academicAnalysis.progress.general(currentFilters),
        technologyApi.academicAnalysis.progressCharts.gradeEvolution(currentFilters)
      ])

      if (progressResponse.success) {
        setProgressData(progressResponse)
      }

      if (evolutionResponse.success) {
        setGradeEvolution(evolutionResponse.data ?? null)
      }

      // Actualizar timestamp
      setLastUpdate(new Date().toLocaleTimeString())

    } catch (error) {
      console.error("Error al cargar datos de progreso:", error)
      toast.error("Error al cargar datos de progreso")
    } finally {
      setLoading(false)
    }
  }

  // Función para aplicar filtros (se llama desde el componente de filtros)
  const handleApplyFilters = (newFilters: ChartFilters) => {
    setFilters(newFilters)
    loadAllProgressData(newFilters)
  }

  // Función para recargar manualmente
  const handleRefresh = () => {
    loadAllProgressData(filters)
    toast.success("Datos actualizados")
  }

  // Función para exportar reportes
  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      setExportLoading(true)
      
      const blob = await technologyApi.academicAnalysis.progress.export(filters, format)
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      
      const timestamp = new Date().toISOString().slice(0, 10)
      const extension = format === 'pdf' ? 'pdf' : 'xlsx'
      
      // Incluir información de filtros en el nombre del archivo
      let fileName = `reporte_progreso_${timestamp}`
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

  // Procesar datos para gráficos - VERSIÓN CORREGIDA
  const prepareGroupedEvolutionData = () => {
    if (!gradeEvolution?.grade_evolution || gradeEvolution.grade_evolution.length === 0) {
      return { chartData: [], groups: {}, quartiles: { q1: 0, q2: 0, q3: 0 } }
    }

    // Calcular promedio por estudiante
    const studentAverages: Record<string, number> = {}
    const studentGrades: Record<string, number[]> = {}
    
    gradeEvolution.grade_evolution.forEach(item => {
      if (!studentGrades[item.student_name]) {
        studentGrades[item.student_name] = []
      }
      studentGrades[item.student_name].push(item.grade)
    })
    
    Object.keys(studentGrades).forEach(student => {
      const grades = studentGrades[student]
      studentAverages[student] = grades.reduce((a, b) => a + b, 0) / grades.length
    })

    // Validar que hay promedios para calcular cuartiles
    const averages = Object.values(studentAverages)
    if (averages.length === 0) {
      return { chartData: [], groups: {}, quartiles: { q1: 0, q2: 0, q3: 0 } }
    }

    // Calcular cuartiles
    const sortedAverages = [...averages].sort((a, b) => a - b)
    const q1 = sortedAverages[Math.floor(sortedAverages.length * 0.25)] || 0 // Percentil 25
    const q2 = sortedAverages[Math.floor(sortedAverages.length * 0.5)] || 0  // Mediana (Percentil 50)
    const q3 = sortedAverages[Math.floor(sortedAverages.length * 0.75)] || 0 // Percentil 75

    // Crear grupos por cuartiles
    const groups = {
      alto: { 
        students: [] as string[], 
        color: 'hsl(var(--chart-1))',
        range: `≥ ${q3.toFixed(1)}`,
        avg: 0
      },
      medioAlto: { 
        students: [] as string[], 
        color: 'hsl(var(--chart-2))',
        range: `${q2.toFixed(1)} - ${q3.toFixed(1)}`,
        avg: 0
      },
      medioBajo: { 
        students: [] as string[], 
        color: 'hsl(var(--chart-3))',
        range: `${q1.toFixed(1)} - ${q2.toFixed(1)}`,
        avg: 0
      },
      bajo: { 
        students: [] as string[], 
        color: 'hsl(var(--chart-4))',
        range: `< ${q1.toFixed(1)}`,
        avg: 0
      }
    }

    // Asignar estudiantes a grupos
    Object.entries(studentAverages).forEach(([student, avg]) => {
      if (avg >= q3) groups.alto.students.push(student)
      else if (avg >= q2) groups.medioAlto.students.push(student)
      else if (avg >= q1) groups.medioBajo.students.push(student)
      else groups.bajo.students.push(student)
    })

    // Calcular promedio de cada grupo
    Object.keys(groups).forEach(groupKey => {
      const group = groups[groupKey as keyof typeof groups]
      const groupAverages = group.students.map(student => studentAverages[student])
      group.avg = groupAverages.length > 0 
        ? groupAverages.reduce((a, b) => a + b, 0) / groupAverages.length 
        : 0
    })

    // Preparar datos para gráfico
    const chartData: Array<{name: string} & Record<string, number | string>> = []
    const allExams = [...new Set(gradeEvolution.grade_evolution.map(item => item.exam_title))]
    
    allExams.forEach(examTitle => {
      const dataPoint: {name: string} & Record<string, number | string> = { name: examTitle }
      
      Object.keys(groups).forEach(groupKey => {
        const group = groups[groupKey as keyof typeof groups]
        const groupGrades = gradeEvolution.grade_evolution
          .filter(item => group.students.includes(item.student_name) && item.exam_title === examTitle)
          .map(item => item.grade)
        
        dataPoint[groupKey] = groupGrades.length > 0 
          ? groupGrades.reduce((a, b) => a + b, 0) / groupGrades.length 
          : 0
      })
      
      chartData.push(dataPoint)
    })

    return { chartData, groups, quartiles: { q1, q2, q3 } }
  }

  // Líneas para los grupos de rendimiento - VERSIÓN CORREGIDA
  const getGroupedEvolutionLines = (groups: any) => {
    if (!groups || Object.keys(groups).length === 0) {
      return []
    }

    const groupLabels = {
      alto: 'Alto Rendimiento',
      medioAlto: 'Medio-Alto',
      medioBajo: 'Medio-Bajo', 
      bajo: 'Bajo Rendimiento'
    }

    return Object.entries(groups).map(([key, group]: [string, any]) => ({
      key,
      name: `${groupLabels[key as keyof typeof groupLabels]} (${group.students.length} est.)`,
      color: group.color,
      description: `Promedio: ${group.avg.toFixed(1)} | Rango: ${group.range}`
    }))
  }

  // Función para datos individuales - VERSIÓN CORREGIDA
  const prepareIndividualEvolutionData = () => {
    if (!gradeEvolution?.grade_evolution || gradeEvolution.grade_evolution.length === 0) {
      return []
    }

    // Limitar a 5 estudiantes para evitar saturación
    const uniqueStudents = [...new Set(gradeEvolution.grade_evolution.map(item => item.student_name))].slice(0, 5)
    
    const studentData: Record<string, Array<{name: string, calificacion: number}>> = {}
    
    gradeEvolution.grade_evolution.forEach(item => {
      if (uniqueStudents.includes(item.student_name)) {
        if (!studentData[item.student_name]) {
          studentData[item.student_name] = []
        }
        studentData[item.student_name].push({
          name: item.exam_title,
          calificacion: item.grade
        })
      }
    })

    const chartData: Array<{name: string} & Record<string, number | string>> = []
    const allExams = [...new Set(gradeEvolution.grade_evolution.map(item => item.exam_title))]
    
    allExams.forEach(examTitle => {
      const dataPoint: {name: string} & Record<string, number | string> = { name: examTitle }
      
      uniqueStudents.forEach(studentName => {
        const studentExam = studentData[studentName]?.find(item => item.name === examTitle)
        dataPoint[studentName] = studentExam ? studentExam.calificacion : 0
      })
      
      chartData.push(dataPoint)
    })

    return chartData
  }

  // Función para líneas individuales - VERSIÓN CORREGIDA
  const getIndividualEvolutionLines = () => {
    if (!gradeEvolution?.grade_evolution || gradeEvolution.grade_evolution.length === 0) {
      return []
    }
    
    const uniqueStudents = [...new Set(gradeEvolution.grade_evolution.map(item => item.student_name))].slice(0, 5)
    const colors = [
      'hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))',
      'hsl(var(--chart-4))', 'hsl(var(--chart-5))'
    ]
    
    return uniqueStudents.map((studentName, index) => ({
      key: studentName,
      name: studentName,
      color: colors[index % colors.length]
    }))
  }

  const { chartData: groupedChartData, groups, quartiles } = prepareGroupedEvolutionData()
  const individualChartData = prepareIndividualEvolutionData()
  const groupedLines = getGroupedEvolutionLines(groups)
  const individualLines = getIndividualEvolutionLines()

  const currentChartData = viewMode === "grouped" ? groupedChartData : individualChartData
  const currentLines = viewMode === "grouped" ? groupedLines : individualLines

  // Calcular métricas para las cards
  const completionRate = progressData?.data?.summary?.avg_completion_rate || 0
  const avgGrade = progressData?.data?.summary?.avg_grade || 0
  const totalStudents = progressData?.data?.summary?.total_students || 0
  const hasLowCompletion = completionRate < 70 && completionRate > 0
  const hasLowGrades = avgGrade < 11 && avgGrade > 0
  const hasNoData = totalStudents === 0

  // Información de filtros aplicados
  const hasActiveFilters = filters.group_id || filters.start_date || filters.end_date
  const filtersInfo = hasActiveFilters ? 
    `Filtros aplicados: ${filters.group_id ? `Grupo ${filters.group_id}` : ''} ${filters.start_date ? `Desde ${filters.start_date}` : ''} ${filters.end_date ? `Hasta ${filters.end_date}` : ''}` 
    : 'Mostrando todos los datos'

  if (loading && !progressData) {
    return (
      <TechnologyLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="text-muted-foreground">Cargando datos de progreso...</p>
          </div>
        </div>
      </TechnologyLayout>
    )
  }

  return (
    <TechnologyLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-400 p-6 text-white">
          <div className="relative z-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Análisis de Progreso</h1>
                <p className="mt-1 text-emerald-100">
                  Seguimiento integral del progreso académico y completación de módulos
                </p>
                {lastUpdate && (
                  <p className="text-emerald-200 text-sm mt-2">
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

        {/* ✅ INTEGRAR FILTROS */}
        <ProgressFilters 
          filters={filters}
          onFiltersChange={setFilters}
          onApplyFilters={handleApplyFilters}
          loading={loading}
        />

        {/* Información de filtros */}
        {hasActiveFilters && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Filtros aplicados</AlertTitle>
            <AlertDescription>
              {filtersInfo}
            </AlertDescription>
          </Alert>
        )}

        {/* Alertas cuando no hay datos */}
        {hasNoData && (
          <Alert variant="default">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Sin datos disponibles</AlertTitle>
            <AlertDescription>
              No se encontraron datos de progreso para los filtros seleccionados.
              {hasActiveFilters && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-2"
                  onClick={() => setFilters({})}
                >
                  Limpiar filtros
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Alertas de progreso bajo */}
        {!hasNoData && hasLowCompletion && (
          <Alert variant="default">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Atención requerida</AlertTitle>
            <AlertDescription>
              La tasa de completación de módulos ({completionRate}%) está por debajo del objetivo mínimo de 70%.
            </AlertDescription>
          </Alert>
        )}

        {!hasNoData && hasLowGrades && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Rendimiento académico bajo</AlertTitle>
            <AlertDescription>
              El promedio de calificaciones ({avgGrade.toFixed(2)}) está por debajo del nivel satisfactorio de 11.
            </AlertDescription>
          </Alert>
        )}

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatsCard
            title="Tasa de Completación"
            value={completionRate > 0 ? `${completionRate}%` : "0%"}
            icon={CheckCircle}
            variant={completionRate >= 70 ? "success" : completionRate > 0 ? "warning" : "default"}
            subtitle="Progreso promedio de módulos"
            loading={loading}
          />
          <StatsCard
            title="Promedio de Calificaciones"
            value={avgGrade > 0 ? avgGrade.toFixed(2) : "0.00"}
            icon={TrendingUp}
            variant={avgGrade >= 11 ? "success" : avgGrade > 0 ? "danger" : "default"}
            subtitle="Rendimiento académico general"
            loading={loading}
          />
          <StatsCard
            title="Estudiantes Activos"
            value={totalStudents}
            icon={BookOpen}
            variant="info"
            subtitle="En progreso académico actual"
            loading={loading}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="modulos" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:w-[500px]">
            <TabsTrigger value="modulos">Módulos</TabsTrigger>
            <TabsTrigger value="consistencia">Consistencia</TabsTrigger>
            <TabsTrigger value="evolucion">Evolución</TabsTrigger>
          </TabsList>

          <TabsContent value="modulos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Completación de Módulos por Estudiante</CardTitle>
                <CardDescription>
                  {filtersInfo}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {progressData?.data?.module_completion && progressData.data.module_completion.length > 0 ? (
                  <div className="space-y-6">
                    {Array.from(new Set(progressData.data.module_completion.map(item => item.enrollment_id)))
                      .map(enrollmentId => {
                        const studentModules = progressData.data.module_completion.filter(
                          item => item.enrollment_id === enrollmentId
                        )
                        const student = studentModules[0]
                        const avgCompletion = studentModules.reduce((sum, mod) => sum + mod.completion_rate, 0) / studentModules.length

                        return (
                          <Card key={enrollmentId} className="border-2">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <CardTitle className="text-base">{student.student_name}</CardTitle>
                                  <CardDescription className="text-xs mt-1">
                                    {student.group_name} • {student.course_name}
                                  </CardDescription>
                                </div>
                                <div className="text-right">
                                  <Badge 
                                    variant="outline" 
                                    className={
                                      avgCompletion >= 80 ? "bg-green-500/10 text-green-600 border-green-500/20" :
                                      avgCompletion >= 60 ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                                      avgCompletion >= 40 ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" :
                                      "bg-red-500/10 text-red-600 border-red-500/20"
                                    }
                                  >
                                    {avgCompletion.toFixed(1)}% completado
                                  </Badge>
                                  <Progress value={avgCompletion} className="mt-2 h-2" />
                                </div>
                              </div>
                            </CardHeader>
                            
                            <CardContent>
                              <div className="space-y-3">
                                {studentModules.map((module) => (
                                  <div key={module.module_id} className="p-3 bg-muted/30 rounded-lg">
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex-1">
                                        <p className="text-sm font-medium">{module.module_title}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                          Módulo {module.module_order} • {module.attended_sessions}/{module.total_sessions} sesiones
                                        </p>
                                      </div>
                                      <Badge variant="secondary" className="text-xs">
                                        {module.completion_rate}%
                                      </Badge>
                                    </div>
                                    <div className="space-y-1">
                                      <Progress value={module.completion_rate} className="h-2" />
                                      {module.completion_days > 0 && (
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          Completado en {module.completion_days} días
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    {loading ? 'Cargando datos...' : 'No hay datos de módulos disponibles para los filtros seleccionados'}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="consistencia" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Consistencia de Calificaciones</CardTitle>
                <CardDescription>
                  {filtersInfo}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {progressData?.data?.grade_consistency && progressData.data.grade_consistency.length > 0 ? (
                  <DataTable
                    data={progressData.data.grade_consistency}
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
                        key: 'total_grades',
                        label: 'N° Notas',
                        sortable: true,
                        className: "text-center"
                      },
                      {
                        key: 'avg_grade',
                        label: 'Promedio',
                        sortable: true,
                        className: "text-center",
                        render: (value) => (
                          <span className="text-lg font-bold">{value.toFixed(2)}</span>
                        )
                      },
                      {
                        key: 'grade_stddev',
                        label: 'Variación',
                        sortable: true,
                        className: "text-center",
                        render: (value) => (
                          <Badge 
                            variant="outline" 
                            className={
                              value < 2 ? "bg-green-500/10 text-green-600 border-green-500/20" :
                              value < 4 ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" :
                              "bg-red-500/10 text-red-600 border-red-500/20"
                            }
                          >
                            ±{value.toFixed(2)}
                          </Badge>
                        )
                      },
                      {
                        key: 'min_grade',
                        label: 'Rango',
                        sortable: false,
                        className: "text-center",
                        render: (_, item) => (
                          <span className="text-sm text-muted-foreground">
                            {item.min_grade} - {item.max_grade}
                          </span>
                        )
                      }
                    ]}
                  />
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    {loading ? 'Cargando datos...' : 'No hay datos de consistencia disponibles para los filtros seleccionados'}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="evolucion" className="space-y-4">
            {/* Selector de modo de visualización */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Modo de Visualización</CardTitle>
                <CardDescription>
                  {filtersInfo}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Button
                    variant={viewMode === "grouped" ? "default" : "outline"}
                    onClick={() => setViewMode("grouped")}
                    className="flex-1"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Por Grupos de Rendimiento
                    <Badge variant="secondary" className="ml-2">
                      Recomendado
                    </Badge>
                  </Button>
                  <Button
                    variant={viewMode === "individual" ? "default" : "outline"}
                    onClick={() => setViewMode("individual")}
                    className="flex-1"
                  >
                    <Target className="mr-2 h-4 w-4" />
                    Estudiantes Individuales
                    <Badge variant="secondary" className="ml-2">
                      Máx. 5
                    </Badge>
                  </Button>
                </div>
                
                {viewMode === "grouped" && quartiles && quartiles.q1 > 0 && (
                  <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium mb-2">Distribución por Cuartiles:</h4>
                    <div className="grid grid-cols-4 gap-2 text-sm">
                      <div className="text-center p-2 bg-red-50 rounded border">
                        <div className="font-bold text-red-600">Q1</div>
                        <div className="text-xs text-muted-foreground">{quartiles.q1.toFixed(1)}+</div>
                      </div>
                      <div className="text-center p-2 bg-yellow-50 rounded border">
                        <div className="font-bold text-yellow-600">Q2</div>
                        <div className="text-xs text-muted-foreground">{quartiles.q2.toFixed(1)}+</div>
                      </div>
                      <div className="text-center p-2 bg-blue-50 rounded border">
                        <div className="font-bold text-blue-600">Q3</div>
                        <div className="text-xs text-muted-foreground">{quartiles.q3.toFixed(1)}+</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded border">
                        <div className="font-bold text-green-600">Q4</div>
                        <div className="text-xs text-muted-foreground">Máximo</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Estadísticas de grupos */}
            {viewMode === "grouped" && groups && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(groups).map(([key, group]: [string, any]) => (
                  <Card key={key} className={`border-l-4`} style={{ borderLeftColor: group.color }}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium capitalize">
                            {key === 'alto' ? 'Alto' : 
                             key === 'medioAlto' ? 'Medio-Alto' :
                             key === 'medioBajo' ? 'Medio-Bajo' : 'Bajo'}
                          </p>
                          <p className="text-2xl font-bold">{group.students.length}</p>
                          <p className="text-xs text-muted-foreground">estudiantes</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{group.avg.toFixed(1)}</p>
                          <p className="text-xs text-muted-foreground">promedio</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Gráfica principal */}
            {currentChartData.length > 0 && currentLines.length > 0 ? (
              <LineChartComponent 
                data={currentChartData}
                lines={currentLines}
                title="Evolución de Calificaciones"
                description={
                  viewMode === "grouped" 
                    ? "Promedio de calificaciones por grupo de rendimiento (basado en cuartiles)"
                    : "Calificaciones de estudiantes individuales (mostrando máximo 5)"
                }
                showArea={viewMode === "grouped"}
                showLegend={true}
                showDots={viewMode === "individual"}
              />
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{loading ? 'Cargando datos...' : 'No hay datos de evolución disponibles para los filtros seleccionados'}</p>
                    {hasActiveFilters && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => setFilters({})}
                      >
                        Limpiar filtros
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tabla detallada de evolución */}
            {gradeEvolution?.grade_evolution && gradeEvolution.grade_evolution.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Detalle de Exámenes</CardTitle>
                  <CardDescription>{filtersInfo}</CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    data={gradeEvolution.grade_evolution}
                    searchable
                    searchPlaceholder="Buscar examen o estudiante..."
                    columns={[
                      {
                        key: 'student_name',
                        label: 'Estudiante',
                        sortable: true
                      },
                      {
                        key: 'exam_title',
                        label: 'Examen',
                        sortable: true
                      },
                      {
                        key: 'module_title',
                        label: 'Módulo',
                        sortable: true,
                        render: (value) => (
                          <span className="text-xs text-muted-foreground">{value}</span>
                        )
                      },
                      {
                        key: 'exam_date',
                        label: 'Fecha',
                        sortable: true,
                        className: "text-center",
                        render: (value) => (
                          <span className="text-xs">{new Date(value).toLocaleDateString()}</span>
                        )
                      },
                      {
                        key: 'grade',
                        label: 'Nota',
                        sortable: true,
                        className: "text-center",
                        render: (value) => (
                          <Badge 
                            variant="outline" 
                            className={
                              value >= 14 ? "bg-green-500/10 text-green-600 border-green-500/20" :
                              value >= 11 ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                              "bg-red-500/10 text-red-600 border-red-500/20"
                            }
                          >
                            {value}
                          </Badge>
                        )
                      }
                    ]}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>

        </Tabs>
      </div>
    </TechnologyLayout>
  )
}