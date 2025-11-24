import { useState, useEffect } from 'react';
import TechnologyLayout from '@/process/technology/TechnologyLayout';
import { config } from '@/config/technology-config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface User {
  id: number
  name: string
  email: string
  fullname?: string
  dni?: string
  phone?: string
  roles?: any[]
}
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
  IconSearch,
  IconEdit,
  IconTrash,
  IconShield,
  IconKey,
  IconUser,
  IconMail,
  IconPhone,
  IconId,
} from '@tabler/icons-react';
import { toast } from 'sonner';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage] = useState(15);

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    fullname: '',
    dni: '',
    phone: '',
    roles: [] as string[],
  });

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = `${config.apiUrl}${config.endpoints.users.list}?per_page=${perPage}&page=${page}${search ? `&search=${encodeURIComponent(search)}` : ''}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data?.data || []);
        setTotal(data.data?.total || 0);
        setTotalPages(data.data?.last_page || 1);
      } else {
        const errorData = await response.json();
        toast.error('Error al cargar usuarios', {
          description: errorData.message || 'No se pudieron cargar los usuarios',
        });
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('Error al cargar usuarios', {
        description: error.message || 'No se pudieron cargar los usuarios',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleCreateUser = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${config.apiUrl}${config.endpoints.users.create}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          roles: formData.roles,
        }),
      });

      if (response.ok) {
        toast.success('Usuario creado exitosamente');
        setShowCreateDialog(false);
        resetForm();
        fetchUsers();
      } else {
        const errorData = await response.json();
        toast.error('Error al crear usuario', {
          description: errorData.message || 'No se pudo crear el usuario',
        });
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error('Error al crear usuario', {
        description: error.message || 'No se pudo crear el usuario',
      });
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem('token');
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        fullname: formData.fullname,
        dni: formData.dni,
        phone: formData.phone,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      const url = config.endpoints.users.update.replace(':id', selectedUser.id.toString());
      const response = await fetch(`${config.apiUrl}${url}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        // Update roles separately if provided
        if (formData.roles.length > 0) {
          const rolesUrl = config.endpoints.users.assignRoles.replace(':id', selectedUser.id.toString());
          await fetch(`${config.apiUrl}${rolesUrl}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ roles: formData.roles }),
          });
        }

        toast.success('Usuario actualizado exitosamente');
        setShowEditDialog(false);
        resetForm();
        fetchUsers();
      } else {
        const errorData = await response.json();
        toast.error('Error al actualizar usuario', {
          description: errorData.message || 'No se pudo actualizar el usuario',
        });
      }
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error('Error al actualizar usuario', {
        description: error.message || 'No se pudo actualizar el usuario',
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem('token');
      const url = config.endpoints.users.delete.replace(':id', selectedUser.id.toString());

      const response = await fetch(`${config.apiUrl}${url}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('Usuario eliminado exitosamente');
        setShowDeleteDialog(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        const errorData = await response.json();
        toast.error('Error al eliminar usuario', {
          description: errorData.message || 'No se pudo eliminar el usuario',
        });
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error('Error al eliminar usuario', {
        description: error.message || 'No se pudo eliminar el usuario',
      });
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      fullname: user.fullname || '',
      dni: user.dni || '',
      phone: user.phone || '',
      roles: user.roles || [],
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      fullname: '',
      dni: '',
      phone: '',
      roles: [],
    });
    setSelectedUser(null);
  };

  return (
    <TechnologyLayout title="Gestión de Usuarios">
      <div className="flex flex-1 flex-col items-center">
        <div className="flex flex-1 flex-col gap-8 p-6 md:p-10 max-w-[1600px] w-full">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Usuarios</h2>
              <p className="text-muted-foreground">
                Gestiona los usuarios del sistema
              </p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <IconPlus className="mr-2 h-4 w-4" />
              Nuevo Usuario
            </Button>
          </div>

          {/* Search and Filters */}
          <Card className="shadow-sm border-muted">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre o email..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Users Table */}
          <Card className="shadow-sm border-muted">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Listado de Usuarios</CardTitle>
              <CardDescription className="text-sm mt-1.5">
                Total: {total} usuarios
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <p className="text-muted-foreground">Cargando usuarios...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <IconUser className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No se encontraron usuarios</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>DNI</TableHead>
                        <TableHead>Roles</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.id}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              {user.fullname && (
                                <p className="text-xs text-muted-foreground">{user.fullname}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.dni || '—'}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {user.roles && user.roles.length > 0 ? (
                                user.roles.map((role, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                                  >
                                    {typeof role === 'string' ? role : role.name}
                                  </span>
                                ))
                              ) : (
                                <span className="text-muted-foreground text-xs">Sin roles</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(user)}
                                title="Editar"
                              >
                                <IconEdit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openDeleteDialog(user)}
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t p-4">
                  <div className="text-sm text-muted-foreground">
                    Página {page} de {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create User Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Completa los datos del nuevo usuario
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre del usuario"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email *</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@ejemplo.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Contraseña *</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Mínimo 8 caracteres"
              />
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
            <Button
              onClick={handleCreateUser}
              disabled={!formData.name || !formData.email || !formData.password}
            >
              Crear Usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica los datos del usuario
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre Completo</label>
                <Input
                  value={formData.fullname}
                  onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email *</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">DNI</label>
                <Input
                  value={formData.dni}
                  onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Teléfono</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nueva Contraseña (opcional)</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Dejar vacío para no cambiar"
              />
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
            <Button onClick={handleUpdateUser}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar al usuario{' '}
              <span className="font-semibold">{selectedUser?.name}</span>? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setSelectedUser(null);
              }}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TechnologyLayout>
  );
}
