import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Loader2 } from "lucide-react";
import { useAcademicAuth } from "@/process/academic/hooks/useAcademicAuth";
import { useAcademicReports } from "../hooks/useAcademicReports";
import type { StudentGroup, GroupGradesResponse } from "../types";

export default function CourseGradesPage() {
  const { user, mounted } = useAcademicAuth();
  const { 
    getStudentGroups, 
    getGroupGrades, 
    downloadCourseGradesReport, 
    loading 
  } = useAcademicReports();
  
  const [groups, setGroups] = useState<StudentGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [gradesData, setGradesData] = useState<GroupGradesResponse | null>(null);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (mounted && user?.id) {
      loadGroups();
    }
  }, [mounted, user?.id]);

  useEffect(() => {
    if (selectedGroupId) {
      loadGrades(parseInt(selectedGroupId));
    }
  }, [selectedGroupId]);

  const loadGroups = async () => {
    try {
      setLoadingGroups(true);
      const data = await getStudentGroups();
      setGroups(data);
    } catch (err) {
      console.error("Error loading groups:", err);
    } finally {
      setLoadingGroups(false);
    }
  };

  const loadGrades = async (groupId: number) => {
    try {
      setLoadingGrades(true);
      const data = await getGroupGrades(groupId);
      setGradesData(data);
    } catch (err) {
      console.error("Error loading grades:", err);
    } finally {
      setLoadingGrades(false);
    }
  };

  const handleDownload = async () => {
    if (!selectedGroupId) return;
    
    try {
      setDownloading(true);
      await downloadCourseGradesReport(parseInt(selectedGroupId));
    } catch (err) {
      console.error("Error downloading report:", err);
    } finally {
      setDownloading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (!mounted || loadingGroups) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user?.id) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            No se pudo cargar la información del usuario. Por favor, inicia sesión nuevamente.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notas por Curso</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Seleccionar Curso:</label>
          <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
            <SelectTrigger>
              <SelectValue placeholder="Elige un curso..." />
            </SelectTrigger>
            <SelectContent>
              {groups.map((group) => (
                <SelectItem key={group.group_id} value={group.group_id.toString()}>
                  {group.course_name} - {group.group_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loadingGrades ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : gradesData ? (
          <>
            <div className="rounded-lg border p-4 bg-muted/50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Promedio</p>
                  <p className="text-2xl font-bold">
                    {gradesData.grades_summary.average_grade ? gradesData.grades_summary.average_grade.toFixed(1) : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Nota más alta</p>
                  <p className="text-2xl font-bold text-green-600">
                    {gradesData.grades_summary.highest_grade ? gradesData.grades_summary.highest_grade.toFixed(1) : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Nota más baja</p>
                  <p className="text-2xl font-bold text-red-600">
                    {gradesData.grades_summary.lowest_grade ? gradesData.grades_summary.lowest_grade.toFixed(1) : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total evaluaciones</p>
                  <p className="text-2xl font-bold">
                    {gradesData.grades_summary.total_grades}
                  </p>
                </div>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>EVALUACIÓN</TableHead>
                  <TableHead>MÓDULO</TableHead>
                  <TableHead>FECHA</TableHead>
                  <TableHead className="text-right">NOTA</TableHead>
                  <TableHead>COMENTARIOS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gradesData.detailed_grades.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No hay evaluaciones registradas
                    </TableCell>
                  </TableRow>
                ) : (
                  gradesData.detailed_grades.map((grade) => (
                    <TableRow key={grade.exam_id}>
                      <TableCell className="font-medium">{grade.exam_title}</TableCell>
                      <TableCell>{grade.module_name}</TableCell>
                      <TableCell>{formatDate(grade.exam_date)}</TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold text-lg">{grade.grade.toFixed(1)}</span>
                        <span className="ml-2 text-sm text-muted-foreground">
                          ({grade.grade_letter})
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {grade.feedback || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {gradesData.can_generate_report && (
              <div className="flex justify-end pt-4">
                <Button onClick={handleDownload} disabled={downloading}>
                  {downloading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Descargando...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Descargar PDF
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        ) : selectedGroupId ? (
          <div className="text-center py-12 text-muted-foreground">
            Selecciona un curso para ver las notas
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
