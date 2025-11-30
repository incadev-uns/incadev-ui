import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { type TutoringRequest } from "@/process/academic/dasboard/audits/components/TeacherTutoringView";

interface TutoringHistoryTableProps {
  requests: TutoringRequest[];
}

export default function TutoringHistoryTable({
  requests,
}: TutoringHistoryTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusBadge = (request: TutoringRequest) => {
    if (request.status === "rejected") {
      return <Badge variant="destructive">Rechazada</Badge>;
    }

    if (request.status === "completed") {
      if (request.student_attended === true) {
        return <Badge className="bg-green-600">Asistió</Badge>;
      }
      if (request.student_attended === false) {
        return <Badge variant="secondary">No asistió</Badge>;
      }
      return <Badge variant="outline">Completada</Badge>;
    }

    return <Badge variant="outline">{request.status}</Badge>;
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay registros en el historial
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Estudiante</TableHead>
            <TableHead>Código</TableHead>
            <TableHead>Curso</TableHead>
            <TableHead>Tema</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Hora</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map(request => (
            <TableRow key={request.id}>
              <TableCell className="font-medium">
                {request.studentName}
              </TableCell>
              <TableCell>{request.studentId}</TableCell>
              <TableCell>{request.subject}</TableCell>
              <TableCell>{request.topic}</TableCell>
              <TableCell>{formatDate(request.requested_date || request.requestedDate || "")}</TableCell>
              <TableCell>{request.requested_time || request.requestedTime}</TableCell>
              <TableCell>{getStatusBadge(request)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}