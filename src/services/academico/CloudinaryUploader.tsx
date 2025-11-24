"use client"

import React, { useState, type ChangeEvent } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Upload, Loader2, ImageIcon, Video, ChevronDown, ChevronUp, Eye } from "lucide-react"

interface CloudinaryUploaderProps {
  onUpload?: (url: string) => void
  label?: string
  acceptType?: "image" | "video" | "both"
}

const CloudinaryUploader: React.FC<CloudinaryUploaderProps> = ({
  onUpload,
  label = "Subir archivo",
  acceptType = "both",
}) => {
  const preset_name = "incadev"
  const cloud_name = "dshi5w2wt"

  const [fileUrl, setFileUrl] = useState<string>("")
  const [fileType, setFileType] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [showPreview, setShowPreview] = useState<boolean>(false)

  const getAcceptString = () => {
    if (acceptType === "image") return "image/*"
    if (acceptType === "video") return "video/*"
    return "image/*,video/*"
  }

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    setFileType(file.type)

    if (
      (acceptType === "image" && !file.type.startsWith("image/")) ||
      (acceptType === "video" && !file.type.startsWith("video/"))
    ) {
      alert(`Solo se permiten archivos de tipo ${acceptType}.`)
      e.target.value = ""
      return
    }

    const data = new FormData()
    data.append("file", file)
    data.append("upload_preset", preset_name)

    setLoading(true)

    try {
      const resourceType = file.type.startsWith("video/") ? "video" : "image"

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/${resourceType}/upload`, {
        method: "POST",
        body: data,
      })

      const uploaded = await res.json()

      if (uploaded.secure_url) {
        setFileUrl(uploaded.secure_url)
        if (onUpload) onUpload(uploaded.secure_url)
      } else {
        throw new Error("No se recibió la URL del archivo.")
      }
    } catch (error) {
      console.error("Error al subir archivo:", error)
    } finally {
      setLoading(false)
    }
  }

  const getPreview = () => {
    if (fileType.startsWith("image/")) {
      return <img src={fileUrl} alt="Vista previa" className="h-full w-full object-cover rounded-lg border" />
    }

    if (fileType.startsWith("video/")) {
      return (
        <video controls className="w-full rounded-lg border">
          <source src={fileUrl} type={fileType} />
        </video>
      )
    }

    return null
  }

  const togglePreview = () => {
    setShowPreview(!showPreview)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="file-upload" className="text-sm font-medium">
          {label}
        </Label>

        <div className="relative">
          <input
            id="file-upload"
            type="file"
            name="file"
            accept={getAcceptString()}
            onChange={handleUpload}
            className="sr-only"
            disabled={loading}
          />

          <label
            htmlFor="file-upload"
            className={`flex flex-col items-center justify-center w-full h-32 px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
              loading
                ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                : "border-gray-300 hover:border-primary hover:bg-accent/50"
            }`}
          >
            {loading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Subiendo archivo...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">Haz clic para cargar</p>
                  <p className="text-xs text-muted-foreground">
                    {acceptType === "image"
                      ? "Solo se permiten imágenes"
                      : acceptType === "video"
                      ? "Solo se permiten videos"
                      : "Se permiten imágenes y videos"}
                  </p>
                </div>
              </div>
            )}
          </label>
        </div>
      </div>

      {fileUrl && !loading && (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {/* Header del preview - siempre visible */}
            <div 
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={togglePreview}
            >
              <div className="flex items-center gap-2">
                {fileType.startsWith("image/") ? (
                  <ImageIcon className="h-5 w-5 text-primary" />
                ) : (
                  <Video className="h-5 w-5 text-red-500" />
                )}
                <span className="text-sm font-medium">
                  {fileType.startsWith("image/") ? "Imagen cargada" : "Video cargado"}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <a 
                  href={fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Eye className="h-3 w-3" />
                  Ver original
                </a>
                {showPreview ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>

            {showPreview && (
              <div className="px-4 pb-4 border-t">
                <div className="pt-3">
                  {getPreview()}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default CloudinaryUploader