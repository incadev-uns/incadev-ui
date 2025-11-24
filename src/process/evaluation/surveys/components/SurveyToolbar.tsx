import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, RefreshCw, Search } from "lucide-react"
import { SURVEY_EVENTS } from "@/process/evaluation/surveys/types/survey"

interface Props {
  search: string
  onSearchChange: (value: string) => void
  eventFilter: string
  onEventFilterChange: (value: string) => void
  onRefresh: () => void
  onCreate: () => void
  loading?: boolean
}

export function SurveyToolbar({
  search,
  onSearchChange,
  eventFilter,
  onEventFilterChange,
  onRefresh,
  onCreate,
  loading,
}: Props) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar encuestas..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={eventFilter} onValueChange={onEventFilterChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Evento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {SURVEY_EVENTS.map((evt) => (
              <SelectItem key={evt.value} value={evt.value}>
                {evt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onRefresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
        <Button onClick={onCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Encuesta
        </Button>
      </div>
    </div>
  )
}