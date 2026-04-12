'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Curso, Asistencia } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Loader2,
  Plus,
  QrCode,
  Pencil,
  Trash2,
  Download,
  LogOut,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('asistencias');

  // Filtros asistencias
  const [filterCurso, setFilterCurso] = useState<string>('');
  const [filterDNI, setFilterDNI] = useState<string>('');
  const [filterFecha, setFilterFecha] = useState<string>('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    setPage(1);
  }, [filterCurso, filterDNI, filterFecha, pageSize]);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewQRModalOpen, setIsViewQRModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCurso, setSelectedCurso] = useState<Curso | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    nombre: '',
    lat: '',
    lng: '',
    radio: '100',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
    }
  }, [router]);

  // Queries
  const { data: cursos = [], isLoading: isLoadingCursos } = useQuery({
    queryKey: ['cursos'],
    queryFn: async () => {
      const response = await api.get('/cursos');
      return response.data;
    },
  });

  const { data: asistenciasData, isLoading: isLoadingAsistencias } = useQuery({
    queryKey: ['asistencias', filterCurso, filterDNI, filterFecha, page, pageSize],
    queryFn: async () => {
      let url = `/asistencia/admin?page=${page}&limit=${pageSize}`;
      if (filterCurso) url += `&cursoId=${filterCurso}`;
      if (filterDNI) url += `&dni=${filterDNI}`;
      if (filterFecha) url += `&fecha=${filterFecha}`;
      const response = await api.get(url);
      return response.data;
    },
    enabled: !!filterCurso, // Solo cargar cuando hay un curso seleccionado
  });
  
  const asistencias = asistenciasData?.data || [];
  const totalAsistencias = asistenciasData?.meta?.total || 0;
  const totalPages = asistenciasData?.meta?.totalPages || 1;

  // Mutations
  const createCursoMutation = useMutation({
    mutationFn: async (data: { nombre: string; lat?: number; lng?: number; radio: number }) => {
      const response = await api.post('/cursos', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Curso creado correctamente');
      queryClient.invalidateQueries({ queryKey: ['cursos'] });
      setIsCreateModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear curso');
    },
  });

  const updateCursoMutation = useMutation({
    mutationFn: async (data: { id: number; nombre: string; lat?: number; lng?: number; radio: number }) => {
      const response = await api.put(`/cursos/${data.id}`, {
        nombre: data.nombre,
        lat: data.lat,
        lng: data.lng,
        radio: data.radio,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Curso actualizado correctamente');
      queryClient.invalidateQueries({ queryKey: ['cursos'] });
      setIsEditModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar curso');
    },
  });

  const deleteCursoMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/cursos/${id}`);
    },
    onSuccess: () => {
      toast.success('Curso eliminado correctamente');
      queryClient.invalidateQueries({ queryKey: ['cursos'] });
      setIsDeleteModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar curso');
    },
  });

  const regenerateQRMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post(`/cursos/${id}/qr`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('QR regenerado correctamente');
      queryClient.invalidateQueries({ queryKey: ['cursos'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al regenerar QR');
    },
  });

  const resetForm = () => {
    setFormData({ nombre: '', lat: '', lng: '', radio: '100' });
    setSelectedCurso(null);
  };

  const openEditModal = (curso: Curso) => {
    setSelectedCurso(curso);
    setFormData({
      nombre: curso.nombre,
      lat: curso.lat?.toString() || '',
      lng: curso.lng?.toString() || '',
      radio: curso.radio.toString(),
    });
    setIsEditModalOpen(true);
  };

  const openViewQRModal = (curso: Curso) => {
    setSelectedCurso(curso);
    setIsViewQRModalOpen(true);
  };

  const openDeleteModal = (curso: Curso) => {
    setSelectedCurso(curso);
    setIsDeleteModalOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCursoMutation.mutate({
      nombre: formData.nombre,
      lat: formData.lat ? parseFloat(formData.lat) : undefined,
      lng: formData.lng ? parseFloat(formData.lng) : undefined,
      radio: parseInt(formData.radio) || 100,
    });
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCurso) return;
    updateCursoMutation.mutate({
      id: selectedCurso.id,
      nombre: formData.nombre,
      lat: formData.lat ? parseFloat(formData.lat) : undefined,
      lng: formData.lng ? parseFloat(formData.lng) : undefined,
      radio: parseInt(formData.radio) || 100,
    });
  };

  // totalPages viene del backend en meta.totalPages

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (filterCurso) params.append('cursoId', filterCurso);
      if (filterFecha) params.append('fecha', filterFecha);
      const url = `/asistencia/export/excel?${params.toString()}`;
      
      const response = await api.get(url, {
        responseType: 'blob',
      });
      
      // Create download link
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `asistencias_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      toast.success('Excel descargado correctamente');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al exportar Excel');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {user.cliente?.logoUrl && (
                <img
                  src={user.cliente.logoUrl}
                  alt="Logo"
                  className="h-12 object-contain"
                />
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {user.cliente?.nombre || 'Panel de Administración'}
                </h1>
                <p className="text-sm text-gray-500">Gestión de Asistencias y Cursos</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={logout}
              className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="asistencias">Asistencias</TabsTrigger>
            <TabsTrigger value="cursos">Cursos</TabsTrigger>
          </TabsList>

          {/* Tab Asistencias */}
          <TabsContent value="asistencias" className="space-y-4">
            {/* Filtros */}
            <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                  <Label>Curso</Label>
                  <Select value={filterCurso} onValueChange={setFilterCurso}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los cursos" />
                    </SelectTrigger>
                    <SelectContent>
                      {cursos.map((curso: Curso) => (
                        <SelectItem key={curso.id} value={curso.id.toString()}>
                          {curso.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <Label>Fecha</Label>
                  <Input
                    type="date"
                    value={filterFecha}
                    onChange={(e) => setFilterFecha(e.target.value)}
                  />
                </div>

                <div className="flex-1 min-w-[200px]">
                  <Label>DNI</Label>
                  <Input
                    placeholder="Buscar DNI..."
                    value={filterDNI}
                    onChange={(e) => setFilterDNI(e.target.value)}
                  />
                </div>

                <Button
                  variant="outline"
                  className="text-gray-600 hover:text-gray-800"
                  onClick={() => {
                    setFilterCurso('');
                    setFilterDNI('');
                    setFilterFecha('');
                    setPage(1);
                  }}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Limpiar
                </Button>

                <Button
                  onClick={handleExport}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Excel
                </Button>
              </div>
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Apellido</TableHead>
                    <TableHead>DNI</TableHead>
                    <TableHead>Curso</TableHead>
                    <TableHead>Fecha y Hora</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingAsistencias ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : !filterCurso ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-lg">Seleccione un curso para ver las asistencias</span>
                          <span className="text-sm text-gray-400">Use el filtro de arriba para elegir un curso</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : asistencias.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        No hay asistencias registradas para este curso
                      </TableCell>
                    </TableRow>
                  ) : (
                    asistencias.map((asistencia: any) => (
                      <TableRow key={asistencia.id}>
                        <TableCell>{asistencia.persona?.split(' ')[0] || asistencia.persona}</TableCell>
                        <TableCell>{asistencia.persona?.split(' ').slice(1).join(' ') || '-'}</TableCell>
                        <TableCell>{asistencia.dni}</TableCell>
                        <TableCell>{asistencia.curso}</TableCell>
                        <TableCell>{formatDateTime(asistencia.fecha)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Paginación */}
              {totalAsistencias > 0 && (
                <div className="flex items-center justify-between px-4 py-4 border-t">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Mostrar:</span>
                    <Select
                      value={pageSize.toString()}
                      onValueChange={(v) => {
                        setPageSize(parseInt(v));
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="w-[70px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAGE_SIZE_OPTIONS.map((size) => (
                          <SelectItem key={size} value={size.toString()}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-gray-500">
                      Total: {totalAsistencias}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-600">
                      Página {page} de {totalPages || 1}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Tab Cursos */}
          <TabsContent value="cursos" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Gestión de Cursos</h2>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                style={{
                  backgroundColor: user?.cliente?.color || undefined,
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Curso
              </Button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Latitud</TableHead>
                    <TableHead>Longitud</TableHead>
                    <TableHead>Radio (m)</TableHead>
                    <TableHead>QR</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingCursos ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : cursos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No hay cursos registrados
                      </TableCell>
                    </TableRow>
                  ) : (
                    cursos.map((curso: Curso) => (
                      <TableRow key={curso.id}>
                        <TableCell className="font-medium">{curso.nombre}</TableCell>
                        <TableCell>{curso.lat?.toFixed(6) || '-'}</TableCell>
                        <TableCell>{curso.lng?.toFixed(6) || '-'}</TableCell>
                        <TableCell>{curso.radio}</TableCell>
                        <TableCell>
                          {curso.qrPath ? (
                            <img
                              src={`${process.env.NEXT_PUBLIC_API_URL}/${curso.qrPath}`}
                              alt="QR"
                              className="h-10 w-10 object-contain cursor-pointer"
                              onClick={() => openViewQRModal(curso)}
                            />
                          ) : (
                            <Badge variant="secondary">Sin QR</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openViewQRModal(curso)}
                            >
                              <QrCode className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditModal(curso)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteModal(curso)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modal Crear Curso */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Curso</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre del Curso *</Label>
              <Input
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Latitud</Label>
                <Input
                  type="number"
                  step="any"
                  value={formData.lat}
                  onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                  placeholder="Opcional"
                />
              </div>
              <div className="space-y-2">
                <Label>Longitud</Label>
                <Input
                  type="number"
                  step="any"
                  value={formData.lng}
                  onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                  placeholder="Opcional"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Radio (metros) *</Label>
              <Input
                type="number"
                min="1"
                value={formData.radio}
                onChange={(e) => setFormData({ ...formData, radio: e.target.value })}
                required
              />
              <p className="text-xs text-gray-500">
                Radio permitido para marcar asistencia
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createCursoMutation.isPending}>
                {createCursoMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Editar Curso */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Curso</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre del Curso *</Label>
              <Input
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Latitud</Label>
                <Input
                  type="number"
                  step="any"
                  value={formData.lat}
                  onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Longitud</Label>
                <Input
                  type="number"
                  step="any"
                  value={formData.lng}
                  onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Radio (metros) *</Label>
              <Input
                type="number"
                min="1"
                value={formData.radio}
                onChange={(e) => setFormData({ ...formData, radio: e.target.value })}
                required
              />
            </div>
            {selectedCurso && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-yellow-800">Regenerar QR</h4>
                    <p className="text-sm text-yellow-600">
                      Genera un nuevo código QR para este curso
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => regenerateQRMutation.mutate(selectedCurso.id)}
                    disabled={regenerateQRMutation.isPending}
                  >
                    {regenerateQRMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Regenerar'
                    )}
                  </Button>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={updateCursoMutation.isPending}>
                {updateCursoMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Actualizar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Ver QR */}
      <Dialog open={isViewQRModalOpen} onOpenChange={setIsViewQRModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Código QR del Curso</DialogTitle>
          </DialogHeader>
          {selectedCurso && selectedCurso.qrPath && (
            <div className="space-y-4 text-center">
              <h3 className="font-semibold text-lg">{selectedCurso.nombre}</h3>
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}/${selectedCurso.qrPath}`}
                alt="QR"
                className="mx-auto max-w-full rounded-lg border"
              />
              <p className="text-sm text-gray-500">
                Este código QR permite a los usuarios tomar asistencia
              </p>
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL}/${selectedCurso.qrPath}`}
                download={`qr-${selectedCurso.nombre}.png`}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar QR
              </a>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Eliminar */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              ¿Estás seguro de que deseas eliminar el curso{' '}
              <strong>{selectedCurso?.nombre}</strong>?
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Atención:</strong> Al eliminar este curso, también se eliminarán
                todas las asistencias registradas para él. Esta acción no se puede deshacer.
              </p>
            </div>
            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedCurso && deleteCursoMutation.mutate(selectedCurso.id)}
                disabled={deleteCursoMutation.isPending}
              >
                {deleteCursoMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Eliminar
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
