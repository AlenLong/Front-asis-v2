'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { CreateCursoModal } from './cursos-modals/CreateCursoModal';
import { EditCursoModal } from './cursos-modals/EditCursoModal';
import { ViewQRModal } from './cursos-modals/ViewQRModal';
import { DeleteCursoModal } from './cursos-modals/DeleteCursoModal';
import { CursosActivosTable } from './CursosActivosTable';
import { CursosHistoricosTable } from './CursosHistoricosTable';
import { useCursos, useUbicacionesFavoritas, useCursosActivosQuery, useCursosHistoricosQuery } from '../../hooks';
import { Curso } from '@/types';
import { Usuario } from '@/types';

interface CursosTabProps {
  user: Usuario | null;
}

export function CursosTab({ user }: CursosTabProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewQRModalOpen, setIsViewQRModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCurso, setSelectedCurso] = useState<Curso | null>(null);
  const [activosPage, setActivosPage] = useState(1);
  const [historicoPage, setHistoricoPage] = useState(1);

  const {
    createCursoMutation,
    updateCursoMutation,
    deleteCursoMutation,
    cerrarCursoMutation,
    reabrirCursoMutation,
    regenerateQRMutation,
  } = useCursos();

  const { data: cursosActivos, isLoading: loadingActivos } = useCursosActivosQuery(activosPage);
  const { data: cursosHistoricos, isLoading: loadingHistoricos } = useCursosHistoricosQuery(historicoPage);

  const { ubicaciones, isLoadingUbicaciones } = useUbicacionesFavoritas();

  const handleViewQR = (curso: Curso) => {
    setSelectedCurso(curso);
    setIsViewQRModalOpen(true);
  };

  const handleEdit = (curso: Curso) => {
    setSelectedCurso(curso);
    setIsEditModalOpen(true);
  };

  const handleDelete = (curso: Curso) => {
    setSelectedCurso(curso);
    setIsDeleteModalOpen(true);
  };

  const handleCerrar = (id: number) => {
    cerrarCursoMutation.mutate(id);
  };

  const handleReabrir = (id: number) => {
    reabrirCursoMutation.mutate(id);
  };

  const handleActivosPageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (cursosActivos?.meta?.totalPages || 1)) {
      setActivosPage(newPage);
    }
  };

  const handleHistoricosPageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (cursosHistoricos?.meta?.totalPages || 1)) {
      setHistoricoPage(newPage);
    }
  };

  return (
    <div className="space-y-4">
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

      <Tabs defaultValue="activos" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="activos">Cursos Activos</TabsTrigger>
          <TabsTrigger value="historicos">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="activos" className="mt-6">
          {loadingActivos ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <CursosActivosTable
              cursos={cursosActivos?.data || []}
              isLoading={loadingActivos}
              user={user}
              onViewQR={handleViewQR}
              onEdit={handleEdit}
              onCerrar={handleCerrar}
              isClosing={cerrarCursoMutation.isPending}
              meta={cursosActivos?.meta}
              onPageChange={handleActivosPageChange}
            />
          )}
        </TabsContent>

        <TabsContent value="historicos" className="mt-6">
          {loadingHistoricos ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <CursosHistoricosTable
              cursos={cursosHistoricos?.data || []}
              isLoading={loadingHistoricos}
              user={user}
              onReabrir={handleReabrir}
              isReopening={reabrirCursoMutation.isPending}
              meta={cursosHistoricos?.meta}
              onPageChange={handleHistoricosPageChange}
            />
          )}
        </TabsContent>
      </Tabs>

      <CreateCursoModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        createMutation={createCursoMutation}
        ubicaciones={ubicaciones}
        isLoadingUbicaciones={isLoadingUbicaciones}
      />

      <EditCursoModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        curso={selectedCurso}
        updateMutation={updateCursoMutation}
        regenerateMutation={regenerateQRMutation}
        ubicaciones={ubicaciones}
        isLoadingUbicaciones={isLoadingUbicaciones}
      />

      <ViewQRModal
        isOpen={isViewQRModalOpen}
        onClose={() => setIsViewQRModalOpen(false)}
        curso={selectedCurso}
      />

      <DeleteCursoModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        curso={selectedCurso}
        deleteMutation={deleteCursoMutation}
      />
    </div>
  );
}
