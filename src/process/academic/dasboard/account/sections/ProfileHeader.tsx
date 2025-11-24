import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IconCamera } from "@tabler/icons-react";
import { type UserData } from "@/process/academic/dasboard/account/hooks/useUserProfile";

interface ProfileHeaderProps {
  formData: UserData;
  isEditing: boolean;
  getInitials: (name: string) => string;
  getRoleLabel: (role: string | string[]) => string;
  onEditClick: () => void;
}

export function ProfileHeader({ 
  formData, 
  isEditing, 
  getInitials, 
  getRoleLabel, 
  onEditClick 
}: ProfileHeaderProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative">
            <Avatar className="h-32 w-32">
              <AvatarImage src={formData.avatar} alt={formData.name} />
              <AvatarFallback className="text-3xl">
                {getInitials(formData.fullname)}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <button 
                className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
                type="button"
              >
                <IconCamera className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-2">
            <h2 className="text-3xl font-bold">
              {formData.fullname}
            </h2>
            <p className="text-muted-foreground text-lg">{formData.email}</p>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20">
                {getRoleLabel(formData.role)}
              </span>
              <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm font-medium border border-green-500/20">
                Cuenta Activa
              </span>
              {formData.dni && (
                <span className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-sm font-medium border border-blue-500/20">
                  DNI: {formData.dni}
                </span>
              )}
            </div>
          </div>

          {!isEditing && (
            <Button
              onClick={onEditClick}
              variant="outline"
              className="mt-4 md:mt-0"
            >
              Editar Perfil
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}