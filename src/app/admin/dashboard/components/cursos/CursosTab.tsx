'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CursosTable } from './CursosTable';
import { CreateCursoModal } from './cursos-modals/CreateCursoModal';
import { EditCursoModal } from './cursos-modals/EditCursoModal';
import { ViewQRModal } from './cursos-modals/ViewQRModal';
import { DeleteCursoModal } from './cursos-modals/DeleteCursoModal';
import { useCursos, useUbicacionesFavoritas } from '../../hooks';
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

  const {
    cursos,
    isLoadingCursos,
    createCursoMutation,
    updateCursoMutation,
    deleteCursoMutation,
    regenerateQRMutation,
  } = useCursos();

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

      <CursosTable
        cursos={cursos}
        isLoading={isLoadingCursos}
        user={user}
        onViewQR={handleViewQR}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

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
