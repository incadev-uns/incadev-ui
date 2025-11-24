import { useState, useEffect } from 'react';
import TechnologyLayout from '@/process/technology/TechnologyLayout';
import { config } from '@/config/technology-config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
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
  IconUser,
  IconMail,
  IconPhone,
  IconId,
  IconEye,
  IconLock,
  IconLockOpen,
  IconMailCheck,
  IconMailX,
  IconCalendar,
  IconX,
} from '@tabler/icons-react';
import { toast } from 'sonner';

interface Role {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
  pivot?: {
    model_type: string;
    model_id: number;
    role_id: number;
  };
}

interface User {
  id: number;
  name: string;
  email: string;
  fullname?: string;
  dni?: string;
  phone?: string;
  avatar?: string | null;
  recovery_email?: string | null;
  two_factor_enabled?: boolean;
  email_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
  roles?: Role[];
  permissions?: any[];
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
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
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showRolesDialog, setShowRolesDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [assigningRoles, setAssigningRoles] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    fullname: '',
    dni: '',
    phone: '',
  });

  // Selected roles for assignment
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [page, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = `${config.apiUrl}${config.endpoints.users.list}?per_page=${perPage}&page=${page}${search ? `&search=${encodeURIComponent(search)}` : ''}`;

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
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
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiUrl}${config.endpoints.roles.list}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAllRoles(data.data?.data || data.data || []);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
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
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
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
      toast.error('Error al crear usuario');
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
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
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
      toast.error('Error al actualizar usuario');
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
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
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
      toast.error('Error al eliminar usuario');
    }
  };

  const handleAssignRoles = async () => {
    if (!selectedUser) return;

    setAssigningRoles(true);
    try {
      const token = localStorage.getItem('token');
      const url = config.endpoints.users.assignRoles.replace(':id', selectedUser.id.toString());

      const response = await fetch(`${config.apiUrl}${url}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roles: selectedRoles }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Roles asignados exitosamente');
        setShowRolesDialog(false);
        setSelectedRoles([]);
        fetchUsers();

        // Update selected user if details dialog is open
        if (result.data) {
          setSelectedUser(result.data);
        }
      } else {
        const errorData = await response.json();
        toast.error('Error al asignar roles', {
          description: errorData.message || 'No se pudieron asignar los roles',
        });
      }
    } catch (error: any) {
      console.error('Error assigning roles:', error);
      toast.error('Error al asignar roles');
    } finally {
      setAssigningRoles(false);
    }
  };

  const openDetailsDialog = (user: User) => {
    setSelectedUser(user);
    setShowDetailsDialog(true);
  };

  const openRolesDialog = (user: User) => {
    setSelectedUser(user);
    setSelectedRoles(user.roles?.map(r => r.name) || []);
    setShowRolesDialog(true);
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
    });
    setSelectedUser(null);
  };

  const toggleRole = (roleName: string) => {
    setSelectedRoles(prev =>
      prev.includes(roleName)
        ? prev.filter(r => r !== roleName)
        : [...prev, roleName]
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleBadgeColor = (roleName: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      teacher: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      student: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      support: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      security: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    };
    return colors[roleName] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  };

  return (
    <TechnologyLayout title="Gestión de Usuarios">
      <div className="flex flex-1 flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Usuarios</h2>
            <p className="text-muted-foreground text-sm">
              Gestiona los usuarios del sistema
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <IconPlus className="mr-2 h-4 w-4" />
            Nuevo Usuario
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-4">
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email o DNI..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Listado de Usuarios</CardTitle>
            <CardDescription>
              Total: {total} usuarios registrados
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
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
                      <TableHead className="w-12">ID</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>DNI</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-mono text-xs">{user.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              {user.avatar ? (
                                <AvatarImage src={`${config.apiUrl.replace('/api', '')}/storage/${user.avatar}`} />
                              ) : null}
                              <AvatarFallback className="text-xs">
                                {user.name?.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{user.name}</p>
                              {user.fullname && (
                                <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                                  {user.fullname}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{user.email}</TableCell>
                        <TableCell className="text-sm">{user.dni || '—'}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {user.roles && user.roles.length > 0 ? (
                              user.roles.slice(0, 2).map((role) => (
                                <span
                                  key={role.id}
                                  className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${getRoleBadgeColor(role.name)}`}
                                >
                                  {role.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-xs">Sin roles</span>
                            )}
                            {user.roles && user.roles.length > 2 && (
                              <span className="text-[10px] text-muted-foreground">
                                +{user.roles.length - 2}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {user.two_factor_enabled ? (
                              <IconLock className="h-4 w-4 text-green-500" title="2FA Activo" />
                            ) : (
                              <IconLockOpen className="h-4 w-4 text-muted-foreground" title="Sin 2FA" />
                            )}
                            {user.email_verified_at ? (
                              <IconMailCheck className="h-4 w-4 text-green-500" title="Email verificado" />
                            ) : (
                              <IconMailX className="h-4 w-4 text-yellow-500" title="Email sin verificar" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openDetailsDialog(user)}
                              title="Ver detalles"
                            >
                              <IconEye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openRolesDialog(user)}
                              title="Asignar roles"
                            >
                              <IconShield className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEditDialog(user)}
                              title="Editar"
                            >
                              <IconEdit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => openDeleteDialog(user)}
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

      {/* User Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                {selectedUser?.avatar ? (
                  <AvatarImage src={`${config.apiUrl.replace('/api', '')}/storage/${selectedUser.avatar}`} />
                ) : null}
                <AvatarFallback>
                  {selectedUser?.name?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <span>{selectedUser?.name}</span>
                <p className="text-sm font-normal text-muted-foreground">{selectedUser?.fullname}</p>
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4 py-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <IconMail className="h-4 w-4" />
                    <span>Email</span>
                  </div>
                  <p className="text-sm font-medium">{selectedUser.email}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <IconId className="h-4 w-4" />
                    <span>DNI</span>
                  </div>
                  <p className="text-sm font-medium">{selectedUser.dni || '—'}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <IconPhone className="h-4 w-4" />
                    <span>Teléfono</span>
                  </div>
                  <p className="text-sm font-medium">{selectedUser.phone || '—'}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <IconCalendar className="h-4 w-4" />
                    <span>Registrado</span>
                  </div>
                  <p className="text-sm font-medium">{formatDate(selectedUser.created_at)}</p>
                </div>
              </div>

              {/* Status */}
              <div className="flex gap-3 pt-2">
                <Badge variant={selectedUser.two_factor_enabled ? "default" : "secondary"}>
                  {selectedUser.two_factor_enabled ? (
                    <><IconLock className="h-3 w-3 mr-1" /> 2FA Activo</>
                  ) : (
                    <><IconLockOpen className="h-3 w-3 mr-1" /> Sin 2FA</>
                  )}
                </Badge>
                <Badge variant={selectedUser.email_verified_at ? "default" : "outline"}>
                  {selectedUser.email_verified_at ? (
                    <><IconMailCheck className="h-3 w-3 mr-1" /> Email verificado</>
                  ) : (
                    <><IconMailX className="h-3 w-3 mr-1" /> Email sin verificar</>
                  )}
                </Badge>
              </div>

              {/* Recovery Email */}
              {selectedUser.recovery_email && (
                <div className="space-y-1 pt-2">
                  <p className="text-sm text-muted-foreground">Email de recuperación</p>
                  <p className="text-sm font-medium">{selectedUser.recovery_email}</p>
                </div>
              )}

              {/* Roles */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Roles asignados</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowDetailsDialog(false);
                      openRolesDialog(selectedUser);
                    }}
                  >
                    <IconShield className="h-3 w-3 mr-1" />
                    Gestionar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.roles && selectedUser.roles.length > 0 ? (
                    selectedUser.roles.map((role) => (
                      <span
                        key={role.id}
                        className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium ${getRoleBadgeColor(role.name)}`}
                      >
                        {role.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">Sin roles asignados</span>
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
              if (selectedUser) openEditDialog(selectedUser);
            }}>
              <IconEdit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Roles Dialog */}
      <Dialog open={showRolesDialog} onOpenChange={setShowRolesDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Asignar Roles</DialogTitle>
            <DialogDescription>
              Selecciona los roles para <span className="font-semibold">{selectedUser?.name}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {allRoles.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay roles disponibles
                </p>
              ) : (
                allRoles.map((role) => (
                  <div
                    key={role.id}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedRoles.includes(role.name)
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => toggleRole(role.name)}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedRoles.includes(role.name)}
                        onCheckedChange={() => toggleRole(role.name)}
                      />
                      <div>
                        <p className="font-medium text-sm">{role.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Guard: {role.guard_name}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(role.name)}`}
                    >
                      {role.name}
                    </span>
                  </div>
                ))
              )}
            </div>

            {selectedRoles.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">
                  Roles seleccionados ({selectedRoles.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedRoles.map((role) => (
                    <Badge
                      key={role}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => toggleRole(role)}
                    >
                      {role}
                      <IconX className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRolesDialog(false);
                setSelectedRoles([]);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleAssignRoles} disabled={assigningRoles}>
              {assigningRoles ? 'Guardando...' : 'Guardar Roles'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[500px]">
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
        <DialogContent className="sm:max-w-[550px]">
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
