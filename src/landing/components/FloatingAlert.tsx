import { useState, useEffect } from "react";
import {
  X,
  AlertTriangle,
  Info,
  CheckCircle,
  AlertCircle,
  Wrench,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { config } from "@/config/technology-config";

interface ContentItem {
  id: number;
  content_type: "alert";
  title: string;
  summary: string;
  content: string;
  item_type: string | null;
  priority: number;
  status: string;
  link_url?: string | null;
  button_text?: string | null;
}

// Iconos según item_type (para alerts)
const alertItemIcons: Record<string, React.ElementType> = {
  information: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  error: AlertCircle,
  maintenance: Wrench,
};

// Estilos shadcn-compatible para alerts (usando variables CSS del tema)
const alertItemStyles: Record<string, {
  card: string;
  icon: string;
  badge: string;
  accent: string;
}> = {
  information: {
    card: "border-l-4 border-l-blue-500 dark:border-l-blue-400",
    icon: "text-blue-600 dark:text-blue-400",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
    accent: "text-blue-600 dark:text-blue-400",
  },
  warning: {
    card: "border-l-4 border-l-yellow-500 dark:border-l-yellow-400",
    icon: "text-yellow-600 dark:text-yellow-400",
    badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300",
    accent: "text-yellow-600 dark:text-yellow-400",
  },
  success: {
    card: "border-l-4 border-l-green-500 dark:border-l-green-400",
    icon: "text-green-600 dark:text-green-400",
    badge: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
    accent: "text-green-600 dark:text-green-400",
  },
  error: {
    card: "border-l-4 border-l-destructive",
    icon: "text-destructive",
    badge: "bg-destructive/10 text-destructive",
    accent: "text-destructive",
  },
  maintenance: {
    card: "border-l-4 border-l-orange-500 dark:border-l-orange-400",
    icon: "text-orange-600 dark:text-orange-400",
    badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300",
    accent: "text-orange-600 dark:text-orange-400",
  },
};


export default function FloatingAlert() {
  const [notifications, setNotifications] = useState<ContentItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<number[]>([]);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("dismissedNotifications");
    if (stored) {
      setDismissedIds(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    // Evitar doble fetch en StrictMode
    if (hasFetched) return;

    const fetchContent = async () => {
      try {
        const response = await fetch(
          `${config.apiUrl}/developer-web/content?status=published`,
          {
            method: "GET",
            headers: { Accept: "application/json" },
          }
        );

        const result = await response.json();

        if (result.success && result.data?.data) {
          // Solo filtrar alerts (announcements se muestran en HeroSection)
          const items = result.data.data
            .filter((item: ContentItem) => item.content_type === "alert")
            .sort((a: ContentItem, b: ContentItem) => a.priority - b.priority);

          // Eliminar duplicados por id
          const uniqueItems = items.filter(
            (item: ContentItem, index: number, self: ContentItem[]) =>
              index === self.findIndex((t) => t.id === item.id)
          );

          const storedDismissed = JSON.parse(
            sessionStorage.getItem("dismissedNotifications") || "[]"
          );
          const activeItems = uniqueItems.filter(
            (item: ContentItem) => !storedDismissed.includes(item.id)
          );

          if (activeItems.length > 0) {
            setNotifications(activeItems);
            setTimeout(() => setIsVisible(true), 500);
          }
        }
      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        setHasFetched(true);
      }
    };

    fetchContent();
  }, [hasFetched]);

  const handleDismiss = () => {
    const current = notifications[currentIndex];
    if (!current) return;

    setIsVisible(false);

    // Guardar en sessionStorage y estado
    const newDismissed = [...dismissedIds, current.id];
    setDismissedIds(newDismissed);
    sessionStorage.setItem("dismissedNotifications", JSON.stringify(newDismissed));

    setTimeout(() => {
      // Buscar la siguiente notificación no descartada
      let nextIndex = -1;
      for (let i = currentIndex + 1; i < notifications.length; i++) {
        if (!newDismissed.includes(notifications[i].id)) {
          nextIndex = i;
          break;
        }
      }

      if (nextIndex !== -1) {
        setCurrentIndex(nextIndex);
        setIsVisible(true);
      }
      // Si no hay más, simplemente no mostramos nada (el componente se oculta)
    }, 300);
  };

  const handleNext = () => {
    // Buscar la siguiente notificación no descartada
    for (let i = currentIndex + 1; i < notifications.length; i++) {
      if (!dismissedIds.includes(notifications[i].id)) {
        setIsVisible(false);
        setTimeout(() => {
          setCurrentIndex(i);
          setIsVisible(true);
        }, 200);
        return;
      }
    }
  };

  // Calcular notificaciones activas (no descartadas)
  const activeNotifications = notifications.filter(
    (n) => !dismissedIds.includes(n.id)
  );

  // Si no hay notificaciones activas, no mostrar nada
  if (activeNotifications.length === 0) return null;

  const current = notifications[currentIndex];

  // Si la notificación actual ya fue descartada, no mostrar
  if (!current || dismissedIds.includes(current.id)) return null;

  const itemType = current.item_type || "information";

  // Obtener estilos según el tipo de alerta
  const styles = alertItemStyles[itemType] || alertItemStyles.information;
  const Icon = alertItemIcons[itemType] || Info;

  // Contar notificaciones restantes (activas después de la actual)
  const remainingCount = notifications
    .slice(currentIndex + 1)
    .filter((n) => !dismissedIds.includes(n.id)).length;

  return (
    <div
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-2xl
        transition-all duration-300 ease-out
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}`}
    >
      <Card className={`${styles.card} shadow-lg dark:shadow-2xl overflow-hidden bg-card`}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/50">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-md ${styles.badge}`}>
              <Icon className="h-4 w-4" />
            </div>
            <Badge variant="outline" className={`${styles.badge} border-0 font-semibold`}>
              Alerta
            </Badge>
            {remainingCount > 0 && (
              <span className="text-xs text-muted-foreground">
                +{remainingCount} más
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Contenido */}
        <div className="px-4 py-3">
          <h4 className={`font-semibold text-sm sm:text-base leading-tight mb-1 ${styles.accent}`}>
            {current.title}
          </h4>
          {current.summary && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {current.summary}
            </p>
          )}
        </div>

        {/* Footer con acciones */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t bg-muted/30">
          <div>
            {current.link_url && (
              <a
                href={current.link_url}
                className={`text-sm font-medium ${styles.accent} hover:underline inline-flex items-center gap-1`}
              >
                {current.button_text || "Ver más"}
                <ChevronRight className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {remainingCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={handleNext}
              >
                Siguiente
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
              onClick={handleDismiss}
            >
              Cerrar
            </Button>
          </div>
        </div>
      </Card>

      {/* Indicador de notificaciones activas */}
      {activeNotifications.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {activeNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`h-2 rounded-full transition-all ${
                notification.id === current.id
                  ? "w-6 bg-primary"
                  : "w-2 bg-muted-foreground/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
