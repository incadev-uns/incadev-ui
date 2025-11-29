import { useState, useEffect } from "react"
import { technologyApi } from "@/services/tecnologico/api"
import { BannerAnnouncement } from "./BannerAnnouncement"
import { ModalAnnouncement } from "./ModalAnnouncement"
import { PopupAnnouncement } from "./PopupAnnouncement"
import { NotificationAnnouncement } from "./NotificationAnnouncement"
import type { Announcement, AnnouncementItemType } from "@/types/developer-web"

const DISMISSED_KEY = "dismissed_announcements"
const MODAL_INITIAL_DELAY = 2000 // 2 seconds after page load for first modal
const MODAL_SEQUENTIAL_DELAY = 3000 // 3 seconds between modals
const POPUP_INITIAL_DELAY = 5000 // 5 seconds after page load for first popup
const POPUP_SEQUENTIAL_DELAY = 3000 // 3 seconds between popups
const NOTIFICATION_INITIAL_DELAY = 1000 // 1 second after page load for first notification
const NOTIFICATION_SEQUENTIAL_DELAY = 2000 // 2 seconds between notifications

export function AnnouncementManager() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [currentModalIndex, setCurrentModalIndex] = useState(0)
  const [currentPopupIndex, setCurrentPopupIndex] = useState(0)
  const [currentNotificationIndex, setCurrentNotificationIndex] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
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
      }
    } catch (error) {
      console.error("Error loading announcements:", error)
    } finally {
      setLoading(false)
    }
  }

  // Schedule modals sequentially
  useEffect(() => {
    if (loading) return

    const modals = announcements
      .filter((a) => a.item_type === "modal")
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))

    if (modals.length === 0) return

    // Show first modal after initial delay
    const initialTimeout = setTimeout(() => {
      setShowModal(true)
    }, MODAL_INITIAL_DELAY)

    return () => clearTimeout(initialTimeout)
  }, [announcements, loading])

  // Schedule popups sequentially
  useEffect(() => {
    if (loading) return

    const popups = announcements
      .filter((a) => a.item_type === "popup")
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))

    if (popups.length === 0) return

    // Show first popup after initial delay
    const initialTimeout = setTimeout(() => {
      setShowPopup(true)
    }, POPUP_INITIAL_DELAY)

    return () => clearTimeout(initialTimeout)
  }, [announcements, loading])

  // Schedule notifications sequentially
  useEffect(() => {
    if (loading) return

    const notifications = announcements
      .filter((a) => a.item_type === "notification")
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))

    if (notifications.length === 0) return

    // Show first notification after initial delay
    const initialTimeout = setTimeout(() => {
      setShowNotification(true)
    }, NOTIFICATION_INITIAL_DELAY)

    return () => clearTimeout(initialTimeout)
  }, [announcements, loading])

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

  const handleModalClose = (id: number) => {
    // Save to dismissed
    addDismissedId(id)

    // Hide current modal
    setShowModal(false)

    // Get remaining modals
    const modals = announcements
      .filter((a) => a.item_type === "modal")
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))

    // Move to next modal after delay
    if (currentModalIndex + 1 < modals.length) {
      setTimeout(() => {
        setCurrentModalIndex(currentModalIndex + 1)
        setShowModal(true)
      }, MODAL_SEQUENTIAL_DELAY)
    }
  }

  const handlePopupClose = (id: number) => {
    // Save to dismissed
    addDismissedId(id)

    // Hide current popup
    setShowPopup(false)

    // Get remaining popups
    const popups = announcements
      .filter((a) => a.item_type === "popup")
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))

    // Move to next popup after delay
    if (currentPopupIndex + 1 < popups.length) {
      setTimeout(() => {
        setCurrentPopupIndex(currentPopupIndex + 1)
        setShowPopup(true)
      }, POPUP_SEQUENTIAL_DELAY)
    }
  }

  const handleNotificationClose = (id: number) => {
    // Save to dismissed
    addDismissedId(id)

    // Hide current notification
    setShowNotification(false)

    // Get remaining notifications
    const notifications = announcements
      .filter((a) => a.item_type === "notification")
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))

    // Move to next notification after delay
    if (currentNotificationIndex + 1 < notifications.length) {
      setTimeout(() => {
        setCurrentNotificationIndex(currentNotificationIndex + 1)
        setShowNotification(true)
      }, NOTIFICATION_SEQUENTIAL_DELAY)
    }
  }

  if (loading) {
    return null
  }

  // Get sorted arrays
  const modals = announcements
    .filter((a) => a.item_type === "modal")
    .sort((a, b) => (b.priority || 0) - (a.priority || 0))

  const popups = announcements
    .filter((a) => a.item_type === "popup")
    .sort((a, b) => (b.priority || 0) - (a.priority || 0))

  const notifications = announcements
    .filter((a) => a.item_type === "notification")
    .sort((a, b) => (b.priority || 0) - (a.priority || 0))

  const currentModal = modals[currentModalIndex]
  const currentPopup = popups[currentPopupIndex]
  const currentNotification = notifications[currentNotificationIndex]

  return (
    <>
      {/* Banner - now shown in HeroSection instead */}
      {/* Removed to avoid duplication */}

      {/* Modal - center overlay - sequential display (highest priority) */}
      {showModal && currentModal && (
        <ModalAnnouncement
          announcement={currentModal}
          onClose={() => handleModalClose(currentModal.id)}
        />
      )}

      {/* Notification - top right - sequential display */}
      {/* Show independent of modal/popup */}
      {showNotification && currentNotification && (
        <NotificationAnnouncement
          announcement={currentNotification}
          onClose={() => handleNotificationClose(currentNotification.id)}
        />
      )}

      {/* Popup - bottom right - sequential display */}
      {/* Only show if no modal is active to avoid conflicts */}
      {showPopup && currentPopup && !showModal && (
        <PopupAnnouncement
          announcement={currentPopup}
          onClose={() => handlePopupClose(currentPopup.id)}
        />
      )}
    </>
  )
}
