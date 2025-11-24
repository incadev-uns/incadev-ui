import { useState, useEffect } from "react"
import { X, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Announcement } from "@/types/developer-web"

interface PopupAnnouncementProps {
  announcement: Announcement
  onClose: () => void
}

export function PopupAnnouncement({ announcement, onClose }: PopupAnnouncementProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [bounce, setBounce] = useState(false)

  useEffect(() => {
    // Initial animation
    setTimeout(() => setIsVisible(true), 100)

    // Periodic bounce effect to attract attention
    const bounceInterval = setInterval(() => {
      setBounce(true)
      setTimeout(() => setBounce(false), 500)
    }, 5000)

    return () => clearInterval(bounceInterval)
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
      className={`fixed bottom-6 right-6 z-[90] transition-all duration-500 ease-out ${
        isVisible && !isClosing
          ? "translate-y-0 opacity-100 scale-100"
          : "translate-y-20 opacity-0 scale-75"
      } ${bounce ? "animate-bounce" : ""}`}
      style={{ maxWidth: "380px", width: "calc(100vw - 3rem)" }}
    >
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border-2 border-blue-500 dark:border-purple-500 overflow-hidden">
        {/* Animated gradient border effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-75 blur-md animate-gradient-rotate" />

        {/* Content container */}
        <div className="relative bg-white dark:bg-gray-900 m-[2px] rounded-2xl">
          {/* Sparkle effect */}
          <div className="absolute top-2 left-2 text-yellow-400 animate-pulse">
            <Sparkles className="w-5 h-5" />
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full p-1.5 transition-all duration-200 hover:rotate-90 z-10"
            aria-label="Cerrar popup"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Image */}
          {announcement.image_url && (
            <div className="relative h-40 overflow-hidden rounded-t-2xl">
              <img
                src={announcement.image_url}
                alt={announcement.title}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          )}

          {/* Content */}
          <div className="p-5 pt-8">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 pr-6 line-clamp-2">
              {announcement.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
              {announcement.content}
            </p>

            {/* Action button */}
            {announcement.button_text && announcement.link_url && (
              <Button
                onClick={handleAction}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                {announcement.button_text}
              </Button>
            )}
          </div>

          {/* Animated shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shine pointer-events-none" />
        </div>

        {/* Floating particles effect */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
        <div className="absolute top-1/2 -left-1 w-2 h-2 bg-blue-400 rounded-full animate-ping delay-100" />
        <div className="absolute -bottom-1 left-1/4 w-2 h-2 bg-purple-400 rounded-full animate-ping delay-200" />
      </div>
    </div>
  )
}
