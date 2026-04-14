'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, RotateCcw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PersonasTable } from './PersonasTable';
import { DeletePersonaModal } from './DeletePersonaModal';
import { CreatePersonaModal } from './CreatePersonaModal';
import {
  usePersonasQuery,
  usePersonasActivasQuery,
  usePersonasHistoricoQuery,
  useCursos,
  usePersonas,
} from '../../hooks';
import { Persona } from '@/types';

interface PersonasTabProps {
  isActive: boolean;
  clientColor?: string | null;
}

export function PersonasTab({ isActive, clientColor }: PersonasTabProps) {
  const [activeTab, setActiveTab] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when tab changes
  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  // Queries based on active tab
  const todasQuery = usePersonasQuery(debouncedSearch, page, limit);
  const activasQuery = usePersonasActivasQuery(debouncedSearch, page, limit);
  const historicoQuery = usePersonasHistoricoQuery(debouncedSearch, page, limit);

  const currentQuery =
    activeTab === 'activas'
      ? activasQuery
      : activeTab === 'historico'
        ? historicoQuery
        : todasQuery;

  const { data, isLoading } = currentQuery;
  const personas = data?.data || [];
  const meta = data?.meta;

  const { cursos, isLoadingCursos } = useCursos();
  const { createPersonaMutation, deletePersonaMutation } = usePersonas(isActive);

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

  const handleReset = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (meta?.totalPages || 1)) {
      setPage(newPage);
    }
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

      {/* Search Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre, apellido o DNI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleReset}
          className="text-gray-600 hover:text-gray-800"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Limpiar
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="activas">Activas</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="todas" className="mt-6">
          <PersonasTable
            personas={personas}
            isLoading={isLoading}
            meta={meta}
            onPageChange={handlePageChange}
            onDeleteClick={handleDeleteClick}
            clientColor={clientColor}
          />
        </TabsContent>

        <TabsContent value="activas" className="mt-6">
          <PersonasTable
            personas={personas}
            isLoading={isLoading}
            meta={meta}
            onPageChange={handlePageChange}
            onDeleteClick={handleDeleteClick}
            clientColor={clientColor}
          />
        </TabsContent>

        <TabsContent value="historico" className="mt-6">
          <PersonasTable
            personas={personas}
            isLoading={isLoading}
            meta={meta}
            onPageChange={handlePageChange}
            onDeleteClick={handleDeleteClick}
            clientColor={clientColor}
            isHistorico
          />
        </TabsContent>
      </Tabs>

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
        deleteMutation={deletePersonaMutation}
        persona={personaToDelete}
      />
    </div>
  );
}
