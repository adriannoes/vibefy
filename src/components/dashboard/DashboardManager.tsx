import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Plus,
  Grid,
  Eye,
  Edit,
  Trash2,
  Copy,
  Download,
  Settings,
  BarChart3,
  Calendar,
  Users
} from 'lucide-react';
import { CustomDashboard } from './CustomDashboard';
import { WidgetEditor } from './WidgetEditor';
import { DashboardExporter } from './DashboardExporter';
import { useDashboards, useCreateDashboard, useUpdateDashboard, useDeleteDashboard, useDuplicateDashboard } from '@/hooks/useDashboard';
import { exportDashboard } from '@/lib/dashboardExport';
import type { Dashboard, DashboardWidget } from '@/types/dashboard';
import type { CustomerFeedback } from '@/types/feedback';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DashboardManagerProps {
  feedback: CustomerFeedback[];
  onFeedbackChange?: () => void;
}

export const DashboardManager: React.FC<DashboardManagerProps> = ({
  feedback,
  onFeedbackChange,
}) => {
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard | null>(null);
  const [isWidgetEditorOpen, setIsWidgetEditorOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<DashboardWidget | null>(null);
  const [isExporterOpen, setIsExporterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: dashboards = [], isLoading } = useDashboards();
  const createDashboardMutation = useCreateDashboard();
  const updateDashboardMutation = useUpdateDashboard();
  const deleteDashboardMutation = useDeleteDashboard();
  const duplicateDashboardMutation = useDuplicateDashboard();

  const handleCreateDashboard = useCallback(async (template?: any) => {
    const newDashboard: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'> = {
      name: template?.name || 'Novo Dashboard',
      description: template?.description || '',
      layout: 'grid',
      widgets: template?.widgets || [],
      filters: [],
      timeRange: '30d',
      isPublic: false,
      isDefault: false,
      createdBy: 'current-user', // In real app, get from auth
      lastViewedAt: new Date().toISOString(),
    };

    try {
      await createDashboardMutation.mutateAsync(newDashboard);
    } catch (error) {
      console.error('Failed to create dashboard:', error);
    }
  }, [createDashboardMutation]);

  const handleUpdateDashboard = useCallback(async (updates: Partial<Dashboard>) => {
    if (!selectedDashboard) return;

    try {
      await updateDashboardMutation.mutateAsync({
        id: selectedDashboard.id,
        updates: {
          ...updates,
          updatedAt: new Date().toISOString(),
        },
      });

      // Update local state
      setSelectedDashboard(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Failed to update dashboard:', error);
    }
  }, [selectedDashboard, updateDashboardMutation]);

  const handleDeleteDashboard = useCallback(async (dashboardId: string) => {
    if (!confirm('Tem certeza que deseja excluir este dashboard?')) return;

    try {
      await deleteDashboardMutation.mutateAsync(dashboardId);
      if (selectedDashboard?.id === dashboardId) {
        setSelectedDashboard(null);
      }
    } catch (error) {
      console.error('Failed to delete dashboard:', error);
    }
  }, [selectedDashboard, deleteDashboardMutation]);

  const handleDuplicateDashboard = useCallback(async (dashboardId: string) => {
    try {
      await duplicateDashboardMutation.mutateAsync(dashboardId);
    } catch (error) {
      console.error('Failed to duplicate dashboard:', error);
    }
  }, [duplicateDashboardMutation]);

  const handleAddWidget = useCallback(() => {
    setEditingWidget(null);
    setIsWidgetEditorOpen(true);
  }, []);

  const handleEditWidget = useCallback((widgetId: string) => {
    const widget = selectedDashboard?.widgets.find(w => w.id === widgetId);
    if (widget) {
      setEditingWidget(widget);
      setIsWidgetEditorOpen(true);
    }
  }, [selectedDashboard]);

  const handleSaveWidget = useCallback((widgetData: Omit<DashboardWidget, 'id'>) => {
    if (!selectedDashboard) return;

    const updatedWidgets = [...selectedDashboard.widgets];

    if (editingWidget) {
      // Update existing widget
      const index = updatedWidgets.findIndex(w => w.id === editingWidget.id);
      if (index !== -1) {
        updatedWidgets[index] = { ...widgetData, id: editingWidget.id };
      }
    } else {
      // Add new widget
      const newWidget: DashboardWidget = {
        ...widgetData,
        id: `widget-${Date.now()}`,
      };
      updatedWidgets.push(newWidget);
    }

    handleUpdateDashboard({ widgets: updatedWidgets });
  }, [selectedDashboard, editingWidget, handleUpdateDashboard]);

  const handleDeleteWidget = useCallback((widgetId: string) => {
    if (!selectedDashboard || !confirm('Tem certeza que deseja excluir este widget?')) return;

    const updatedWidgets = selectedDashboard.widgets.filter(w => w.id !== widgetId);
    handleUpdateDashboard({ widgets: updatedWidgets });
  }, [selectedDashboard, handleUpdateDashboard]);

  const handleExport = useCallback(async (options: any) => {
    if (!selectedDashboard) return;

    await exportDashboard(selectedDashboard, feedback, options);
  }, [selectedDashboard, feedback]);

  const getDashboardStats = useCallback((dashboard: Dashboard) => {
    return {
      totalViews: Math.floor(Math.random() * 100), // Mock data
      lastViewed: dashboard.lastViewedAt || dashboard.updatedAt,
      widgetCount: dashboard.widgets.length,
      isPublic: dashboard.isPublic,
    };
  }, []);

  if (selectedDashboard) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setSelectedDashboard(null)}
          >
            ← Voltar aos Dashboards
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExporterOpen(true)}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleAddWidget}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Widget
            </Button>
          </div>
        </div>

        <CustomDashboard
          dashboard={selectedDashboard}
          feedback={feedback}
          onUpdateDashboard={handleUpdateDashboard}
          onAddWidget={handleAddWidget}
          onEditWidget={handleEditWidget}
          onDeleteWidget={handleDeleteWidget}
        />

        <WidgetEditor
          isOpen={isWidgetEditorOpen}
          onClose={() => setIsWidgetEditorOpen(false)}
          onSave={handleSaveWidget}
          widget={editingWidget || undefined}
        />

        <DashboardExporter
          isOpen={isExporterOpen}
          onClose={() => setIsExporterOpen(false)}
          dashboard={selectedDashboard}
          feedback={feedback}
          onExport={handleExport}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboards</h1>
          <p className="text-muted-foreground">
            Visualize e analise seus dados de feedback de forma customizada
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <BarChart3 className="h-4 w-4" />
          </Button>

          <Button onClick={() => handleCreateDashboard()}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Dashboard
          </Button>
        </div>
      </div>

      {/* Dashboard Grid/List */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando dashboards...</p>
        </div>
      ) : dashboards.length === 0 ? (
        <Card className="text-center p-12">
          <div className="flex flex-col items-center gap-4">
            <BarChart3 className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">Nenhum dashboard encontrado</h3>
              <p className="text-muted-foreground">
                Crie seu primeiro dashboard para começar a visualizar seus dados
              </p>
            </div>
            <Button onClick={() => handleCreateDashboard()}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Dashboard
            </Button>
          </div>
        </Card>
      ) : (
        <div className={
          viewMode === 'grid'
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        }>
          {dashboards.map(dashboard => {
            const stats = getDashboardStats(dashboard);

            if (viewMode === 'grid') {
              return (
                <Card key={dashboard.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{dashboard.name}</CardTitle>
                        {dashboard.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {dashboard.description}
                          </p>
                        )}
                      </div>
                      {dashboard.isDefault && (
                        <Badge variant="secondary">Padrão</Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Widgets</p>
                        <p className="font-medium">{dashboard.widgets.length}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Visualizações</p>
                        <p className="font-medium">{stats.totalViews}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        Atualizado {format(new Date(dashboard.updatedAt), 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                      {dashboard.isPublic && (
                        <Badge variant="outline" className="text-xs">Público</Badge>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => setSelectedDashboard(dashboard)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDuplicateDashboard(dashboard.id)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteDashboard(dashboard.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            }

            // List view
            return (
              <Card key={dashboard.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{dashboard.name}</h3>
                          {dashboard.isDefault && (
                            <Badge variant="secondary">Padrão</Badge>
                          )}
                          {dashboard.isPublic && (
                            <Badge variant="outline">Público</Badge>
                          )}
                        </div>
                        {dashboard.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {dashboard.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">{dashboard.widgets.length}</span> widgets
                        </div>
                        <div>
                          <span className="font-medium">{stats.totalViews}</span> visualizações
                        </div>
                        <div>
                          Atualizado {format(new Date(dashboard.updatedAt), 'dd/MM/yyyy', { locale: ptBR })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => setSelectedDashboard(dashboard)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Abrir
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDuplicateDashboard(dashboard.id)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteDashboard(dashboard.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
