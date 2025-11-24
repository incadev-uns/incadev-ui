import * as React from "react"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ModeToggle() {
  const [theme, setThemeState] = React.useState<"light" | "dark" | "system">("light")

  React.useEffect(() => {
    // Leer tema desde localStorage al montar
    const storedTheme = localStorage.getItem("theme") as "light" | "dark" | null

    if (storedTheme) {
      setThemeState(storedTheme)
    } else {
      // Si no hay tema guardado, usar preferencia del sistema
      const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches
      setThemeState(isDarkMode ? "dark" : "light")
    }
  }, [])

  React.useEffect(() => {
    // Aplicar tema
    const isDark =
      theme === "dark" ||
      (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)

    document.documentElement.classList[isDark ? "add" : "remove"]("dark")

    // Guardar en localStorage
    if (theme !== "system") {
      localStorage.setItem("theme", theme)
    } else {
      // Si es system, guardar el tema actual resuelto
      localStorage.setItem("theme", isDark ? "dark" : "light")
    }
  }, [theme])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setThemeState("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setThemeState("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setThemeState("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}