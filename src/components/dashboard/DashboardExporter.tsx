import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, FileSpreadsheet, Image, Loader2 } from 'lucide-react';
import type { Dashboard, DashboardExportOptions } from '@/types/dashboard';
import type { CustomerFeedback } from '@/types/feedback';

interface DashboardExporterProps {
  isOpen: boolean;
  onClose: () => void;
  dashboard: Dashboard;
  feedback: CustomerFeedback[];
  onExport: (options: DashboardExportOptions) => Promise<void>;
}

export const DashboardExporter: React.FC<DashboardExporterProps> = ({
  isOpen,
  onClose,
  dashboard,
  feedback,
  onExport,
}) => {
  const [exportOptions, setExportOptions] = useState<DashboardExportOptions>({
    format: 'csv',
    includeFilters: true,
    includeMetadata: true,
    dateRange: dashboard.timeRange,
    widgets: dashboard.widgets.map(w => w.id),
    orientation: 'portrait',
    paperSize: 'a4',
  });

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport(exportOptions);
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportFormats = [
    {
      value: 'csv',
      label: 'CSV',
      icon: FileSpreadsheet,
      description: 'Dados estruturados para planilhas',
      color: 'text-green-600'
    },
    {
      value: 'xlsx',
      label: 'Excel',
      icon: FileSpreadsheet,
      description: 'Planilha Excel com formatação',
      color: 'text-green-700'
    },
    {
      value: 'pdf',
      label: 'PDF',
      icon: FileText,
      description: 'Relatório PDF com gráficos',
      color: 'text-red-600'
    },
    {
      value: 'png',
      label: 'PNG',
      icon: Image,
      description: 'Imagem do dashboard',
      color: 'text-blue-600'
    },
  ];

  const selectedFormat = exportFormats.find(f => f.value === exportOptions.format);
  const FormatIcon = selectedFormat?.icon || FileText;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportar Dashboard
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Formato de Exportação</Label>
            <div className="grid grid-cols-2 gap-3">
              {exportFormats.map(format => {
                const Icon = format.icon;
                const isSelected = exportOptions.format === format.value;

                return (
                  <Card
                    key={format.value}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setExportOptions(prev => ({ ...prev, format: format.value as any }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Icon className={`h-8 w-8 ${format.color} ${isSelected ? 'text-primary' : ''}`} />
                        <div>
                          <h3 className="font-medium">{format.label}</h3>
                          <p className="text-sm text-muted-foreground">{format.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* PDF Options */}
          {(exportOptions.format === 'pdf' || exportOptions.format === 'png') && (
            <div className="space-y-4">
              <Label className="text-base font-medium">Opções de Layout</Label>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="orientation">Orientação</Label>
                  <Select
                    value={exportOptions.orientation}
                    onValueChange={(value: 'portrait' | 'landscape') =>
                      setExportOptions(prev => ({ ...prev, orientation: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">Retrato</SelectItem>
                      <SelectItem value="landscape">Paisagem</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="paperSize">Tamanho do Papel</Label>
                  <Select
                    value={exportOptions.paperSize}
                    onValueChange={(value: 'a4' | 'letter' | 'a3') =>
                      setExportOptions(prev => ({ ...prev, paperSize: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a4">A4</SelectItem>
                      <SelectItem value="letter">Carta</SelectItem>
                      <SelectItem value="a3">A3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Widget Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Widgets a Incluir</Label>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
              {dashboard.widgets.map(widget => (
                <div key={widget.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={widget.id}
                    checked={exportOptions.widgets?.includes(widget.id) || false}
                    onCheckedChange={(checked) => {
                      setExportOptions(prev => ({
                        ...prev,
                        widgets: checked
                          ? [...(prev.widgets || []), widget.id]
                          : (prev.widgets || []).filter(id => id !== widget.id)
                      }));
                    }}
                  />
                  <Label htmlFor={widget.id} className="text-sm font-normal">
                    {widget.title}
                  </Label>
                  <Badge variant="outline" className="text-xs">
                    {widget.type}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Opções Adicionais</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeFilters"
                  checked={exportOptions.includeFilters}
                  onCheckedChange={(checked) =>
                    setExportOptions(prev => ({ ...prev, includeFilters: checked as boolean }))
                  }
                />
                <Label htmlFor="includeFilters" className="text-sm font-normal">
                  Incluir filtros aplicados
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeMetadata"
                  checked={exportOptions.includeMetadata}
                  onCheckedChange={(checked) =>
                    setExportOptions(prev => ({ ...prev, includeMetadata: checked as boolean }))
                  }
                />
                <Label htmlFor="includeMetadata" className="text-sm font-normal">
                  Incluir metadados do dashboard
                </Label>
              </div>
            </div>
          </div>

          {/* Summary */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <FormatIcon className={`h-8 w-8 ${selectedFormat?.color}`} />
                <div className="flex-1">
                  <h3 className="font-medium">Resumo da Exportação</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Formato: {selectedFormat?.label}</p>
                    <p>Widgets: {exportOptions.widgets?.length || 0} selecionados</p>
                    <p>Itens de dados: {feedback.length}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            Cancelar
          </Button>
          <Button onClick={handleExport} disabled={isExporting || !exportOptions.widgets?.length}>
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Exportar Dashboard
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
