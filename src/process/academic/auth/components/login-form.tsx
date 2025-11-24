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
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { z } from "zod"
import {GoogleLoginButton} from "@/process/academic/auth/components/google-login-button";
import { config } from "@/config/academic-config"
import {routes} from "@/process/academic/academic-site"

const FormSchema = z.object({
  email: z
    .string()
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
    }),
  role: z.enum(["student", "teacher"] as const, {
    error: "Debes seleccionar un tipo de sesión.",
  }),
})

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema as any) as any,
    defaultValues: {
      email: "",
      password: "",
      role: "student",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      const response = await fetch(`${config.endpoints.auth.register}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          role: data.role,
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log("Login response:", responseData.data);
        localStorage.setItem("token", JSON.stringify(responseData.data.token));
        localStorage.setItem("user", JSON.stringify(responseData.data.user));
        localStorage.setItem("role", data.role);
        toast.success("¡Inicio de sesión exitoso!", {
          description: "Redirigiendo a tu dashboard.",
        });
        
        setTimeout(() => {
          window.location.href = routes.dashboard.index;
        }, 2000);
      } else {
        const errorData = await response.json();
        toast.error(`Error: ${errorData.message || "Algo salió mal."}`);
      }
    } catch (error) {
      toast.error("Hubo un error al conectar con el servidor.");
    }

    toast.info("Datos del formulario:", {
      description: (
        <pre className="mt-2 w-[320px] rounded-md bg-neutral-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
  }

  return (
    <form 
      className={cn("flex flex-col gap-6 mt-5", className)} 
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Inicia sesión en tu cuenta</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Ingresa tu correo electrónico para acceder a tu cuenta
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor="role">Tipo de Sesión</FieldLabel>
          <select
            id="role"
            {...register("role")}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="student">Estudiante</option>
            <option value="teacher">Docente</option>
          </select>
          {errors.role && (
            <p className="text-sm text-red-500 mt-1">{errors.role.message}</p>
          )}
        </Field>
        
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input 
            id="email" 
            type="email" 
            placeholder="m@example.com" 
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
        </Field>

        <Field>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
          </Button>
        </Field>

        <FieldSeparator>O continúa con</FieldSeparator>
        
        <Field>
          <GoogleLoginButton text="Iniciar Sesión con Google"/>
          <FieldDescription className="text-center">
            ¿No tienes una cuenta?{" "}
            <a href={routes.general.register} className="underline underline-offset-4">
              Regístrate
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}