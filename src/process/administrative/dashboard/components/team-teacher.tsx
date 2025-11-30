import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { GraduationCap, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface Teacher {
  id: number;
  name: string;
  speciality: string;
  courses: number;
  students: number;
  email?: string;
  status?: 'active' | 'inactive';
}

interface TeamTeacherProps {
  data: Teacher[];
  title?: string;
  description?: string;
  className?: string;
  maxItems?: number;
  showIcon?: boolean;
  showSpeciality?: boolean;
  showStudents?: boolean;
  avatarColor?: string;
  avatarIconColor?: string;
  maxNameWidth?: string;
  maxSpecialityWidth?: string;
}

export default function TeamTeacher({
  data,
  title = "Equipo Docente",
  description = "Profesores y su carga académica",
  className,
  maxItems = 5,
  showIcon = true,
  showSpeciality = true,
  showStudents = true,
  avatarColor = "bg-purple-100 dark:bg-purple-900/30",
  avatarIconColor = "text-purple-600 dark:text-purple-400",
  maxNameWidth = "max-w-[120px]",
  maxSpecialityWidth = "max-w-[180px]",
}: TeamTeacherProps) {
  const [showAll, setShowAll] = useState(false);
  const [visibleItems, setVisibleItems] = useState(maxItems);

  const displayData = showAll ? data : data.slice(0, visibleItems);
  const hasMore = data.length > visibleItems;
  const totalTeachers = data.length;

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
              <span className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-1 rounded-full">
                {totalTeachers}
              </span>
            </div>
            <CardDescription>{description}</CardDescription>
          </div>
          {showIcon && (
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[400px] overflow-y-auto">
          <div className="space-y-1 p-4">
            {displayData.map((teacher) => (
              <div
                key={teacher.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`h-10 w-10 rounded-full ${avatarColor} flex items-center justify-center flex-shrink-0`}>
                    <GraduationCap className={`h-5 w-5 ${avatarIconColor}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`font-medium text-sm truncate ${maxNameWidth}`}>
                      {teacher.name}
                    </p>
                    {showSpeciality && (
                      <p className={`text-xs text-muted-foreground truncate ${maxSpecialityWidth}`}>
                        {teacher.speciality}
                      </p>
                    )}
                    {teacher.email && (
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {teacher.email}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 ml-2 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-medium whitespace-nowrap">
                      {teacher.courses}
                    </p>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                      curso{teacher.courses !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {showStudents && (
                    <div className="text-right">
                      <p className="text-sm font-medium whitespace-nowrap">
                        {teacher.students}
                      </p>
                      <p className="text-xs text-muted-foreground whitespace-nowrap">
                        estudiantes
                      </p>
                    </div>
                  )}
                  {teacher.status && (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        teacher.status === "active"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {teacher.status === "active" ? "Activo" : "Inactivo"}
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
                  className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors font-medium px-2 py-1 rounded-md hover:bg-purple-100 dark:hover:bg-purple-900/30"
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