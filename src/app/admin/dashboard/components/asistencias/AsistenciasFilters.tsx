'use client';

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
import { RotateCcw, Download } from 'lucide-react';
import { Curso } from '@/types';

interface AsistenciasFiltersProps {
  cursos: Curso[];
  filterCurso: string;
  setFilterCurso: (value: string) => void;
  filterDNI: string;
  setFilterDNI: (value: string) => void;
  filterFecha: string;
  setFilterFecha: (value: string) => void;
  onExport: () => void;
  onReset: () => void;
}

export function AsistenciasFilters({
  cursos,
  filterCurso,
  setFilterCurso,
  filterDNI,
  setFilterDNI,
  filterFecha,
  setFilterFecha,
  onExport,
  onReset,
}: AsistenciasFiltersProps) {
  return (
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
          onClick={onReset}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Limpiar
        </Button>

        <Button
          onClick={onExport}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar Excel
        </Button>
      </div>
    </div>
  );
}
