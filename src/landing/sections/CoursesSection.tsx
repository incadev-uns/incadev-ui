import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ArrowRight, Tag } from "lucide-react";
import { config } from "@/config/technology-config";

interface Course {
  id: number;
  name: string;
  description: string;
  image: string;
  version: string;
  version_name: string;
  price: string;
  created_at: string;
}

export default function CoursesSection() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${config.apiUrl}${config.endpoints.developerWeb.landing.courses}`);
      const data = await response.json();

      if (data.success && data.data) {
        setCourses(data.data);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <BookOpen className="h-3 w-3 mr-1" />
            Cursos Certificados
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Cursos Disponibles
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubre nuestros cursos diseñados por expertos y comienza tu camino en tecnología
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse overflow-hidden">
              <div className="h-48 bg-muted" />
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-full mt-2" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-1/3 mb-4" />
                <div className="h-10 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <Badge variant="outline" className="mb-4">
          <BookOpen className="h-3 w-3 mr-1" />
          Cursos Certificados
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Cursos Disponibles
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Descubre nuestros cursos diseñados por expertos y comienza tu camino en tecnología
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {courses.map((course) => (
          <Card key={course.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
            {/* Imagen del curso */}
            <div className="relative h-48 overflow-hidden bg-muted/30">
              <img
                src={course.image}
                alt={course.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>

            <CardHeader>
              <CardTitle className="text-xl line-clamp-2">{course.name}</CardTitle>
              <CardDescription className="line-clamp-2">
                {course.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col">
              {/* Versión */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Tag className="h-4 w-4 text-primary" />
                <span>{course.version_name}</span>
              </div>

              {/* Precio */}
              <div className="mt-auto pt-4 border-t">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-primary">
                    S/ {parseFloat(course.price).toFixed(0)}
                  </span>
                  <span className="text-sm text-muted-foreground">por curso</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ver todos los cursos */}
      <div className="text-center mt-12">
        <Button variant="outline" size="lg" className="gap-2" asChild>
          <a href="/tecnologico/web/cursos">
            Ver todos los cursos
            <ArrowRight className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}
