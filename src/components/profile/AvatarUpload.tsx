import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { IconCamera, IconUpload, IconUser } from "@tabler/icons-react"

interface AvatarUploadProps {
  currentAvatar?: string | null
  avatarPreview: string | null
  userName: string
  onAvatarChange: (file: File | null) => void
  disabled?: boolean
}

export function AvatarUpload({
  currentAvatar,
  avatarPreview,
  userName,
  onAvatarChange,
  disabled = false
}: AvatarUploadProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onAvatarChange(file)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 pb-4 border-b">
      <div className="relative group">
        <Avatar className="h-32 w-32 rounded-lg">
          {avatarPreview ? (
            <AvatarImage src={avatarPreview} alt="Preview" className="object-cover" />
          ) : currentAvatar ? (
            <AvatarImage src={currentAvatar} alt={userName} className="object-cover" />
          ) : null}
          <AvatarFallback className="bg-primary/10 text-primary text-4xl rounded-lg">
            {userName ? userName.charAt(0).toUpperCase() : <IconUser className="h-16 w-16" />}
          </AvatarFallback>
        </Avatar>
        <label
          htmlFor="avatar-upload"
          className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        >
          <IconCamera className="h-8 w-8 text-white" />
        </label>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />
      </div>
      <div className="text-center">
        <label
          htmlFor="avatar-upload"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline cursor-pointer"
        >
          <IconUpload className="h-4 w-4" />
          {avatarPreview || currentAvatar ? 'Cambiar foto' : 'Subir foto de perfil'}
        </label>
        <p className="text-xs text-muted-foreground mt-1">
          JPG, PNG o GIF. Máximo 5MB
        </p>
      </div>
    </div>
  )
}
