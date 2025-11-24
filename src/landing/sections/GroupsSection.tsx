import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Clock, MapPin, ArrowRight, GraduationCap } from "lucide-react";

// Datos de ejemplo - En producción vendrían de la API
const openGroups = [
  {
    id: 1,
    courseName: "Desarrollo Web Full Stack",
    groupName: "Grupo A - Turno Mañana",
    startDate: "2025-02-15",
    endDate: "2025-05-10",
    schedule: "Lunes a Viernes, 9:00 - 11:00 AM",
    teacher: "Dr. Carlos Ramírez",
    availableSpots: 8,
    totalSpots: 25,
    modality: "Virtual",
    status: "open"
  },
  {
    id: 2,
    courseName: "Python para Análisis de Datos",
    groupName: "Grupo B - Turno Tarde",
    startDate: "2025-02-20",
    endDate: "2025-04-30",
    schedule: "Martes y Jueves, 3:00 - 6:00 PM",
    teacher: "Mg. Ana Torres",
    availableSpots: 12,
    totalSpots: 20,
    modality: "Presencial",
    status: "open"
  },
  {
    id: 3,
    courseName: "Diseño UX/UI Profesional",
    groupName: "Grupo C - Turno Noche",
    startDate: "2025-03-01",
    endDate: "2025-04-26",
    schedule: "Lunes, Miércoles y Viernes, 7:00 - 9:00 PM",
    teacher: "Lic. María Gonzáles",
    availableSpots: 5,
    totalSpots: 18,
    modality: "Híbrido",
    status: "open"
  }
];

export default function GroupsSection() {
  const getOccupancyPercentage = (available: number, total: number) => {
    return ((total - available) / total) * 100;
  };

  const getOccupancyColor = (percentage: number) => {
    if (percentage >= 80) return "text-red-500";
    if (percentage >= 50) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <Badge variant="outline" className="mb-4">
          <Calendar className="h-3 w-3 mr-1" />
          Inscripciones Abiertas
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Próximos Grupos
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Únete a nuestros grupos de estudio con fechas de inicio próximas
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {openGroups.map((group) => {
          const occupancyPercentage = getOccupancyPercentage(group.availableSpots, group.totalSpots);
          const occupancyColor = getOccupancyColor(occupancyPercentage);

          return (
            <Card key={group.id} className="hover:shadow-xl transition-all duration-300 flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant={group.modality === "Virtual" ? "default" : group.modality === "Presencial" ? "secondary" : "outline"}>
                    {group.modality}
                  </Badge>
                  <Badge variant={group.availableSpots <= 5 ? "destructive" : "secondary"}>
                    {group.availableSpots} cupos
                  </Badge>
                </div>
                <CardTitle className="text-xl">{group.courseName}</CardTitle>
                <CardDescription>{group.groupName}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                <div className="space-y-3 mb-6">
                  {/* Profesor */}
                  <div className="flex items-center gap-2 text-sm">
                    <GraduationCap className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{group.teacher}</span>
                  </div>

                  {/* Fechas */}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">
                      {new Date(group.startDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - {new Date(group.endDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  {/* Horario */}
                  <div className="flex items-start gap-2 text-sm">
                    <Clock className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{group.schedule}</span>
                  </div>

                  {/* Ubicación */}
                  {group.modality !== "Virtual" && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">Campus INCADEV</span>
                    </div>
                  )}
                </div>

                {/* Barra de ocupación */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Ocupación</span>
                    <span className={`font-semibold ${occupancyColor}`}>
                      {group.totalSpots - group.availableSpots}/{group.totalSpots}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        occupancyPercentage >= 80 ? 'bg-red-500' :
                        occupancyPercentage >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${occupancyPercentage}%` }}
                    />
                  </div>
                </div>

                {/* CTA */}
                <Button className="w-full gap-2 mt-auto" asChild>
                  <a href={`/academico/grupos/${group.id}/inscripcion`}>
                    Inscribirme ahora
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Ver todos los grupos */}
      <div className="text-center mt-12">
        <Button variant="outline" size="lg" className="gap-2" asChild>
          <a href="/academico/grupos/disponible">
            Ver todos los grupos
            <ArrowRight className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}
