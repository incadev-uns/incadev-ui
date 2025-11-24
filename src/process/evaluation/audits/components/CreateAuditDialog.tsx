"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { LoaderIcon, PlusIcon } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

export function CreateAuditDialog({ }: { onSuccess: () => void }) {
    return (
        <Dialog>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Crear Auditoría</DialogTitle>
                    <DialogDescription>
                        Llena los campos para crear una nueva auditoría
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}