import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import DriveUploader from "@/services/academico/DriveUploader"
import { config } from "@/config/academic-config"
export interface EnrollmentFormData {
  operation_number: string
  agency_number: string
  operation_date: string
  amount: number
  evidence_path: string
}

interface EnrollmentFormProps {
  groupId: string
  groupName: string
  courseName: string
  onSuccess: () => void
  onCancel: () => void
  token: string | null
}

export function EnrollmentForm({ 
  groupId, 
  groupName, 
  courseName, 
  onSuccess, 
  onCancel,
  token 
}: EnrollmentFormProps) {
  const [formData, setFormData] = useState<EnrollmentFormData>({
    operation_number: "",
    agency_number: "",
    operation_date: new Date().toISOString().split('T')[0], // Fecha actual
    amount: 0,
    evidence_path: ""
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!token) {
      setError("No hay token de autenticación")
      return
    }

    if (!formData.evidence_path) {
      setError("Debes subir el comprobante de pago antes de enviar la inscripción")
      return
    }

    try {
      setLoading(true)
      setError(null)

      const tokenWithoutQuotes = token.replace(/^"|"$/g, '')
      const response = await fetch(
        `${config.apiUrl}${config.endpoints.groups.enroll}`.replace(":group", groupId),
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${tokenWithoutQuotes}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Error al inscribirse al grupo")
      }

      setSuccess(true)
      setTimeout(() => {
        onSuccess()
      }, 2000)

    } catch (error) {
      console.error("Error al inscribirse:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof EnrollmentFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileUpload = (url: string) => {
    setFormData(prev => ({
      ...prev,
      evidence_path: url
    }))
  }

  if (success) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">¡Inscripción enviada!</h3>
            <p className="text-muted-foreground mb-4">
              Tu solicitud de inscripción ha sido enviada correctamente. 
              El pago está en proceso de verificación.
            </p>
            <Button onClick={onSuccess}>
              Continuar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Formulario de Inscripción</CardTitle>
        <CardDescription>
          Completa la información de pago para inscribirte en el grupo
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Información del grupo */}
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold">{groupName}</h4>
          <p className="text-sm text-muted-foreground">{courseName}</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="operation_number">Número de Operación *</Label>
              <Input
                id="operation_number"
                value={formData.operation_number}
                onChange={(e) => handleChange("operation_number", e.target.value)}
                placeholder="OP-123456789"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="agency_number">Número de Agencia *</Label>
              <Input
                id="agency_number"
                value={formData.agency_number}
                onChange={(e) => handleChange("agency_number", e.target.value)}
                placeholder="AG-001"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="operation_date">Fecha de Operación *</Label>
              <Input
                id="operation_date"
                type="date"
                value={formData.operation_date}
                onChange={(e) => handleChange("operation_date", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Monto *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleChange("amount", parseFloat(e.target.value))}
                placeholder="500.00"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="evidence_path">Comprobante de Pago *</Label>
            
            <DriveUploader
              onUpload={handleFileUpload}
              label="Subir comprobante de pago"
            />
            
            {/* Mostrar la URL del archivo subido si existe */}
            {formData.evidence_path && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-700">
                  <CheckCircle2 className="w-4 h-4 inline mr-1" />
                  Comprobante subido correctamente
                </p>
                <p className="text-xs text-green-600 mt-1 truncate">
                  {formData.evidence_path}
                </p>
              </div>
            )}
            
            <p className="text-xs text-muted-foreground">
              Sube una imagen o PDF del comprobante de pago. Formatos aceptados: JPG, PNG, PDF (Máx. 5MB)
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.evidence_path}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Inscripción"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}