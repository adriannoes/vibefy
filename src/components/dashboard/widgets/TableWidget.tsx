import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import type { DashboardWidget } from '@/types/dashboard';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TableWidgetProps {
  widget: DashboardWidget;
  data: any;
}

export const TableWidget: React.FC<TableWidgetProps> = ({ widget, data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const config = widget.config;
  const pageSize = config.pageSize || 10;

  const filteredAndSortedData = useMemo(() => {
    if (!data?.data) return [];

    let filtered = data.data;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((row: any) =>
        Object.values(row).some((value: any) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply sorting
    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];

        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, sortColumn, sortDirection]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedData.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const formatCellValue = (value: any, column: string) => {
    if (value === null || value === undefined) return '-';

    // Format dates
    if (column.includes('date') || column.includes('created_at') || column.includes('updated_at')) {
      try {
        return format(new Date(value), 'dd/MM/yyyy', { locale: ptBR });
      } catch {
        return String(value);
      }
    }

    // Format status/priority as badges
    if (column === 'status' || column === 'priority') {
      return (
        <Badge variant={
          value === 'completed' || value === 'high' ? 'default' :
          value === 'in_progress' || value === 'medium' ? 'secondary' :
          'outline'
        }>
          {String(value).replace('_', ' ')}
        </Badge>
      );
    }

    // Format sentiment
    if (column === 'sentiment') {
      return (
        <Badge variant={
          value === 'very_positive' || value === 'positive' ? 'default' :
          value === 'negative' || value === 'very_negative' ? 'destructive' :
          'secondary'
        }>
          {String(value).replace('_', ' ')}
        </Badge>
      );
    }

    // Format arrays (tags)
    if (Array.isArray(value)) {
      return (
        <div className="flex flex-wrap gap-1">
          {value.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {value.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{value.length - 3}
            </Badge>
          )}
        </div>
      );
    }

    return String(value);
  };

  if (!data?.columns || !data?.data) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-muted-foreground">Dados não disponíveis</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        {/* Search */}
        {config.searchable !== false && (
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        )}

        {/* Table */}
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                {data.columns.map((column: string) => (
                  <TableHead
                    key={column}
                    className={config.sortable !== false ? 'cursor-pointer hover:bg-muted/50' : ''}
                    onClick={() => config.sortable !== false && handleSort(column)}
                  >
                    <div className="flex items-center gap-1">
                      {column.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      {sortColumn === column && (
                        <span className="text-xs">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((row: any, index: number) => (
                <TableRow key={index}>
                  {data.columns.map((column: string) => (
                    <TableCell key={column} className="max-w-48">
                      <div className="truncate">
                        {formatCellValue(row[column], column)}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {config.pagination !== false && totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Mostrando {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, filteredAndSortedData.length)} de {filteredAndSortedData.length} itens
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <span className="text-sm">
                {currentPage} de {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
