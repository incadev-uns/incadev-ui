import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { IconDeviceFloppy, IconEdit, IconX, IconUser } from "@tabler/icons-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { UseFormRegister, FieldErrors } from "react-hook-form"
import { AvatarUpload } from "./AvatarUpload"

interface User {
  id: number
  name: string
  fullname?: string
  email: string
  dni?: string
  phone?: string
  avatar?: string | null
  avatar_url?: string | null
  roles?: string[]
}

interface ProfileFormData {
  name: string
  fullname?: string
  email: string
  dni?: string
  phone?: string
  password?: string
  password_confirmation?: string
}

interface ProfileInfoCardProps {
  user: User | null
  editMode: boolean
  onEditToggle: (editing: boolean) => void
  onSubmit: (e?: React.FormEvent<HTMLFormElement>) => void
  register: UseFormRegister<ProfileFormData>
  errors: FieldErrors<ProfileFormData>
  isSubmitting: boolean
  saving: boolean
  avatarFile: File | null
  avatarPreview: string | null
  onAvatarChange: (file: File | null) => void
  onCancel: () => void
}

export function ProfileInfoCard({
  user,
  editMode,
  onEditToggle,
  onSubmit,
  register,
  errors,
  isSubmitting,
  saving,
  avatarFile,
  avatarPreview,
  onAvatarChange,
  onCancel
}: ProfileInfoCardProps) {
  return (
    <Card className="shadow-sm border-muted">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-xl">Información Personal</CardTitle>
          <CardDescription className="text-sm mt-1.5">
            Tu información de perfil y datos de contacto
          </CardDescription>
        </div>
        {!editMode && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEditToggle(true)}
          >
            <IconEdit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-8">
        {!editMode ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b">
              <Avatar className="h-20 w-20 rounded-lg">
                {user?.avatar_url || user?.avatar ? (
                  <AvatarImage
                    src={(user.avatar_url || user.avatar) ?? undefined}
                    alt={user.name}
                    className="object-cover"
                  />
                ) : null}
                <AvatarFallback className="bg-primary/10 text-primary text-2xl rounded-lg">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <IconUser className="h-10 w-10" />}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xl font-semibold">{user?.fullname || user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Nombre</p>
                <p className="text-sm">{user?.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Nombre Completo</p>
                <p className="text-sm">{user?.fullname || "No especificado"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">DNI</p>
                <p className="text-sm">{user?.dni || "No especificado"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                <p className="text-sm">{user?.phone || "No especificado"}</p>
              </div>
            </div>

            {user?.roles && user.roles.length > 0 && (
              <div className="space-y-2 pt-4 border-t">
                <p className="text-sm font-medium">Roles Asignados</p>
                <div className="flex flex-wrap gap-2">
                  {user.roles.map((role) => (
                    <span
                      key={role}
                      className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-950 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-600/20"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <AvatarUpload
              currentAvatar={user?.avatar_url || user?.avatar}
              avatarPreview={avatarPreview}
              userName={user?.name || ""}
              onAvatarChange={onAvatarChange}
              disabled={isSubmitting || saving}
            />

            <FieldGroup>
              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="name">Nombre *</FieldLabel>
                  <Input id="name" {...register("name")} disabled={isSubmitting || saving} />
                  {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
                </Field>

                <Field>
                  <FieldLabel htmlFor="fullname">Nombre Completo</FieldLabel>
                  <Input id="fullname" {...register("fullname")} disabled={isSubmitting || saving} />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="email">Email *</FieldLabel>
                <Input id="email" type="email" {...register("email")} disabled={isSubmitting || saving} />
                {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="dni">DNI</FieldLabel>
                  <Input id="dni" {...register("dni")} disabled={isSubmitting || saving} />
                </Field>

                <Field>
                  <FieldLabel htmlFor="phone">Teléfono</FieldLabel>
                  <Input id="phone" {...register("phone")} disabled={isSubmitting || saving} />
                </Field>
              </div>

              <div className="border-t pt-4 space-y-4">
                <h3 className="text-sm font-medium">Cambiar Contraseña (Opcional)</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="password">Nueva Contraseña</FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      {...register("password")}
                      disabled={isSubmitting || saving}
                      placeholder="Mínimo 8 caracteres"
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="password_confirmation">Confirmar Contraseña</FieldLabel>
                    <Input
                      id="password_confirmation"
                      type="password"
                      {...register("password_confirmation")}
                      disabled={isSubmitting || saving}
                    />
                    {errors.password_confirmation && (
                      <p className="text-sm text-red-500 mt-1">{errors.password_confirmation.message}</p>
                    )}
                  </Field>
                </div>
              </div>
            </FieldGroup>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isSubmitting || saving}>
                <IconDeviceFloppy className="mr-2 h-4 w-4" />
                {isSubmitting || saving ? "Guardando..." : "Guardar Cambios"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                <IconX className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
