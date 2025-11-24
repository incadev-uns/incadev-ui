import AcademicLayout from "@/process/academic/AcademicLayout";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ClipboardList, Clock, CheckCircle2, Lock, Users, AlertCircle } from "lucide-react";
import { SurveyForm } from "@/process/academic/dasboard/surveys/components/SurveyForm";
import { useAcademicAuth } from "@/process/academic/hooks/useAcademicAuth";
import { config } from "@/config/academic-config";
import { config as evaluationConfig } from "@/config/evaluation-config"
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

// Interfaces para los tipos de datos
interface SurveyQuestion {
  id: number;
  survey_id: number;
  question: string;
  order: number;
  created_at: string;
  updated_at: string;
}

interface SurveyMapping {
  id: number;
  event: string;
  survey_id: number;
  description: string;
  created_at: string;
  updated_at: string;
}

interface APISurvey {
  id: number;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  questions: SurveyQuestion[];
  mapping: SurveyMapping;
}

interface APIGroupData {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  progress?: number;
}

interface TeachingGroup {
  id: number;
  name: string;
  course_name: string;
  course_version: string;
  course_version_name: string;
  start_date: string;
  end_date: string;
  status: string;
  students_count: number;
  teachers: Array<{
    id: number;
    name: string;
    fullname: string;
    email: string;
    avatar: string | null;
  }>;
  created_at: string;
}

interface SurveyStatus {
  hasResponded: boolean;
  event: string;
  group_id: number;
  survey_id?: number;
  canAnswerTime: boolean;
}

interface GroupWithSurveys {
  group: APIGroupData;
  surveys: (APISurvey & { status: SurveyStatus })[];
}

const statusConfig = {
  pending: {
    label: "Pendiente",
    variant: "destructive" as const,
    icon: Clock,
    color: "text-red-600"
  },
  "in-progress": {
    label: "En progreso",
    variant: "default" as const,
    icon: ClipboardList,
    color: "text-blue-600"
  },
  completed: {
    label: "Completada",
    variant: "secondary" as const,
    icon: CheckCircle2,
    color: "text-green-600"
  },
  "time-locked": {
    label: "No disponible",
    variant: "outline" as const,
    icon: Lock,
    color: "text-gray-500"
  }
};

// Eventos permitidos por rol
const ALLOWED_EVENTS_BY_ROLE = {
  student: ["satisfaction", "impact", "teacher"],
  teacher: ["teacher"]
};

export default function SurveysPage() {
  const { token, role } = useAcademicAuth();
  const [selectedSurvey, setSelectedSurvey] = useState<{survey: APISurvey, groupId: string, event: string} | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [groupsWithSurveys, setGroupsWithSurveys] = useState<GroupWithSurveys[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Obtener grupos matriculados (estudiantes) o grupos de enseñanza (docentes)
  const fetchGroups = async (): Promise<APIGroupData[]> => {
    try {
      const tokenWithoutQuotes = token?.replace(/^"|"$/g, '');
      
      if (role === 'student') {
        // Endpoint para estudiantes
        const response = await fetch(
          `${config.apiUrl}${config.endpoints.groups.listComplete}`,
          {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${tokenWithoutQuotes}`,
              "Content-Type": "application/json"
            }
          }
        );

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data.data;
      } else if (role === 'teacher') {
        // Endpoint para docentes - solo grupos completados
        const response = await fetch(
          `${config.apiUrl}${config.endpoints.groups.teaching}`,
          {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${tokenWithoutQuotes}`,
              "Content-Type": "application/json"
            }
          }
        );

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Filtrar solo grupos con status 'completed' y mapear a APIGroupData
        const completedGroups = data.data
          .filter((group: TeachingGroup) => group.status === 'completed')
          .map((group: TeachingGroup) => ({
            id: group.id.toString(),
            name: group.name,
            description: `${group.course_name} - ${group.course_version_name}`,
            start_date: group.start_date,
            end_date: group.end_date,
            status: group.status
          }));

        return completedGroups;
      } else {
        throw new Error("Rol de usuario no reconocido");
      }
    } catch (error) {
      console.error("Error cargando grupos:", error);
      throw error;
    }
  };

  // Obtener encuestas disponibles y filtrar por rol
  const fetchSurveys = async (): Promise<APISurvey[]> => {
    try {
      const tokenWithoutQuotes = token?.replace(/^"|"$/g, '');
      const response = await fetch(
        `${evaluationConfig.apiUrl}${evaluationConfig.endpoints.surveys.byRole}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${tokenWithoutQuotes}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Filtrar encuestas por eventos permitidos según el rol
      const allowedEvents = ALLOWED_EVENTS_BY_ROLE[role as keyof typeof ALLOWED_EVENTS_BY_ROLE] || [];
      const filteredSurveys = data.data.filter((survey: APISurvey) => 
        allowedEvents.includes(survey.mapping.event)
      );

      return filteredSurveys;
    } catch (error) {
      console.error("Error cargando encuestas:", error);
      throw error;
    }
  };

  // Verificar estado de encuesta por grupo, evento y survey_id
  const checkSurveyStatus = async (groupId: string, event: string, surveyId: number): Promise<SurveyStatus> => {
    try {
      const tokenWithoutQuotes = token?.replace(/^"|"$/g, '');
      const response = await fetch(
        `${evaluationConfig.apiUrl}${evaluationConfig.endpoints.surveys.active}?event=${event}&group_id=${groupId}&survey_id=${surveyId}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${tokenWithoutQuotes}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error(`Error verificando estado de encuesta ${event} (survey: ${surveyId}) para grupo ${groupId}:`, error);
      // Si hay error, asumimos que no ha respondido pero puede responder
      return {
        hasResponded: false,
        event,
        group_id: parseInt(groupId),
        survey_id: surveyId,
        canAnswerTime: true
      };
    }
  };

  // Cargar datos
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Si no hay rol definido, esperar
        if (!role) {
          return;
        }

        const [groups, surveys] = await Promise.all([
          fetchGroups(),
          fetchSurveys()
        ]);

        // Si no hay grupos o encuestas, mostrar mensaje
        if (groups.length === 0) {
          setGroupsWithSurveys([]);
          setLoading(false);
          return;
        }

        if (surveys.length === 0) {
          setGroupsWithSurveys([]);
          setLoading(false);
          return;
        }

        // Combinar grupos con sus encuestas y verificar estado
        const groupsWithSurveysData: GroupWithSurveys[] = await Promise.all(
          groups.map(async (group) => {
            const surveysWithStatus = await Promise.all(
              surveys.map(async (survey) => {
                const status = await checkSurveyStatus(group.id, survey.mapping.event, survey.id);
                return {
                  ...survey,
                  status
                };
              })
            );

            return {
              group,
              surveys: surveysWithStatus
            };
          })
        );

        setGroupsWithSurveys(groupsWithSurveysData);
      } catch (error) {
        console.error("Error cargando datos:", error);
        setError(error instanceof Error ? error.message : "Error desconocido al cargar datos");
      } finally {
        setLoading(false);
      }
    };

    if (token && role) {
      loadData();
    }
  }, [token, role]);

  const handleSurveyClick = (survey: APISurvey, groupId: string, event: string, hasResponded: boolean, canAnswerTime: boolean) => {
    if (hasResponded) return;
    
    if (event === 'impact' && !canAnswerTime) {
      return;
    }
    
    setSelectedSurvey({ survey, groupId, event });
    setIsDialogOpen(true);
  };

  const isSurveyEnabled = (survey: APISurvey & { status: SurveyStatus }) => {
    const { hasResponded, canAnswerTime, event } = survey.status;
    
    if (hasResponded) return false;
    if (event === 'impact' && !canAnswerTime) return false;
    return true;
  };
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedSurvey(null);
  };

  const handleSurveySubmit = async () => {
    if (!selectedSurvey) return;

    // Actualizar el estado local para marcar como completada
    setGroupsWithSurveys(prev => 
      prev.map(groupData => {
        if (groupData.group.id === selectedSurvey.groupId) {
          return {
            ...groupData,
            surveys: groupData.surveys.map(survey => {
              if (survey.mapping.event === selectedSurvey.event) {
                return {
                  ...survey,
                  status: {
                    ...survey.status,
                    hasResponded: true
                  }
                };
              }
              return survey;
            })
          };
        }
        return groupData;
      })
    );

    handleCloseDialog();
  };

  // Calcular estadísticas
  const totalSurveys = groupsWithSurveys.reduce((total, groupData) => 
    total + groupData.surveys.length, 0
  );
  
  const completedSurveys = groupsWithSurveys.reduce((total, groupData) => 
    total + groupData.surveys.filter(s => s.status.hasResponded).length, 0
  );
  
  const pendingSurveys = totalSurveys - completedSurveys;

  const getSurveyStatus = (survey: APISurvey & { status: SurveyStatus }) => {
    const { hasResponded, canAnswerTime, event } = survey.status;
    
    if (hasResponded) return "completed";
    if (event === 'impact' && !canAnswerTime) return "time-locked";
    return "pending";
  };

  if (loading) {
    return (
      <AcademicLayout title="Módulo de encuestas">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AcademicLayout>
    );
  }

  return (
    <AcademicLayout title="Módulo de encuestas">
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Header */}
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold tracking-tight">
                {role === 'teacher' ? 'Evaluaciones de Docentes' : 'Encuestas Disponibles'}
              </h2>
              <p className="text-muted-foreground">
                {role === 'teacher' 
                  ? 'Completa las evaluaciones de tus grupos para mejorar la experiencia educativa'
                  : 'Completa las encuestas pendientes para ayudarnos a mejorar tu experiencia académica'
                }
              </p>
            </div>

            {/* Statistics */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Pendientes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">
                    {pendingSurveys}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    En Progreso
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    0
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Completadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {completedSurveys}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Groups with Surveys */}
            <div className="space-y-6">
              {groupsWithSurveys.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {role === 'teacher' 
                      ? 'No tienes grupos completados para evaluar' 
                      : 'No tienes grupos con encuestas disponibles'
                    }
                  </h3>
                  <p className="text-muted-foreground">
                    {role === 'teacher'
                      ? 'Solo los grupos con estado "completado" están disponibles para evaluación'
                      : 'No se encontraron encuestas pendientes para tus grupos'
                    }
                  </p>
                </div>
              ) : (
                groupsWithSurveys.map((groupData) => (
                  <div key={groupData.group.id} className="space-y-4">
                    {/* Group Header */}
                    <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                      <Users className="h-6 w-6 text-primary" />
                      <div>
                        <h3 className="font-semibold text-lg">{groupData.group.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {groupData.group.description}
                        </p>
                        {role === 'teacher' && (
                          <Badge variant="outline" className="mt-1">
                            Grupo completado
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Surveys Grid */}
                    <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                      {groupData.surveys.map((survey) => {
                        const surveyStatus = getSurveyStatus(survey);
                        const config = statusConfig[surveyStatus];
                        const StatusIcon = config.icon;
                        const isEnabled = isSurveyEnabled(survey);
                        const isCompleted = surveyStatus === "completed";
                        const isTimeLocked = surveyStatus === "time-locked";

                        return (
                          <Card
                            key={`${groupData.group.id}-${survey.id}`}
                            className={`relative overflow-hidden transition-all ${
                              !isEnabled 
                                ? "opacity-60 cursor-not-allowed" 
                                : "cursor-pointer hover:shadow-md hover:border-primary"
                            }`}
                            onClick={() => isEnabled && handleSurveyClick(
                              survey, 
                              groupData.group.id, 
                              survey.mapping.event, 
                              survey.status.hasResponded, 
                              survey.status.canAnswerTime
                            )}
                          >
                            {!isEnabled && (
                              <div className="absolute top-3 right-3">
                                <Lock className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                            
                            <CardHeader>
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <CardTitle className="text-lg mb-2">{survey.title}</CardTitle>
                                  <Badge variant={config.variant} className="mb-3">
                                    <StatusIcon className="mr-1 h-3 w-3" />
                                    {config.label}
                                  </Badge>
                                </div>
                              </div>
                              <CardDescription className="line-clamp-2">
                                {survey.description}
                                {isTimeLocked && (
                                  <div className="text-xs text-amber-600 mt-1">
                                    Disponible 2 meses después de finalizar el grupo
                                  </div>
                                )}
                              </CardDescription>
                            </CardHeader>
                            
                            <CardContent>
                              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {survey.questions.length} preguntas
                                  </span>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t">
                                  <span className="text-xs capitalize">
                                    Tipo: {survey.mapping.event}
                                  </span>
                                  {isEnabled && !isCompleted && (
                                    <Button size="sm" variant="default">
                                      {role === 'teacher' ? 'Evaluar' : 'Iniciar'}
                                    </Button>
                                  )}
                                  {!isEnabled && (
                                    <Badge variant="secondary" className="text-xs">
                                      {isCompleted ? 'Completada' : 'No disponible'}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Survey Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedSurvey?.survey.title}</DialogTitle>
            <DialogDescription>{selectedSurvey?.survey.description}</DialogDescription>
          </DialogHeader>
          {selectedSurvey && (
            <SurveyForm 
              survey={selectedSurvey.survey}
              groupId={selectedSurvey.groupId}
              event={selectedSurvey.event}
              onClose={handleCloseDialog}
              onSubmit={handleSurveySubmit}
            />
          )}
        </DialogContent>
      </Dialog>
    </AcademicLayout>
  );
}