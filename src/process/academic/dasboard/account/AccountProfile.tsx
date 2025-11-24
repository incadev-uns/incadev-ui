import AcademicLayout from "@/process/academic/AcademicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IconUser } from "@tabler/icons-react";
import { useUserProfile } from "@/process/academic/dasboard/account/hooks/useUserProfile";
import { ProfileHeader } from "@/process/academic/dasboard/account/sections/ProfileHeader";
import { PersonalInfoSection } from "@/process/academic/dasboard/account/sections/PersonalInfoSection";
import { AlertMessage } from "@/process/academic/dasboard/account/sections/AlertMessage";
import { ProfileSkeleton } from "@/process/academic/dasboard/account/sections/ProfileSkeleton";

export default function AccountProfile() {
  const {
    mounted,
    loading,
    saving,
    message,
    isEditing,
    formData,
    setIsEditing,
    handleChange,
    handleSubmit,
    handleCancel,
    getRoleLabel,
    getInitials
  } = useUserProfile();

  if (!mounted || loading) {
    return (
      <AcademicLayout title="Perfil de usuario">
        <ProfileSkeleton />
      </AcademicLayout>
    );
  }

  return (
    <AcademicLayout title="Perfil de usuario">
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <section className="px-4 md:px-6 lg:px-10 max-w-5xl mx-auto w-full">
              <div className="space-y-6">
                <AlertMessage message={message} />

                <ProfileHeader
                  formData={formData}
                  isEditing={isEditing}
                  getInitials={getInitials}
                  getRoleLabel={getRoleLabel}
                  onEditClick={() => setIsEditing(true)}
                />

                <form onSubmit={handleSubmit} className="space-y-6">
                  <PersonalInfoSection
                    formData={formData}
                    isEditing={isEditing}
                    onChange={handleChange}
                  />

                  {isEditing && (
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={handleCancel}
                        disabled={saving}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={saving}
                      >
                        {saving ? "Guardando..." : "Guardar Cambios"}
                      </Button>
                    </div>
                  )}
                </form>

                <InfoCard />
              </div>
            </section>
          </div>
        </div>
      </div>
    </AcademicLayout>
  );
}

function InfoCard() {
  return (
    <Card className="bg-blue-500/5 border-blue-500/20">
      <CardContent className="pt-6">
        <div className="flex gap-4">
          <div className="shrink-0">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <IconUser className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold">Protege tu información</h4>
            <p className="text-sm text-muted-foreground">
              Mantén tus datos actualizados para mejorar tu experiencia en la plataforma.
              Si necesitas cambiar tu contraseña o cerrar tu cuenta, contacta con soporte.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}