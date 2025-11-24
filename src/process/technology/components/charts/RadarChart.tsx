"use client"

import * as React from "react"
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from "recharts"
import { TrendingUp, Target, Users, Award, Calendar, AlertCircle } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { ChartConfig } from "@/components/ui/chart"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import type { GroupPerformanceMetric } from "@/types/academic-analysis"

interface RadarChartComponentProps {
  data: GroupPerformanceMetric[]
  title?: string
  description?: string
  showLegend?: boolean
}

export function RadarChartComponent({ 
  data, 
  title = "Rendimiento por Grupo",
  description = "Métricas comparativas entre grupos",
  showLegend = true
}: RadarChartComponentProps) {
  
  const [activeMetric, setActiveMetric] = React.useState<'approval' | 'grade' | 'both'>('both')
  
  // Convertir valores null a cero y preparar datos para el radar chart
  const chartData = React.useMemo(() => {
    return data.map(group => ({
      subject: group.group_name.length > 20 
        ? `${group.group_name.slice(0, 20)}...` 
        : group.group_name,
      fullName: group.group_name,
      courseName: group.course_name,
      approvalRate: group.approval_rate,
      avgGrade: group.avg_final_grade !== null ? (group.avg_final_grade / 20) * 100 : 0, // Convertir null a 0 y normalizar
      avgAttendance: group.avg_attendance !== null ? group.avg_attendance : 0, // Convertir null a 0
      totalStudents: group.total_students,
      approvedStudents: group.approved_students,
      failedStudents: group.failed_students,
      performanceScore: group.performance_score,
      hasData: group.avg_final_grade !== null && group.avg_attendance !== null,
      fullMark: 100,
    }))
  }, [data])

  const chartConfig = {
    approvalRate: {
      label: "Tasa de Aprobación (%)",
      color: "hsl(var(--chart-1))",
    },
    avgGrade: {
      label: "Promedio Calificaciones (%)",
      color: "hsl(var(--chart-2))",
    },
    avgAttendance: {
      label: "Asistencia Promedio (%)",
      color: "hsl(var(--chart-3))",
    },
    performanceScore: {
      label: "Puntaje Rendimiento",
      color: "hsl(var(--chart-4))",
    },
  } satisfies ChartConfig

  // Calcular promedios de todos los grupos (incluyendo los que tenían null)
  const averages = React.useMemo(() => {
    if (data.length === 0) return { approval: 0, grade: 0, attendance: 0, performance: 0 }
    
    return {
      approval: data.reduce((sum, g) => sum + g.approval_rate, 0) / data.length,
      grade: data.reduce((sum, g) => sum + (g.avg_final_grade || 0), 0) / data.length, // null se convierte a 0
      attendance: data.reduce((sum, g) => sum + (g.avg_attendance || 0), 0) / data.length, // null se convierte a 0
      performance: data.reduce((sum, g) => sum + g.performance_score, 0) / data.length,
    }
  }, [data])

  // Contar grupos con y sin datos
  const groupsWithData = React.useMemo(() => {
    return data.filter(group => group.avg_final_grade !== null && group.avg_attendance !== null).length
  }, [data])

  const groupsWithoutData = React.useMemo(() => {
    return data.filter(group => group.avg_final_grade === null || group.avg_attendance === null).length
  }, [data])

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>No hay datos disponibles</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Sin datos para comparar</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-muted-foreground" />
              <CardTitle>{title}</CardTitle>
            </div>
            <CardDescription className="mt-1.5">{description}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge 
              variant={activeMetric === 'approval' ? 'default' : 'outline'}
              className="cursor-pointer text-xs"
              onClick={() => setActiveMetric('approval')}
            >
              Aprobación
            </Badge>
            <Badge 
              variant={activeMetric === 'grade' ? 'default' : 'outline'}
              className="cursor-pointer text-xs"
              onClick={() => setActiveMetric('grade')}
            >
              Calificación
            </Badge>
            <Badge 
              variant={activeMetric === 'both' ? 'default' : 'outline'}
              className="cursor-pointer text-xs"
              onClick={() => setActiveMetric('both')}
            >
              Ambas
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[400px]">
          <RadarChart data={chartData}>
            <PolarGrid strokeDasharray="3 3" />
            <PolarAngleAxis 
              dataKey="subject"
              tick={({ x, y, textAnchor, value, index }) => {
                const fullName = chartData[index]?.fullName || value
                const hasData = chartData[index]?.hasData
                return (
                  <text
                    x={x}
                    y={y}
                    textAnchor={textAnchor}
                    fontSize={11}
                    fontWeight={500}
                    className={`fill-foreground ${!hasData ? 'opacity-50' : ''}`}
                  >
                    <title>{fullName} {!hasData ? '(Sin datos completos)' : ''}</title>
                    {value}
                  </text>
                )
              }}
            />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            <ChartTooltip 
              cursor={false}
              content={<ChartTooltipContent 
                labelFormatter={(_, payload) => {
                  if (payload && payload[0]) {
                    const data = payload[0].payload
                    return (
                      <div className="text-center">
                        <div className="font-medium">{data.fullName}</div>
                        <div className="text-xs text-muted-foreground">{data.courseName}</div>
                        {!data.hasData && (
                          <div className="text-xs text-yellow-600 mt-1 flex items-center gap-1 justify-center">
                            <AlertCircle className="h-3 w-3" />
                            Datos incompletos
                          </div>
                        )}
                      </div>
                    )
                  }
                  return ''
                }}
                formatter={(value, name) => {
                  const config = chartConfig[name as keyof typeof chartConfig]
                  if (name === 'avgGrade') {
                    const gradeValue = (value as number) / 100 * 20
                    return [
                      gradeValue > 0 ? `${gradeValue.toFixed(1)}/20` : 'Sin datos', 
                      config?.label || name
                    ]
                  }
                  if (name === 'performanceScore') {
                    return [`${value} pts`, config?.label || name]
                  }
                  if (name === 'avgAttendance') {
                    const attendanceValue = value as number
                    return [
                      attendanceValue > 0 ? `${attendanceValue}%` : 'Sin datos', 
                      config?.label || name
                    ]
                  }
                  return [`${value as number}%`, config?.label || name]
                }}
              />} 
            />
            {showLegend && (
              <ChartLegend content={<ChartLegendContent />} />
            )}
            
            {(activeMetric === 'approval' || activeMetric === 'both') && (
              <Radar
                dataKey="approvalRate"
                stroke="var(--color-approvalRate)"
                fill="var(--color-approvalRate)"
                fillOpacity={0.6}
                strokeWidth={2}
              />
            )}
            {(activeMetric === 'grade' || activeMetric === 'both') && (
              <Radar
                dataKey="avgGrade"
                stroke="var(--color-avgGrade)"
                fill="var(--color-avgGrade)"
                fillOpacity={0.4}
                strokeWidth={2}
              />
            )}
            <Radar
              dataKey="avgAttendance"
              stroke="var(--color-avgAttendance)"
              fill="var(--color-avgAttendance)"
              fillOpacity={0.3}
              strokeWidth={1}
              strokeDasharray="3 3"
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      
      <CardFooter className="flex-col gap-3 text-sm border-t bg-muted/30 pt-4">
        <div className="grid grid-cols-4 gap-3 w-full">
          <div className="text-center p-2 bg-chart-1/10 rounded-lg">
            <Award className="h-4 w-4 mx-auto mb-1 text-chart-1" />
            <div className="text-xs text-muted-foreground">Aprobación</div>
            <div className="text-lg font-bold">{averages.approval.toFixed(1)}%</div>
          </div>
          <div className="text-center p-2 bg-chart-2/10 rounded-lg">
            <TrendingUp className="h-4 w-4 mx-auto mb-1 text-chart-2" />
            <div className="text-xs text-muted-foreground">Calificación</div>
            <div className="text-lg font-bold">{averages.grade.toFixed(1)}/20</div>
          </div>
          <div className="text-center p-2 bg-chart-3/10 rounded-lg">
            <Calendar className="h-4 w-4 mx-auto mb-1 text-chart-3" />
            <div className="text-xs text-muted-foreground">Asistencia</div>
            <div className="text-lg font-bold">{averages.attendance.toFixed(1)}%</div>
          </div>
          <div className="text-center p-2 bg-chart-4/10 rounded-lg">
            <Target className="h-4 w-4 mx-auto mb-1 text-chart-4" />
            <div className="text-xs text-muted-foreground">Rendimiento</div>
            <div className="text-lg font-bold">{averages.performance.toFixed(1)}</div>
          </div>
        </div>
        
        <div className="flex items-center justify-between w-full text-muted-foreground text-xs">
          <div className="flex items-center gap-2">
            <Users className="h-3 w-3" />
            <span>{data.length} grupos totales</span>
          </div>
          <div className="flex items-center gap-2">
            {groupsWithoutData > 0 && (
              <div className="flex items-center gap-1 text-yellow-600">
                <AlertCircle className="h-3 w-3" />
                <span>{groupsWithoutData} sin datos completos</span>
              </div>
            )}
            {groupsWithData > 0 && (
              <div className="flex items-center gap-1 text-green-600">
                <Target className="h-3 w-3" />
                <span>{groupsWithData} con datos</span>
              </div>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}