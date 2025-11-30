import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Users, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface Student {
  id: number;
  name: string;
  email: string;
  courses: number;
  status: 'active' | 'inactive';
}

interface NewStudentsProps {
  data: Student[];
  title?: string;
  description?: string;
  className?: string;
  maxItems?: number;
  showIcon?: boolean;
  showStatus?: boolean;
  showCourses?: boolean;
  avatarColor?: string;
  avatarIconColor?: string;
}

export default function NewStudents({
  data,
  title = "Estudiantes Recientes",
  description = "Últimos estudiantes registrados",
  className,
  maxItems = 5,
  showIcon = true,
  showStatus = true,
  showCourses = true,
  avatarColor = "bg-sky-100 dark:bg-sky-900/30",
  avatarIconColor = "text-sky-600 dark:text-sky-400",
}: NewStudentsProps) {
  const [showAll, setShowAll] = useState(false);
  const [visibleItems, setVisibleItems] = useState(maxItems);

  const displayData = showAll ? data : data.slice(0, visibleItems);
  const hasMore = data.length > visibleItems;
  const totalStudents = data.length;

  const toggleShowAll = () => {
    if (showAll) {
      setShowAll(false);
      setVisibleItems(maxItems);
    } else {
      setShowAll(true);
    }
  };

  const loadMore = () => {
    setVisibleItems(prev => Math.min(prev + maxItems, data.length));
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg">{title}</CardTitle>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                {totalStudents}
              </span>
            </div>
            <CardDescription>{description}</CardDescription>
          </div>
          {showIcon && (
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[400px] overflow-y-auto">
          <div className="space-y-1 p-4">
            {displayData.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`h-10 w-10 rounded-full ${avatarColor} flex items-center justify-center flex-shrink-0`}>
                    <Users className={`h-5 w-5 ${avatarIconColor}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{student.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {student.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-2 flex-shrink-0">
                  {showCourses && (
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {student.courses}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        curso{student.courses !== 1 ? "s" : ""}
                      </p>
                    </div>
                  )}
                  {showStatus && (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        student.status === "active"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {student.status === "active" ? "Activo" : "Inactivo"}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controles de paginación/vista */}
        {data.length > maxItems && (
          <div className="border-t p-3 bg-muted/20">
            <div className="flex items-center justify-between">
              <button
                onClick={toggleShowAll}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted/50"
              >
                {showAll ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Mostrar menos
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Mostrar todos ({data.length})
                  </>
                )}
              </button>

              {!showAll && hasMore && (
                <button
                  onClick={loadMore}
                  className="text-sm text-primary hover:text-primary/80 transition-colors font-medium px-2 py-1 rounded-md hover:bg-primary/10"
                >
                  Cargar más
                </button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}