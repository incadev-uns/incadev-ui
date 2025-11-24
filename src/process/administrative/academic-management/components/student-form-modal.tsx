import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { config } from '@/config/administrative-config';

interface StudentProfile {
  interests?: string[] | null;
  learning_goal?: string | null;
}

interface Enrollment {
  id: number;
  academic_status: string;
  payment_status: string;
  group?: {
    course_version?: {
      course?: {
        name: string;
      };
    };
  };
}

interface Student {
  id: number;
  name: string;
  fullname: string;
  dni: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  created_at: string;
  student_profile?: StudentProfile;
  enrollments?: Enrollment[];
}

interface StudentFormModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  fullname: string;
  dni: string;
  email: string;
  phone: string;
  name: string;
}

interface FormErrors {
  fullname?: string;
  dni?: string;
  email?: string;
  phone?: string;
  name?: string;
}

export default function StudentFormModal({
  student,
  isOpen,
  onClose,
  onSuccess
}: StudentFormModalProps) {
  const [formData, setFormData] = useState<FormData>({
    fullname: '',
    dni: '',
    email: '',
    phone: '',
    name: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isEditing = !!student;

  useEffect(() => {
    if (student) {
      setFormData({
        fullname: student.fullname || '',
        dni: student.dni || '',
        email: student.email || '',
        phone: student.phone || '',
        name: student.name || ''
      });
    } else {
      setFormData({
        fullname: '',
        dni: '',
        email: '',
        phone: '',
        name: ''
      });
    }
    setErrors({});
    setError(null);
    setSuccess(false);
  }, [student, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullname.trim()) {
      newErrors.fullname = 'El nombre completo es requerido';
    }

    if (!formData.dni.trim()) {
      newErrors.dni = 'El DNI es requerido';
    } else if (!/^\d{8}$/.test(formData.dni.trim())) {
      newErrors.dni = 'El DNI debe tener 8 dígitos';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (formData.phone && !/^\d{9}$/.test(formData.phone.trim())) {
      newErrors.phone = 'El teléfono debe tener 9 dígitos';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre de usuario es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = isEditing 
        ? `${config.apiUrl}${config.endpoints.students}/${student.id}`
        : `${config.apiUrl}${config.endpoints.students}`;
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar el estudiante');
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);

    } catch (err) {
      console.error('Error saving student:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Estudiante' : 'Nuevo Estudiante'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Modifica los datos del estudiante'
              : 'Completa el formulario para registrar un nuevo estudiante'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <IconAlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30 text-emerald-900 dark:text-emerald-100">
                <IconCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <AlertDescription>
                  {isEditing ? '¡Estudiante actualizado correctamente!' : '¡Estudiante creado correctamente!'}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="fullname">Nombre Completo *</Label>
                <Input
                  id="fullname"
                  name="fullname"
                  type="text"
                  value={formData.fullname}
                  onChange={handleInputChange}
                  placeholder="Ej: Juan Pérez García"
                  className={errors.fullname ? 'border-red-500' : ''}
                />
                {errors.fullname && (
                  <p className="text-xs text-red-500 mt-1">{errors.fullname}</p>
                )}
              </div>

              <div>
                <Label htmlFor="dni">DNI *</Label>
                <Input
                  id="dni"
                  name="dni"
                  type="text"
                  value={formData.dni}
                  onChange={handleInputChange}
                  placeholder="12345678"
                  maxLength={8}
                  className={errors.dni ? 'border-red-500' : ''}
                />
                {errors.dni && (
                  <p className="text-xs text-red-500 mt-1">{errors.dni}</p>
                )}
              </div>

              <div>
                <Label htmlFor="name">Nombre de Usuario *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="jperez"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="ejemplo@correo.com"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="text"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="987654321"
                  maxLength={9}
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Guardando...
                </>
              ) : (
                isEditing ? 'Actualizar' : 'Crear Estudiante'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}