import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowRight, Newspaper, Eye, User, Loader2, Home, Megaphone, AlertTriangle, CalendarDays, Sparkles } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { config } from "@/config/technology-config";

type ContentType = "news" | "announcement" | "alert" | "event";

interface News {
  id: number;
  content_type?: ContentType;
  title: string;
  slug: string;
  summary: string;
  image_url: string;
  category: string;
  published_date: string;
  views: number;
  reading_time: string;
  author: string;
}

interface NewsDetail {
  id: number;
  content_type?: ContentType;
  title: string;
  slug: string;
  content: string;
  summary: string;
  image_url: string;
  category: string;
  published_date: string;
  views: number;
  metadata: {
    tags: string[];
    author: string;
    reading_time: string;
  };
  seo_title: string;
  seo_description: string;
}

const categoryColors: Record<string, string> = {
  business: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  education: "bg-green-500/10 text-green-600 dark:text-green-400",
  technology: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  health: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  science: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

const contentTypeConfig: Record<ContentType, {
  icon: typeof Newspaper;
  label: string;
  badgeClass: string;
  cardClass: string;
  gradientFrom: string;
  gradientTo: string;
  borderAccent: string;
  iconBgClass: string;
}> = {
  news: {
    icon: Newspaper,
    label: "Noticia",
    badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    cardClass: "hover:shadow-blue-500/10",
    gradientFrom: "from-blue-500/5",
    gradientTo: "to-transparent",
    borderAccent: "border-l-blue-500",
    iconBgClass: "bg-blue-500/10 text-blue-600",
  },
  announcement: {
    icon: Megaphone,
    label: "Anuncio",
    badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    cardClass: "hover:shadow-purple-500/10",
    gradientFrom: "from-purple-500/5",
    gradientTo: "to-transparent",
    borderAccent: "border-l-purple-500",
    iconBgClass: "bg-purple-500/10 text-purple-600",
  },
  alert: {
    icon: AlertTriangle,
    label: "Alerta",
    badgeClass: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    cardClass: "hover:shadow-red-500/10 border-red-500/20",
    gradientFrom: "from-red-500/5",
    gradientTo: "to-transparent",
    borderAccent: "border-l-red-500",
    iconBgClass: "bg-red-500/10 text-red-600",
  },
  event: {
    icon: CalendarDays,
    label: "Evento",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    cardClass: "hover:shadow-emerald-500/10",
    gradientFrom: "from-emerald-500/5",
    gradientTo: "to-transparent",
    borderAccent: "border-l-emerald-500",
    iconBgClass: "bg-emerald-500/10 text-emerald-600",
  },
};

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<NewsDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await fetch(`${config.apiUrl}${config.endpoints.developerWeb.landing.news}`);
      const data = await response.json();

      if (data.success && data.data) {
        setNews(data.data);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNewsDetail = async (id: number) => {
    setIsLoadingDetail(true);
    try {
      const response = await fetch(`${config.apiUrl}/developer-web/landing/news/${id}`);
      const data = await response.json();

      if (data.success && data.data) {
        setSelectedNews(data.data);
      }
    } catch (error) {
      console.error("Error fetching news detail:", error);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleOpenNews = async (item: News) => {
    setIsModalOpen(true);
    await fetchNewsDetail(item.id);
  };

  const formatContent = (content: string) => {
    return content.split('\r').map((paragraph, index) => {
      const trimmed = paragraph.trim();
      if (!trimmed) return null;

      if (trimmed.startsWith('-')) {
        return (
          <li key={index} className="ml-4">
            {trimmed.substring(1).trim()}
          </li>
        );
      }

      return (
        <p key={index} className="mb-4">
          {trimmed}
        </p>
      );
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
        <div className="container mx-auto px-4 py-20 md:py-24 max-w-[1400px]">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-12">
            <a href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
              <Home className="h-4 w-4" />
              Inicio
            </a>
            <span>/</span>
            <span className="text-foreground font-medium">Noticias</span>
          </nav>

          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Newspaper className="h-4 w-4" />
              <span>Centro de Noticias</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Últimas Noticias
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Mantente informado sobre eventos, logros, nuevos cursos y todo lo que sucede en INCADEV
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse overflow-hidden">
                <div className="h-48 bg-muted" />
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-1/4 mb-2" />
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
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
        <div className="container mx-auto px-4 py-20 md:py-24 max-w-[1400px]">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-12">
            <a href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
              <Home className="h-4 w-4" />
              Inicio
            </a>
            <span>/</span>
            <span className="text-foreground font-medium">Noticias</span>
          </nav>

          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Newspaper className="h-4 w-4" />
              <span>Centro de Noticias</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Últimas Noticias
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              No hay noticias disponibles en este momento.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
        <div className="container mx-auto px-4 py-20 md:py-24 max-w-[1400px]">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-12">
            <a href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
              <Home className="h-4 w-4" />
              Inicio
            </a>
            <span>/</span>
            <span className="text-foreground font-medium">Noticias</span>
          </nav>

          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Newspaper className="h-4 w-4" />
              <span>Centro de Noticias</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Últimas Noticias
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Mantente informado sobre eventos, logros, nuevos cursos y todo lo que sucede en INCADEV
            </p>
          </div>

          {/* Todas las Noticias */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item) => {
              const config = contentTypeConfig[item.content_type || 'news'];
              const ContentIcon = config.icon;

              return (
                <Card
                  key={item.id}
                  className={`group hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col relative border-l-4 ${config.borderAccent} ${config.cardClass} hover:-translate-y-1`}
                >
                  {/* Gradiente de fondo sutil */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${config.gradientFrom} ${config.gradientTo} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

                  {/* Imagen de la noticia con overlay dinámico */}
                  <div className="relative h-48 overflow-hidden bg-muted/30">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Badge de tipo de contenido - Esquina superior izquierda */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <Badge className={`${config.badgeClass} border font-semibold backdrop-blur-sm shadow-lg`}>
                        <ContentIcon className="h-3 w-3 mr-1" />
                        {config.label}
                      </Badge>
                    </div>

                    {/* Badge de categoría - Esquina superior derecha */}
                    <div className="absolute top-3 right-3">
                      <Badge className={`${categoryColors[item.category]} backdrop-blur-sm shadow-lg`}>
                        {item.category}
                      </Badge>
                    </div>

                    {/* Icono flotante para alertas y eventos */}
                    {(item.content_type === 'alert' || item.content_type === 'event') && (
                      <div className="absolute bottom-3 right-3">
                        <div className={`${config.iconBgClass} p-2 rounded-full backdrop-blur-sm shadow-lg animate-pulse`}>
                          <ContentIcon className="h-5 w-5" />
                        </div>
                      </div>
                    )}
                  </div>

                  <CardHeader className="relative z-10">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(item.published_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{item.reading_time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{item.views}</span>
                      </div>
                    </div>
                    <CardTitle className="text-xl line-clamp-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-3">
                      {item.summary}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="mt-auto relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {item.author}
                      </p>
                      {item.content_type === 'announcement' && (
                        <Badge variant="outline" className="text-xs">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Nuevo
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full gap-2 group/btn"
                      onClick={() => handleOpenNews(item)}
                    >
                      {item.content_type === 'event' ? 'Ver detalles' : 'Leer más'}
                      <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal de detalle de noticia */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[95vw] w-full lg:max-w-[85vw] xl:max-w-[1400px] max-h-[95vh] overflow-y-auto p-0">
          {isLoadingDetail ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : selectedNews ? (
            <div className="flex flex-col">
              {/* Imagen de cabecera con diseño mejorado */}
              <div className="relative w-full h-64 md:h-96">
                <img
                  src={selectedNews.image_url}
                  alt={selectedNews.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                {/* Badges superiores */}
                <div className="absolute top-6 left-6 flex items-center gap-3">
                  {(() => {
                    const config = contentTypeConfig[selectedNews.content_type || 'news'];
                    const ContentIcon = config.icon;
                    return (
                      <Badge className={`${config.badgeClass} border font-semibold backdrop-blur-md shadow-2xl text-sm px-3 py-1`}>
                        <ContentIcon className="h-4 w-4 mr-1.5" />
                        {config.label}
                      </Badge>
                    );
                  })()}
                  <Badge className={`${categoryColors[selectedNews.category]} backdrop-blur-md shadow-2xl px-3 py-1`}>
                    {selectedNews.category}
                  </Badge>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <h1 className="text-2xl md:text-4xl font-bold text-white mt-3 leading-tight drop-shadow-2xl">
                    {selectedNews.title}
                  </h1>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-6 md:p-8">
                {/* Metadatos */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-b pb-6 mb-6">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{selectedNews.metadata.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(selectedNews.published_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{selectedNews.metadata.reading_time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>{selectedNews.views} vistas</span>
                  </div>
                </div>

                {/* Resumen destacado */}
                <div className="bg-muted/50 rounded-lg p-4 mb-6 border-l-4 border-primary">
                  <p className="text-base md:text-lg italic text-muted-foreground">
                    {selectedNews.summary}
                  </p>
                </div>

                {/* Contenido principal */}
                <article className="prose prose-lg dark:prose-invert max-w-none">
                  <div className="text-base md:text-lg leading-relaxed text-foreground">
                    {formatContent(selectedNews.content)}
                  </div>
                </article>

                {/* Tags */}
                {selectedNews.metadata.tags && selectedNews.metadata.tags.length > 0 && (
                  <div className="mt-8 pt-6 border-t">
                    <p className="text-sm text-muted-foreground mb-3">Etiquetas:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedNews.metadata.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
