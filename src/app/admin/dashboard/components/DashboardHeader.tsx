'use client';

import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { Usuario } from '@/types';

interface DashboardHeaderProps {
  user: Usuario | null;
  onLogout: () => void;
}

export function DashboardHeader({ user, onLogout }: DashboardHeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {user?.cliente?.logoUrl && (
              <img
                src={user.cliente.logoUrl}
                alt="Logo"
                className="h-12 object-contain"
              />
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {user?.cliente?.nombre || 'Panel de Administración'}
              </h1>
              <p className="text-sm text-gray-500">Gestión de Asistencias y Cursos</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={onLogout}
            className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </header>
  );
}
