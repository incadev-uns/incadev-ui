"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Download, TrendingUp } from "lucide-react"
import type { AttendanceCalendarEntry, AttendanceStatus } from "@/types/academic-analysis"
import { AttendanceStatusLabels } from "@/types/academic-analysis"

interface AttendanceCalendarHeatmapProps {
  data: AttendanceCalendarEntry[]
  title?: string
  description?: string
}

export function AttendanceCalendarHeatmap({ 
  data, 
  title = "Calendario de Asistencia",
  description = "Heatmap de asistencia diaria por estudiante"
}: AttendanceCalendarHeatmapProps) {
  const [selectedStudent, setSelectedStudent] = React.useState<string>('all')
  const [hoveredCell, setHoveredCell] = React.useState<{student: string, date: string} | null>(null)
  
  const students = React.useMemo(() => {
    const uniqueStudents = Array.from(new Set(data.map(item => item.student_name)))
    return ['all', ...uniqueStudents]
  }, [data])

  const filteredData = React.useMemo(() => {
    if (selectedStudent === 'all') return data
    return data.filter(item => item.student_name === selectedStudent)
  }, [data, selectedStudent])

  const groupedData = React.useMemo(() => {
    const grouped: Record<string, Record<string, AttendanceStatus>> = {}
    
    filteredData.forEach(item => {
      if (!grouped[item.fecha]) {
        grouped[item.fecha] = {}
      }
      grouped[item.fecha][item.student_name] = item.status
    })
    
    return grouped
  }, [filteredData])

  const dates = React.useMemo(() => {
    return Object.keys(groupedData).sort()
  }, [groupedData])

  const displayStudents = React.useMemo(() => {
    return Array.from(new Set(filteredData.map(item => item.student_name))).sort()
  }, [filteredData])

  const getStatusColor = (status: AttendanceStatus): string => {
    const colorMap: Record<AttendanceStatus, string> = {
      present: 'bg-green-500 hover:bg-green-600 dark:bg-green-600',
      absent: 'bg-red-500 hover:bg-red-600 dark:bg-red-600', 
      late: 'bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600',
      excused: 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600'
    }
    return colorMap[status] || 'bg-muted hover:bg-muted/80'
  }

  const stats = React.useMemo(() => {
    const present = filteredData.filter(d => d.status === 'present').length
    const absent = filteredData.filter(d => d.status === 'absent').length
    const late = filteredData.filter(d => d.status === 'late').length
    const excused = filteredData.filter(d => d.status === 'excused').length
    const total = filteredData.length
    
    return { present, absent, late, excused, total }
  }, [filteredData])

  const attendanceRate = stats.total > 0 
    ? ((stats.present / stats.total) * 100).toFixed(1)
    : '0'

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <CardTitle>{title}</CardTitle>
            </div>
            <CardDescription className="mt-1.5">{description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Seleccionar estudiante" />
              </SelectTrigger>
              <SelectContent>
                {students.map(student => (
                  <SelectItem key={student} value={student}>
                    {student === 'all' ? 'Todos los estudiantes' : student}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Leyenda con diseño mejorado */}
        <div className="flex items-center gap-6 flex-wrap p-4 bg-muted/30 rounded-lg border">
          <span className="text-sm font-semibold">Leyenda:</span>
          {Object.entries(AttendanceStatusLabels).map(([status, label]) => (
            <div key={status} className="flex items-center gap-2">
              <div 
                className={`w-4 h-4 rounded ${getStatusColor(status as AttendanceStatus).split(' ')[0]}`}
              />
              <span className="text-sm font-medium">{label}</span>
            </div>
          ))}
        </div>

        {/* Heatmap mejorado */}
        <div className="border rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-auto max-h-[500px]">
            {dates.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 bg-muted/20">
                <Calendar className="h-12 w-12 text-muted-foreground/50 mb-2" />
                <p className="text-muted-foreground font-medium">No hay datos para mostrar</p>
              </div>
            ) : (
              <div className="min-w-max">
                {/* Header con fechas mejorado */}
                <div className="flex sticky top-0 bg-background border-b z-10">
                  <div className="w-48 flex-shrink-0 p-3 font-semibold border-r bg-muted/50">
                    Estudiante
                  </div>
                  {dates.map(date => {
                    const dateObj = new Date(date)
                    return (
                      <div 
                        key={date}
                        className="w-10 flex-shrink-0 p-2 text-center"
                      >
                        <div className="text-xs font-semibold">
                          {dateObj.getDate()}
                        </div>
                        <div className="text-[10px] text-muted-foreground uppercase">
                          {dateObj.toLocaleDateString('es', { month: 'short' })}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Filas de estudiantes mejoradas */}
                {displayStudents.map((student, idx) => (
                  <div 
                    key={student} 
                    className={`flex items-center border-b last:border-b-0 ${
                      idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                    }`}
                  >
                    <div className="w-48 flex-shrink-0 p-3 border-r sticky left-0 bg-inherit">
                      <p className="text-sm font-medium truncate" title={student}>
                        {student}
                      </p>
                    </div>

                    {dates.map(date => {
                      const status = groupedData[date]?.[student]
                      const isHovered = hoveredCell?.student === student && hoveredCell?.date === date
                      
                      return (
                        <div
                          key={`${student}-${date}`}
                          className={`w-10 h-10 flex-shrink-0 border-l transition-all duration-200 cursor-pointer ${
                            status ? getStatusColor(status) : 'bg-muted/50 hover:bg-muted'
                          } ${isHovered ? 'ring-2 ring-primary scale-110 z-20' : ''}`}
                          onMouseEnter={() => setHoveredCell({student, date})}
                          onMouseLeave={() => setHoveredCell(null)}
                          title={`${student}\n${new Date(date).toLocaleDateString()}\n${status ? AttendanceStatusLabels[status] : 'Sin datos'}`}
                        />
                      )
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Estadísticas mejoradas */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
            <div className="text-3xl font-bold text-green-600 dark:text-green-500">{stats.present}</div>
            <div className="text-xs text-muted-foreground font-medium mt-1">Presentes</div>
          </div>
          <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
            <div className="text-3xl font-bold text-red-600 dark:text-red-500">{stats.absent}</div>
            <div className="text-xs text-muted-foreground font-medium mt-1">Ausentes</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-900">
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-500">{stats.late}</div>
            <div className="text-xs text-muted-foreground font-medium mt-1">Tardanzas</div>
          </div>
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-500">{stats.excused}</div>
            <div className="text-xs text-muted-foreground font-medium mt-1">Justificados</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg border">
            <div className="text-3xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground font-medium mt-1">Total</div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex-col gap-2 text-sm border-t bg-muted/30 pt-4">
        <div className="flex items-center gap-2 leading-none font-medium w-full">
          <TrendingUp className="h-4 w-4 text-green-600" />
          Tasa de asistencia: {attendanceRate}%
        </div>
        <div className="text-muted-foreground leading-none w-full">
          {displayStudents.length} estudiante{displayStudents.length !== 1 ? 's' : ''} • {dates.length} día{dates.length !== 1 ? 's' : ''} registrado{dates.length !== 1 ? 's' : ''}
        </div>
      </CardFooter>
    </Card>
  )
}