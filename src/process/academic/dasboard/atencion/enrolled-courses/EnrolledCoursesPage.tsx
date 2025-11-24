import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, Loader2 } from "lucide-react";
import { useAcademicAuth } from "@/process/academic/hooks/useAcademicAuth";
import { useAcademicReports } from "../hooks/useAcademicReports";
import type { StudentGroup } from "../types";

export default function EnrolledCoursesPage() {
  const { user, mounted } = useAcademicAuth();
  const { getStudentGroups, downloadEnrolledCoursesReport, loading, error } = useAcademicReports();
  const [groups, setGroups] = useState<StudentGroup[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (mounted && user?.id) {
      loadGroups();
    }
  }, [mounted, user?.id]);

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

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await downloadEnrolledCoursesReport();
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      active: { variant: "default", label: "ACTIVO" },
      completed: { variant: "secondary", label: "COMPLETADO" },
      inactive: { variant: "outline", label: "INACTIVO" },
    };
    const config = variants[status.toLowerCase()] || variants.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
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
        <CardTitle>Mis Cursos Matriculados</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>CURSO</TableHead>
              <TableHead>GRUPO</TableHead>
              <TableHead>FECHA INICIO</TableHead>
              <TableHead>FECHA FIN</TableHead>
              <TableHead>ESTADO</TableHead>
              <TableHead className="text-right">NOTA FINAL</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No tienes cursos matriculados
                </TableCell>
              </TableRow>
            ) : (
              groups.map((group) => (
                <TableRow key={group.enrollment_id}>
                  <TableCell className="font-medium">{group.course_name}</TableCell>
                  <TableCell>{group.group_name}</TableCell>
                  <TableCell>{formatDate(group.start_date)}</TableCell>
                  <TableCell>{formatDate(group.end_date)}</TableCell>
                  <TableCell>{getStatusBadge(group.group_status)}</TableCell>
                  <TableCell className="text-right">
                    {group.final_grade ? (
                      <span className="font-semibold">{group.final_grade.toFixed(1)}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {groups.length > 0 && (
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
      </CardContent>
    </Card>
  );
}
