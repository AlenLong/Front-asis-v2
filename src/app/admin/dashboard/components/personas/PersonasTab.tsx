'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PersonasTable } from './PersonasTable';
import { DeletePersonaModal } from './DeletePersonaModal';
import { CreatePersonaModal } from './CreatePersonaModal';
import { usePersonas, useCursos } from '../../hooks';
import { Persona } from '@/types';

interface PersonasTabProps {
  isActive: boolean;
  clientColor?: string | null;
}

export function PersonasTab({ isActive, clientColor }: PersonasTabProps) {
  const { personas, isLoadingPersonas, createPersonaMutation, updatePersonaMutation, deletePersonaMutation } =
    usePersonas(isActive);
  const { cursos, isLoadingCursos } = useCursos();

  const [personaToDelete, setPersonaToDelete] = useState<Persona | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleDeleteClick = (persona: Persona) => {
    setPersonaToDelete(persona);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setPersonaToDelete(null);
  };

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Gestión de Personas</h2>
        <Button
          onClick={handleOpenCreateModal}
          style={{
            backgroundColor: clientColor || undefined,
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Persona
        </Button>
      </div>

      <PersonasTable
        personas={personas}
        isLoading={isLoadingPersonas}
        updateMutation={updatePersonaMutation}
        deleteMutation={deletePersonaMutation}
        onDeleteClick={handleDeleteClick}
        clientColor={clientColor}
      />

      <CreatePersonaModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        createMutation={createPersonaMutation}
        cursos={cursos}
        isLoadingCursos={isLoadingCursos}
      />

      <DeletePersonaModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        persona={personaToDelete}
        deleteMutation={deletePersonaMutation}
      />
    </div>
  );
}
