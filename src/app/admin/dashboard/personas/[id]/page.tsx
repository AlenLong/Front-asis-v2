'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePersonaDetail } from '../../hooks/usePersonas';
import { PersonaInfo } from './components/PersonaInfo';
import { InscripcionesSection } from './components/InscripcionesSection';
import { DeletePersonaModal } from '../../components/personas/DeletePersonaModal';
import { useState } from 'react';

interface PersonaDetailPageProps {
  params: { id: string };
}

export default function PersonaDetailPage({ params }: PersonaDetailPageProps) {
  const router = useRouter();
  const personaId = isNaN(parseInt(params.id)) ? null : parseInt(params.id);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const {
    persona,
    inscripciones,
    isLoadingPersona,
    isLoadingInscripciones,
    inscribirMutation,
    desinscribirMutation,
    updatePersonaMutation,
    deletePersonaMutation,
  } = usePersonaDetail(personaId);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
    }
  }, [router]);

  const handleBack = () => {
    router.push('/admin/dashboard?tab=personas');
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const handleDeleteSuccess = () => {
    router.push('/admin/dashboard?tab=personas');
  };

  if (!personaId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">ID de persona inválido</p>
          <Button onClick={handleBack}>Volver al listado</Button>
        </div>
      </div>
    );
  }

  if (isLoadingPersona) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!persona) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Persona no encontrada</p>
          <Button onClick={handleBack}>Volver al listado</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <h1 className="text-xl font-semibold">
                {persona.nombre} {persona.apellido}
              </h1>
            </div>
            <Button variant="destructive" onClick={handleDeleteClick}>
              Eliminar Persona
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <PersonaInfo
              persona={persona}
              updateMutation={updatePersonaMutation}
            />
          </div>

          <div className="lg:col-span-2">
            <InscripcionesSection
              inscripciones={inscripciones}
              isLoading={isLoadingInscripciones}
              personaId={personaId}
              inscribirMutation={inscribirMutation}
              desinscribirMutation={desinscribirMutation}
            />
          </div>
        </div>
      </main>

      <DeletePersonaModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        persona={persona}
        deleteMutation={deletePersonaMutation}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
