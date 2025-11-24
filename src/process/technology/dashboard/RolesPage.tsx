import { useState, useEffect } from 'react';
import TechnologyLayout from '@/process/technology/TechnologyLayout';
import { config } from '@/config/technology-config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  IconKey,
  IconSearch,
  IconChevronLeft,
  IconChevronRight,
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';

interface Role {
  id: number;
  name: string;
  guard_name?: string;
  created_at?: string;
  updated_at?: string;
  permissions?: Permission[];
}

interface Permission {
  id: number;
  name: string;
  guard_name?: string;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    permissions: [] as string[],
  });

  useEffect(() => {
    fetchRoles();
  }, [page, search]);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = `${config.apiUrl}${config.endpoints.roles.list}?per_page=${perPage}&page=${page}${search ? `&search=${encodeURIComponent(search)}` : ''}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();

        // Soporte para paginación Laravel (data.data contiene los metadatos de paginación)
        if (data.data?.data && Array.isArray(data.data.data)) {
          setRoles(data.data.data);
          setTotal(data.data.total || 0);
          setTotalPages(data.data.last_page || 1);
        }
        // Soporte para respuesta sin paginación (data es array directo)
        else if (Array.isArray(data.data)) {
          setRoles(data.data);
          setTotal(data.data.length);
          setTotalPages(1);
        }
        // Fallback
        else {
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
      toast.error('Error al cargar roles', {
        description: error.message || 'No se pudieron cargar los roles',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const fetchPermissions = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${config.apiUrl}${config.endpoints.permissions.list}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPermissions(data.data || []);
      }
    } catch (error: any) {
      console.error('Error fetching permissions:', error);
    }
  };

  const handleCreateRole = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${config.apiUrl}${config.endpoints.roles.create}`, {
        method: 'POST',
        headers: {
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
      toast.error('Error al crear rol', {
        description: error.message || 'No se pudo crear el rol',
      });
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
      toast.error('Error al actualizar rol', {
        description: error.message || 'No se pudo actualizar el rol',
      });
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
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
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
      toast.error('Error al eliminar rol', {
        description: error.message || 'No se pudo eliminar el rol',
      });
    }
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
    setFormData({
      name: '',
      permissions: [],
    });
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

  return (
    <TechnologyLayout title="Gestión de Roles">
      <div className="flex flex-1 flex-col items-center">
        <div className="flex flex-1 flex-col gap-8 p-6 md:p-10 max-w-[1600px] w-full">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Roles</h2>
              <p className="text-muted-foreground">
                Gestiona los roles y sus permisos asociados
              </p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <IconPlus className="mr-2 h-4 w-4" />
              Nuevo Rol
            </Button>
          </div>

          {/* Search */}
          <Card className="shadow-sm border-muted">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar roles..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Roles Table */}
          <Card className="shadow-sm border-muted">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Listado de Roles</CardTitle>
              <CardDescription className="text-sm mt-1.5">
                Mostrando {roles.length} de {total} roles
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <p className="text-muted-foreground">Cargando roles...</p>
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
                        <TableHead>ID</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Permisos</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {roles.map((role) => (
                        <TableRow key={role.id}>
                          <TableCell className="font-medium">{role.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <IconShield className="h-4 w-4 text-primary" />
                              <span className="font-medium">{role.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {role.permissions && role.permissions.length > 0 ? (
                                <>
                                  {role.permissions.slice(0, 3).map((permission) => (
                                    <span
                                      key={permission.id}
                                      className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs font-medium"
                                    >
                                      {permission.name}
                                    </span>
                                  ))}
                                  {role.permissions.length > 3 && (
                                    <span className="text-xs text-muted-foreground">
                                      +{role.permissions.length - 3} más
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span className="text-muted-foreground text-xs">Sin permisos</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(role)}
                                title="Editar"
                              >
                                <IconEdit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openDeleteDialog(role)}
                                title="Eliminar"
                                className="text-destructive hover:text-destructive"
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
            </CardContent>

            {/* Pagination */}
            {!loading && roles.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Página {page} de {totalPages}
                </div>
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
          </Card>
        </div>
      </div>

      {/* Create Role Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Rol</DialogTitle>
            <DialogDescription>
              Define el nombre del rol y sus permisos asociados
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
              <label className="text-sm font-medium">Permisos</label>
              <div className="border rounded-md p-4 max-h-[300px] overflow-y-auto space-y-2">
                {permissions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay permisos disponibles
                  </p>
                ) : (
                  permissions.map((permission) => (
                    <div key={permission.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`create-perm-${permission.id}`}
                        checked={formData.permissions.includes(permission.name)}
                        onCheckedChange={() => togglePermission(permission.name)}
                      />
                      <label
                        htmlFor={`create-perm-${permission.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {permission.name}
                      </label>
                    </div>
                  ))
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Seleccionados: {formData.permissions.length} permisos
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateRole} disabled={!formData.name}>
              Crear Rol
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Editar Rol</DialogTitle>
            <DialogDescription>
              Modifica el nombre del rol y sus permisos
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre del Rol *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Permisos</label>
              <div className="border rounded-md p-4 max-h-[300px] overflow-y-auto space-y-2">
                {permissions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay permisos disponibles
                  </p>
                ) : (
                  permissions.map((permission) => (
                    <div key={permission.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-perm-${permission.id}`}
                        checked={formData.permissions.includes(permission.name)}
                        onCheckedChange={() => togglePermission(permission.name)}
                      />
                      <label
                        htmlFor={`edit-perm-${permission.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {permission.name}
                      </label>
                    </div>
                  ))
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Seleccionados: {formData.permissions.length} permisos
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditDialog(false);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleUpdateRole}>Guardar Cambios</Button>
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
              <span className="font-semibold">{selectedRole?.name}</span>? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setSelectedRole(null);
              }}
            >
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
