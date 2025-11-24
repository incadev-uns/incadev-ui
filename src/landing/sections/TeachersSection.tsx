import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, FileText } from "lucide-react";
import { config } from "@/config/technology-config";

interface Teacher {
  id: number;
  name: string;
  avatar: string | null;
  subject_areas: string[];
  professional_summary: string | null;
  cv_path: string | null;
}

export default function TeachersSection() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await fetch(`${config.apiUrl}${config.endpoints.developerWeb.landing.featuredTeachers}`);
      const data = await response.json();

      if (data.success && data.data) {
        setTeachers(data.data);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <GraduationCap className="h-3 w-3 mr-1" />
            Nuestro Equipo
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Profesores Destacados
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Aprende de profesionales con amplia experiencia en la industria tecnológica
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-square bg-muted" />
              <CardHeader>
                <div className="h-5 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="h-16 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (teachers.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <Badge variant="outline" className="mb-4">
          <GraduationCap className="h-3 w-3 mr-1" />
          Nuestro Equipo
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Profesores Destacados
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Aprende de profesionales con amplia experiencia en la industria tecnológica
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {teachers.map((teacher) => (
          <Card key={teacher.id} className="group hover:shadow-xl transition-all duration-300 flex flex-col">
            {/* Avatar del profesor - solo si existe */}
            {teacher.avatar && teacher.avatar.trim() !== '' && (
              <div className="relative">
                <div className="aspect-square overflow-hidden bg-muted/30">
                  <img
                    src={teacher.avatar}
                    alt={teacher.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              </div>
            )}

            <CardHeader>
              <CardTitle className="text-lg capitalize">{teacher.name.toLowerCase()}</CardTitle>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col">
              {/* Áreas de especialización */}
              {teacher.subject_areas && teacher.subject_areas.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {teacher.subject_areas.map((area, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {area}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Resumen profesional */}
              {teacher.professional_summary && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {teacher.professional_summary}
                </p>
              )}

              {/* CV */}
              {teacher.cv_path && (
                <div className="mt-auto pt-4 border-t">
                  <a
                    href={teacher.cv_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <FileText className="h-4 w-4" />
                    Ver CV
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
