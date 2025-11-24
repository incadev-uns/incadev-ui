import { useState, useEffect } from "react"
import TechnologyLayout from "@/process/technology/TechnologyLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { IconArrowLeft, IconDeviceFloppy } from "@tabler/icons-react"
import { technologyApi, type User } from "@/services/tecnologico/api"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const UserFormSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  fullname: z.string().optional(),
  email: z.string().email("Email inválido").min(1, "El email es obligatorio"),
  dni: z.string().optional(),
  phone: z.string().optional(),
  password: z.string().optional(),
  password_confirmation: z.string().optional(),
}).refine((data) => {
  // If password is provided, it must match confirmation
  if (data.password && data.password !== data.password_confirmation) {
    return false
  }
  return true
}, {
  message: "Las contraseñas no coinciden",
  path: ["password_confirmation"],
})

type UserFormData = z.infer<typeof UserFormSchema>

export default function UserForm() {
  const [userId, setUserId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const isEditMode = !!userId

  // Obtener el ID del usuario desde la URL (query param ?id=123)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const id = params.get("id")
      if (id) {
        setUserId(parseInt(id, 10))
      } else {
        setInitialLoading(false)
      }
    }
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UserFormData>({
    resolver: zodResolver(UserFormSchema),
    defaultValues: {
      name: "",
      fullname: "",
      email: "",
      dni: "",
      phone: "",
      password: "",
      password_confirmation: "",
    },
  })

  useEffect(() => {
    if (userId) {
      loadUser(userId)
    }
  }, [userId])

  const loadUser = async (id: number) => {
    try {
      setInitialLoading(true)
      const response = await technologyApi.users.getById(id)

      if (response.success && response.data) {
        reset({
          name: response.data.name,
          fullname: response.data.fullname || "",
          email: response.data.email,
          dni: response.data.dni || "",
          phone: response.data.phone || "",
          password: "",
          password_confirmation: "",
        })
      } else {
        toast.error("Error al cargar usuario", {
          description: response.message || "No se pudo cargar el usuario"
        })
      }
    } catch (error) {
      console.error("Error loading user:", error)
      toast.error("Error de conexión", {
        description: "No se pudo conectar con el servidor"
      })
    } finally {
      setInitialLoading(false)
    }
  }

  const onSubmit = async (data: UserFormData) => {
    try {
      setLoading(true)

      let response

      if (isEditMode && userId) {
        // Update existing user
        const updateData: any = {
          name: data.name,
          email: data.email,
        }
        if (data.fullname) updateData.fullname = data.fullname
        if (data.dni) updateData.dni = data.dni
        if (data.phone) updateData.phone = data.phone
        if (data.password) updateData.password = data.password

        response = await technologyApi.users.update(userId, updateData)
      } else {
        // Create new user
        if (!data.password) {
          toast.error("Contraseña requerida", {
            description: "Debes proporcionar una contraseña para el nuevo usuario"
          })
          setLoading(false)
          return
        }

        response = await technologyApi.users.create({
          name: data.name,
          email: data.email,
          password: data.password,
        })
      }

      if (response.success) {
        toast.success(
          isEditMode ? "Usuario actualizado" : "Usuario creado",
          {
            description: isEditMode
              ? "El usuario ha sido actualizado exitosamente"
              : "El usuario ha sido creado exitosamente"
          }
        )

        setTimeout(() => {
          window.location.href = "/tecnologico/admin/usuarios"
        }, 1500)
      } else {
        toast.error("Error al guardar", {
          description: response.message || "No se pudo guardar el usuario"
        })
      }
    } catch (error) {
      console.error("Error saving user:", error)
      toast.error("Error de conexión", {
        description: "No se pudo conectar con el servidor"
      })
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <TechnologyLayout title={isEditMode ? "Editar Usuario" : "Crear Usuario"}>
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </TechnologyLayout>
    )
  }

  return (
    <TechnologyLayout title={isEditMode ? "Editar Usuario" : "Crear Usuario"}>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <a href="/tecnologico/admin/usuarios">
                <IconArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </a>
            </Button>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                {isEditMode ? "Editar Usuario" : "Crear Nuevo Usuario"}
              </h2>
              <p className="text-muted-foreground">
                {isEditMode
                  ? "Actualiza la información del usuario"
                  : "Completa el formulario para crear un nuevo usuario"}
              </p>
            </div>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Usuario</CardTitle>
              <CardDescription>
                Ingresa los datos del usuario
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="name">Nombre *</FieldLabel>
                    <Input
                      id="name"
                      {...register("name")}
                      placeholder="Ej: Admin"
                      disabled={isSubmitting}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="fullname">Nombre Completo</FieldLabel>
                    <Input
                      id="fullname"
                      {...register("fullname")}
                      placeholder="Ej: SUPER ADMINISTRATOR"
                      disabled={isSubmitting}
                    />
                    {errors.fullname && (
                      <p className="text-sm text-red-500 mt-1">{errors.fullname.message}</p>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="email">Email *</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      placeholder="usuario@example.com"
                      disabled={isSubmitting}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="dni">DNI</FieldLabel>
                    <Input
                      id="dni"
                      {...register("dni")}
                      placeholder="12345678"
                      disabled={isSubmitting}
                    />
                    {errors.dni && (
                      <p className="text-sm text-red-500 mt-1">{errors.dni.message}</p>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="phone">Teléfono</FieldLabel>
                    <Input
                      id="phone"
                      {...register("phone")}
                      placeholder="+51 999 999 999"
                      disabled={isSubmitting}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="password">
                      {isEditMode ? "Nueva Contraseña (opcional)" : "Contraseña *"}
                    </FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      {...register("password")}
                      placeholder={isEditMode ? "Dejar en blanco para no cambiar" : "Ingresa una contraseña"}
                      disabled={isSubmitting}
                    />
                    {errors.password && (
                      <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="password_confirmation">Confirmar Contraseña</FieldLabel>
                    <Input
                      id="password_confirmation"
                      type="password"
                      {...register("password_confirmation")}
                      placeholder="Confirma la contraseña"
                      disabled={isSubmitting}
                    />
                    {errors.password_confirmation && (
                      <p className="text-sm text-red-500 mt-1">{errors.password_confirmation.message}</p>
                    )}
                  </Field>
                </FieldGroup>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={isSubmitting || loading}>
                    <IconDeviceFloppy className="mr-2 h-4 w-4" />
                    {isSubmitting || loading
                      ? "Guardando..."
                      : isEditMode
                      ? "Actualizar Usuario"
                      : "Crear Usuario"}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <a href="/tecnologico/admin/usuarios">Cancelar</a>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </TechnologyLayout>
  )
}
