import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconMail, IconPhone, IconCalendar, IconUser } from "@tabler/icons-react";
import { type UserData } from "@/process/academic/dasboard/account/hooks/useUserProfile";

interface PersonalInfoSectionProps {
  formData: UserData;
  isEditing: boolean;
  onChange: (field: keyof UserData, value: string) => void;
}

export function PersonalInfoSection({ formData, isEditing, onChange }: PersonalInfoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconUser className="h-5 w-5 text-primary" />
          Información Personal
        </CardTitle>
        <CardDescription>
          {isEditing ? "Actualiza tu información personal" : "Tu información personal"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullname">Nombre(s) Completos *</Label>
            <Input
              id="fullname"
              placeholder="Juan"
              value={formData.fullname}
              onChange={(e) => onChange("fullname", e.target.value)}
              disabled={!isEditing}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dni">DNI</Label>
            <Input
              id="dni"
              placeholder="12345678"
              value={formData.dni || ""}
              onChange={(e) => onChange("dni", e.target.value)}
              disabled={true}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">
              <div className="flex items-center gap-2">
                <IconMail className="h-4 w-4" />
                Correo Electrónico *
              </div>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="juan.perez@example.com"
              value={formData.email}
              onChange={(e) => onChange("email", e.target.value)}
              disabled={!isEditing}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">
              <div className="flex items-center gap-2">
                <IconPhone className="h-4 w-4" />
                Teléfono
              </div>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+51 999 999 999"
              value={formData.phone}
              onChange={(e) => onChange("phone", e.target.value)}
              disabled={!isEditing}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}