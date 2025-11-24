// app/auditoria/components/ActionFormDialog.tsx
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { AuditFinding } from "../types/audit"
import { config } from "@/config/evaluation-config"
import { AlertCircle } from "lucide-react"

interface ActionFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    finding: AuditFinding | null
    onSuccess: () => void
}

interface User {
    id: number
    name: string
    email: string
    role?: string
}

export function ActionFormDialog({
    open,
    onOpenChange,
    finding,
    onSuccess
}: ActionFormDialogProps) {
    const [loading, setLoading] = useState(false)
    const [users, setUsers] = useState<User[]>([])
    const [error, setError] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        responsible_id: 0,
        action_required: '',
        due_date: ''
    })

    useEffect(() => {
        if (open) {
            fetchUsers()
            setError(null) // Limpiar errores al abrir
        }

        // Resetear form para nueva acción
        const nextWeek = new Date()
        nextWeek.setDate(nextWeek.getDate() + 7)

        setFormData({
            responsible_id: 0,
            action_required: '',
            due_date: nextWeek.toISOString().split('T')[0]
        })
    }, [finding, open])

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("token")?.replace(/"/g, "")
            if (!token) {
                setError('No estás autenticado')
                return
            }

            // Intentar diferentes endpoints posibles
            const endpoints = [
                '/api/users/auditors',
                '/api/users',
                '/api/audit/users'
            ]

            let usersData: User[] = []

            for (const endpoint of endpoints) {
                try {
                    const response = await fetch(`${config.apiUrl}${endpoint}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json'
                        }
                    })

                    if (response.ok) {
                        const data = await response.json()
                        // Manejar diferentes formatos de respuesta
                        usersData = Array.isArray(data) ? data :
                            data.data ? data.data :
                                data.users ? data.users : []
                        break
                    }
                } catch (err) {
                    console.log(`Endpoint ${endpoint} no disponible`)
                }
            }

            // Si no hay usuarios, usar datos de prueba
            if (usersData.length === 0) {
                console.warn('Usando usuarios de prueba')
                usersData = [
                    { id: 1, name: 'SERGIO PONCE VILLEGAS', email: 'sergio.audit@incadev.com' },
                    { id: 2, name: 'LUIS SANDOVAL VASQUEZ', email: 'luis@incadev.com' },
                ]
            }

            setUsers(usersData)
        } catch (error) {
            console.error('Error fetching users:', error)
            setError('Error al cargar los usuarios')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!finding) return

        // Validaciones
        if (formData.responsible_id === 0) {
            setError('Debes seleccionar un responsable')
            return
        }

        if (!formData.action_required.trim()) {
            setError('La acción requerida es obligatoria')
            return
        }

        if (!formData.due_date) {
            setError('La fecha límite es obligatoria')
            return
        }

        const selectedDate = new Date(formData.due_date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (selectedDate < today) {
            setError('La fecha límite no puede ser en el pasado')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const token = localStorage.getItem("token")?.replace(/"/g, "")
            if (!token) {
                setError('No estás autenticado. Por favor, inicia sesión.')
                return
            }

            console.log('📤 Creando acción para hallazgo:', finding.id)
            console.log('📦 Datos:', formData)

            const response = await fetch(`${config.apiUrl}/api/findings/${finding.id}/actions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            })

            console.log('📡 Response status:', response.status)

            if (response.ok) {
                const data = await response.json()
                console.log('✅ Acción creada:', data)
                onSuccess()
                onOpenChange(false)
            } else {
                const errorText = await response.text()
                console.error('❌ Error del servidor:', errorText)

                if (response.status === 401) {
                    setError('Sesión expirada. Por favor, inicia sesión nuevamente.')
                    localStorage.removeItem("token")
                    setTimeout(() => window.location.href = '/login', 2000)
                } else {
                    setError('Error al crear la acción: ' + errorText)
                }
            }
        } catch (error) {
            console.error('💥 Error de conexión:', error)
            setError('Error de conexión con el servidor')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (field: keyof typeof formData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        // Limpiar error cuando el usuario empiece a escribir
        if (error) setError(null)
    }

    if (!finding) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Nueva Acción Correctiva</DialogTitle>
                    <DialogDescription>
                        Define la acción correctiva necesaria para resolver este hallazgo.
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="responsible">Responsable *</Label>
                            <Select
                                value={formData.responsible_id.toString()}
                                onValueChange={(value) => handleChange('responsible_id', parseInt(value))}
                            >
                                <SelectTrigger className={formData.responsible_id === 0 ? "border-red-500" : ""}>
                                    <SelectValue placeholder="Selecciona un responsable" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">-- Seleccionar --</SelectItem>
                                    {users.map((user) => (
                                        <SelectItem key={user.id} value={user.id.toString()}>
                                            {user.name} - {user.email}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {formData.responsible_id === 0 && (
                                <p className="text-sm text-red-500">Este campo es requerido</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="due_date">Fecha Límite *</Label>
                            <Input
                                id="due_date"
                                type="date"
                                value={formData.due_date}
                                onChange={(e) => handleChange('due_date', e.target.value)}
                                required
                                min={new Date().toISOString().split('T')[0]}
                                className={!formData.due_date ? "border-red-500" : ""}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="action_required">Acción Requerida *</Label>
                            <Textarea
                                id="action_required"
                                value={formData.action_required}
                                onChange={(e) => handleChange('action_required', e.target.value)}
                                placeholder="Describe la acción correctiva que debe implementarse..."
                                required
                                rows={4}
                                className={!formData.action_required.trim() ? "border-red-500" : ""}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                    Creando...
                                </>
                            ) : (
                                'Crear Acción'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}