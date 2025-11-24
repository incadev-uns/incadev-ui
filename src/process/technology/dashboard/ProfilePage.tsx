import { useState, useEffect } from "react"
import TechnologyLayout from "@/process/technology/TechnologyLayout"
import { toast } from "sonner"
import { config } from "@/config/technology-config"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ProfileInfoCard } from "@/components/profile/ProfileInfoCard"
import { TwoFactorAuthCard } from "@/components/profile/TwoFactorAuthCard"
import { RecoveryEmailCard } from "@/components/profile/RecoveryEmailCard"

interface User {
  id: number
  name: string
  fullname?: string
  email: string
  dni?: string
  phone?: string
  avatar?: string | null
  avatar_url?: string | null
  roles?: string[]
  two_factor_enabled?: boolean
  secondary_email?: string
  secondary_email_verified?: boolean
}

const ProfileFormSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  fullname: z.string().optional(),
  email: z.string().email("Email inválido").min(1, "El email es obligatorio"),
  dni: z.string().optional(),
  phone: z.string().optional(),
  password: z.string().optional(),
  password_confirmation: z.string().optional(),
}).refine((data) => {
  if (data.password && data.password !== data.password_confirmation) {
    return false
  }
  return true
}, {
  message: "Las contraseñas no coinciden",
  path: ["password_confirmation"],
})

type ProfileFormData = z.infer<typeof ProfileFormSchema>

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)

  // Avatar states
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // 2FA States
  const [show2FASetup, setShow2FASetup] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [secret, setSecret] = useState("")
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
  const [twoFACode, setTwoFACode] = useState("")
  const [twoFAPassword, setTwoFAPassword] = useState("")
  const [processing2FA, setProcessing2FA] = useState(false)

  // Recovery Email States
  const [showRecoveryEmailSetup, setShowRecoveryEmailSetup] = useState(false)
  const [recoveryEmailStep, setRecoveryEmailStep] = useState<'add' | 'verify'>('add')
  const [recoveryEmail, setRecoveryEmail] = useState("")
  const [recoveryCode, setRecoveryCode] = useState("")
  const [processingRecovery, setProcessingRecovery] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(ProfileFormSchema),
    defaultValues: {
      name: "",
      fullname: "",
      email: "",
      dni: "",
      phone: "",
      password: "",
      password_confirmation: "",
    },
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      const response = await fetch(`${config.apiUrl}${config.endpoints.auth.me}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const responseData = await response.json()
        if (responseData.success && responseData.data && responseData.data.user) {
          const userData = responseData.data.user
          setUser(userData)
          reset({
            name: userData.name,
            fullname: userData.fullname || "",
            email: userData.email,
            dni: userData.dni || "",
            phone: userData.phone || "",
            password: "",
            password_confirmation: "",
          })
        }
      } else {
        toast.error("Error al cargar perfil")
      }
    } catch (error) {
      console.error("Error loading profile:", error)
      toast.error("Error al cargar perfil")
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = (file: File | null) => {
    if (!file) {
      setAvatarFile(null)
      setAvatarPreview(null)
      return
    }

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten archivos de imagen')
      return
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 5MB')
      return
    }

    setAvatarFile(file)

    // Crear preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setSaving(true)
      const token = localStorage.getItem("token")

      const formData = new FormData()
      formData.append('_method', 'PUT')
      formData.append('name', data.name)
      formData.append('email', data.email)

      if (data.fullname) formData.append('fullname', data.fullname)
      if (data.dni) formData.append('dni', data.dni)
      if (data.phone) formData.append('phone', data.phone)
      if (data.password) {
        formData.append('password', data.password)
        formData.append('password_confirmation', data.password_confirmation || '')
      }

      if (avatarFile) {
        formData.append('avatar', avatarFile)
      }

      const response = await fetch(`${config.apiUrl}${config.endpoints.auth.profile}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        const responseData = await response.json()
        if (responseData.success && responseData.data && responseData.data.user) {
          const userData = responseData.data.user
          setUser(userData)
          localStorage.setItem("user", JSON.stringify(userData))
          toast.success("Perfil actualizado exitosamente")
          setEditMode(false)
          setAvatarFile(null)
          setAvatarPreview(null)
          reset({
            ...data,
            password: "",
            password_confirmation: "",
          })
          loadProfile()
        }
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || "Error al actualizar perfil")
      }
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar perfil")
    } finally {
      setSaving(false)
    }
  }

  // ============== 2FA Functions ==============

  const handleEnable2FA = async () => {
    try {
      setProcessing2FA(true)
      const token = localStorage.getItem("token")

      const response = await fetch(`${config.apiUrl}${config.endpoints.twoFactor.enable}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const responseData = await response.json()
        setQrCodeUrl(responseData.data.qr_code_url)
        setSecret(responseData.data.secret)
        setRecoveryCodes(responseData.data.recovery_codes || [])
        setShow2FASetup(true)
        toast.info("Escanea el código QR con Google Authenticator")
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || "Error al habilitar 2FA")
      }
    } catch (error: any) {
      toast.error(error.message || "Error al habilitar 2FA")
    } finally {
      setProcessing2FA(false)
    }
  }

  const handleVerify2FA = async () => {
    if (!twoFACode) {
      toast.error("Ingresa el código de 6 dígitos")
      return
    }

    try {
      setProcessing2FA(true)
      const token = localStorage.getItem("token")

      const response = await fetch(`${config.apiUrl}${config.endpoints.twoFactor.verify}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: twoFACode }),
      })

      if (response.ok) {
        toast.success("2FA habilitado exitosamente")
        setShow2FASetup(false)
        setTwoFACode("")
        loadProfile()
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || "Código inválido")
      }
    } catch (error: any) {
      toast.error(error.message || "Código inválido")
    } finally {
      setProcessing2FA(false)
    }
  }

  const handleDisable2FA = async () => {
    if (!twoFAPassword) {
      toast.error("Ingresa tu contraseña")
      return
    }

    if (!confirm("¿Estás seguro de deshabilitar 2FA? Tu cuenta será menos segura.")) {
      return
    }

    try {
      setProcessing2FA(true)
      const token = localStorage.getItem("token")

      const response = await fetch(`${config.apiUrl}${config.endpoints.twoFactor.disable}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: twoFAPassword }),
      })

      if (response.ok) {
        toast.success("2FA deshabilitado")
        setTwoFAPassword("")
        loadProfile()
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || "Contraseña incorrecta")
      }
    } catch (error: any) {
      toast.error(error.message || "Contraseña incorrecta")
    } finally {
      setProcessing2FA(false)
    }
  }

  const handleRegenerateRecoveryCodes = async () => {
    const password = prompt("Ingresa tu contraseña para regenerar códigos:")
    if (!password) return

    try {
      const token = localStorage.getItem("token")

      const response = await fetch(`${config.apiUrl}${config.endpoints.twoFactor.regenerateRecoveryCodes}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      })

      if (response.ok) {
        const responseData = await response.json()
        setRecoveryCodes(responseData.data.recovery_codes || [])
        toast.success("Códigos regenerados. Guárdalos en un lugar seguro.")
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || "Error al regenerar códigos")
      }
    } catch (error: any) {
      toast.error(error.message || "Error al regenerar códigos")
    }
  }

  // ============== Secondary Email Functions ==============

  const handleAddRecoveryEmail = async () => {
    if (!recoveryEmail) {
      toast.error("Ingresa un email secundario")
      return
    }

    try {
      setProcessingRecovery(true)
      const token = localStorage.getItem("token")

      const response = await fetch(`${config.apiUrl}${config.endpoints.secondaryEmail.add}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ secondary_email: recoveryEmail }),
      })

      if (response.ok) {
        toast.success("Código enviado a tu email secundario")
        setRecoveryEmailStep('verify')
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || "Error al agregar email secundario")
      }
    } catch (error: any) {
      toast.error(error.message || "Error al agregar email")
    } finally {
      setProcessingRecovery(false)
    }
  }

  const handleVerifyRecoveryEmail = async () => {
    if (!recoveryCode) {
      toast.error("Ingresa el código de 6 dígitos")
      return
    }

    try {
      setProcessingRecovery(true)
      const token = localStorage.getItem("token")

      const response = await fetch(`${config.apiUrl}${config.endpoints.secondaryEmail.verify}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: recoveryCode }),
      })

      if (response.ok) {
        toast.success("Email secundario verificado exitosamente")
        setShowRecoveryEmailSetup(false)
        setRecoveryEmail("")
        setRecoveryCode("")
        setRecoveryEmailStep('add')
        loadProfile()
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || "Código inválido")
      }
    } catch (error: any) {
      toast.error(error.message || "Código inválido")
    } finally {
      setProcessingRecovery(false)
    }
  }

  const handleResendRecoveryCode = async () => {
    try {
      const token = localStorage.getItem("token")

      const response = await fetch(`${config.apiUrl}${config.endpoints.secondaryEmail.resendCode}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        toast.success("Nuevo código enviado")
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || "Error al reenviar código")
      }
    } catch (error: any) {
      toast.error(error.message || "Error al reenviar código")
    }
  }

  const handleRemoveRecoveryEmail = async () => {
    if (!confirm("¿Estás seguro de eliminar el email secundario?")) {
      return
    }

    try {
      const token = localStorage.getItem("token")

      const response = await fetch(`${config.apiUrl}${config.endpoints.secondaryEmail.remove}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        toast.success("Email secundario eliminado")
        loadProfile()
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || "Error al eliminar email secundario")
      }
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar email")
    }
  }

  if (loading) {
    return (
      <TechnologyLayout title="Mi Perfil">
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </TechnologyLayout>
    )
  }

  return (
    <TechnologyLayout title="Mi Perfil">
      <div className="flex flex-1 flex-col items-center">
        <div className="@container/main flex flex-1 flex-col gap-8 p-6 md:p-10 max-w-[1400px] w-full">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Mi Perfil</h2>
              <p className="text-muted-foreground">
                Administra tu información personal y configuración de seguridad
              </p>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Left Column - Profile Info */}
            <div className="space-y-8">
              <ProfileInfoCard
                user={user}
                editMode={editMode}
                onEditToggle={setEditMode}
                onSubmit={handleSubmit(onSubmit)}
                register={register}
                errors={errors}
                isSubmitting={isSubmitting}
                saving={saving}
                avatarFile={avatarFile}
                avatarPreview={avatarPreview}
                onAvatarChange={handleAvatarChange}
                onCancel={() => {
                  setEditMode(false)
                  setAvatarFile(null)
                  setAvatarPreview(null)
                  reset()
                }}
              />
            </div>

            {/* Right Column - Security */}
            <div className="space-y-8">
              <TwoFactorAuthCard
                twoFactorEnabled={user?.two_factor_enabled || false}
                show2FASetup={show2FASetup}
                qrCodeUrl={qrCodeUrl}
                secret={secret}
                recoveryCodes={recoveryCodes}
                twoFACode={twoFACode}
                twoFAPassword={twoFAPassword}
                processing2FA={processing2FA}
                onEnable2FA={handleEnable2FA}
                onVerify2FA={handleVerify2FA}
                onDisable2FA={handleDisable2FA}
                onRegenerateRecoveryCodes={handleRegenerateRecoveryCodes}
                onTwoFACodeChange={setTwoFACode}
                onTwoFAPasswordChange={setTwoFAPassword}
                onCancel2FASetup={() => {
                  setShow2FASetup(false)
                  setTwoFACode("")
                }}
              />

              <RecoveryEmailCard
                recoveryEmail={user?.secondary_email}
                recoveryEmailVerified={user?.secondary_email_verified || false}
                showRecoveryEmailSetup={showRecoveryEmailSetup}
                recoveryEmailStep={recoveryEmailStep}
                recoveryEmailInput={recoveryEmail}
                recoveryCode={recoveryCode}
                processingRecovery={processingRecovery}
                onAddRecoveryEmail={handleAddRecoveryEmail}
                onVerifyRecoveryEmail={handleVerifyRecoveryEmail}
                onResendRecoveryCode={handleResendRecoveryCode}
                onRemoveRecoveryEmail={handleRemoveRecoveryEmail}
                onRecoveryEmailInputChange={setRecoveryEmail}
                onRecoveryCodeChange={setRecoveryCode}
                onShowSetup={setShowRecoveryEmailSetup}
                onChangeStep={setRecoveryEmailStep}
              />
            </div>
          </div>
        </div>
      </div>
    </TechnologyLayout>
  )
}
