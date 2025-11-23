import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Eye, 
  ListChecks, 
  FileText, 
  Table as TableIcon,
  TrendingUp 
} from "lucide-react"
import type { Survey, SurveyEvent } from "@/process/evaluation/surveys/types/survey"

interface Meta {
  current_page: number
  from: number
  to: number
  per_page: number
  total: number
  last_page: number
}

interface Links {
  first: string
  last: string
  prev: string | null
  next: string | null
}

interface Props {
  surveys: Survey[]
  meta: Meta
  links: Links
  onEdit: (survey: Survey) => void
  onDelete: (survey: Survey) => void
  onView?: (survey: Survey) => void
  onManageQuestions: (survey: Survey) => void
  onDownloadPdf: (surveyId: number) => Promise<boolean>
  onDownloadExcel: (surveyId: number) => Promise<boolean>
  onViewAnalysis: (survey: Survey) => void
  onPageChange: (page: number) => void
  loading?: boolean
}

const eventConfig: Record<SurveyEvent, { label: string; variant: "default" | "secondary" | "outline" }> = {
  satisfaction: { label: "Satisfacción", variant: "default" },
  teacher: { label: "Docente", variant: "secondary" },
  impact: { label: "Impacto", variant: "outline" },
}

export function SurveyTable({ 
  surveys, 
  meta, 
  links, 
  onEdit, 
  onDelete, 
  onView, 
  onManageQuestions,
  onDownloadPdf,
  onDownloadExcel,
  onViewAnalysis,
  onPageChange,
  loading = false 
}: Props) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const getPageNumbers = () => {
    const pages = []
    const delta = 1
    for (
      let i = Math.max(1, meta.current_page - delta);
      i <= Math.min(meta.last_page, meta.current_page + delta);
      i++
    ) {
      pages.push(i)
    }
    return pages
  }

  // Manejar descarga de PDF
  const handleDownloadPdf = async (surveyId: number) => {
    const success = await onDownloadPdf(surveyId)
    if (!success) {
      // El error ya está manejado en el hook
      console.error("Error al descargar PDF")
    }
  }

  // Manejar descarga de Excel
  const handleDownloadExcel = async (surveyId: number) => {
    const success = await onDownloadExcel(surveyId)
    if (!success) {
      // El error ya está manejado en el hook
      console.error("Error al descargar Excel")
    }
  }

  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Evento</TableHead>
              <TableHead className="hidden md:table-cell">Descripción</TableHead>
              <TableHead className="hidden sm:table-cell">Creación</TableHead>
              <TableHead className="w-[70px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(meta.per_page || 3)].map((_, idx) => (
              <TableRow key={idx}>
                <TableCell><div className="h-4 bg-muted rounded w-8 animate-pulse" /></TableCell>
                <TableCell><div className="h-4 bg-muted rounded w-32 animate-pulse" /></TableCell>
                <TableCell><div className="h-5 bg-muted rounded w-20 animate-pulse" /></TableCell>
                <TableCell className="hidden md:table-cell"><div className="h-4 bg-muted rounded w-48 animate-pulse" /></TableCell>
                <TableCell className="hidden sm:table-cell"><div className="h-4 bg-muted rounded w-24 animate-pulse" /></TableCell>
                <TableCell><div className="h-8 w-8 bg-muted rounded animate-pulse" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (surveys.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p>No hay encuestas registradas</p>
        <p className="text-sm">Crea una nueva encuesta para comenzar</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Evento</TableHead>
              <TableHead className="hidden md:table-cell">Descripción</TableHead>
              <TableHead className="hidden sm:table-cell">Creación</TableHead>
              <TableHead className="w-[70px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {surveys.map((survey, idx) => (
              <TableRow key={survey.id}>
                <TableCell className="font-medium">{meta.from + idx}</TableCell>
                <TableCell className="font-medium">{survey.title}</TableCell>
                <TableCell>
                  <Badge variant={eventConfig[survey.mapping.event]?.variant || "default"}>
                    {eventConfig[survey.mapping.event]?.label || survey.mapping.event}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell max-w-[250px] truncate text-muted-foreground">
                  {survey.description || "—"}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {formatDate(survey.created_at)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Abrir menú</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onView && (
                        <DropdownMenuItem onClick={() => onView(survey)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalles
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => onManageQuestions(survey)}>
                        <ListChecks className="mr-2 h-4 w-4" />
                        Gestionar Preguntas
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onViewAnalysis(survey)}>
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Ver Análisis
                      </DropdownMenuItem>
                      {/* Sección de Reportes */}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDownloadPdf(survey.id)}>
                        <FileText className="mr-2 h-4 w-4" />
                        Descargar PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownloadExcel(survey.id)}>
                        <TableIcon className="mr-2 h-4 w-4" />
                        Descargar Excel
                      </DropdownMenuItem>

                      {/* Sección de Administración */}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onEdit(survey)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(survey)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              href="#"
              onClick={(e) => {
                e.preventDefault()
                if (meta.current_page > 1) onPageChange(meta.current_page - 1)
              }}
              className={meta.current_page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>

          {meta.current_page > 2 && (
            <PaginationItem>
              <PaginationLink href="#" onClick={(e) => { e.preventDefault(); onPageChange(1) }} className="cursor-pointer">1</PaginationLink>
            </PaginationItem>
          )}

          {meta.current_page > 3 && <PaginationItem><PaginationEllipsis /></PaginationItem>}

          {getPageNumbers().map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                href="#"
                onClick={(e) => { e.preventDefault(); onPageChange(page) }}
                isActive={page === meta.current_page}
                className="cursor-pointer"
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}

          {meta.current_page < meta.last_page - 2 && <PaginationItem><PaginationEllipsis /></PaginationItem>}

          {meta.current_page < meta.last_page - 1 && (
            <PaginationItem>
              <PaginationLink href="#" onClick={(e) => { e.preventDefault(); onPageChange(meta.last_page) }} className="cursor-pointer">
                {meta.last_page}
              </PaginationLink>
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault()
                if (meta.current_page < meta.last_page) onPageChange(meta.current_page + 1)
              }}
              className={meta.current_page === meta.last_page ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}