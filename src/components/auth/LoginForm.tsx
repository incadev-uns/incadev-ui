"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as TablerIcons from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import type { ModuleCategory } from "@/types/module-categories";
import type { Role } from "@/types/roles";

const {
  IconShieldCheck,
  IconLifebuoy,
  IconServer,
  IconShield,
  IconChartBar,
  IconCode,
  IconClipboardList,
  IconUserCheck,
  IconSearch,
  IconUsers,
  IconCurrencyDollar,
  IconEye,
  IconUserPlus,
  IconTrendingUp,
  IconSpeakerphone,
  IconPresentation,
  IconSchool,
  IconBook,
  IconHeart,
  IconFileText,
  IconCalendar,
  IconCalendarCheck,
  IconRepeat,
  IconLoader2,
  IconMail,
  IconLock,
  IconEyeOff,
  IconArrowLeft,
  IconHome,
  IconLayoutGrid,
} = TablerIcons;

const EyeIcon = IconEye;

// Icon mapping
const iconMap: Record<string, any> = {
  Shield: IconShieldCheck,
  LifeBuoy: IconLifebuoy,
  Server: IconServer,
  ShieldCheck: IconShieldCheck,
  BarChart3: IconChartBar,
  Code: IconCode,
  ClipboardList: IconClipboardList,
  UserCheck: IconUserCheck,
  Search: IconSearch,
  Users: IconUsers,
  DollarSign: IconCurrencyDollar,
  Eye: IconEye,
  UserPlus: IconUserPlus,
  TrendingUp: IconTrendingUp,
  Megaphone: IconSpeakerphone,
  Presentation: IconPresentation,
  GraduationCap: IconSchool,
  BookOpen: IconBook,
  Heart: IconHeart,
  FileText: IconFileText,
  Calendar: IconCalendar,
  CalendarCheck: IconCalendarCheck,
  Repeat: IconRepeat,
};

// Form Schema
const FormSchema = z.object({
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
    .min(1, {
      message: "La contraseña es obligatoria.",
    }),

  role: z
    .string()
    .min(1, {
      message: "El rol es obligatorio.",
    }),

  code: z.string().optional(),
});

type LoginFormData = z.infer<typeof FormSchema>;

interface LoginFormProps {
  moduleInfo: ModuleCategory;
  selectedRole: Role;
  onBackToRoles: () => void;
  onSubmit: (data: LoginFormData) => Promise<void>;
  requires2FA: boolean;
  code2FA: string[];
  onCode2FAChange: (index: number, value: string) => void;
}

export function LoginForm({
  moduleInfo,
  selectedRole,
  onBackToRoles,
  onSubmit,
  requires2FA,
  code2FA,
  onCode2FAChange,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
      role: selectedRole.id,
      code: "",
    },
  });

  const RoleIcon = iconMap[selectedRole.icon] || IconShieldCheck;

  return (
    <div className="bg-muted flex min-h-screen flex-col items-center justify-center p-3 sm:p-4 md:p-6 lg:p-10 pt-20 sm:pt-24 md:pt-32">
      <div className="w-full max-w-sm md:max-w-4xl">
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            <form className="p-4 sm:p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center mb-4 sm:mb-6">
                  <div className={`flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-br ${moduleInfo.gradient} mb-2`}>
                    <RoleIcon className={`h-8 w-8 sm:h-9 sm:w-9 ${moduleInfo.color}`} />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold">
                    {requires2FA ? "Verificación 2FA" : "Bienvenido"}
                  </h1>
                  <p className="text-muted-foreground text-balance text-sm sm:text-base">
                    {requires2FA ? "Ingresa tu código de verificación" : `Inicia sesión como ${selectedRole.displayName}`}
                  </p>
                </div>

                {!requires2FA ? (
                  <>
                    <Field>
                      <FieldLabel htmlFor="email">Correo Electrónico</FieldLabel>
                      <div className="relative">
                        <IconMail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="usuario@example.com"
                          className="pl-10"
                          {...register("email")}
                          disabled={isSubmitting}
                        />
                      </div>
                      {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                      <div className="relative">
                        <IconLock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Ingresa tu contraseña"
                          className="pl-10 pr-10"
                          {...register("password")}
                          disabled={isSubmitting}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          disabled={isSubmitting}
                        >
                          {showPassword ? <IconEyeOff className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
                    </Field>

                    <div className="flex justify-end -mt-2">
                      <a
                        href="/tecnologico/forgot-password"
                        className="text-sm text-primary hover:underline"
                      >
                        ¿Olvidaste tu contraseña?
                      </a>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button type="button" variant="ghost" size="sm" onClick={onBackToRoles} className="text-sm flex-1">
                        <IconArrowLeft className="mr-2 h-4 w-4" />
                        Cambiar rol
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => window.location.href = '/auth'} className="text-sm">
                        <IconLayoutGrid className="mr-2 h-4 w-4" />
                        Módulos
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => window.location.href = '/'} className="text-sm">
                        <IconHome className="mr-2 h-4 w-4" />
                        Inicio
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center gap-2">
                      {code2FA.map((digit, index) => (
                        <input
                          key={index}
                          id={`code-${index}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => onCode2FAChange(index, e.target.value)}
                          disabled={isSubmitting}
                          className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-semibold border-2 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      ))}
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={onBackToRoles} className="text-sm">
                      ← Volver al inicio de sesión
                    </Button>
                  </div>
                )}

                <Field>
                  <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
                    {isSubmitting ? (
                      <>
                        <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                        {requires2FA ? "Verificando..." : "Iniciando sesión..."}
                      </>
                    ) : requires2FA ? (
                      "Verificar código"
                    ) : (
                      "Iniciar sesión"
                    )}
                  </Button>
                </Field>
              </FieldGroup>
            </form>

            <div className="bg-muted relative hidden md:block">
              <div className={`absolute inset-0 bg-gradient-to-br ${moduleInfo.gradient}`} />
              <img
                src="/ISOLOGOTIPO_VERTICAL.svg"
                alt="INCADEV"
                className="absolute inset-0 h-full w-full object-contain p-12 lg:p-16 dark:brightness-[0.9]"
              />
              <div className="absolute bottom-6 md:bottom-8 left-6 md:left-8 right-6 md:right-8 text-center">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">{moduleInfo.name}</h2>
                <p className="text-muted-foreground text-sm md:text-base">{moduleInfo.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="px-3 sm:px-6 text-center text-xs sm:text-sm text-muted-foreground mt-4 sm:mt-6">
          Al continuar, aceptas nuestros{" "}
          <a href="#" className="underline underline-offset-4 hover:text-foreground">
            Términos de Servicio
          </a>{" "}
          y{" "}
          <a href="#" className="underline underline-offset-4 hover:text-foreground">
            Política de Privacidad
          </a>
          .
        </p>
      </div>
    </div>
  );
}
