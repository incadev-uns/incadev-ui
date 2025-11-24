"use client"

import * as React from "react"
import type { ComponentProps } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Alias usando tu Dialog existente
const AlertDialog = Dialog
const AlertDialogContent = DialogContent
const AlertDialogDescription = DialogDescription
const AlertDialogFooter = DialogFooter
const AlertDialogHeader = DialogHeader
const AlertDialogTitle = DialogTitle

// Tipos del botón basados en tu Button
type AlertDialogButtonProps = ComponentProps<typeof Button> & {
  children: React.ReactNode
}

// Botón cancelar CON DialogClose
const AlertDialogCancel = ({ children, ...props }: AlertDialogButtonProps) => (
  <DialogClose asChild>
    <Button variant="outline" {...props}>
      {children}
    </Button>
  </DialogClose>
)

// Botón acción / confirmación
const AlertDialogAction = ({ children, ...props }: AlertDialogButtonProps) => (
  <Button {...props}>
    {children}
  </Button>
)

export {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}