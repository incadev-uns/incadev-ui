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
  IconShield,
  IconSearch,
  IconChevronLeft,
  IconChevronRight,
  IconUsers,
  IconKey,
  IconEye,
  IconSortAscending,
  IconSortDescending,
  IconFilter,
  IconX,
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';

interface Role {
  id: number;
  name: string;
  guard_name?: string;
  created_at?: string;
  updated_at?: string;
  users_count?: number;
  permissions?: Permission[];
  users?: Array<{ id: number; name: string; email: string }>;
}

interface Permission {
  id: number;
  name: string;
  guard_name?: string;
}

interface GroupedPermissions {
  category: string;
  count: number;
  permissions: Permission[];
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [groupedPermissions, setGroupedPermissions] = useState<GroupedPermissions[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination & filters
  const [page, setPage] = useState(1);
  const [perPage] = useState(15);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [hasUsers, setHasUsers] = useState<string>('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    permissions: [] as string[],
  });

  useEffect(() => {
    fetchRoles();
  }, [page, search, hasUsers, sortBy, sortOrder]);

  useEffect(() => {
    fetchPermissionsGrouped();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url = `${config.apiUrl}${config.endpoints.roles.list}?per_page=${perPage}&page=${page}&with_permissions=true&with_users_count=true`;

      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (hasUsers !== 'all') url += `&has_users=${hasUsers === 'yes'}`;
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
          setRoles(data.data.data);
          setTotal(data.data.total || 0);
          setTotalPages(data.data.last_page || 1);
        } else if (Array.isArray(data.data)) {
          setRoles(data.data);
          setTotal(data.data.length);
          setTotalPages(1);
        } else {
          setRoles([]);
          setTotal(0);
          setTotalPages(1);
        }
      } else {
        const errorData = await response.json();
        toast.error('Error al cargar roles', {
          description: errorData.message || 'No se pudieron cargar los roles',
        });
      }
    } catch (error: any) {
      console.error('Error fetching roles:', error);
      toast.error('Error al cargar roles');
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissionsGrouped = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiUrl}${config.endpoints.permissions.list}?grouped=true&per_page=-1`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.data)) {
          setGroupedPermissions(data.data);
          // Flatten for backwards compatibility
          const flatPerms = data.data.flatMap((g: GroupedPermissions) => g.permissions);
          setPermissions(flatPerms);
        } else if (data.data?.data) {
          setPermissions(data.data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const fetchRoleDetails = async (roleId: number) => {
    setLoadingDetails(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiUrl}/roles/${roleId}?with_users=true`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedRole(data.data);
      }
    } catch (error) {
      console.error('Error fetching role details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleCreateRole = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${config.apiUrl}${config.endpoints.roles.create}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          permissions: formData.permissions,
        }),
      });

      if (response.ok) {
        toast.success('Rol creado exitosamente');
        setShowCreateDialog(false);
        resetForm();
        fetchRoles();
      } else {
        const errorData = await response.json();
        toast.error('Error al crear rol', {
          description: errorData.message || 'No se pudo crear el rol',
        });
      }
    } catch (error: any) {
      console.error('Error creating role:', error);
      toast.error('Error al crear rol');
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedRole) return;

    try {
      const token = localStorage.getItem('token');
      const url = config.endpoints.roles.update.replace(':id', selectedRole.id.toString());

      const response = await fetch(`${config.apiUrl}${url}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          permissions: formData.permissions,
        }),
      });

      if (response.ok) {
        toast.success('Rol actualizado exitosamente');
        setShowEditDialog(false);
        resetForm();
        fetchRoles();
      } else {
        const errorData = await response.json();
        toast.error('Error al actualizar rol', {
          description: errorData.message || 'No se pudo actualizar el rol',
        });
      }
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast.error('Error al actualizar rol');
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;

    try {
      const token = localStorage.getItem('token');
      const url = config.endpoints.roles.delete.replace(':id', selectedRole.id.toString());

      const response = await fetch(`${config.apiUrl}${url}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Rol eliminado exitosamente');
        setShowDeleteDialog(false);
        setSelectedRole(null);
        fetchRoles();
      } else {
        const errorData = await response.json();
        toast.error('Error al eliminar rol', {
          description: errorData.message || 'No se pudo eliminar el rol',
        });
      }
    } catch (error: any) {
      console.error('Error deleting role:', error);
      toast.error('Error al eliminar rol');
    }
  };

  const openDetailsDialog = (role: Role) => {
    setSelectedRole(role);
    setShowDetailsDialog(true);
    fetchRoleDetails(role.id);
  };

  const openEditDialog = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name || '',
      permissions: role.permissions?.map((p) => p.name) || [],
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (role: Role) => {
    setSelectedRole(role);
    setShowDeleteDialog(true);
  };

  const resetForm = () => {
    setFormData({ name: '', permissions: [] });
    setSelectedRole(null);
  };

  const togglePermission = (permissionName: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionName)
        ? prev.permissions.filter((p) => p !== permissionName)
        : [...prev.permissions, permissionName],
    }));
  };

  const toggleCategoryPermissions = (category: GroupedPermissions) => {
    const categoryPermNames = category.permissions.map(p => p.name);
    const allSelected = categoryPermNames.every(name => formData.permissions.includes(name));

    if (allSelected) {
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(p => !categoryPermNames.includes(p))
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        permissions: [...new Set([...prev.permissions, ...categoryPermNames])]
      }));
    }
  };

  const clearFilters = () => {
    setSearch('');
    setHasUsers('all');
    setSortBy('name');
    setSortOrder('asc');
    setPage(1);
  };

  const hasActiveFilters = search || hasUsers !== 'all' || sortBy !== 'name' || sortOrder !== 'asc';

  return (
    <TechnologyLayout title="Gestión de Roles">
      <div className="flex flex-1 flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Roles</h2>
            <p className="text-muted-foreground text-sm">
              Gestiona los roles y sus permisos asociados
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <IconPlus className="mr-2 h-4 w-4" />
            Nuevo Rol
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar roles..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={hasUsers} onValueChange={(v) => { setHasUsers(v); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Usuarios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="yes">Con usuarios</SelectItem>
                  <SelectItem value="no">Sin usuarios</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nombre</SelectItem>
                  <SelectItem value="users_count">Cantidad usuarios</SelectItem>
                  <SelectItem value="created_at">Fecha creación</SelectItem>
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

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <IconX className="h-4 w-4 mr-1" />
                  Limpiar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Roles Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Listado de Roles</CardTitle>
            <CardDescription>
              Total: {total} roles registrados
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : roles.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <IconShield className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No se encontraron roles</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">ID</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Usuarios</TableHead>
                      <TableHead>Permisos</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell className="font-mono text-xs">{role.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <IconShield className="h-4 w-4 text-primary" />
                            <span className="font-medium">{role.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <IconUsers className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{role.users_count || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-[250px]">
                            {role.permissions && role.permissions.length > 0 ? (
                              <>
                                {role.permissions.slice(0, 2).map((perm) => (
                                  <Badge key={perm.id} variant="secondary" className="text-[10px]">
                                    {perm.name}
                                  </Badge>
                                ))}
                                {role.permissions.length > 2 && (
                                  <Badge variant="outline" className="text-[10px]">
                                    +{role.permissions.length - 2}
                                  </Badge>
                                )}
                              </>
                            ) : (
                              <span className="text-xs text-muted-foreground">Sin permisos</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openDetailsDialog(role)}
                              title="Ver detalles"
                            >
                              <IconEye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEditDialog(role)}
                              title="Editar"
                            >
                              <IconEdit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => openDeleteDialog(role)}
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
      </div>

      {/* Role Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconShield className="h-5 w-5 text-primary" />
              {selectedRole?.name}
            </DialogTitle>
            <DialogDescription>
              Detalles del rol y usuarios asignados
            </DialogDescription>
          </DialogHeader>

          {loadingDetails ? (
            <div className="space-y-3 py-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : selectedRole && (
            <div className="space-y-4 py-4">
              <div className="flex gap-4">
                <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                  <IconUsers className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{selectedRole.users_count || 0} usuarios</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                  <IconKey className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{selectedRole.permissions?.length || 0} permisos</span>
                </div>
              </div>

              {/* Permissions */}
              <div>
                <h4 className="text-sm font-medium mb-2">Permisos asignados</h4>
                <div className="flex flex-wrap gap-1.5 max-h-[150px] overflow-y-auto p-2 bg-muted/50 rounded-lg">
                  {selectedRole.permissions && selectedRole.permissions.length > 0 ? (
                    selectedRole.permissions.map((perm) => (
                      <Badge key={perm.id} variant="secondary" className="text-xs">
                        {perm.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">Sin permisos</span>
                  )}
                </div>
              </div>

              {/* Users */}
              {selectedRole.users && selectedRole.users.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Usuarios con este rol</h4>
                  <div className="space-y-2 max-h-[150px] overflow-y-auto">
                    {selectedRole.users.map((user) => (
                      <div key={user.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium">{user.name.substring(0, 2).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Cerrar
            </Button>
            <Button onClick={() => {
              setShowDetailsDialog(false);
              if (selectedRole) openEditDialog(selectedRole);
            }}>
              <IconEdit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Role Dialog */}
      <Dialog open={showCreateDialog || showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setShowEditDialog(false);
          resetForm();
        }
      }}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{showEditDialog ? 'Editar Rol' : 'Crear Nuevo Rol'}</DialogTitle>
            <DialogDescription>
              {showEditDialog ? 'Modifica el nombre y permisos del rol' : 'Define el nombre del rol y sus permisos'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre del Rol *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: moderator, content-manager"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Permisos</label>
                <span className="text-xs text-muted-foreground">
                  {formData.permissions.length} seleccionados
                </span>
              </div>

              <div className="border rounded-lg max-h-[350px] overflow-y-auto">
                {groupedPermissions.length > 0 ? (
                  groupedPermissions.map((group) => {
                    const categoryPermNames = group.permissions.map(p => p.name);
                    const selectedInCategory = categoryPermNames.filter(n => formData.permissions.includes(n)).length;
                    const allSelected = selectedInCategory === group.count;

                    return (
                      <div key={group.category} className="border-b last:border-b-0">
                        <div
                          className="flex items-center justify-between p-3 bg-muted/30 cursor-pointer hover:bg-muted/50"
                          onClick={() => toggleCategoryPermissions(group)}
                        >
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={allSelected}
                              onCheckedChange={() => toggleCategoryPermissions(group)}
                            />
                            <span className="font-medium text-sm capitalize">{group.category}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {selectedInCategory}/{group.count}
                          </Badge>
                        </div>
                        <div className="p-3 grid grid-cols-2 gap-2">
                          {group.permissions.map((perm) => (
                            <div key={perm.id} className="flex items-center gap-2">
                              <Checkbox
                                id={`perm-${perm.id}`}
                                checked={formData.permissions.includes(perm.name)}
                                onCheckedChange={() => togglePermission(perm.name)}
                              />
                              <label
                                htmlFor={`perm-${perm.id}`}
                                className="text-xs cursor-pointer truncate"
                                title={perm.name}
                              >
                                {perm.name.split('.').pop()}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                ) : permissions.length > 0 ? (
                  <div className="p-4 grid grid-cols-2 gap-2">
                    {permissions.map((perm) => (
                      <div key={perm.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`perm-${perm.id}`}
                          checked={formData.permissions.includes(perm.name)}
                          onCheckedChange={() => togglePermission(perm.name)}
                        />
                        <label htmlFor={`perm-${perm.id}`} className="text-xs cursor-pointer">
                          {perm.name}
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center p-4">
                    No hay permisos disponibles
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false);
              setShowEditDialog(false);
              resetForm();
            }}>
              Cancelar
            </Button>
            <Button
              onClick={showEditDialog ? handleUpdateRole : handleCreateRole}
              disabled={!formData.name}
            >
              {showEditDialog ? 'Guardar Cambios' : 'Crear Rol'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar el rol{' '}
              <span className="font-semibold">{selectedRole?.name}</span>?
              {selectedRole?.users_count && selectedRole.users_count > 0 && (
                <span className="block mt-2 text-destructive">
                  Este rol tiene {selectedRole.users_count} usuario(s) asignado(s).
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowDeleteDialog(false);
              setSelectedRole(null);
            }}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteRole}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TechnologyLayout>
  );
}
