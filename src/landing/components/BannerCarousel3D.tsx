"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Megaphone,
  ExternalLink,
  Pause,
  Play,
} from "lucide-react";
import type { Announcement } from "@/types/developer-web";

interface BannerCarousel3DProps {
  banners: Announcement[];
}

export default function BannerCarousel3D({ banners }: BannerCarousel3DProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying || banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000); // 6 seconds per banner

    return () => clearInterval(interval);
  }, [isAutoPlaying, banners.length]);

  const goToPrevious = useCallback(() => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  }, [banners.length]);

  const goToNext = useCallback(() => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

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

    const clientX = "changedTouches" in e ? e.changedTouches[0].clientX : e.clientX;
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
    const totalItems = banners.length;
    let diff = index - currentIndex;

    // Normalize diff for circular navigation
    if (diff > totalItems / 2) diff -= totalItems;
    if (diff < -totalItems / 2) diff += totalItems;

    const baseTransition = "all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)";

    if (diff === 0) {
      // Active card - front and center
      return {
        transform: "translateX(0) translateZ(0) scale(1) rotateY(0deg)",
        zIndex: 30,
        opacity: 1,
        filter: "brightness(1) blur(0px)",
        transition: baseTransition,
      };
    } else if (diff === 1) {
      // Next card - right side
      return {
        transform: "translateX(60%) translateZ(-200px) scale(0.75) rotateY(-40deg)",
        zIndex: 20,
        opacity: 0.6,
        filter: "brightness(0.6) blur(1px)",
        transition: baseTransition,
      };
    } else if (diff === -1) {
      // Previous card - left side
      return {
        transform: "translateX(-60%) translateZ(-200px) scale(0.75) rotateY(40deg)",
        zIndex: 20,
        opacity: 0.6,
        filter: "brightness(0.6) blur(1px)",
        transition: baseTransition,
      };
    } else {
      // Cards further away - hidden
      return {
        transform: `translateX(${diff > 0 ? "100%" : "-100%"}) translateZ(-400px) scale(0.5)`,
        zIndex: 10,
        opacity: 0,
        filter: "brightness(0.4) blur(2px)",
        transition: baseTransition,
      };
    }
  };

  if (banners.length === 0) return null;

  return (
    <div className="relative w-full -mr-4 lg:-mr-8 xl:-mr-16">
      {/* 3D Carousel Container */}
      <div
        className="relative w-full h-[420px] lg:h-[540px] select-none"
        style={{ perspective: "1500px" }}
        onMouseDown={handleDragStart}
        onMouseUp={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchEnd={handleDragEnd}
      >
        {/* Cards */}
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
            style={getCardStyle(index)}
          >
            <div
              className="relative w-full max-w-lg h-full rounded-2xl overflow-hidden shadow-2xl border-2 border-border/50 dark:border-border/30"
              style={{
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden",
              }}
            >
              {/* Banner Image/Background */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: banner.image_url
                    ? `url(${banner.image_url})`
                    : "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)) 100%)",
                }}
              >
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
              </div>

              {/* Content */}
              <div className="relative h-full flex flex-col justify-end p-6 lg:p-8">
                {/* Badge */}
                <div className="mb-4">
                  <Badge
                    variant="secondary"
                    className="bg-primary/20 text-primary-foreground border border-primary/30 backdrop-blur-sm"
                  >
                    <Megaphone className="h-3 w-3 mr-1" />
                    Anuncio Importante
                  </Badge>
                </div>

                {/* Title */}
                <h3 className="text-2xl lg:text-3xl font-bold text-white mb-3 leading-tight drop-shadow-lg">
                  {banner.title}
                </h3>

                {/* Content */}
                <p className="text-white/90 text-sm lg:text-base mb-6 line-clamp-3 drop-shadow-md">
                  {banner.content}
                </p>

                {/* Action Button */}
                {banner.link_url && banner.button_text && (
                  <div>
                    <Button
                      size="lg"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 gap-2"
                      asChild
                    >
                      <a
                        href={banner.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {banner.button_text}
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                )}

                {/* Sparkles decoration for active card */}
                {index === currentIndex && (
                  <div className="absolute top-6 right-6">
                    <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
                  </div>
                )}
              </div>

              {/* 3D shine effect */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      {banners.length > 1 && (
        <>
          {/* Arrow Buttons */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-2 lg:px-4 pointer-events-none z-40">
            <Button
              size="icon"
              variant="secondary"
              className="pointer-events-auto w-11 h-11 lg:w-12 lg:h-12 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background shadow-xl border-2 border-border/50 hover:scale-110 transition-transform"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-5 w-5 lg:h-6 lg:w-6" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="pointer-events-auto w-11 h-11 lg:w-12 lg:h-12 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background shadow-xl border-2 border-border/50 hover:scale-110 transition-transform"
              onClick={goToNext}
            >
              <ChevronRight className="h-5 w-5 lg:h-6 lg:w-6" />
            </Button>
          </div>

          {/* Dot Indicators */}
          <div className="absolute bottom-4 lg:bottom-6 left-0 right-0 flex justify-center gap-2 z-40">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full hover:scale-110 ${
                  index === currentIndex
                    ? "w-8 h-3 bg-primary shadow-lg shadow-primary/50"
                    : "w-3 h-3 bg-muted-foreground/40 hover:bg-muted-foreground/60"
                }`}
                aria-label={`Ir al anuncio ${index + 1}`}
              />
            ))}
          </div>

          {/* Counter and Auto-play toggle */}
          <div className="absolute top-4 lg:top-6 left-4 lg:left-6 right-4 lg:right-6 flex items-center justify-between z-40">
            {/* Counter */}
            <div className="px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 shadow-lg">
              <span className="text-xs lg:text-sm font-medium text-foreground">
                {currentIndex + 1} / {banners.length}
              </span>
            </div>

            {/* Auto-play toggle button */}
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="w-8 h-8 rounded-full bg-background/60 backdrop-blur-sm border border-border/30 shadow-lg hover:bg-background/80 hover:border-border/50 hover:scale-110 transition-all duration-300 flex items-center justify-center group opacity-40 hover:opacity-100"
              aria-label={isAutoPlaying ? "Pausar auto-play" : "Activar auto-play"}
              title={isAutoPlaying ? "Pausar rotación automática" : "Activar rotación automática"}
            >
              {isAutoPlaying ? (
                <Pause className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
              ) : (
                <Play className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors ml-0.5" />
              )}
            </button>
          </div>
        </>
      )}

      {/* Decorative elements */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}
