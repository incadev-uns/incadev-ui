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
  IconKey,
  IconSearch,
  IconChevronLeft,
  IconChevronRight,
} from '@tabler/icons-react';
import { toast } from 'sonner';

interface Permission {
  id: number;
  name: string;
  guard_name?: string;
  created_at?: string;
  updated_at?: string;
}

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [page, setPage] = useState(1);
  const [perPage] = useState(15);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);

  // Form states
  const [permissionName, setPermissionName] = useState('');

  useEffect(() => {
    fetchPermissions();
  }, [page, search]);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = `${config.apiUrl}${config.endpoints.permissions.list}?per_page=${perPage}&page=${page}${search ? `&search=${encodeURIComponent(search)}` : ''}`;

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
          setPermissions(data.data.data);
          setTotal(data.data.total || 0);
          setTotalPages(data.data.last_page || 1);
        }
        // Soporte para respuesta sin paginación (data es array directo)
        else if (Array.isArray(data.data)) {
          setPermissions(data.data);
          setTotal(data.data.length);
          setTotalPages(1);
        }
        // Fallback
        else {
          setPermissions([]);
          setTotal(0);
          setTotalPages(1);
        }
      } else {
        const errorData = await response.json();
        toast.error('Error al cargar permisos', {
          description: errorData.message || 'No se pudieron cargar los permisos',
        });
      }
    } catch (error: any) {
      console.error('Error fetching permissions:', error);
      toast.error('Error al cargar permisos', {
        description: error.message || 'No se pudieron cargar los permisos',
      });
    } finally {
      setLoading(false);
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
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: permissionName,
        }),
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
      toast.error('Error al crear permiso', {
        description: error.message || 'No se pudo crear el permiso',
      });
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
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: permissionName,
        }),
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
      toast.error('Error al actualizar permiso', {
        description: error.message || 'No se pudo actualizar el permiso',
      });
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
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
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
      toast.error('Error al eliminar permiso', {
        description: error.message || 'No se pudo eliminar el permiso',
      });
    }
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

  return (
    <TechnologyLayout title="Gestión de Permisos">
      <div className="flex flex-1 flex-col items-center">
        <div className="flex flex-1 flex-col gap-8 p-6 md:p-10 max-w-[1600px] w-full">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Permisos</h2>
              <p className="text-muted-foreground">
                Gestiona los permisos del sistema
              </p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <IconPlus className="mr-2 h-4 w-4" />
              Nuevo Permiso
            </Button>
          </div>

          {/* Search */}
          <Card className="shadow-sm border-muted">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar permisos..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Permissions Table */}
          <Card className="shadow-sm border-muted">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Listado de Permisos</CardTitle>
              <CardDescription className="text-sm mt-1.5">
                Mostrando {permissions.length} de {total} permisos
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <p className="text-muted-foreground">Cargando permisos...</p>
                </div>
              ) : permissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <IconKey className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {search ? 'No se encontraron permisos con ese criterio' : 'No hay permisos registrados'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Guard</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {permissions.map((permission) => (
                        <TableRow key={permission.id}>
                          <TableCell className="font-medium">{permission.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <IconKey className="h-4 w-4 text-primary" />
                              <span className="font-medium">{permission.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-muted-foreground">
                              {permission.guard_name || 'api'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(permission)}
                                title="Editar"
                              >
                                <IconEdit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openDeleteDialog(permission)}
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
            {!loading && permissions.length > 0 && (
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

      {/* Create Permission Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Permiso</DialogTitle>
            <DialogDescription>
              Define el nombre del permiso. Usa formato: acción-recurso
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre del Permiso *</label>
              <Input
                value={permissionName}
                onChange={(e) => setPermissionName(e.target.value)}
                placeholder="Ej: view-users, create-posts"
              />
              <p className="text-xs text-muted-foreground">
                Ejemplos: view-users, create-courses, edit-content, delete-comments
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setPermissionName('');
              }}
            >
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
            <Button
              variant="outline"
              onClick={() => {
                setShowEditDialog(false);
                setPermissionName('');
                setSelectedPermission(null);
              }}
            >
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
              Este permiso será removido de todos los roles y usuarios que lo tengan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setSelectedPermission(null);
              }}
            >
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
