"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { config } from "@/config/technology-config";

interface Event {
  id: number;
  title: string;
  slug: string;
  summary: string;
  image_url: string;
  category: string;
  published_date: string;
  link_url?: string;
  button_text?: string;
  event_date?: string;
  event_location?: string;
}

export default function Events3DCarousel() {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  useEffect(() => {
    fetchEvents();
  }, []);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying || events.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, events.length]);

  const fetchEvents = async () => {
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
        const eventItems = data.data.data
          .filter((item: any) => item.content_type === "event")
          .slice(0, 6);
        setEvents(eventItems);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const goToPrevious = useCallback(() => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev === 0 ? events.length - 1 : prev - 1));
  }, [events.length]);

  const goToNext = useCallback(() => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % events.length);
  }, [events.length]);

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  // Touch/Mouse handlers for swipe
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    setStartX(clientX);
  };

  const handleDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    setIsDragging(false);

    const clientX =
      "changedTouches" in e ? e.changedTouches[0].clientX : e.clientX;
    const diff = startX - clientX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }
  };

  const getCardStyle = (index: number): React.CSSProperties => {
    const totalItems = events.length;
    let diff = index - currentIndex;

    // Normalize diff for circular navigation
    if (diff > totalItems / 2) diff -= totalItems;
    if (diff < -totalItems / 2) diff += totalItems;

    const baseTransition = "all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)";

    if (diff === 0) {
      // Active card - front and center
      return {
        transform: "translateX(0) scale(1) rotateY(0deg)",
        zIndex: 30,
        opacity: 1,
        filter: "brightness(1)",
        transition: baseTransition,
      };
    } else if (diff === 1) {
      // Next card - right side
      return {
        transform: "translateX(55%) scale(0.8) rotateY(-35deg)",
        zIndex: 20,
        opacity: 0.8,
        filter: "brightness(0.7)",
        transition: baseTransition,
      };
    } else if (diff === -1) {
      // Previous card - left side
      return {
        transform: "translateX(-55%) scale(0.8) rotateY(35deg)",
        zIndex: 20,
        opacity: 0.8,
        filter: "brightness(0.7)",
        transition: baseTransition,
      };
    } else if (diff === 2) {
      // Far right
      return {
        transform: "translateX(95%) scale(0.6) rotateY(-50deg)",
        zIndex: 10,
        opacity: 0.4,
        filter: "brightness(0.5)",
        transition: baseTransition,
      };
    } else if (diff === -2) {
      // Far left
      return {
        transform: "translateX(-95%) scale(0.6) rotateY(50deg)",
        zIndex: 10,
        opacity: 0.4,
        filter: "brightness(0.5)",
        transition: baseTransition,
      };
    } else {
      // Hidden cards
      return {
        transform: `translateX(${diff > 0 ? "120%" : "-120%"}) scale(0.4) rotateY(${diff > 0 ? "-60" : "60"}deg)`,
        zIndex: 0,
        opacity: 0,
        filter: "brightness(0.3)",
        transition: baseTransition,
      };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-PE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="relative w-full h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground text-sm">Cargando eventos...</p>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    // Fallback image when no events
    return (
      <div className="relative w-full max-w-lg mx-auto">
        <div className="relative overflow-hidden rounded-2xl shadow-2xl">
          <img
            src="/tecnologico/landing/educacion-y-estudiantes-mujer-asiatica-feliz-sosteniendo-cuadernos-y-riendo-sonriendo-la-camara-disfruta-de-goi.jpg"
            alt="Estudiante aprendiendo con INCADEV"
            className="w-full h-auto"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Header badge */}
      <div className="flex justify-center mb-6">
        <Badge
          variant="outline"
          className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-4 py-1.5"
        >
          <CalendarDays className="h-3.5 w-3.5 mr-2" />
          Próximos Eventos
        </Badge>
      </div>

      {/* 3D Carousel Container */}
      <div
        className="relative h-[380px] cursor-grab active:cursor-grabbing select-none"
        style={{ perspective: "1500px" }}
        onMouseDown={handleDragStart}
        onMouseUp={handleDragEnd}
        onMouseLeave={() => setIsDragging(false)}
        onTouchStart={handleDragStart}
        onTouchEnd={handleDragEnd}
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          {events.map((event, index) => (
            <div
              key={event.id}
              className="absolute w-[85%] max-w-[320px]"
              style={{
                ...getCardStyle(index),
                transformStyle: "preserve-3d",
              }}
            >
              {/* Event Card */}
              <div className="relative overflow-hidden rounded-2xl bg-card border border-border shadow-2xl">
                {/* Image Section */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={event.image_url || "/placeholder-event.jpg"}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />

                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-lg">
                      {event.category || "Evento"}
                    </Badge>
                  </div>

                  {/* Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" />
                </div>

                {/* Content Section */}
                <div className="p-4 space-y-3">
                  <h3 className="font-bold text-lg text-foreground line-clamp-2 leading-tight">
                    {event.title}
                  </h3>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {event.summary}
                  </p>

                  {/* Event Meta */}
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-emerald-500" />
                      <span>{formatDate(event.event_date || event.published_date)}</span>
                    </div>
                    {event.event_location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="truncate max-w-[120px]">
                          {event.event_location}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* CTA Button */}
                  {index === currentIndex && (
                    <div className="pt-2">
                      <Button
                        size="sm"
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white gap-2 group/btn"
                        asChild
                      >
                        <a href={event.link_url || `/eventos/${event.slug}`}>
                          {event.button_text || "Ver detalles"}
                          <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                        </a>
                      </Button>
                    </div>
                  )}
                </div>

                {/* Decorative Elements */}
                <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl" />
                <div className="absolute -top-2 -left-2 w-16 h-16 bg-primary/10 rounded-full blur-2xl" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Controls */}
      {events.length > 1 && (
        <div className="flex items-center justify-center gap-6 mt-6">
          {/* Previous Button */}
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full border-2 shadow-lg hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          {/* Dot Indicators */}
          <div className="flex items-center gap-2">
            {events.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-8 bg-emerald-500"
                    : "w-2 bg-muted-foreground/30 hover:bg-emerald-500/50"
                }`}
                aria-label={`Ir al evento ${index + 1}`}
              />
            ))}
          </div>

          {/* Next Button */}
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full border-2 shadow-lg hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
            onClick={goToNext}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Auto-play indicator */}
      {events.length > 1 && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full transition-colors ${
              isAutoPlaying
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <Clock className="h-3 w-3" />
            {isAutoPlaying ? "Auto-play activo" : "Auto-play pausado"}
          </button>
        </div>
      )}

      {/* Add shimmer animation to global styles */}
      <style>{`
        @keyframes shimmer {
          100% {
            transform: translateX(200%);
          }
        }
        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
