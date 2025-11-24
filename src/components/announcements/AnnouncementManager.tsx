import { useState, useEffect } from "react"
import { technologyApi } from "@/services/tecnologico/api"
import { BannerAnnouncement } from "./BannerAnnouncement"
import { ModalAnnouncement } from "./ModalAnnouncement"
import { PopupAnnouncement } from "./PopupAnnouncement"
import type { Announcement, AnnouncementItemType } from "@/types/developer-web"

const DISMISSED_KEY = "dismissed_announcements"
const MODAL_SHOW_DELAY = 2000 // 2 seconds after page load
const POPUP_SHOW_DELAY = 5000 // 5 seconds after page load

export function AnnouncementManager() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [visibleAnnouncements, setVisibleAnnouncements] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnnouncements()
  }, [])

  const loadAnnouncements = async () => {
    try {
      const response = await technologyApi.developerWeb.announcements.published()

      if (response.success && response.data?.data) {
        const publishedAnnouncements = response.data.data as Announcement[]

        // Filter out dismissed announcements
        const dismissedIds = getDismissedIds()
        const activeAnnouncements = publishedAnnouncements.filter(
          (announcement) => !dismissedIds.includes(announcement.id)
        )

        setAnnouncements(activeAnnouncements)
        scheduleAnnouncements(activeAnnouncements)
      }
    } catch (error) {
      console.error("Error loading announcements:", error)
    } finally {
      setLoading(false)
    }
  }

  const scheduleAnnouncements = (announcements: Announcement[]) => {
    announcements.forEach((announcement) => {
      const delay = getDelayForType(announcement.item_type)

      setTimeout(() => {
        setVisibleAnnouncements((prev) => new Set([...prev, announcement.id]))
      }, delay)
    })
  }

  const getDelayForType = (type: AnnouncementItemType): number => {
    switch (type) {
      case "banner":
        return 500 // Show immediately
      case "modal":
        return MODAL_SHOW_DELAY
      case "popup":
        return POPUP_SHOW_DELAY
      default:
        return 1000
    }
  }

  const getDismissedIds = (): number[] => {
    try {
      const dismissed = localStorage.getItem(DISMISSED_KEY)
      return dismissed ? JSON.parse(dismissed) : []
    } catch {
      return []
    }
  }

  const addDismissedId = (id: number) => {
    try {
      const dismissed = getDismissedIds()
      dismissed.push(id)
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissed))
    } catch (error) {
      console.error("Error saving dismissed announcement:", error)
    }
  }

  const handleClose = (id: number) => {
    // Remove from visible
    setVisibleAnnouncements((prev) => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })

    // Save to dismissed
    addDismissedId(id)
  }

  if (loading) {
    return null
  }

  // Separate announcements by type
  const banners = announcements.filter((a) => a.item_type === "banner" && visibleAnnouncements.has(a.id))
  const modals = announcements.filter((a) => a.item_type === "modal" && visibleAnnouncements.has(a.id))
  const popups = announcements.filter((a) => a.item_type === "popup" && visibleAnnouncements.has(a.id))

  // Only show the first of each type (based on priority)
  const sortByPriority = (a: Announcement, b: Announcement) => (b.priority || 0) - (a.priority || 0)

  const activeBanner = banners.sort(sortByPriority)[0]
  const activeModal = modals.sort(sortByPriority)[0]
  const activePopup = popups.sort(sortByPriority)[0]

  return (
    <>
      {/* Banner - always on top */}
      {activeBanner && (
        <BannerAnnouncement
          announcement={activeBanner}
          onClose={() => handleClose(activeBanner.id)}
        />
      )}

      {/* Modal - center overlay */}
      {activeModal && (
        <ModalAnnouncement
          announcement={activeModal}
          onClose={() => handleClose(activeModal.id)}
        />
      )}

      {/* Popup - bottom right */}
      {activePopup && (
        <PopupAnnouncement
          announcement={activePopup}
          onClose={() => handleClose(activePopup.id)}
        />
      )}
    </>
  )
}
