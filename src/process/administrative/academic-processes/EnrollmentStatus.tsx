import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import AdministrativeLayout from '@/process/administrative/AdministrativeLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
    DropdownMenuSeparator,
    DropdownMenuLabel,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { config } from '@/config/administrative-config';
import {
    IconSearch,
    IconFilter,
    IconArrowsSort,
    IconChevronDown,
    IconChevronUp,
    IconUsers,
    IconBook,
    IconCalendar,
    IconUser,
    IconEye,
    IconCreditCard,
    IconSchool,
    IconCheck,
    IconX,
    IconClock
} from '@tabler/icons-react';

interface Enrollment {
    id: number;
    group_id: number;
    user_id: number;
    payment_status: string;
    academic_status: string;
    created_at: string;
    student_name?: string;
    student_email?: string;
    group_name?: string;
    course_name?: string;
    enrollment_result?: EnrollmentResult;
}

interface EnrollmentResult {
    id: number;
    enrollment_id: number;
    final_grade: number | null;
    attendance_percentage: number | null;
    status: string;
}

interface Stats {
    total_enrollments: number;
    active_enrollments: number;
    completed_enrollments: number;
    pending_payment: number;
}

export default function EnrollmentStatus() {
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [filteredEnrollments, setFilteredEnrollments] = useState<Enrollment[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortColumn, setSortColumn] = useState<keyof Enrollment | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState<string[]>([]);
    const [academicStatusFilter, setAcademicStatusFilter] = useState<string[]>([]);
    const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const itemsPerPage = 10;

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        handleSearch(searchQuery);
    }, [searchQuery, enrollments, sortColumn, sortDirection, paymentStatusFilter, academicStatusFilter]);

    const handleSort = (column: keyof Enrollment) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('desc');
        }
    };

    const togglePaymentStatusFilter = (status: string) => {
        setPaymentStatusFilter(prev =>
            prev.includes(status)
                ? prev.filter(s => s !== status)
                : [...prev, status]
        );
    };

    const toggleAcademicStatusFilter = (status: string) => {
        setAcademicStatusFilter(prev =>
            prev.includes(status)
                ? prev.filter(s => s !== status)
                : [...prev, status]
        );
    };

    const clearFilters = () => {
        setPaymentStatusFilter([]);
        setAcademicStatusFilter([]);
        setSortColumn(null);
        setSortDirection('desc');
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const apiUrl = `${config.apiUrl}/api/academic-processes/enrollment-status`;
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setStats(data.stats);
            setEnrollments(data.enrollments);
            setFilteredEnrollments(data.enrollments);
            setError(null);
        } catch (err) {
            console.error('Error al cargar datos:', err);
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (query: string) => {
        const lowerQuery = query.toLowerCase().trim();

        let filtered = [...enrollments];

        if (lowerQuery) {
            filtered = filtered.filter((enrollment) => {
                const studentName = (enrollment.student_name || '').toLowerCase();
                const studentEmail = (enrollment.student_email || '').toLowerCase();
                const groupName = (enrollment.group_name || '').toLowerCase();
                const courseName = (enrollment.course_name || '').toLowerCase();
                const enrollmentId = String(enrollment.id).toLowerCase();
                return studentName.includes(lowerQuery) ||
                    studentEmail.includes(lowerQuery) ||
                    groupName.includes(lowerQuery) ||
                    courseName.includes(lowerQuery) ||
                    enrollmentId.includes(lowerQuery);
            });
        }

        if (paymentStatusFilter.length > 0) {
            filtered = filtered.filter(enrollment =>
                paymentStatusFilter.includes(enrollment.payment_status.toLowerCase())
            );
        }

        if (academicStatusFilter.length > 0) {
            filtered = filtered.filter(enrollment =>
                academicStatusFilter.includes(enrollment.academic_status.toLowerCase())
            );
        }

        if (sortColumn) {
            filtered.sort((a, b) => {
                const aValue = a[sortColumn];
                const bValue = b[sortColumn];

                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
                }

                const aString = String(aValue || '');
                const bString = String(bValue || '');

                if (sortDirection === 'asc') {
                    return aString.localeCompare(bString);
                } else {
                    return bString.localeCompare(aString);
                }
            });
        }

        setFilteredEnrollments(filtered);
        setCurrentPage(1);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setCurrentPage(1);
    };

    const getPaymentStatusBadge = (status: string) => {
        const statusLower = status.toLowerCase();
        const statusMap: Record<string, { text: string; className: string; icon: React.ReactNode }> = {
            pending: {
                text: 'Pendiente',
                className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
                icon: <IconClock className="h-3 w-3" />
            },
            paid: {
                text: 'Pagado',
                className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
                icon: <IconCheck className="h-3 w-3" />
            },
            partially_paid: {
                text: 'Parcialmente Pagado',
                className: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20',
                icon: <IconCreditCard className="h-3 w-3" />
            },
            overdue: {
                text: 'Vencido',
                className: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
                icon: <IconX className="h-3 w-3" />
            },
            cancelled: {
                text: 'Cancelado',
                className: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20',
                icon: <IconX className="h-3 w-3" />
            },
            refunded: {
                text: 'Reembolsado',
                className: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
                icon: <IconCheck className="h-3 w-3" />
            }
        };
        const statusInfo = statusMap[statusLower] || {
            text: status,
            className: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20',
            icon: null
        };
        return (
            <Badge variant="outline" className={cn("gap-1", statusInfo.className)}>
                {statusInfo.icon}
                {statusInfo.text}
            </Badge>
        );
    };

    const getAcademicStatusBadge = (status: string) => {
        const statusLower = status.toLowerCase();
        const statusMap: Record<string, { text: string; className: string; icon: React.ReactNode }> = {
            pending: {
                text: 'Pendiente',
                className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
                icon: <IconClock className="h-3 w-3" />
            },
            active: {
                text: 'Activo',
                className: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20',
                icon: <IconSchool className="h-3 w-3" />
            },
            completed: {
                text: 'Completado',
                className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
                icon: <IconCheck className="h-3 w-3" />
            },
            failed: {
                text: 'Reprobado',
                className: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
                icon: <IconX className="h-3 w-3" />
            },
            dropped: {
                text: 'Retirado',
                className: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20',
                icon: <IconX className="h-3 w-3" />
            }
        };
        const statusInfo = statusMap[statusLower] || {
            text: status,
            className: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20',
            icon: null
        };
        return (
            <Badge variant="outline" className={cn("gap-1", statusInfo.className)}>
                {statusInfo.icon}
                {statusInfo.text}
            </Badge>
        );
    };

    const getResultStatusBadge = (status: string | undefined) => {
        if (!status) {
            return (
                <Badge variant="outline" className="bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20">
                    Sin resultado
                </Badge>
            );
        }
        const statusLower = status.toLowerCase();
        const statusMap: Record<string, { text: string; className: string; icon: React.ReactNode }> = {
            approved: {
                text: 'Aprobado',
                className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
                icon: <IconCheck className="h-3 w-3" />
            },
            failed: {
                text: 'Reprobado',
                className: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
                icon: <IconX className="h-3 w-3" />
            },
            pending: {
                text: 'Pendiente',
                className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
                icon: <IconClock className="h-3 w-3" />
            }
        };
        const statusInfo = statusMap[statusLower] || {
            text: status,
            className: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20',
            icon: null
        };
        return (
            <Badge variant="outline" className={cn("gap-1", statusInfo.className)}>
                {statusInfo.icon}
                {statusInfo.text}
            </Badge>
        );
    };

    const handleViewDetails = (enrollment: Enrollment) => {
        setSelectedEnrollment(enrollment);
        setIsDialogOpen(true);
    };

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageEnrollments = filteredEnrollments.slice(start, end);

    return (
        <AdministrativeLayout title="Estado de Matrículas">
            <div className="min-h-screen p-4 md:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl space-y-6">

                    <div className="rounded-3xl border border-slate-200 dark:border-slate-800/60 bg-gradient-to-br from-sky-500 to-sky-700 px-6 py-7 shadow-xl">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.28em] text-sky-100/90">Procesos Académicos</p>
                            <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">Estado de Matrículas</h1>
                            <p className="mt-2 max-w-xl text-sm text-sky-100/80">
                                Seguimiento y gestión del estado académico y de pago de las matrículas
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="text-center">
                                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-sky-500"></div>
                                <p className="text-sm text-muted-foreground">Cargando datos...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="text-center">
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                                    <IconUsers className="h-6 w-6" />
                                </div>
                                <p className="text-sm text-muted-foreground">Error al cargar los datos: {error}</p>
                                <p className="text-xs text-muted-foreground mt-2">Verifica que el backend esté corriendo en {config.apiUrl}</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Card>
                                <CardContent className="p-3">
                                    <div className="grid gap-3 md:grid-cols-4 justify-items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
                                                <IconBook className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                                                <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-sky-500 animate-pulse"></div>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-medium text-muted-foreground">Total Matrículas</p>
                                                <p className="text-2xl font-bold">{stats?.total_enrollments || 0}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
                                                <IconSchool className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-medium text-muted-foreground">Activas</p>
                                                <p className="text-2xl font-bold">{stats?.active_enrollments || 0}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                                                <IconCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-medium text-muted-foreground">Completadas</p>
                                                <p className="text-2xl font-bold">{stats?.completed_enrollments || 0}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                                                <IconCreditCard className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-medium text-muted-foreground">Pago Pendiente</p>
                                                <p className="text-2xl font-bold">{stats?.pending_payment || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div>
                                            <CardTitle>Matrículas Registradas</CardTitle>
                                            <CardDescription>Gestión y seguimiento de matrículas de estudiantes</CardDescription>
                                        </div>
                                        <Badge variant="secondary">
                                            {filteredEnrollments.length} matrículas
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex flex-wrap gap-3">
                                        <div className="relative flex-1 min-w-[280px]">
                                            <IconSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                type="text"
                                                placeholder="Buscar por estudiante, grupo o curso..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" className="gap-2">
                                                    <IconSchool className="h-4 w-4" />
                                                    Estado Matrícula
                                                    {academicStatusFilter.length > 0 && (
                                                        <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                                                            {academicStatusFilter.length}
                                                        </Badge>
                                                    )}
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56">
                                                <DropdownMenuLabel>Estado Matrícula</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuCheckboxItem
                                                    checked={academicStatusFilter.includes('pending')}
                                                    onCheckedChange={() => toggleAcademicStatusFilter('pending')}
                                                >
                                                    Pendiente
                                                </DropdownMenuCheckboxItem>
                                                <DropdownMenuCheckboxItem
                                                    checked={academicStatusFilter.includes('active')}
                                                    onCheckedChange={() => toggleAcademicStatusFilter('active')}
                                                >
                                                    Activo
                                                </DropdownMenuCheckboxItem>
                                                {/* <DropdownMenuCheckboxItem
                                                    checked={academicStatusFilter.includes('completed')}
                                                    onCheckedChange={() => toggleAcademicStatusFilter('completed')}
                                                >
                                                    Completado
                                                </DropdownMenuCheckboxItem> */}
                                                <DropdownMenuCheckboxItem
                                                    checked={academicStatusFilter.includes('failed')}
                                                    onCheckedChange={() => toggleAcademicStatusFilter('failed')}
                                                >
                                                    Reprobado
                                                </DropdownMenuCheckboxItem>
                                                {/* <DropdownMenuCheckboxItem
                                                    checked={academicStatusFilter.includes('dropped')}
                                                    onCheckedChange={() => toggleAcademicStatusFilter('dropped')}
                                                >
                                                    Retirado
                                                </DropdownMenuCheckboxItem> */}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        {(paymentStatusFilter.length > 0 || academicStatusFilter.length > 0 || sortColumn) && (
                                            <Button variant="outline" onClick={clearFilters}>
                                                Limpiar filtros
                                            </Button>
                                        )}
                                        <Button variant="outline" onClick={handleClearSearch}>
                                            Limpiar búsqueda
                                        </Button>
                                    </div>

                                    {filteredEnrollments.length === 0 ? (
                                        <div className="py-12 text-center">
                                            <p className="text-muted-foreground">No hay matrículas que coincidan con la búsqueda</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="rounded-md border">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className="bg-sky-50 dark:bg-sky-950/20">
                                                            <TableHead>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 gap-1 font-semibold text-sky-700 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300"
                                                                    onClick={() => handleSort('id')}
                                                                >
                                                                    ID
                                                                    {sortColumn === 'id' ? (
                                                                        sortDirection === 'asc' ? <IconChevronUp className="h-3 w-3" /> : <IconChevronDown className="h-3 w-3" />
                                                                    ) : (
                                                                        <IconArrowsSort className="h-3 w-3 opacity-50" />
                                                                    )}
                                                                </Button>
                                                            </TableHead>
                                                            <TableHead className="font-semibold text-sky-700 dark:text-sky-400">Estudiante</TableHead>
                                                            <TableHead className="font-semibold text-sky-700 dark:text-sky-400">Grupo</TableHead>
                                                            <TableHead className="font-semibold text-sky-700 dark:text-sky-400">Curso</TableHead>
                                                            <TableHead className="font-semibold text-sky-700 dark:text-sky-400">Fecha</TableHead>
                                                            <TableHead>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 gap-1 font-semibold text-sky-700 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300"
                                                                    onClick={() => handleSort('academic_status')}
                                                                >
                                                                    Estado Matrícula
                                                                    {sortColumn === 'academic_status' ? (
                                                                        sortDirection === 'asc' ? <IconChevronUp className="h-3 w-3" /> : <IconChevronDown className="h-3 w-3" />
                                                                    ) : (
                                                                        <IconArrowsSort className="h-3 w-3 opacity-50" />
                                                                    )}
                                                                </Button>
                                                            </TableHead>
                                                            <TableHead className="text-center font-semibold text-sky-700 dark:text-sky-400">Acciones</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {pageEnrollments.map((enrollment) => (
                                                            <TableRow key={enrollment.id}>
                                                                <TableCell className="font-semibold">
                                                                    #{enrollment.id}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/20">
                                                                            <IconUser className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-medium">{enrollment.student_name || 'Sin nombre'}</p>
                                                                            <p className="text-xs text-muted-foreground">{enrollment.student_email}</p>
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="text-muted-foreground">
                                                                    {enrollment.group_name || 'Sin grupo'}
                                                                </TableCell>
                                                                <TableCell className="text-muted-foreground">
                                                                    {enrollment.course_name || 'Sin curso'}
                                                                </TableCell>
                                                                <TableCell className="text-muted-foreground">
                                                                    {new Date(enrollment.created_at).toLocaleDateString('es-ES', {
                                                                        day: '2-digit',
                                                                        month: '2-digit',
                                                                        year: 'numeric'
                                                                    })}
                                                                </TableCell>
                                                                <TableCell>{getAcademicStatusBadge(enrollment.academic_status)}</TableCell>
                                                                <TableCell>
                                                                    <div className="flex items-center justify-center gap-2">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => handleViewDetails(enrollment)}
                                                                            title="Ver detalles"
                                                                        >
                                                                            <IconEye className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="text-sm text-muted-foreground">
                                                    Mostrando {start + 1}-{Math.min(end, filteredEnrollments.length)} de {filteredEnrollments.length}
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setCurrentPage(currentPage - 1)}
                                                        disabled={currentPage === 1}
                                                    >
                                                        Anterior
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setCurrentPage(currentPage + 1)}
                                                        disabled={end >= filteredEnrollments.length}
                                                    >
                                                        Siguiente
                                                    </Button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Detalles de Matrícula #{selectedEnrollment?.id}</DialogTitle>
                        <DialogDescription>
                            Información completa de la matrícula del estudiante
                        </DialogDescription>
                    </DialogHeader>
                    {selectedEnrollment && (
                        <div className="space-y-6 py-4">
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Estudiante</h3>
                                <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/20">
                                        <IconUser className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">{selectedEnrollment.student_name || 'Sin nombre'}</p>
                                        <p className="text-sm text-muted-foreground">{selectedEnrollment.student_email}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground">Grupo</p>
                                    <p className="font-semibold">{selectedEnrollment.group_name || 'Sin grupo'}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground">Curso</p>
                                    <p className="font-semibold">{selectedEnrollment.course_name || 'Sin curso'}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground">Fecha de Matrícula</p>
                                    <p className="font-semibold">
                                        {new Date(selectedEnrollment.created_at).toLocaleDateString('es-ES', {
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground">Estado de Pago</p>
                                    {getPaymentStatusBadge(selectedEnrollment.payment_status)}
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground">Estado Matrícula</p>
                                    {getAcademicStatusBadge(selectedEnrollment.academic_status)}
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground">Resultado Académico</p>
                                    {getResultStatusBadge(selectedEnrollment.enrollment_result?.status)}
                                </div>
                            </div>

                            {selectedEnrollment.enrollment_result && (
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Resultados Académicos</h3>
                                    <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-muted-foreground">Nota Final</p>
                                            <p className="text-2xl font-bold">
                                                {selectedEnrollment.enrollment_result.final_grade !== null
                                                    ? selectedEnrollment.enrollment_result.final_grade.toFixed(1)
                                                    : 'N/A'}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-muted-foreground">Asistencia</p>
                                            <p className="text-2xl font-bold">
                                                {selectedEnrollment.enrollment_result.attendance_percentage !== null
                                                    ? `${selectedEnrollment.enrollment_result.attendance_percentage.toFixed(0)}%`
                                                    : 'N/A'}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-muted-foreground">Estado</p>
                                            {getResultStatusBadge(selectedEnrollment.enrollment_result.status)}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cerrar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdministrativeLayout>
    );
}
