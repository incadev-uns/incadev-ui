import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Laptop, LifeBuoy, ArrowRight } from "lucide-react";

const services = [
  {
    id: 1,
    icon: BookOpen,
    title: "Cursos Educativos",
    description: "Accede a más de 15 cursos certificados en tecnología con instructores expertos",
    features: [
      "Certificados oficiales",
      "Grupos reducidos",
      "Modalidad presencial y virtual",
      "Material descargable"
    ],
    link: "/academico/grupos/disponible",
    image: "/tecnologico/landing/joven-profesor-sosteniendo-un-libro-mientras-explica-el-uso-de-gafas-en-la-pared-beige.jpg"
  },
  {
    id: 2,
    icon: Laptop,
    title: "Gestión Tecnológica",
    description: "Administra hardware, software y licencias de forma eficiente",
    features: [
      "Control de inventario",
      "Gestión de licencias",
      "Seguimiento de garantías",
      "Reportes detallados"
    ],
    link: "/tecnologico",
    image: "/tecnologico/landing/chica-joven-estudiante-aislada-en-la-pared-gris-sonriendo-la-camara-presionando-la-computadora-portatil-contra-el-pecho-con-mochila-lista-para-ir-estudios-comenzar-un-nu.jpg"
  },
  {
    id: 3,
    icon: LifeBuoy,
    title: "Soporte Técnico",
    description: "Asistencia personalizada para resolver tus dudas y problemas",
    features: [
      "Respuesta en 2 horas",
      "Chatbot 24/7",
      "Base de conocimiento",
      "Tickets prioritarios"
    ],
    link: "/soporte",
    image: "/tecnologico/landing/persona-que-realiza-terapia-de-psicologo-en-linea.jpg"
  }
];

export default function ServicesSection() {
  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Nuestros Servicios
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Todo lo que necesitas para impulsar tu desarrollo profesional
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {services.map((service) => {
          const Icon = service.icon;

          return (
            <Card
              key={service.id}
              className="group hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Imagen */}
              <div className="relative h-64 bg-muted/30 overflow-hidden flex items-center justify-center">
                <img
                  src={service.image}
                  alt={service.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>

              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </div>
                <CardDescription className="text-base">
                  {service.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-2">
                  {service.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button variant="outline" className="gap-2 w-full group/btn" asChild>
                  <a href={service.link}>
                    Conocer más
                    <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
