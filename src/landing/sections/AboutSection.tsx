import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Eye, Award, Users, BookOpen, TrendingUp, Shield, Heart } from "lucide-react";

const values = [
  {
    icon: Award,
    title: "Excelencia Educativa",
    description: "Comprometidos con la calidad y actualización constante de nuestros programas"
  },
  {
    icon: Users,
    title: "Comunidad Activa",
    description: "Fomentamos el aprendizaje colaborativo y el networking profesional"
  },
  {
    icon: TrendingUp,
    title: "Enfoque Práctico",
    description: "Proyectos reales y casos de estudio del mundo empresarial"
  },
  {
    icon: Shield,
    title: "Certificación Oficial",
    description: "Certificados reconocidos que impulsan tu carrera profesional"
  }
];

const stats = [
  {
    icon: BookOpen,
    value: "15+",
    label: "Cursos Especializados"
  },
  {
    icon: Users,
    value: "500+",
    label: "Estudiantes Graduados"
  },
  {
    icon: Award,
    value: "98%",
    label: "Satisfacción"
  },
  {
    icon: Heart,
    value: "4.9/5",
    label: "Calificación"
  }
];

export default function AboutSection() {
  return (
    <div className="container mx-auto px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <Heart className="h-3 w-3 mr-1" />
            Nuestra Historia
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Acerca de INCADEV
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Transformando vidas a través de la educación tecnológica de calidad
          </p>
        </div>

        {/* Misión y Visión */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Nuestra Misión</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Proporcionar educación tecnológica de excelencia, accesible y práctica, que empodere a nuestros estudiantes
                para alcanzar sus metas profesionales y contribuir al desarrollo tecnológico de nuestra región.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-blue-500/5 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Nuestra Visión</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Ser la plataforma educativa líder en tecnología de Latinoamérica, reconocida por la calidad de nuestros
                programas, la empleabilidad de nuestros graduados y el impacto positivo en la transformación digital.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Valores */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-foreground text-center mb-8">
            Nuestros Valores
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-all duration-300">
                  <CardContent className="pt-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h4 className="font-semibold text-foreground mb-2">{value.title}</h4>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Estadísticas */}
        <Card className="bg-gradient-to-br from-primary/10 via-blue-500/5 to-purple-500/5">
          <CardContent className="py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Historia */}
        <div className="mt-12 text-center max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-foreground mb-4">Nuestra Historia</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            INCADEV nació en 2020 con la visión de democratizar la educación tecnológica en el Perú.
            Desde nuestros inicios, hemos formado a más de 500 profesionales en diversas áreas de la tecnología,
            con un enfoque práctico y orientado a resultados.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Hoy somos una comunidad vibrante de estudiantes, profesores y egresados comprometidos con la excelencia
            y la innovación. Nuestros graduados trabajan en las principales empresas tecnológicas de la región,
            y muchos han emprendido sus propios proyectos exitosos.
          </p>
        </div>
      </div>
    </div>
  );
}
