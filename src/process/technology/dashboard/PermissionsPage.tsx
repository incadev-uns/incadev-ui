import { useState, useEffect } from 'react';
import TechnologyLayout from '@/process/technology/TechnologyLayout';
import { config } from '@/config/technology-config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  IconPlus,
  IconEdit,
  IconTrash,
  IconKey,
  IconSearch,
  IconChevronLeft,
  IconChevronRight,
  IconSortAscending,
  IconSortDescending,
  IconX,
  IconEye,
  IconShield,
  IconCategory,
} from '@tabler/icons-react';
import { toast } from 'sonner';

interface Permission {
  id: number;
  name: string;
  guard_name?: string;
  created_at?: string;
  updated_at?: string;
  roles?: Array<{ id: number; name: string }>;
}

interface GroupedPermissions {
  category: string;
  count: number;
  permissions: Permission[];
}

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [groupedPermissions, setGroupedPermissions] = useState<GroupedPermissions[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'grouped'>('table');

  // Pagination & filters
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [inUse, setInUse] = useState<string>('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Form states
  const [permissionName, setPermissionName] = useState('');

  useEffect(() => {
    if (viewMode === 'table') {
      fetchPermissions();
    } else {
      fetchGroupedPermissions();
    }
  }, [page, search, category, inUse, sortBy, sortOrder, viewMode]);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url = `${config.apiUrl}${config.endpoints.permissions.list}?per_page=${perPage}&page=${page}`;

      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (category !== 'all') url += `&category=${category}`;
      if (inUse !== 'all') url += `&in_use=${inUse === 'yes'}`;
      url += `&sort_by=${sortBy}&sort_order=${sortOrder}`;

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();

        if (data.data?.data && Array.isArray(data.data.data)) {
          setPermissions(data.data.data);
          setTotal(data.data.total || 0);
          setTotalPages(data.data.last_page || 1);
        } else if (Array.isArray(data.data)) {
          setPermissions(data.data);
          setTotal(data.data.length);
          setTotalPages(1);
        } else {
          setPermissions([]);
          setTotal(0);
          setTotalPages(1);
        }

        if (data.available_categories) {
          setAvailableCategories(data.available_categories);
        }
      } else {
        const errorData = await response.json();
        toast.error('Error al cargar permisos', {
          description: errorData.message || 'No se pudieron cargar los permisos',
        });
      }
    } catch (error: any) {
      console.error('Error fetching permissions:', error);
      toast.error('Error al cargar permisos');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupedPermissions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url = `${config.apiUrl}${config.endpoints.permissions.list}?grouped=true&per_page=-1`;

      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (category !== 'all') url += `&category=${category}`;

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();

        if (Array.isArray(data.data)) {
          setGroupedPermissions(data.data);
          setTotal(data.total || data.data.reduce((acc: number, g: GroupedPermissions) => acc + g.count, 0));
        }
      }
    } catch (error) {
      console.error('Error fetching grouped permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissionDetails = async (permId: number) => {
    setLoadingDetails(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiUrl}/permissions/${permId}?with_roles=true`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedPermission(data.data);
      }
    } catch (error) {
      console.error('Error fetching permission details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleCreatePermission = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${config.apiUrl}${config.endpoints.permissions.create}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: permissionName }),
      });

      if (response.ok) {
        toast.success('Permiso creado exitosamente');
        setShowCreateDialog(false);
        setPermissionName('');
        fetchPermissions();
      } else {
        const errorData = await response.json();
        toast.error('Error al crear permiso', {
          description: errorData.message || 'No se pudo crear el permiso',
        });
      }
    } catch (error: any) {
      console.error('Error creating permission:', error);
      toast.error('Error al crear permiso');
    }
  };

  const handleUpdatePermission = async () => {
    if (!selectedPermission) return;

    try {
      const token = localStorage.getItem('token');
      const url = config.endpoints.permissions.update.replace(':id', selectedPermission.id.toString());

      const response = await fetch(`${config.apiUrl}${url}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: permissionName }),
      });

      if (response.ok) {
        toast.success('Permiso actualizado exitosamente');
        setShowEditDialog(false);
        setPermissionName('');
        setSelectedPermission(null);
        fetchPermissions();
      } else {
        const errorData = await response.json();
        toast.error('Error al actualizar permiso', {
          description: errorData.message || 'No se pudo actualizar el permiso',
        });
      }
    } catch (error: any) {
      console.error('Error updating permission:', error);
      toast.error('Error al actualizar permiso');
    }
  };

  const handleDeletePermission = async () => {
    if (!selectedPermission) return;

    try {
      const token = localStorage.getItem('token');
      const url = config.endpoints.permissions.delete.replace(':id', selectedPermission.id.toString());

      const response = await fetch(`${config.apiUrl}${url}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Permiso eliminado exitosamente');
        setShowDeleteDialog(false);
        setSelectedPermission(null);
        fetchPermissions();
      } else {
        const errorData = await response.json();
        toast.error('Error al eliminar permiso', {
          description: errorData.message || 'No se pudo eliminar el permiso',
        });
      }
    } catch (error: any) {
      console.error('Error deleting permission:', error);
      toast.error('Error al eliminar permiso');
    }
  };

  const openDetailsDialog = (permission: Permission) => {
    setSelectedPermission(permission);
    setShowDetailsDialog(true);
    fetchPermissionDetails(permission.id);
  };

  const openEditDialog = (permission: Permission) => {
    setSelectedPermission(permission);
    setPermissionName(permission.name);
    setShowEditDialog(true);
  };

  const openDeleteDialog = (permission: Permission) => {
    setSelectedPermission(permission);
    setShowDeleteDialog(true);
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('all');
    setInUse('all');
    setSortBy('name');
    setSortOrder('asc');
    setPage(1);
  };

  const hasActiveFilters = search || category !== 'all' || inUse !== 'all' || sortBy !== 'name' || sortOrder !== 'asc';

  const getPermissionCategory = (name: string) => {
    return name.split('.')[0] || 'other';
  };

  return (
    <TechnologyLayout title="Gestión de Permisos">
      <div className="flex flex-1 flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Permisos</h2>
            <p className="text-muted-foreground text-sm">
              Gestiona los permisos del sistema
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              Tabla
            </Button>
            <Button
              variant={viewMode === 'grouped' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grouped')}
            >
              Agrupado
            </Button>
            <Button onClick={() => setShowCreateDialog(true)}>
              <IconPlus className="mr-2 h-4 w-4" />
              Nuevo Permiso
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar permisos..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {availableCategories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="capitalize">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {viewMode === 'table' && (
                <>
                  <Select value={inUse} onValueChange={(v) => { setInUse(v); setPage(1); }}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="yes">En uso</SelectItem>
                      <SelectItem value="no">Sin usar</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); }}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                      <SelectValue placeholder="Ordenar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Nombre</SelectItem>
                      <SelectItem value="created_at">Fecha</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    title={sortOrder === 'asc' ? 'Ascendente' : 'Descendente'}
                  >
                    {sortOrder === 'asc' ? (
                      <IconSortAscending className="h-4 w-4" />
                    ) : (
                      <IconSortDescending className="h-4 w-4" />
                    )}
                  </Button>
                </>
              )}

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <IconX className="h-4 w-4 mr-1" />
                  Limpiar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {viewMode === 'table' ? (
          /* Table View */
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Listado de Permisos</CardTitle>
              <CardDescription>
                Total: {total} permisos registrados
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : permissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <IconKey className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {search || category !== 'all' ? 'No se encontraron permisos con ese criterio' : 'No hay permisos registrados'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">ID</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Guard</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {permissions.map((permission) => (
                        <TableRow key={permission.id}>
                          <TableCell className="font-mono text-xs">{permission.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <IconKey className="h-4 w-4 text-primary" />
                              <span className="font-medium">{permission.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs capitalize">
                              {getPermissionCategory(permission.name)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-muted-foreground">
                              {permission.guard_name || 'web'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openDetailsDialog(permission)}
                                title="Ver detalles"
                              >
                                <IconEye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEditDialog(permission)}
                                title="Editar"
                              >
                                <IconEdit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => openDeleteDialog(permission)}
                                title="Eliminar"
                              >
                                <IconTrash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t p-4">
                  <p className="text-sm text-muted-foreground">
                    Página {page} de {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      <IconChevronLeft className="h-4 w-4 mr-1" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                    >
                      Siguiente
                      <IconChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          /* Grouped View */
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="h-6 w-32 mb-3" />
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {[1, 2, 3, 4].map((j) => (
                          <Skeleton key={j} className="h-8 w-full" />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : groupedPermissions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                  <IconKey className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No hay permisos registrados</p>
                </CardContent>
              </Card>
            ) : (
              groupedPermissions.map((group) => (
                <Card key={group.category}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconCategory className="h-5 w-5 text-primary" />
                        <CardTitle className="text-base capitalize">{group.category}</CardTitle>
                      </div>
                      <Badge variant="secondary">{group.count} permisos</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {group.permissions.map((perm) => (
                        <div
                          key={perm.id}
                          className="flex items-center justify-between p-2 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <IconKey className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="text-xs truncate" title={perm.name}>
                              {perm.name.split('.').pop()}
                            </span>
                          </div>
                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => openDetailsDialog(perm)}
                            >
                              <IconEye className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => openEditDialog(perm)}
                            >
                              <IconEdit className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            {/* Total count */}
            <div className="text-center text-sm text-muted-foreground">
              Total: {total} permisos en {groupedPermissions.length} categorías
            </div>
          </div>
        )}
      </div>

      {/* Permission Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconKey className="h-5 w-5 text-primary" />
              {selectedPermission?.name}
            </DialogTitle>
            <DialogDescription>
              Detalles del permiso y roles asignados
            </DialogDescription>
          </DialogHeader>

          {loadingDetails ? (
            <div className="space-y-3 py-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : selectedPermission && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Categoría</p>
                  <Badge variant="outline" className="capitalize">
                    {getPermissionCategory(selectedPermission.name)}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Guard</p>
                  <p className="text-sm font-medium">{selectedPermission.guard_name || 'web'}</p>
                </div>
              </div>

              {/* Roles */}
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <IconShield className="h-4 w-4" />
                  Roles con este permiso
                </h4>
                <div className="flex flex-wrap gap-1.5 p-2 bg-muted/50 rounded-lg min-h-[60px]">
                  {selectedPermission.roles && selectedPermission.roles.length > 0 ? (
                    selectedPermission.roles.map((role) => (
                      <Badge key={role.id} variant="secondary" className="text-xs">
                        {role.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No asignado a ningún rol</span>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Cerrar
            </Button>
            <Button onClick={() => {
              setShowDetailsDialog(false);
              if (selectedPermission) openEditDialog(selectedPermission);
            }}>
              <IconEdit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Permission Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Permiso</DialogTitle>
            <DialogDescription>
              Define el nombre del permiso. Usa formato: categoria.accion
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre del Permiso *</label>
              <Input
                value={permissionName}
                onChange={(e) => setPermissionName(e.target.value)}
                placeholder="Ej: users.view, courses.create"
              />
              <p className="text-xs text-muted-foreground">
                Ejemplos: users.view, courses.create, reports.export
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false);
              setPermissionName('');
            }}>
              Cancelar
            </Button>
            <Button onClick={handleCreatePermission} disabled={!permissionName}>
              Crear Permiso
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Permission Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Permiso</DialogTitle>
            <DialogDescription>
              Modifica el nombre del permiso
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre del Permiso *</label>
              <Input
                value={permissionName}
                onChange={(e) => setPermissionName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEditDialog(false);
              setPermissionName('');
              setSelectedPermission(null);
            }}>
              Cancelar
            </Button>
            <Button onClick={handleUpdatePermission}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar el permiso{' '}
              <span className="font-semibold">{selectedPermission?.name}</span>?
              {selectedPermission?.roles && selectedPermission.roles.length > 0 && (
                <span className="block mt-2 text-destructive">
                  Este permiso está asignado a {selectedPermission.roles.length} rol(es).
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowDeleteDialog(false);
              setSelectedPermission(null);
            }}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeletePermission}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TechnologyLayout>
  );
}
