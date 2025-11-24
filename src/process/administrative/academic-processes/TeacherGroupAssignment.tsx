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
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { config } from '@/config/administrative-config';
import { IconSearch, IconFilter, IconArrowsSort, IconChevronDown, IconChevronUp, IconUserPlus, IconTrash, IconUsers, IconBook, IconCalendar, IconPlus, IconUser, IconCheck, IconBriefcase } from '@tabler/icons-react';

interface Group {
    id: number;
    course_version_id: number;
    name: string;
    start_date: string;
    end_date: string;
    status: string;
    course_name?: string;
    teachers?: Teacher[];
}

interface Teacher {
    id: number;
    user_id: number;
    subject_area: string;
    professional_summary: string;
    cv_path: string;
    user_name?: string;
    user_email?: string;
}

interface GroupTeacher {
    id: number;
    group_id: number;
    user_id: number;
    teacher_name?: string;
}

interface Stats {
    total_groups: number;
    active_groups: number;
    groups_with_teachers: number;
    total_teachers: number;
}

export default function TeacherGroupAssignment() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortColumn, setSortColumn] = useState<keyof Group | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [statusFilter, setStatusFilter] = useState<string[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [selectedTeacher, setSelectedTeacher] = useState<string>('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isAssigning, setIsAssigning] = useState(false);
    const [teacherSearch, setTeacherSearch] = useState('');
    const itemsPerPage = 10;

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        handleSearch(searchQuery);
    }, [searchQuery, groups, sortColumn, sortDirection, statusFilter]);

    const handleSort = (column: keyof Group) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('desc');
        }
    };

    const toggleStatusFilter = (status: string) => {
        setStatusFilter(prev =>
            prev.includes(status)
                ? prev.filter(s => s !== status)
                : [...prev, status]
        );
    };

    const clearFilters = () => {
        setStatusFilter([]);
        setSortColumn(null);
        setSortDirection('desc');
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const apiUrl = `${config.apiUrl}/api/academic-processes/teacher-groups`;
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
            setGroups(data.groups);
            setTeachers(data.teachers);
            setFilteredGroups(data.groups);
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

        let filtered = [...groups];

        if (lowerQuery) {
            filtered = filtered.filter((group) => {
                const groupName = (group.name || '').toLowerCase();
                const courseName = (group.course_name || '').toLowerCase();
                const groupId = String(group.id).toLowerCase();
                return groupName.includes(lowerQuery) || courseName.includes(lowerQuery) || groupId.includes(lowerQuery);
            });
        }

        if (statusFilter.length > 0) {
            filtered = filtered.filter(group =>
                statusFilter.includes(group.status.toLowerCase())
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

        setFilteredGroups(filtered);
        setCurrentPage(1);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setCurrentPage(1);
    };

    const filteredTeachersForDialog = teachers.filter(teacher => {
        const searchLower = teacherSearch.toLowerCase();
        return (
            (teacher.user_name || '').toLowerCase().includes(searchLower) ||
            (teacher.user_email || '').toLowerCase().includes(searchLower) ||
            (teacher.subject_area || '').toLowerCase().includes(searchLower) ||
            (teacher.professional_summary || '').toLowerCase().includes(searchLower)
        );
    });

    const handleAssignTeacher = async () => {
        if (!selectedGroup || !selectedTeacher) return;

        try {
            setIsAssigning(true);
            const apiUrl = `${config.apiUrl}/api/academic-processes/teacher-groups/assign`;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    group_id: selectedGroup.id,
                    user_id: parseInt(selectedTeacher),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
            }

            await loadData();
            setIsDialogOpen(false);
            setSelectedGroup(null);
            setSelectedTeacher('');
        } catch (err) {
            console.error('Error al asignar docente:', err);
            alert(err instanceof Error ? err.message : 'Error al asignar docente');
        } finally {
            setIsAssigning(false);
        }
    };

    const handleRemoveTeacher = async (groupId: number, userId: number) => {
        if (!confirm('¿Está seguro de remover este docente del grupo?')) return;

        try {
            const apiUrl = `${config.apiUrl}/api/academic-processes/teacher-groups/remove`;
            const response = await fetch(apiUrl, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    group_id: groupId,
                    user_id: userId,
                }),
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            await loadData();
        } catch (err) {
            console.error('Error al remover docente:', err);
            alert('Error al remover docente');
        }
    };

    const getStatusBadge = (status: string) => {
        const statusLower = status.toLowerCase();
        const statusMap: Record<string, { text: string; className: string }> = {
            pending: { text: 'Pendiente', className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20' },
            enrolling: { text: 'En Inscripción', className: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20' },
            active: { text: 'Activo', className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' },
            completed: { text: 'Completado', className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20' },
            cancelled: { text: 'Cancelado', className: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20' }
        };
        const statusInfo = statusMap[statusLower] || { text: status, className: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20' };
        return <Badge variant="outline" className={statusInfo.className}>{statusInfo.text}</Badge>;
    };

    const renderAssignDialog = (group: Group) => (
        <Dialog open={isDialogOpen && selectedGroup?.id === group.id} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
                setSelectedGroup(null);
                setSelectedTeacher('');
                setTeacherSearch('');
            }
        }}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        setSelectedGroup(group);
                        setIsDialogOpen(true);
                    }}
                    title="Asignar docente"
                >
                    <IconPlus className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Asignar Docente</DialogTitle>
                    <DialogDescription>
                        {group.status.toLowerCase() === 'completed' || group.status.toLowerCase() === 'cancelled'
                            ? `Este grupo está ${group.status.toLowerCase() === 'completed' ? 'completado' : 'cancelado'}`
                            : `Asignar un docente al grupo ${group.name}`
                        }
                    </DialogDescription>
                </DialogHeader>
                {group.status.toLowerCase() === 'completed' || group.status.toLowerCase() === 'cancelled' ? (
                    <>
                        <div className="py-6">
                            <div className="flex flex-col items-center justify-center space-y-4 text-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20">
                                    <IconUsers className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-foreground">
                                        No se pueden asignar docentes
                                    </p>
                                    <p className="text-sm text-muted-foreground max-w-sm">
                                        Este grupo está {group.status.toLowerCase() === 'completed' ? 'completado' : 'cancelado'} y no permite la asignación de nuevos docentes.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsDialogOpen(false);
                                    setSelectedGroup(null);
                                    setSelectedTeacher('');
                                    setTeacherSearch('');
                                }}
                            >
                                Cerrar
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <>
                        <div className="space-y-4 py-4">
                            <div className="space-y-3">
                                <label className="text-sm font-medium">Seleccionar Docente</label>
                                <Input
                                    type="text"
                                    placeholder="Buscar por nombre, email o área..."
                                    value={teacherSearch}
                                    onChange={(e) => setTeacherSearch(e.target.value)}
                                    className="w-full"
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                                    {filteredTeachersForDialog.length === 0 ? (
                                        <div className="col-span-2 py-8 text-center text-sm text-muted-foreground">
                                            No se encontraron docentes
                                        </div>
                                    ) : (
                                        filteredTeachersForDialog.map((teacher) => (
                                            <div
                                                key={teacher.user_id}
                                                onClick={() => setSelectedTeacher(String(teacher.user_id))}
                                                className={cn(
                                                    "relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md",
                                                    selectedTeacher === String(teacher.user_id)
                                                        ? "border-sky-500 bg-sky-50 dark:bg-sky-950/20"
                                                        : "border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-700"
                                                )}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/20">
                                                        <IconUser className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm truncate">
                                                            {teacher.user_name || 'Sin nombre'}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground truncate">
                                                            {teacher.user_email}
                                                        </p>
                                                    </div>
                                                    {selectedTeacher === String(teacher.user_id) && (
                                                        <IconCheck className="h-5 w-5 text-sky-600 dark:text-sky-400 shrink-0" />
                                                    )}
                                                </div>
                                                {teacher.subject_area && (
                                                    <div className="mt-3 flex flex-wrap gap-1">
                                                        {teacher.subject_area.split(',').slice(0, 2).map((area, idx) => (
                                                            <Badge
                                                                key={idx}
                                                                variant="secondary"
                                                                className="text-xs bg-slate-100 dark:bg-slate-800"
                                                            >
                                                                {area.trim()}
                                                            </Badge>
                                                        ))}
                                                        {teacher.subject_area.split(',').length > 2 && (
                                                            <Badge variant="secondary" className="text-xs bg-slate-100 dark:bg-slate-800">
                                                                +{teacher.subject_area.split(',').length - 2}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                )}
                                                {teacher.professional_summary && (
                                                    <div className="mt-2 flex items-start gap-1.5">
                                                        <IconBriefcase className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                                            {teacher.professional_summary}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsDialogOpen(false);
                                    setSelectedGroup(null);
                                    setSelectedTeacher('');
                                    setTeacherSearch('');
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleAssignTeacher}
                                disabled={!selectedTeacher || isAssigning}
                                className="bg-sky-600 hover:bg-sky-700 text-white"
                            >
                                {isAssigning ? 'Asignando...' : 'Asignar'}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageGroups = filteredGroups.slice(start, end);

    return (
        <AdministrativeLayout title="Docentes por Grupo">
            <div className="min-h-screen p-4 md:p-6 lg:p-8">
                <div className="mx-auto max-w-[1600px] space-y-6">

                    <div className="rounded-3xl border border-slate-200 dark:border-slate-800/60 bg-gradient-to-br from-sky-500 to-sky-700 px-6 py-7 shadow-xl">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.28em] text-sky-100/90">Procesos Académicos</p>
                            <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">Docentes por Grupo</h1>
                            <p className="mt-2 max-w-xl text-sm text-sky-100/80">
                                Asignación y gestión de docentes a grupos de cursos
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
                                                <p className="text-xs font-medium text-muted-foreground">Total Grupos</p>
                                                <p className="text-2xl font-bold">{stats?.total_groups || 0}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                                                <IconCalendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-medium text-muted-foreground">Grupos Activos</p>
                                                <p className="text-2xl font-bold">{stats?.active_groups || 0}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                                                <IconUserPlus className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-medium text-muted-foreground">Con Docentes</p>
                                                <p className="text-2xl font-bold">{stats?.groups_with_teachers || 0}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                                                <IconUsers className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-medium text-muted-foreground">Total Docentes</p>
                                                <p className="text-2xl font-bold">{stats?.total_teachers || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div>
                                            <CardTitle>Grupos y Docentes</CardTitle>
                                            <CardDescription>Gestión de asignación de docentes a grupos</CardDescription>
                                        </div>
                                        <Badge variant="secondary">
                                            {filteredGroups.length} grupos
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex flex-wrap gap-3">
                                        <div className="relative flex-1 min-w-0 md:min-w-[280px]">
                                            <IconSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                type="text"
                                                placeholder="Buscar por nombre de grupo o curso..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" className="gap-2">
                                                    <IconFilter className="h-4 w-4" />
                                                    Filtrar estado
                                                    {statusFilter.length > 0 && (
                                                        <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                                                            {statusFilter.length}
                                                        </Badge>
                                                    )}
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56">
                                                <DropdownMenuLabel>Estado del grupo</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuCheckboxItem
                                                    checked={statusFilter.includes('pending')}
                                                    onCheckedChange={() => toggleStatusFilter('pending')}
                                                >
                                                    Pendiente
                                                </DropdownMenuCheckboxItem>
                                                <DropdownMenuCheckboxItem
                                                    checked={statusFilter.includes('enrolling')}
                                                    onCheckedChange={() => toggleStatusFilter('enrolling')}
                                                >
                                                    En Inscripción
                                                </DropdownMenuCheckboxItem>
                                                <DropdownMenuCheckboxItem
                                                    checked={statusFilter.includes('active')}
                                                    onCheckedChange={() => toggleStatusFilter('active')}
                                                >
                                                    Activo
                                                </DropdownMenuCheckboxItem>
                                                <DropdownMenuCheckboxItem
                                                    checked={statusFilter.includes('completed')}
                                                    onCheckedChange={() => toggleStatusFilter('completed')}
                                                >
                                                    Completado
                                                </DropdownMenuCheckboxItem>
                                                <DropdownMenuCheckboxItem
                                                    checked={statusFilter.includes('cancelled')}
                                                    onCheckedChange={() => toggleStatusFilter('cancelled')}
                                                >
                                                    Cancelado
                                                </DropdownMenuCheckboxItem>
                                                {(statusFilter.length > 0 || sortColumn) && (
                                                    <>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={clearFilters} className="text-red-600 dark:text-red-400">
                                                            Limpiar filtros
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <Button variant="outline" onClick={handleClearSearch}>
                                            Limpiar búsqueda
                                        </Button>
                                    </div>

                                    {filteredGroups.length === 0 ? (
                                        <div className="py-12 text-center">
                                            <p className="text-muted-foreground">No hay grupos que coincidan con la búsqueda</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                                {pageGroups.map((group) => (
                                                    <div key={group.id} className="group rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 space-y-4 hover:shadow-lg transition-all duration-300 hover:border-violet-500/50">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">#{group.id}</span>
                                                                    {getStatusBadge(group.status)}
                                                                </div>
                                                                <h3 className="text-lg font-bold text-foreground truncate">{group.name}</h3>
                                                                <p className="text-sm text-muted-foreground truncate">{group.course_name || 'Sin curso'}</p>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                                            <div className="space-y-1">
                                                                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                                                    <IconCalendar className="h-3 w-3" />
                                                                    Inicio
                                                                </p>
                                                                <p className="font-medium">{new Date(group.start_date).toLocaleDateString()}</p>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                                                    <IconCalendar className="h-3 w-3" />
                                                                    Fin
                                                                </p>
                                                                <p className="font-medium">{new Date(group.end_date).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                                                                    <IconUsers className="h-3.5 w-3.5" />
                                                                    Docentes ({group.teachers?.length || 0})
                                                                </p>
                                                                {renderAssignDialog(group)}
                                                            </div>
                                                            <div className="flex flex-wrap gap-2">
                                                                {group.teachers && group.teachers.length > 0 ? (
                                                                    group.teachers.map((teacher) => (
                                                                        <div key={teacher.id} className="flex items-center gap-1.5 rounded-lg border border-violet-500/20 bg-violet-500/10 px-2.5 py-1.5 text-xs">
                                                                            <IconUser className="h-3 w-3 text-violet-600 dark:text-violet-400" />
                                                                            <span className="font-medium text-violet-700 dark:text-violet-300">{teacher.user_name || 'Sin nombre'}</span>
                                                                            {group.status !== 'completed' && group.status !== 'cancelled' && (
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    className="h-4 w-4 p-0 ml-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                                                    onClick={() => handleRemoveTeacher(group.id, teacher.user_id)}
                                                                                    title="Remover docente"
                                                                                >
                                                                                    <IconTrash className="h-3 w-3" />
                                                                                </Button>
                                                                            )}
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <span className="text-xs text-muted-foreground italic">Sin docentes asignados</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>



                                            <div className="flex items-center justify-between">
                                                <div className="text-sm text-muted-foreground">
                                                    Mostrando {start + 1}-{Math.min(end, filteredGroups.length)} de {filteredGroups.length}
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
                                                        disabled={end >= filteredGroups.length}
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
        </AdministrativeLayout>
    );
}
