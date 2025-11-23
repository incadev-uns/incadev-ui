import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { config } from "@/config/technology-config";

interface Announcement {
  id: number;
  title: string;
  content: string;
  summary: string;
  image_url: string;
  link_url: string | null;
  button_text: string | null;
  priority: number;
}

export default function AnnouncementsSection() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(`${config.apiUrl}${config.endpoints.developerWeb.landing.announcements}`);
      const data = await response.json();

      if (data.success && data.data) {
        setAnnouncements(data.data);
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <Megaphone className="h-3 w-3 mr-1" />
            Anuncios
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Últimas Novedades
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Mantente informado sobre nuestros nuevos cursos, eventos y actualizaciones importantes
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse overflow-hidden">
              <div className="h-48 bg-muted" />
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-full mt-2" />
              </CardHeader>
              <CardContent>
                <div className="h-10 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (announcements.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <Badge variant="outline" className="mb-4">
          <Megaphone className="h-3 w-3 mr-1" />
          Anuncios
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Últimas Novedades
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Mantente informado sobre nuestros nuevos cursos, eventos y actualizaciones importantes
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {announcements.map((announcement) => (
          <Card
            key={announcement.id}
            className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col"
          >
            {/* Imagen del anuncio */}
            <div className="relative h-48 overflow-hidden bg-muted/30">
              <img
                src={announcement.image_url}
                alt={announcement.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>

            <CardHeader>
              <CardTitle className="text-xl line-clamp-2">{announcement.title}</CardTitle>
              <CardDescription className="line-clamp-2">
                {announcement.summary}
              </CardDescription>
            </CardHeader>

            <CardContent className="mt-auto">
              {announcement.link_url && (
                <Button variant="default" className="w-full gap-2" asChild>
                  <a href={announcement.link_url}>
                    {announcement.button_text || "Ver más"}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
