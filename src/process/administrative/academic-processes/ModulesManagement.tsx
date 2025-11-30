import AdministrativeLayout from "@/process/administrative/AdministrativeLayout";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/process/administrative/academic-processes/components/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  GripVertical,
  AlertCircle,
  Search,
  ArrowLeft,
  FolderOpen,
  CheckCircle2,
} from "lucide-react";
import { config } from "@/config/administrative-config";

interface Course {
  id: number;
  name: string;
  description: string | null;
  image_path: string | null;
  versions: CourseVersion[];
}

interface CourseVersion {
  id: number;
  course_id: number;
  version: string | null;
  name: string;
  price: string;
  status: string;
  course?: Course;
  modules?: Module[];
}

interface Module {
  id: number;
  course_version_id: number;
  title: string;
  description: string | null;
  sort: number;
}

const ModulesManagement = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseVersion, setSelectedCourseVersion] = useState<CourseVersion | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [deletingModule, setDeletingModule] = useState<Module | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  // Alert state
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const apiUrl = `${config.apiUrl}${config.endpoints.modulesCourses}`;
      const response = await fetch(apiUrl);
      const data = await response.json();
      if (data.success) {
        setCourses(data.data);
      }
    } catch (error) {
      showAlert("error", "Error al cargar los cursos");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseVersion = async (courseVersionId: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${config.apiUrl}${config.endpoints.modulesCourseVersion}/${courseVersionId}`
      );
      const data = await response.json();
      if (data.success) {
        setSelectedCourseVersion(data.data);
        setModules(data.data.modules || []);
      }
    } catch (error) {
      showAlert("error", "Error al cargar la versión del curso");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateModule = () => {
    setEditingModule(null);
    setFormData({ title: "", description: "" });
    setIsModuleDialogOpen(true);
  };

  const handleEditModule = (module: Module) => {
    setEditingModule(module);
    setFormData({
      title: module.title,
      description: module.description || "",
    });
    setIsModuleDialogOpen(true);
  };

  const handleDeleteModule = (module: Module) => {
    setDeletingModule(module);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmitModule = async () => {
    if (!formData.title.trim()) {
      showAlert("error", "El título es obligatorio");
      return;
    }

    setLoading(true);
    try {
      const url = editingModule
        ? `${config.apiUrl}${config.endpoints.modules}/${editingModule.id}`
        : `${config.apiUrl}${config.endpoints.modules}`;

      const method = editingModule ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          course_version_id: selectedCourseVersion?.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showAlert("success", data.message);
        setIsModuleDialogOpen(false);
        if (selectedCourseVersion) {
          fetchCourseVersion(selectedCourseVersion.id);
        }
      } else {
        showAlert("error", data.message);
      }
    } catch (error) {
      showAlert("error", "Error al guardar el módulo");
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteModule = async () => {
    if (!deletingModule) return;

    setLoading(true);
    try {
      const apiUrl = `${config.apiUrl}${config.endpoints.modules}/${deletingModule.id}`;
      const response = await fetch(
        apiUrl,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (data.success) {
        showAlert("success", data.message);
        setIsDeleteDialogOpen(false);
        if (selectedCourseVersion) {
          fetchCourseVersion(selectedCourseVersion.id);
        }
      } else {
        showAlert("error", data.message);
      }
    } catch (error) {
      showAlert("error", "Error al eliminar el módulo");
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const filteredCourses = courses.filter((course) =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdministrativeLayout title="Gestión de Módulos">
      <div className="p-6 bg-background min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800/60 bg-gradient-to-br from-indigo-500 to-indigo-700 px-6 py-7 shadow-xl">
            <p className="text-[11px] uppercase tracking-[0.28em] text-indigo-100/90">
              Procesos Académicos
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
              Gestión de Módulos
            </h1>
            <p className="mt-2 max-w-xl text-sm text-indigo-100/80">
              Administra los módulos de aprendizaje para cada curso
            </p>
          </div>

          {/* Alert */}
          {alert && (
            <Alert
              className={
                alert.type === "success"
                  ? "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20"
                  : "border-red-200 bg-red-50 dark:bg-red-950/20"
              }
            >
              {alert.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <AlertDescription
                className={
                  alert.type === "success"
                    ? "text-emerald-800 dark:text-emerald-200"
                    : "text-red-800 dark:text-red-200"
                }
              >
                {alert.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Content */}
          {!selectedCourseVersion ? (
            <CoursesList
              courses={filteredCourses}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onSelectVersion={fetchCourseVersion}
              loading={loading}
            />
          ) : (
            <ModulesView
              courseVersion={selectedCourseVersion}
              modules={modules}
              onBack={() => setSelectedCourseVersion(null)}
              onCreateModule={handleCreateModule}
              onEditModule={handleEditModule}
              onDeleteModule={handleDeleteModule}
              loading={loading}
            />
          )}
        </div>
      </div>

      {/* Module Dialog */}
      <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingModule ? "Editar Módulo" : "Crear Módulo"}
            </DialogTitle>
            <DialogDescription>
              {editingModule
                ? "Modifica la información del módulo"
                : "Ingresa los datos del nuevo módulo"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título del Módulo *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Ej: Introducción a la programación"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descripción del módulo (opcional)"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsModuleDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSubmitModule} disabled={loading}>
              {loading ? "Guardando..." : editingModule ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el módulo "
              {deletingModule?.title}" de forma permanente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteModule}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdministrativeLayout>
  );
};

/* ==================== SUBCOMPONENTS ==================== */

const CoursesList = ({ courses, searchTerm, setSearchTerm, onSelectVersion, loading }) => (
  <div className="space-y-4">
    {/* Search */}
    <Card>
      <CardContent className="pt-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cursos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardContent>
    </Card>

    {/* Courses List */}
    {loading ? (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-muted-foreground">Cargando cursos...</p>
        </div>
      </div>
    ) : courses.length === 0 ? (
      <Card>
        <CardContent className="py-12 text-center">
          <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No se encontraron cursos</p>
        </CardContent>
      </Card>
    ) : (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course:Course) => (
          <Card
            key={course.id}
            className="hover:shadow-lg transition-shadow duration-300"
          >
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-950/30 rounded-lg">
                  <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{course.name}</CardTitle>
                  {course.description && (
                    <CardDescription className="mt-1 line-clamp-2">
                      {course.description}
                    </CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Versiones disponibles:
              </p>
              {course.versions.map((version:CourseVersion) => (
                <Button
                  key={version.id}
                  variant="outline"
                  className="w-full justify-between hover:bg-indigo-50 dark:hover:bg-indigo-950/20"
                  onClick={() => onSelectVersion(version.id)}
                >
                  <span>{version.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {version.status === "published" ? "Publicado" : "Borrador"}
                  </span>
                </Button>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    )}
  </div>
);

const ModulesView = ({
  courseVersion,
  modules,
  onBack,
  onCreateModule,
  onEditModule,
  onDeleteModule,
  loading,
}:{
  courseVersion: CourseVersion;
  modules: Module[];
  onBack: () => void;
  onCreateModule: () => void;
  onEditModule: (module: Module) => void;
  onDeleteModule: (module: Module) => void;
  loading: boolean;
}
) => (
  <div className="space-y-4">
    {/* Course Info Header */}
    <Card className="border-l-4 border-l-indigo-500">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="mb-2 -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a cursos
            </Button>
            <CardTitle className="text-2xl">{courseVersion.course?.name}</CardTitle>
            <CardDescription className="text-base mt-1">
              Versión: {courseVersion.name} • Precio: S/ {courseVersion.price}
            </CardDescription>
          </div>
          <Button onClick={onCreateModule} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            Agregar Módulo
          </Button>
        </div>
      </CardHeader>
    </Card>

    {/* Modules List */}
    {loading ? (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-muted-foreground">Cargando módulos...</p>
        </div>
      </div>
    ) : modules.length === 0 ? (
      <Card>
        <CardContent className="py-12 text-center">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground mb-4">
            No hay módulos creados para este curso
          </p>
          <Button onClick={onCreateModule} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Crear primer módulo
          </Button>
        </CardContent>
      </Card>
    ) : (
      <div className="space-y-3">
        {modules.map((module, index) => (
          <Card
            key={module.id}
            className="hover:shadow-md transition-shadow duration-200"
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{module.title}</h3>
                    {module.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {module.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditModule(module)}
                    className="hover:bg-indigo-50 dark:hover:bg-indigo-950/20"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteModule(module)}
                    className="hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <div className="cursor-move p-2">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )}
  </div>
);

export default ModulesManagement;