import { useState, useEffect } from "react"
import { X, Info, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react"
import type { Announcement } from "@/types/developer-web"

interface NotificationAnnouncementProps {
  announcement: Announcement
  onClose: () => void
}

export function NotificationAnnouncement({ announcement, onClose }: NotificationAnnouncementProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setIsVisible(true), 100)

    // Auto-close after 8 seconds
    const autoCloseTimer = setTimeout(() => {
      handleClose()
    }, 8000)

    return () => clearTimeout(autoCloseTimer)
  }, [])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => onClose(), 300)
  }

  // Determine notification style based on priority or use default
  const getNotificationStyle = () => {
    const priority = announcement.priority || 0

    if (priority >= 80) {
      // High priority - Red/Error style
      return {
        icon: <AlertCircle className="w-5 h-5" />,
        colorClass: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800",
        iconColorClass: "text-red-600 dark:text-red-400",
        titleColorClass: "text-red-900 dark:text-red-100",
        contentColorClass: "text-red-700 dark:text-red-300",
      }
    } else if (priority >= 50) {
      // Medium priority - Orange/Warning style
      return {
        icon: <AlertTriangle className="w-5 h-5" />,
        colorClass: "bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800",
        iconColorClass: "text-orange-600 dark:text-orange-400",
        titleColorClass: "text-orange-900 dark:text-orange-100",
        contentColorClass: "text-orange-700 dark:text-orange-300",
      }
    } else if (priority >= 30) {
      // Low-Medium priority - Blue/Info style
      return {
        icon: <Info className="w-5 h-5" />,
        colorClass: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800",
        iconColorClass: "text-blue-600 dark:text-blue-400",
        titleColorClass: "text-blue-900 dark:text-blue-100",
        contentColorClass: "text-blue-700 dark:text-blue-300",
      }
    } else {
      // Low priority - Green/Success style
      return {
        icon: <CheckCircle className="w-5 h-5" />,
        colorClass: "bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800",
        iconColorClass: "text-emerald-600 dark:text-emerald-400",
        titleColorClass: "text-emerald-900 dark:text-emerald-100",
        contentColorClass: "text-emerald-700 dark:text-emerald-300",
      }
    }
  }

  const style = getNotificationStyle()

  return (
    <div
      className={`fixed top-20 right-6 z-[95] transition-all duration-500 ease-out ${
        isVisible && !isClosing
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0"
      }`}
      style={{ maxWidth: "420px", width: "calc(100vw - 3rem)" }}
    >
      <div
        className={`relative rounded-lg shadow-lg border ${style.colorClass} overflow-hidden`}
      >
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-black/10 dark:bg-white/10">
          <div
            className={`h-full ${style.iconColorClass.replace('text-', 'bg-')} animate-progress-notification`}
            style={{ animationDuration: "8s" }}
          />
        </div>

        <div className="p-4 pt-5">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={`shrink-0 ${style.iconColorClass}`}>
              {style.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className={`font-semibold text-sm mb-1 ${style.titleColorClass}`}>
                {announcement.title}
              </h4>
              <p className={`text-sm ${style.contentColorClass} line-clamp-3`}>
                {announcement.content}
              </p>

              {/* Link if available */}
              {announcement.link_url && announcement.button_text && (
                <a
                  href={announcement.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1 text-sm font-medium ${style.iconColorClass} hover:underline mt-2`}
                >
                  {announcement.button_text}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={handleClose}
              className={`shrink-0 ${style.iconColorClass} hover:opacity-70 transition-opacity`}
              aria-label="Cerrar notificación"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Decorative gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      </div>
    </div>
  )
}
