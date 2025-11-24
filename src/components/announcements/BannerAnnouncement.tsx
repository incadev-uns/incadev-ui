import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Announcement } from "@/types/developer-web"

interface BannerAnnouncementProps {
  announcement: Announcement
  onClose: () => void
}

export function BannerAnnouncement({ announcement, onClose }: BannerAnnouncementProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    // Trigger animation on mount
    setTimeout(() => setIsVisible(true), 100)
  }, [])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => onClose(), 300)
  }

  const handleAction = () => {
    if (announcement.link_url) {
      window.open(announcement.link_url, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <div
      className={`fixed top-20 left-0 right-0 z-50 transition-all duration-500 ease-out ${
        isVisible && !isClosing
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0"
      }`}
    >
      <div className="mx-4 md:mx-8 lg:mx-16">
        <div
          className="relative overflow-hidden rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700"
          style={{
            background: announcement.image_url
              ? `linear-gradient(135deg, rgba(59, 130, 246, 0.95) 0%, rgba(147, 51, 234, 0.95) 100%), url(${announcement.image_url})`
              : "linear-gradient(135deg, #3b82f6 0%, #9333ea 100%)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundBlendMode: announcement.image_url ? "overlay" : "normal",
          }}
        >
          {/* Animated background effect */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer" />
          </div>

          <div className="relative px-6 py-4 md:py-5 flex items-center justify-between gap-4">
            <div className="flex-1 flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-6">
              {/* Content */}
              <div className="flex-1 space-y-1">
                <h3 className="text-white font-bold text-lg md:text-xl leading-tight">
                  {announcement.title}
                </h3>
                <p className="text-white/90 text-sm md:text-base line-clamp-2">
                  {announcement.content}
                </p>
              </div>

              {/* Action Button */}
              {announcement.button_text && announcement.link_url && (
                <Button
                  onClick={handleAction}
                  className="bg-white text-blue-600 hover:bg-gray-100 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 whitespace-nowrap"
                >
                  {announcement.button_text}
                </Button>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1.5 transition-all duration-200 hover:rotate-90"
              aria-label="Cerrar anuncio"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div
              className="h-full bg-white/60 animate-progress"
              style={{ animationDuration: "10s" }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
