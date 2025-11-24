"use client"

import React, { useState, type ChangeEvent } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Upload, Loader2, FileText, FileType } from "lucide-react"
import { toast } from "sonner"

interface DriveUploaderProps {
  onUpload?: (url: string) => void
  label?: string
}

const DriveUploader: React.FC<DriveUploaderProps> = ({ onUpload, label = "Subir documento a Drive" }) => {
  const [fileUrl, setFileUrl] = useState<string>("")
  const [fileName, setFileName] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)

  // Tu endpoint de Google Apps Script
  const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbz4X_Z-A4cZMc6Nu_I71ACsu0gVhQyyVlIYyNmN67rKfNEep4kDXSqfHohLFSHFIWLGxg/exec"

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    setFileName(file.name)
    setLoading(true)

    try {
      // Convertir a base64
      const reader = new FileReader()
      reader.readAsDataURL(file)

      reader.onload = async () => {
        try {
          const base64 = (reader.result as string).split(",")[1]

          const payload = {
            dataReq: {
              data: base64,
              name: file.name,
              type: file.type,
            },
            fname: "uploadFilesToGoogleDrive",
          }

          const res = await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            body: JSON.stringify(payload),
          })

          const result = await res.json()

          if (result.url) {
            setFileUrl(result.url)
            toast.success("Archivo subido correctamente a Google Drive")
            if (onUpload) onUpload(result.url)
          } else if (result.obj?.url) {
            setFileUrl(result.obj.url)
            toast.success("Archivo subido correctamente a Google Drive")
            if (onUpload) onUpload(result.obj.url)
          } else {
            throw new Error("No se recibió la URL del archivo.")
          }
        } catch (error) {
          console.error("Error durante la subida:", error)
          toast.error("No se pudo subir el archivo a Drive.")
        } finally {
          setLoading(false)
        }
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al procesar el archivo.")
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="drive-upload" className="text-sm font-medium">
          {label}
        </Label>

        <div className="relative">
          <input
            id="drive-upload"
            type="file"
            name="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.xlsx,.jpg,.png,.webp"
            onChange={handleUpload}
            className="sr-only"
            disabled={loading}
          />

          <label
            htmlFor="drive-upload"
            className={`flex flex-col items-center justify-center w-full h-32 px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
              loading
                ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                : "border-gray-300 hover:border-primary hover:bg-accent/50"
            }`}
          >
            {loading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Subiendo a Drive...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">Haz clic para subir</p>
                  <p className="text-xs text-muted-foreground">
                    Formatos permitidos: PDF, DOCX, PPTX, XLSX, TXT
                  </p>
                </div>
              </div>
            )}
          </label>
        </div>
      </div>

      {fileUrl && !loading && (
        <Card className="overflow-hidden">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              {fileName.endsWith(".pdf") ? (
                <FileText className="h-5 w-5 text-primary" />
              ) : (
                <FileType className="h-5 w-5 text-blue-500" />
              )}
              <span>{fileName}</span>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
              <span>Documento cargado exitosamente</span>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Abrir en Drive
              </a>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default DriveUploader
