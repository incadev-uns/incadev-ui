"use client"

import { useMemo } from "react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface PasswordStrengthIndicatorProps {
  password: string
  className?: string
}

interface PasswordStrength {
  score: number
  label: string
  color: string
  percentage: number
}

export function PasswordStrengthIndicator({
  password,
  className,
}: PasswordStrengthIndicatorProps) {
  const strength = useMemo((): PasswordStrength => {
    if (!password) {
      return { score: 0, label: "", color: "bg-gray-200", percentage: 0 }
    }

    let score = 0

    // Length check
    if (password.length >= 8) score += 25
    if (password.length >= 12) score += 15

    // Contains lowercase
    if (/[a-z]/.test(password)) score += 15

    // Contains uppercase
    if (/[A-Z]/.test(password)) score += 15

    // Contains number
    if (/\d/.test(password)) score += 15

    // Contains special character
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 15

    // Determine label and color
    let label = ""
    let color = ""

    if (score < 40) {
      label = "Débil"
      color = "bg-red-500"
    } else if (score < 60) {
      label = "Media"
      color = "bg-yellow-500"
    } else if (score < 80) {
      label = "Buena"
      color = "bg-blue-500"
    } else {
      label = "Fuerte"
      color = "bg-green-500"
    }

    return { score, label, color, percentage: score }
  }, [password])

  if (!password) return null

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Fortaleza de contraseña:</span>
        <span
          className={cn(
            "font-medium",
            strength.score < 40 && "text-red-500",
            strength.score >= 40 && strength.score < 60 && "text-yellow-500",
            strength.score >= 60 && strength.score < 80 && "text-blue-500",
            strength.score >= 80 && "text-green-500"
          )}
        >
          {strength.label}
        </span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={cn(
            "h-full transition-all duration-300 ease-in-out",
            strength.color
          )}
          style={{ width: `${strength.percentage}%` }}
        />
      </div>
      <div className="space-y-1 text-xs text-muted-foreground">
        <p>La contraseña debe contener:</p>
        <ul className="list-inside list-disc space-y-0.5 pl-2">
          <li className={password.length >= 8 ? "text-green-600" : ""}>
            Al menos 8 caracteres
          </li>
          <li className={/[a-z]/.test(password) ? "text-green-600" : ""}>
            Letras minúsculas
          </li>
          <li className={/[A-Z]/.test(password) ? "text-green-600" : ""}>
            Letras mayúsculas
          </li>
          <li className={/\d/.test(password) ? "text-green-600" : ""}>
            Números
          </li>
        </ul>
      </div>
    </div>
  )
}
