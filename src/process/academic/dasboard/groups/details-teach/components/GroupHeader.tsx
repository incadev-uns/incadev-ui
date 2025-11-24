import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Users, Download, FileSpreadsheet } from "lucide-react"
import { useState } from "react"
import { config } from "@/config/academic-config"
import { useAcademicAuth } from "@/process/academic/hooks/useAcademicAuth"

interface Teacher {
  id: number
  name: string
  fullname: string
  email: string
  avatar: string | null
}

interface Student {
  id: number
  name: string
  fullname: string
  email: string
  avatar: string | null
}

interface GroupHeaderProps {
  groupData: {
    id: number
    name: string
    course_name: string
    course_description: string
    start_date: string
    end_date: string
    status: string
    students: Student[]
  }
  onBack: () => void
}

export function GroupHeader({ groupData, onBack }: GroupHeaderProps) {
  const { token } = useAcademicAuth()
  const [downloading, setDownloading] = useState<string | null>(null)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-PE', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Activo</Badge>
      case "enrolling":
        return <Badge variant="secondary">Matrícula Abierta</Badge>
      case "completed":
        return <Badge variant="outline">Completado</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const handleDownloadExcel = async (type: 'matriculas' | 'asistencias' | 'grades') => {
    if (!token) {
      alert("No hay token de autenticación")
      return
    }

    try {
      setDownloading(type)
      
      const tokenWithoutQuotes = token.replace(/^"|"$/g, '')
      const endpoint = config.endpoints.export[type].replace(':groupId', groupData.id.toString())
      
      const response = await fetch(
        `${config.apiUrl}${endpoint}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${tokenWithoutQuotes}`,
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const blob = await response.blob()
      
      // Determinar el nombre del archivo según el tipo
      let fileName = ''
      switch (type) {
        case 'matriculas':
          fileName = `matriculas-${groupData.name}.xlsx`
          break
        case 'asistencias':
          fileName = `asistencias-${groupData.name}.xlsx`
          break
        case 'grades':
          fileName = `notas-${groupData.name}.xlsx`
          break
      }

      // Crear URL temporal y descargar
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      console.log(`${type} descargado exitosamente`)
    } catch (error) {
      console.error(`Error descargando ${type}:`, error)
      alert(`Error al descargar el archivo de ${type}. Por favor, inténtalo de nuevo.`)
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div>
      <Button 
        onClick={onBack} 
        variant="ghost"
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver a mis grupos
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{groupData.name}</CardTitle>
              <CardDescription className="text-base mt-1">
                {groupData.course_name}
              </CardDescription>
              <p className="text-sm text-muted-foreground mt-2">
                {groupData.course_description}
              </p>
            </div>
            {getStatusBadge(groupData.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fecha de inicio</p>
                <p className="font-medium">{formatDate(groupData.start_date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fecha de fin</p>
                <p className="font-medium">{formatDate(groupData.end_date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Users className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estudiantes</p>
                <p className="font-medium">{groupData.students.length}</p>
              </div>
            </div>
          </div>

          {/* Botones de descarga de Excel */}
          <div className="border-t pt-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={() => handleDownloadExcel('matriculas')}
                disabled={downloading === 'matriculas'}
                variant="outline"
                className="flex-1"
              >
                {downloading === 'matriculas' ? (
                  <Download className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                )}
                {downloading === 'matriculas' ? 'Descargando...' : 'Matrículas'}
              </Button>
              
              <Button
                onClick={() => handleDownloadExcel('asistencias')}
                disabled={downloading === 'asistencias'}
                variant="outline"
                className="flex-1"
              >
                {downloading === 'asistencias' ? (
                  <Download className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                )}
                {downloading === 'asistencias' ? 'Descargando...' : 'Asistencias'}
              </Button>
              
              <Button
                onClick={() => handleDownloadExcel('grades')}
                disabled={downloading === 'grades'}
                variant="outline"
                className="flex-1"
              >
                {downloading === 'grades' ? (
                  <Download className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                )}
                {downloading === 'grades' ? 'Descargando...' : 'Notas'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Descargar reportes en formato Excel
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}