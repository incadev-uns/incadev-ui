import { useState, useEffect } from "react"
import { X, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Announcement } from "@/types/developer-web"

interface ModalAnnouncementProps {
  announcement: Announcement
  onClose: () => void
}

export function ModalAnnouncement({ announcement, onClose }: ModalAnnouncementProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    // Prevent body scroll
    document.body.style.overflow = "hidden"

    // Trigger animation
    setTimeout(() => setIsVisible(true), 50)

    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      document.body.style.overflow = ""
      onClose()
    }, 300)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  const handleAction = () => {
    if (announcement.link_url) {
      window.open(announcement.link_url, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <div
      className={`fixed inset-0 z-[110] flex items-center justify-center p-4 transition-all duration-300 ${
        isVisible && !isClosing ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleBackdropClick}
    >
      {/* Backdrop with blur */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300 ${
          isVisible && !isClosing ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 ${
          isVisible && !isClosing
            ? "scale-100 rotate-0 opacity-100"
            : "scale-75 rotate-3 opacity-0"
        }`}
        style={{
          transformOrigin: "center",
        }}
      >
        {/* Header with image */}
        {announcement.image_url && (
          <div className="relative h-48 md:h-64 overflow-hidden">
            <img
              src={announcement.image_url}
              alt={announcement.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            {/* Close button on image */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 transition-all duration-200 hover:scale-110 hover:rotate-90 shadow-lg"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title overlay on image */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h2 className="text-white text-2xl md:text-3xl font-bold drop-shadow-lg">
                {announcement.title}
              </h2>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 md:p-8">
          {/* Title if no image */}
          {!announcement.image_url && (
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white pr-4">
                {announcement.title}
              </h2>
              <button
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full p-2 transition-all duration-200 hover:rotate-90"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Content text */}
          <div className="prose dark:prose-invert max-w-none mb-6">
            <p className="text-gray-700 dark:text-gray-300 text-base md:text-lg leading-relaxed whitespace-pre-wrap">
              {announcement.content}
            </p>
          </div>

          {/* Action buttons */}
          {announcement.button_text && announcement.link_url && (
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={handleAction}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                {announcement.button_text}
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
              <Button
                onClick={handleClose}
                variant="outline"
                className="sm:w-auto"
              >
                Cerrar
              </Button>
            </div>
          )}
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-full blur-3xl -z-10" />
      </div>
    </div>
  )
}
