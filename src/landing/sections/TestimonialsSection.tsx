import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Quote } from "lucide-react";
import { config } from "@/config/technology-config";

interface Testimonial {
  id: number;
  student_name: string;
  student_avatar: string;
  comment: string;
  rating: number | null;
  date: string;
}

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await fetch(`${config.apiUrl}${config.endpoints.developerWeb.landing.testimonials}`);
      const data = await response.json();

      if (data.success && data.data) {
        setTestimonials(data.data);
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />
            Testimonios
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Lo Que Dicen Nuestros Estudiantes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Conoce las experiencias de quienes ya transformaron su carrera con INCADEV
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div key={j} className="h-4 w-4 bg-muted rounded" />
                  ))}
                </div>
                <div className="h-20 bg-muted rounded mb-6" />
                <div className="flex items-center gap-3 pt-4 border-t">
                  <div className="w-12 h-12 rounded-full bg-muted" />
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Si no hay testimonios, no mostrar la sección
  if (testimonials.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <Badge variant="outline" className="mb-4">
          <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />
          Testimonios
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Lo Que Dicen Nuestros Estudiantes
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Conoce las experiencias de quienes ya transformaron su carrera con INCADEV
        </p>
      </div>

      {/* Grid de testimonios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.id} className="relative hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              {/* Icono de comillas */}
              <div className="absolute top-4 right-4 text-primary/10">
                <Quote className="h-12 w-12" />
              </div>

              {/* Rating */}
              {testimonial.rating && (
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, index) => (
                    <Star
                      key={index}
                      className={`h-4 w-4 ${
                        index < testimonial.rating!
                          ? 'fill-yellow-500 text-yellow-500'
                          : 'text-muted'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Comentario */}
              <p className="text-sm text-muted-foreground mb-6 line-clamp-4 italic">
                "{testimonial.comment}"
              </p>

              {/* Información del estudiante */}
              <div className="flex items-center gap-3 pt-4 border-t">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={testimonial.student_avatar}
                    alt={testimonial.student_name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">
                    {testimonial.student_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(testimonial.date).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
