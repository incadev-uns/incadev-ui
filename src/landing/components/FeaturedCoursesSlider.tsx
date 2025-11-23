import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Tag, BookOpen } from "lucide-react";
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

export default function FeaturedCoursesSlider() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${config.apiUrl}${config.endpoints.developerWeb.landing.courses}`);
      const data = await response.json();

      if (data.success && data.data) {
        // Limitar a los últimos 4 cursos
        const limitedCourses = data.data.slice(0, 4);
        setCourses(limitedCourses);
        // Centrar en el segundo curso si hay más de 2
        if (limitedCourses.length > 2) {
          setCurrentIndex(1);
        }
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? courses.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === courses.length - 1 ? 0 : prev + 1));
  };

  const getCardStyle = (index: number) => {
    const diff = index - currentIndex;

    if (diff === 0) {
      return {
        transform: 'translateX(0%) scale(1) rotateY(0deg)',
        zIndex: 30,
        opacity: 1,
        filter: 'brightness(1)'
      };
    } else if (diff === 1 || diff === -(courses.length - 1)) {
      return {
        transform: 'translateX(70%) scale(0.85) rotateY(-25deg)',
        zIndex: 20,
        opacity: 0.7,
        filter: 'brightness(0.8)'
      };
    } else if (diff === -1 || diff === courses.length - 1) {
      return {
        transform: 'translateX(-70%) scale(0.85) rotateY(25deg)',
        zIndex: 20,
        opacity: 0.7,
        filter: 'brightness(0.8)'
      };
    } else if (Math.abs(diff) === 2) {
      return {
        transform: diff > 0 ? 'translateX(140%) scale(0.7) rotateY(-35deg)' : 'translateX(-140%) scale(0.7) rotateY(35deg)',
        zIndex: 10,
        opacity: 0.4,
        filter: 'brightness(0.6)'
      };
    } else {
      return {
        transform: 'translateX(0%) scale(0.5)',
        zIndex: 0,
        opacity: 0,
        filter: 'brightness(0.5)'
      };
    }
  };

  if (isLoading) {
    return (
      <div className="w-full py-8">
        <div className="text-center mb-8">
          <Badge variant="outline" className="mb-4">
            <BookOpen className="h-3 w-3 mr-1" />
            Nuevos Cursos
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Últimos Cursos Publicados
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubre los cursos más recientes agregados a nuestra plataforma
          </p>
        </div>
        <div className="flex justify-center">
          <Card className="w-full max-w-md animate-pulse">
            <div className="h-56 bg-muted" />
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-full mt-2" />
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-muted rounded w-1/3 mb-4" />
              <div className="h-10 bg-muted rounded" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return null;
  }

  return (
    <div className="w-full py-8">
      <div className="text-center mb-16">
        <Badge variant="outline" className="mb-4">
          <BookOpen className="h-3 w-3 mr-1" />
          Nuevos Cursos
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Últimos Cursos Publicados
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Descubre los cursos más recientes agregados a nuestra plataforma
        </p>
      </div>

      {/* Slider Container */}
      <div className="relative h-[420px] mb-8" style={{ perspective: '2000px' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          {courses.map((course, index) => (
            <div
              key={course.id}
              className="absolute w-full max-w-md transition-all duration-700 ease-out"
              style={{
                ...getCardStyle(index),
                transformStyle: 'preserve-3d'
              }}
            >
              <Card className="overflow-hidden border-2 shadow-2xl h-full">
                {/* Imagen del curso */}
                <div className="relative h-56 overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10">
                  <img
                    src={course.image}
                    alt={course.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>

                <CardHeader>
                  <CardTitle className="text-xl line-clamp-2">{course.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {course.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {/* Versión */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Tag className="h-4 w-4 text-primary" />
                    <span>{course.version_name}</span>
                  </div>

                  {/* Precio */}
                  <div className="pt-4 border-t">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-primary">
                        S/ {parseFloat(course.price).toFixed(0)}
                      </span>
                      <span className="text-sm text-muted-foreground">por curso</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Controles de navegación */}
      {courses.length > 1 && (
        <div className="flex items-center justify-center gap-8">
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg z-40"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          {/* Indicadores */}
          <div className="flex gap-2">
            {courses.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-8 bg-primary'
                    : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Ir al curso ${index + 1}`}
              />
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg z-40"
            onClick={goToNext}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      )}
    </div>
  );
}
