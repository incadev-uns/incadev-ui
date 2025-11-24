import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, GraduationCap, Loader2, AlertCircle } from "lucide-react"

interface CanCompleteData {
  can_complete: boolean
  reasons: {
    has_students: boolean
    has_classes: boolean
    has_exams: boolean
    total_students: number
    total_classes: number
    total_exams: number
  }
}

interface CompletionStatusCardProps {
  canCompleteData: CanCompleteData
  completing: boolean
  onComplete: () => void
}

export function CompletionStatusCard({ 
  canCompleteData, 
  completing, 
  onComplete 
}: CompletionStatusCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {canCompleteData.can_complete ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <XCircle className="w-5 h-5 text-destructive" />
          )}
          Estado de completitud
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-2">
            {canCompleteData.reasons.has_students ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-destructive" />
            )}
            <span className="text-sm">
              Estudiantes: {canCompleteData.reasons.total_students}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {canCompleteData.reasons.has_classes ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-destructive" />
            )}
            <span className="text-sm">
              Clases: {canCompleteData.reasons.total_classes}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {canCompleteData.reasons.has_exams ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-destructive" />
            )}
            <span className="text-sm">
              Exámenes: {canCompleteData.reasons.total_exams}
            </span>
          </div>
        </div>
        
        {canCompleteData.can_complete ? (
          <Button 
            onClick={onComplete}
            disabled={completing}
            className="w-full md:w-auto"
          >
            {completing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Completando...
              </>
            ) : (
              <>
                <GraduationCap className="w-4 h-4 mr-2" />
                Completar grupo
              </>
            )}
          </Button>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Este grupo no puede completarse aún. Asegúrate de tener al menos un estudiante, una clase y un examen calificados en cada módulo.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}