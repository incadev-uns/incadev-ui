"use client"

import * as React from "react"
import { Filter, X, Calendar, Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ChartFilters, GroupOption } from "@/types/academic-analysis"
import { technologyApi } from "@/services/tecnologico/api"

interface ProgressFiltersProps {
  filters: ChartFilters
  onFiltersChange: (filters: ChartFilters) => void
  onApplyFilters: (filters: ChartFilters) => void
  loading?: boolean
}

export function ProgressFilters({ 
  filters, 
  onFiltersChange,
  onApplyFilters,
  loading = false
}: ProgressFiltersProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [availableGroups, setAvailableGroups] = React.useState<GroupOption[]>([])
  const [loadingGroups, setLoadingGroups] = React.useState(false)
  const [pendingFilters, setPendingFilters] = React.useState<ChartFilters>(filters)

  // Cargar grupos activos al abrir el panel de filtros
  React.useEffect(() => {
    if (isOpen && availableGroups.length === 0) {
      loadActiveGroups()
    }
  }, [isOpen])

  // Sincronizar pendingFilters cuando cambien los filters externos
  React.useEffect(() => {
    setPendingFilters(filters)
  }, [filters])

  const loadActiveGroups = async () => {
    try {
      setLoadingGroups(true)
      const response = await technologyApi.academicAnalysis.groups.active()
      if (response.success && response.data) {
        setAvailableGroups(response.data)
      }
    } catch (error) {
      console.error("Error cargando grupos:", error)
    } finally {
      setLoadingGroups(false)
    }
  }

  const handleGroupChange = (groupId: string) => {
    const newPendingFilters = { ...pendingFilters }
    if (groupId === "all") {
      delete newPendingFilters.group_id
    } else {
      newPendingFilters.group_id = parseInt(groupId)
    }
    setPendingFilters(newPendingFilters)
  }

  const handleDateChange = (field: 'start_date' | 'end_date', value: string) => {
    const newPendingFilters = { ...pendingFilters }
    if (value) {
      newPendingFilters[field] = value
    } else {
      delete newPendingFilters[field]
    }
    setPendingFilters(newPendingFilters)
  }

  const handleApplyFilters = () => {
    onApplyFilters(pendingFilters)
    setIsOpen(false)
  }

  const handleClearFilters = () => {
    const emptyFilters = {}
    setPendingFilters(emptyFilters)
    onApplyFilters(emptyFilters)
    setIsOpen(false)
  }

  const hasActiveFilters = filters.group_id || filters.start_date || filters.end_date
  const hasPendingChanges = JSON.stringify(pendingFilters) !== JSON.stringify(filters)

  const getSelectedGroupName = () => {
    if (!filters.group_id) return null
    const group = availableGroups.find(g => g.id === filters.group_id)
    return group?.display_name || group?.name || `Grupo ${filters.group_id}`
  }

  return (
    <div className="space-y-4">
      {/* Filtros rápidos */}
      <div className="flex flex-wrap items-center gap-4">
        <Button
          variant={isOpen ? "default" : "outline"}
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2"
          disabled={loadingGroups || loading}
        >
          <Filter className="h-4 w-4" />
          Filtros
          {loadingGroups && (
            <Loader2 className="h-3 w-3 animate-spin" />
          )}
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
              {Object.keys(filters).length}
            </Badge>
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            disabled={loading}
          >
            <X className="h-4 w-4" />
            Limpiar filtros
          </Button>
        )}

        {/* Filtros activos */}
        <div className="flex flex-wrap items-center gap-2">
          {filters.group_id && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Grupo: {getSelectedGroupName()}
            </Badge>
          )}
          {filters.start_date && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Desde: {filters.start_date}
            </Badge>
          )}
          {filters.end_date && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Hasta: {filters.end_date}
            </Badge>
          )}
        </div>
      </div>

      {/* Panel de filtros expandible */}
      {isOpen && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Filtros de Progreso</CardTitle>
            <CardDescription>
              Configura los filtros y aplícalos para ver los resultados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              {/* Filtro por Grupo */}
              <div className="space-y-2">
                <Label htmlFor="group-filter">Grupo</Label>
                <Select
                  value={pendingFilters.group_id?.toString() || "all"}
                  onValueChange={handleGroupChange}
                  disabled={loadingGroups}
                >
                  <SelectTrigger id="group-filter">
                    <SelectValue placeholder={
                      loadingGroups ? "Cargando grupos..." : "Todos los grupos"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los grupos</SelectItem>
                    {availableGroups.map((group) => (
                      <SelectItem key={group.id} value={group.id.toString()}>
                        {group.display_name || group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filtros de fecha */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start-date">Fecha de inicio</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="start-date"
                    type="date"
                    value={pendingFilters.start_date || ""}
                    onChange={(e) => handleDateChange('start_date', e.target.value)}
                    className="pl-9"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Filtra sesiones de clase y fechas de examen
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">Fecha de fin</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="end-date"
                    type="date"
                    value={pendingFilters.end_date || ""}
                    onChange={(e) => handleDateChange('end_date', e.target.value)}
                    className="pl-9"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Filtra sesiones de clase y fechas de examen
                </p>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-2 pt-2">
              <Button 
                onClick={handleApplyFilters}
                disabled={!hasPendingChanges || loading}
                className="flex-1"
              >
                <Check className="mr-2 h-4 w-4" />
                {loading ? 'Aplicando...' : 'Aplicar Filtros'}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  setPendingFilters(filters)
                  setIsOpen(false)
                }}
                disabled={loading}
              >
                Cancelar
              </Button>
            </div>

            {/* Información de filtros pendientes */}
            {hasPendingChanges && (
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                <p className="text-sm text-blue-700">
                  <strong>Cambios pendientes:</strong> Los filtros configurados no se han aplicado aún. 
                  Haz clic en "Aplicar Filtros" para ver los resultados.
                </p>
              </div>
            )}

            {/* Información de filtros aplicados */}
            {hasActiveFilters && (
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-sm text-muted-foreground">
                  <strong>Filtros actualmente aplicados:</strong>
                  {filters.group_id && (
                    <span className="font-medium ml-1">
                      {getSelectedGroupName()}
                    </span>
                  )}
                  {(filters.group_id && (filters.start_date || filters.end_date)) && " en "}
                  {filters.start_date && filters.end_date && (
                    <span className="font-medium">
                      período {filters.start_date} a {filters.end_date}
                    </span>
                  )}
                  {filters.start_date && !filters.end_date && (
                    <span className="font-medium">
                      desde {filters.start_date}
                    </span>
                  )}
                  {!filters.start_date && filters.end_date && (
                    <span className="font-medium">
                      hasta {filters.end_date}
                    </span>
                  )}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}