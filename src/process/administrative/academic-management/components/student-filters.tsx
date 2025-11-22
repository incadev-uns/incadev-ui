import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  IconSearch,
  IconFilter,
  IconX,
  IconChevronDown
} from '@tabler/icons-react';

interface StudentFilters {
  search: string;
  date_from: string;
  date_to: string;
  status: string;
}

interface StudentFiltersProps {
  filters: StudentFilters;
  onFiltersChange: (filters: StudentFilters) => void;
  onClearFilters: () => void;
}

export default function StudentFilters({
  filters,
  onFiltersChange,
  onClearFilters
}: StudentFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const hasActiveFilters = filters.date_from || filters.date_to || filters.status !== 'all';
  const activeFiltersCount = [filters.date_from, filters.date_to, filters.status !== 'all'].filter(Boolean).length;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-3">
            {/* Search Input */}
            <div className="flex-1 min-w-[280px]">
              <div className="relative">
                <IconSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre, DNI o email..."
                  value={filters.search}
                  onChange={(e) => onFiltersChange({...filters, search: e.target.value})}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Advanced Filters Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="gap-2"
            >
              <IconFilter className="h-4 w-4" />
              Filtros Avanzados
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                  {activeFiltersCount}
                </Badge>
              )}
              <IconChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          {/* Advanced Filters Panel */}
          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-1.5">
                  Fecha desde
                </label>
                <Input
                  type="date"
                  value={filters.date_from}
                  onChange={(e) => onFiltersChange({...filters, date_from: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-1.5">
                  Fecha hasta
                </label>
                <Input
                  type="date"
                  value={filters.date_to}
                  onChange={(e) => onFiltersChange({...filters, date_to: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-1.5">
                  Estado académico
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {filters.status === 'all' && 'Todos los estados'}
                      {filters.status === 'active' && 'Activos'}
                      {filters.status === 'inactive' && 'Inactivos'}
                      <IconChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuLabel>Estado académico</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                      checked={filters.status === 'all'}
                      onCheckedChange={() => onFiltersChange({...filters, status: 'all'})}
                    >
                      Todos
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={filters.status === 'active'}
                      onCheckedChange={() => onFiltersChange({...filters, status: 'active'})}
                    >
                      Activos
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={filters.status === 'inactive'}
                      onCheckedChange={() => onFiltersChange({...filters, status: 'inactive'})}
                    >
                      Inactivos
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {hasActiveFilters && (
                <div className="md:col-span-3 flex justify-end">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={onClearFilters}
                    className="gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  >
                    <IconX className="h-4 w-4" />
                    Limpiar Filtros
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}