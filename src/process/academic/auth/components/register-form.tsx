"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { config } from "@/config/academic-config"
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import {GoogleLoginButton} from "@/process/academic/auth/components/google-login-button";
import {routes} from "@/process/academic/academic-site";

const FormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "El nombre debe tener al menos 2 caracteres.",
    })
    .max(100, {
      message: "El nombre no debe exceder los 100 caracteres.",
    })
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
      message: "El nombre solo debe contener letras y espacios.",
    }),
  
  dni: z
    .string()
    .min(8, {
      message: "El DNI debe tener al menos 8 caracteres.",
    })
    .max(8, {
      message: "El DNI no debe exceder los 8 caracteres.",
    })
    .regex(/^[0-9]+$/, {
      message: "El DNI solo debe contener números.",
    }),
  
  email: z
    .string()
    .email({
      message: "Por favor, ingresa una dirección de correo válida.",
    })
    .min(1, {
      message: "El correo electrónico es obligatorio.",
    }),

  password: z
    .string()
    .min(8, {
      message: "La contraseña debe tener al menos 8 caracteres.",
    })
    .max(20, {
      message: "La contraseña no debe exceder los 20 caracteres.",
    })
    .regex(/[A-Z]/, {
      message: "Debe contener al menos una letra mayúscula.",
    })
    .regex(/[0-9]/, {
      message: "Debe contener al menos un número.",
    }),
  
  password_confirmation: z
    .string()
    .min(1, {
      message: "Debes confirmar tu contraseña.",
    }),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Las contraseñas no coinciden.",
  path: ["password_confirmation"],
})

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema as any) as any,
    defaultValues: {
      name: "",
      dni: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
  })

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      const response = await fetch(`${config.apiUrl}${config.endpoints.auth.register}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          dni: data.dni,
          email: data.email,
          password: data.password,
          password_confirmation: data.password_confirmation,
        }),
      })

      if (response.ok) {
        const responseData = await response.json()
        
        toast.success("¡Registro exitoso!", {
          description: "Tu cuenta ha sido creada. Redirigiendo al inicio de sesión.",
        })
        
        reset()
        
        setTimeout(() => {
          window.location.href = routes.general.login
        }, 2000)
      } else {
        const errorData = await response.json()
        
        if (errorData.errors) {
          Object.keys(errorData.errors).forEach((key) => {
            errorData.errors[key].forEach((error: string) => {
              toast.error(error)
            })
          })
        } else {
          toast.error(`Error: ${errorData.message || "Algo salió mal durante el registro."}`)
        }
      }
    } catch (error) {
      console.error("Error de registro:", error)
      toast.error("Hubo un error al conectar con el servidor.")
    }
  }

  return (
    <div 
      className={cn("flex flex-col gap-6 mt-5", className)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Crea tu cuenta</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Completa los datos para registrarte en la plataforma
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor="name">Nombre Completo</FieldLabel>
          <Input 
            id="name" 
            type="text" 
            placeholder="Ingresa tu nombre completo" 
            {...register("name")}
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
          )}
        </Field>
        
        <Field>
          <FieldLabel htmlFor="dni">DNI / Documento</FieldLabel>
          <Input 
            id="dni" 
            type="text" 
            placeholder="12345678" 
            maxLength={8}
            {...register("dni")}
          />
          {errors.dni && (
            <p className="text-sm text-red-500 mt-1">{errors.dni.message}</p>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="email">Correo Electrónico</FieldLabel>
          <Input 
            id="email" 
            type="email" 
            placeholder="tu@correo.com" 
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Contraseña</FieldLabel>
          <div className="relative">
            <Input
              id="password" 
              type={showPassword ? "text" : "password"}
              placeholder="Mínimo 8 caracteres"
              className="pr-10"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
          )}
          <FieldDescription className="text-xs">
            Debe contener al menos 8 caracteres, una mayúscula y un número
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="password_confirmation">Confirmar Contraseña</FieldLabel>
          <div className="relative">
            <Input
              id="password_confirmation" 
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Repite tu contraseña"
              className="pr-10"
              {...register("password_confirmation")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password_confirmation && (
            <p className="text-sm text-red-500 mt-1">{errors.password_confirmation.message}</p>
          )}
        </Field>

        <Field>
          <Button 
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
          </Button>
        </Field>

        <FieldSeparator>O regístrate con</FieldSeparator>
        
        <Field>
          <GoogleLoginButton text="Registrarse con Google"/>
          <FieldDescription className="text-center">
            ¿Ya tienes una cuenta?{" "}
            <a href={routes.general.login} className="underline underline-offset-4 hover:text-primary transition-colors">
              Inicia sesión
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </div>
  )
}