import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Search,
  ChevronLeft,
  ChevronRight,
  Tag,
  Home
} from "lucide-react";
import FeaturedCoursesSlider from "./FeaturedCoursesSlider";
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

export default function CourseCatalog() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 6;

  useEffect(() => {
    fetchCourses();
  }, []);

  // Agregar estilos de animación en el cliente
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const styleId = 'course-catalog-animations';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `;
        document.head.appendChild(style);
      }
    }
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

  // Filtrar cursos
  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.name.toLowerCase().includes(search.toLowerCase()) ||
                         course.description.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  // Paginación
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  // Reset página cuando cambian los filtros
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
        <div className="container mx-auto px-4 py-20 md:py-24 max-w-[1400px]">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <a href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
              <Home className="h-4 w-4" />
              Inicio
            </a>
            <span>/</span>
            <span className="text-foreground font-medium">Catálogo de Cursos</span>
          </nav>

          <div className="space-y-3 mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <BookOpen className="h-4 w-4" />
              <span>Cargando cursos...</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Catálogo de Cursos
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse overflow-hidden">
                <div className="h-48 bg-muted" />
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-full mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded w-1/3 mb-4" />
                  <div className="h-8 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-20 md:py-24 max-w-[1400px]">
        {/* Header con breadcrumbs */}
        <div className="flex flex-col gap-6 mb-12">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <a href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
              <Home className="h-4 w-4" />
              Inicio
            </a>
            <span>/</span>
            <span className="text-foreground font-medium">Catálogo de Cursos</span>
          </nav>

          {/* Título y descripción */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <BookOpen className="h-4 w-4" />
              <span>{courses.length} Cursos Disponibles</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Catálogo de Cursos
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-3xl">
              Descubre cursos diseñados por expertos de la industria. Aprende a tu ritmo y obtén certificados reconocidos.
            </p>
          </div>
        </div>

        {/* Slider de Cursos Destacados */}
        <div className="mb-16">
          <FeaturedCoursesSlider />
        </div>

        {/* Búsqueda */}
        <div className="mb-12">
          <Card className="shadow-lg border-muted/50">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar cursos..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    handleFilterChange();
                  }}
                  className="pl-10"
                />
              </div>

              {/* Contador de resultados */}
              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Mostrando <span className="font-semibold text-foreground">{currentCourses.length}</span> de{" "}
                  <span className="font-semibold text-foreground">{filteredCourses.length}</span> cursos
                </p>
                {search && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearch("");
                      setCurrentPage(1);
                    }}
                    className="text-xs"
                  >
                    Limpiar búsqueda
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grid de Cursos */}
        {currentCourses.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-muted p-6 mb-4">
                <BookOpen className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No se encontraron cursos</h3>
              <p className="text-muted-foreground text-center max-w-md mb-4">
                Intenta realizar una búsqueda diferente para encontrar más resultados
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setCurrentPage(1);
                }}
              >
                Mostrar todos los cursos
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentCourses.map((course, index) => (
                <Card
                  key={course.id}
                  className="group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col border-muted/50"
                  style={{
                    animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                  }}
                >
                  {/* Imagen del curso */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10">
                    <img
                      src={course.image}
                      alt={course.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
                        <span className="text-3xl font-bold text-primary">
                          S/ {parseFloat(course.price).toFixed(0)}
                        </span>
                        <span className="text-sm text-muted-foreground">por curso</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <Card className="shadow-lg border-muted/50 mt-8">
                <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
                  <div className="text-sm text-muted-foreground">
                    Página <span className="font-semibold text-foreground">{currentPage}</span> de{" "}
                    <span className="font-semibold text-foreground">{totalPages}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCurrentPage(currentPage - 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={currentPage === 1}
                      className="gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>

                    {/* Números de página */}
                    <div className="hidden sm:flex gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setCurrentPage(pageNum);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="w-9"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCurrentPage(currentPage + 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={currentPage === totalPages}
                      className="gap-1"
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
