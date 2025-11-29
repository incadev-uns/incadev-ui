import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  BookOpen,
  Users,
  Award,
  GraduationCap,
  Megaphone,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
} from "lucide-react";
import { config } from "@/config/technology-config";
import { technologyApi } from "@/services/tecnologico/api";
import Events3DCarousel from "../components/Events3DCarousel";
import BannerCarousel3D from "../components/BannerCarousel3D";
import type { Announcement } from "@/types/developer-web";

interface HeroStats {
  students: number;
  courses: number;
  teachers: number;
}

export default function HeroSection() {
  const [stats, setStats] = useState<HeroStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [banners, setBanners] = useState<Announcement[]>([]);
  const [bannersLoaded, setBannersLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissedIds, setDismissedIds] = useState<number[]>([]);

  useEffect(() => {
    // Cargar IDs descartados
    const stored = sessionStorage.getItem("dismissedAnnouncements");
    if (stored) {
      setDismissedIds(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    fetchHeroStats();
    fetchAnnouncements();
    fetchBanners();
  }, []);

  const fetchHeroStats = async () => {
    try {
      const response = await fetch(
        `${config.apiUrl}${config.endpoints.developerWeb.landing.heroStats}`
      );
      const data = await response.json();

      if (data.success && data.data) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching hero stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(
        `${config.apiUrl}/developer-web/content?status=published`,
        {
          method: "GET",
          headers: { Accept: "application/json" },
        }
      );
      const data = await response.json();

      if (data.success && data.data?.data) {
        // Filtrar solo announcements y ordenar por prioridad
        const allAnnouncements = data.data.data
          .filter((item: any) => item.content_type === "announcement")
          .sort((a: any, b: any) => a.priority - b.priority);

        // Eliminar duplicados
        const uniqueAnnouncements = allAnnouncements.filter(
          (item: Announcement, index: number, self: Announcement[]) =>
            index === self.findIndex((t) => t.id === item.id)
        );

        setAnnouncements(uniqueAnnouncements);
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
  };

  const fetchBanners = async () => {
    try {
      const response = await technologyApi.developerWeb.announcements.published();

      if (response.success && response.data?.data) {
        // Filtrar solo banners tipo "banner" y ordenar por prioridad
        const bannerItems = response.data.data
          .filter((item: any) => item.item_type === "banner")
          .sort((a: any, b: any) => (b.priority || 0) - (a.priority || 0));

        // Delay para permitir que la imagen estática se muestre primero
        setTimeout(() => {
          setBanners(bannerItems);
          setBannersLoaded(true);
        }, 800);

        console.log("Banners cargados:", bannerItems);
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
      setBannersLoaded(true);
    }
  };

  const handleDismiss = (id: number) => {
    const newDismissed = [...dismissedIds, id];
    setDismissedIds(newDismissed);
    sessionStorage.setItem("dismissedAnnouncements", JSON.stringify(newDismissed));

    // Si el actual fue descartado, mover al siguiente disponible
    const activeAnnouncements = announcements.filter(
      (a) => !newDismissed.includes(a.id)
    );
    if (activeAnnouncements.length > 0 && currentIndex >= activeAnnouncements.length) {
      setCurrentIndex(0);
    }
  };

  const handleNext = () => {
    const activeAnnouncements = announcements.filter(
      (a) => !dismissedIds.includes(a.id)
    );
    if (currentIndex < activeAnnouncements.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Filtrar anuncios activos (no descartados)
  const activeAnnouncements = announcements.filter(
    (a) => !dismissedIds.includes(a.id)
  );

  const currentAnnouncement = activeAnnouncements[currentIndex];

  return (
    <div className="px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 2xl:px-40 py-16 lg:py-24 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-emerald-500/5 rounded-full blur-[80px] translate-y-1/2" />
      {/* Announcement Banner */}
      {activeAnnouncements.length > 0 && currentAnnouncement && (
        <div className="mb-8 animate-in slide-in-from-top-4 fade-in duration-500">
          <div className="relative bg-linear-to-r from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 border border-primary/20 rounded-xl p-4">
            {/* Botón cerrar */}
            <button
              onClick={() => handleDismiss(currentAnnouncement.id)}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-3 pr-8">
              <div className="shrink-0 p-2 rounded-lg bg-primary/10 text-primary">
                <Megaphone className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant="outline"
                    className="bg-primary/10 text-primary border-primary/20 text-xs"
                  >
                    Anuncio
                  </Badge>
                  {activeAnnouncements.length > 1 && (
                    <span className="text-xs text-muted-foreground">
                      {currentIndex + 1} de {activeAnnouncements.length}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-foreground text-sm sm:text-base leading-tight">
                  {currentAnnouncement.title}
                </h3>
                {currentAnnouncement.summary && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {currentAnnouncement.summary}
                  </p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <div>
                    {currentAnnouncement.link_url && (
                      <a
                        href={currentAnnouncement.link_url}
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                      >
                        {currentAnnouncement.button_text || "Ver más"}
                        <ChevronRight className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                  {/* Navegación */}
                  {activeAnnouncements.length > 1 && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={handleNext}
                        disabled={currentIndex === activeAnnouncements.length - 1}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Indicadores */}
            {activeAnnouncements.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-3">
                {activeAnnouncements.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentIndex
                        ? "w-4 bg-primary"
                        : "w-1.5 bg-primary/30 hover:bg-primary/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        {/* Contenido */}
        <div className="space-y-8 text-center lg:text-left">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 shadow-sm">
              <Sparkles className="h-4 w-4 animate-pulse" />
              Plataforma educativa certificada
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              La plataforma de tecnología de{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-primary to-emerald-500">
                INCADEV
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              Más de 15 cursos certificados con instructores expertos. Aprende a
              tu ritmo y alcanza tus metas profesionales.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="relative group p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 hover:bg-card transition-all duration-300">
              <div className="flex flex-col items-center lg:items-start gap-1">
                <div className="p-2 rounded-lg bg-primary/10 text-primary mb-2 group-hover:scale-110 transition-transform">
                  <Users className="h-5 w-5" />
                </div>
                <span className="text-2xl font-bold text-foreground">
                  {isLoading ? "..." : stats?.students || 0}
                </span>
                <p className="text-xs text-muted-foreground">Estudiantes activos</p>
              </div>
            </div>
            <div className="relative group p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 hover:bg-card transition-all duration-300">
              <div className="flex flex-col items-center lg:items-start gap-1">
                <div className="p-2 rounded-lg bg-primary/10 text-primary mb-2 group-hover:scale-110 transition-transform">
                  <BookOpen className="h-5 w-5" />
                </div>
                <span className="text-2xl font-bold text-foreground">
                  {isLoading ? "..." : stats?.courses || 0}
                </span>
                <p className="text-xs text-muted-foreground">Cursos disponibles</p>
              </div>
            </div>
            <div className="relative group p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 hover:bg-card transition-all duration-300">
              <div className="flex flex-col items-center lg:items-start gap-1">
                <div className="p-2 rounded-lg bg-primary/10 text-primary mb-2 group-hover:scale-110 transition-transform">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <span className="text-2xl font-bold text-foreground">
                  {isLoading ? "..." : stats?.teachers || 0}
                </span>
                <p className="text-xs text-muted-foreground">Profesores expertos</p>
              </div>
            </div>
            <div className="relative group p-4 rounded-xl bg-card/50 border border-border/50 hover:border-emerald-500/30 hover:bg-card transition-all duration-300">
              <div className="flex flex-col items-center lg:items-start gap-1">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 mb-2 group-hover:scale-110 transition-transform">
                  <Award className="h-5 w-5" />
                </div>
                <span className="text-2xl font-bold text-foreground">100%</span>
                <p className="text-xs text-muted-foreground">Certificación</p>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button size="lg" className="gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow" asChild>
              <a href="/tecnologico/web/cursos">
                Explorar Cursos
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 hover:bg-muted/50"
              onClick={() => {
                document
                  .getElementById("contact")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Contáctanos
            </Button>
          </div>
        </div>

        {/* 3D Carousel (Banners or Events) */}
        <div className="relative flex justify-center lg:justify-end">
          <div className="relative w-full">
            {/* Decorative background elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />

            {/* 3D Carousel - Show Banners if available, otherwise Events */}
            <div className="relative w-full">
              {/* Events Carousel - Always render but fade out when banners load */}
              <div
                className={`transition-opacity duration-700 ${
                  banners.length > 0 && bannersLoaded
                    ? "opacity-0 pointer-events-none absolute inset-0"
                    : "opacity-100"
                }`}
              >
                <Events3DCarousel />
              </div>

              {/* Banner Carousel - Fade in when loaded */}
              {banners.length > 0 && (
                <div
                  className={`transition-opacity duration-700 ${
                    bannersLoaded ? "opacity-100" : "opacity-0 absolute inset-0"
                  }`}
                >
                  <BannerCarousel3D banners={banners} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
