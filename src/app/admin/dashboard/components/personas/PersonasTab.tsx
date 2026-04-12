'use client';

import { PersonasTable } from './PersonasTable';
import { usePersonas } from '../../hooks/usePersonas';

interface PersonasTabProps {
  isActive: boolean;
  clientColor?: string | null;
}

export function PersonasTab({ isActive, clientColor }: PersonasTabProps) {
  const { personas, isLoadingPersonas, updatePersonaMutation } = usePersonas(isActive);

  return (
    <div className="space-y-4">
      <PersonasTable
        personas={personas}
        isLoading={isLoadingPersonas}
        updateMutation={updatePersonaMutation}
        clientColor={clientColor}
      />
    </div>
  );
}
