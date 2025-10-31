import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Grid,
  Lightbulb,
  Target,
  Settings,
  Palette,
  Database
} from 'lucide-react';
import type { DashboardWidget, WidgetType, WidgetConfig, ChartType, MetricType } from '@/types/dashboard';

interface WidgetEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (widget: Omit<DashboardWidget, 'id'>) => void;
  widget?: DashboardWidget;
  availableDataSources?: string[];
}

const widgetTypeOptions = [
  { value: 'metric', label: 'Métrica', icon: TrendingUp, description: 'Exibe um número ou porcentagem' },
  { value: 'chart', label: 'Gráfico', icon: BarChart3, description: 'Visualização de dados em gráfico' },
  { value: 'table', label: 'Tabela', icon: Grid, description: 'Lista de dados em formato tabular' },
  { value: 'insights', label: 'Insights', icon: Lightbulb, description: 'Insights e recomendações de IA' },
  { value: 'themes', label: 'Temas', icon: Target, description: 'Temas identificados automaticamente' },
] as const;

const chartTypeOptions = [
  { value: 'bar', label: 'Barras', icon: BarChart3 },
  { value: 'pie', label: 'Pizza', icon: PieChart },
  { value: 'line', label: 'Linha', icon: TrendingUp },
] as const;

export const WidgetEditor: React.FC<WidgetEditorProps> = ({
  isOpen,
  onClose,
  onSave,
  widget,
  availableDataSources = ['feedback', 'issues', 'analytics']
}) => {
  const [formData, setFormData] = useState({
    type: 'metric' as WidgetType,
    title: '',
    description: '',
    dataSource: 'feedback',
    position: { x: 0, y: 0, width: 4, height: 2 },
    config: {} as WidgetConfig,
    filters: [],
    refreshInterval: undefined,
    isVisible: true,
  });

  useEffect(() => {
    if (widget) {
      setFormData({
        type: widget.type,
        title: widget.title,
        description: widget.description || '',
        dataSource: widget.dataSource,
        position: { ...widget.position },
        config: { ...widget.config },
        filters: [...widget.filters],
        refreshInterval: widget.refreshInterval,
        isVisible: widget.isVisible,
      });
    } else {
      // Reset form for new widget
      setFormData({
        type: 'metric',
        title: '',
        description: '',
        dataSource: 'feedback',
        position: { x: 0, y: 0, width: 4, height: 2 },
        config: {},
        filters: [],
        refreshInterval: undefined,
        isVisible: true,
      });
    }
  }, [widget, isOpen]);

  const handleSave = () => {
    if (!formData.title.trim()) return;

    const widgetData: Omit<DashboardWidget, 'id'> = {
      type: formData.type,
      title: formData.title,
      description: formData.description || undefined,
      position: formData.position,
      config: formData.config,
      dataSource: formData.dataSource,
      filters: formData.filters,
      refreshInterval: formData.refreshInterval,
      isVisible: formData.isVisible,
    };

    onSave(widgetData);
    onClose();
  };

  const updateConfig = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      config: { ...prev.config, [key]: value }
    }));
  };

  const renderTypeSelection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {widgetTypeOptions.map(option => {
        const Icon = option.icon;
        const isSelected = formData.type === option.value;

        return (
          <Card
            key={option.value}
            className={`cursor-pointer transition-all hover:shadow-md ${
              isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
            }`}
            onClick={() => setFormData(prev => ({ ...prev, type: option.value as WidgetType }))}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Icon className={`h-8 w-8 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                <div className="flex-1">
                  <h3 className="font-medium">{option.label}</h3>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderBasicConfig = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Título *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Digite o título do widget"
        />
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Descrição opcional do widget"
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="dataSource">Fonte de Dados</Label>
        <Select
          value={formData.dataSource}
          onValueChange={(value) => setFormData(prev => ({ ...prev, dataSource: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableDataSources.map(source => (
              <SelectItem key={source} value={source}>
                {source.charAt(0).toUpperCase() + source.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderChartConfig = () => (
    <div className="space-y-4">
      <div>
        <Label>Tipo de Gráfico</Label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {chartTypeOptions.map(option => {
            const Icon = option.icon;
            const isSelected = formData.config.chartType === option.value;

            return (
              <Card
                key={option.value}
                className={`cursor-pointer p-3 text-center ${
                  isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                }`}
                onClick={() => updateConfig('chartType', option.value)}
              >
                <Icon className={`h-6 w-6 mx-auto mb-1 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="text-sm">{option.label}</span>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="xAxis">Eixo X</Label>
          <Select
            value={formData.config.xAxis || ''}
            onValueChange={(value) => updateConfig('xAxis', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecionar campo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Data de Criação</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="priority">Prioridade</SelectItem>
              <SelectItem value="sentiment">Sentimento</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="groupBy">Agrupar Por</Label>
          <Select
            value={formData.config.groupBy || ''}
            onValueChange={(value) => updateConfig('groupBy', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecionar campo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="priority">Prioridade</SelectItem>
              <SelectItem value="sentiment">Sentimento</SelectItem>
              <SelectItem value="source">Fonte</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderMetricConfig = () => (
    <div className="space-y-4">
      <div>
        <Label>Tipo de Métrica</Label>
        <Select
          value={formData.config.metricType || 'count'}
          onValueChange={(value) => updateConfig('metricType', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="count">Contagem</SelectItem>
            <SelectItem value="percentage">Porcentagem</SelectItem>
            <SelectItem value="average">Média</SelectItem>
            <SelectItem value="sum">Soma</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="metricField">Campo da Métrica</Label>
        <Select
          value={formData.config.metricField || ''}
          onValueChange={(value) => updateConfig('metricField', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecionar campo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="votes">Votos</SelectItem>
            <SelectItem value="business_value">Valor de Negócio</SelectItem>
            <SelectItem value="story_points">Pontos de História</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="showTrend"
          checked={formData.config.showTrend || false}
          onCheckedChange={(checked) => updateConfig('showTrend', checked)}
        />
        <Label htmlFor="showTrend">Mostrar tendência</Label>
      </div>
    </div>
  );

  const renderTableConfig = () => (
    <div className="space-y-4">
      <div>
        <Label>Colunas a Exibir</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {['title', 'status', 'priority', 'created_at', 'sentiment', 'votes'].map(column => (
            <div key={column} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={column}
                checked={formData.config.columns?.includes(column) || false}
                onChange={(e) => {
                  const currentColumns = formData.config.columns || [];
                  if (e.target.checked) {
                    updateConfig('columns', [...currentColumns, column]);
                  } else {
                    updateConfig('columns', currentColumns.filter(c => c !== column));
                  }
                }}
                className="rounded"
              />
              <Label htmlFor={column} className="text-sm">
                {column.charAt(0).toUpperCase() + column.slice(1).replace('_', ' ')}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="pageSize">Itens por Página</Label>
          <Select
            value={String(formData.config.pageSize || 10)}
            onValueChange={(value) => updateConfig('pageSize', parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="sortable"
            checked={formData.config.sortable !== false}
            onCheckedChange={(checked) => updateConfig('sortable', checked)}
          />
          <Label htmlFor="sortable">Ordenável</Label>
        </div>
      </div>
    </div>
  );

  const renderInsightsConfig = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="maxItems">Máximo de Insights</Label>
        <Select
          value={String(formData.config.maxItems || 5)}
          onValueChange={(value) => updateConfig('maxItems', parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">3</SelectItem>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="15">15</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="showDetails"
          checked={formData.config.showDetails || false}
          onCheckedChange={(checked) => updateConfig('showDetails', checked)}
        />
        <Label htmlFor="showDetails">Mostrar detalhes</Label>
      </div>
    </div>
  );

  const renderAdvancedConfig = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="refreshInterval">Intervalo de Atualização (minutos)</Label>
        <Select
          value={String(formData.refreshInterval || '')}
          onValueChange={(value) => setFormData(prev => ({
            ...prev,
            refreshInterval: value ? parseInt(value) : undefined
          }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Nunca" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Nunca</SelectItem>
            <SelectItem value="5">5 minutos</SelectItem>
            <SelectItem value="15">15 minutos</SelectItem>
            <SelectItem value="30">30 minutos</SelectItem>
            <SelectItem value="60">1 hora</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isVisible"
          checked={formData.isVisible}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isVisible: checked }))}
        />
        <Label htmlFor="isVisible">Widget visível</Label>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {widget ? 'Editar Widget' : 'Criar Novo Widget'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="type" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="type">Tipo</TabsTrigger>
            <TabsTrigger value="basic">Básico</TabsTrigger>
            <TabsTrigger value="config">Configuração</TabsTrigger>
            <TabsTrigger value="advanced">Avançado</TabsTrigger>
          </TabsList>

          <TabsContent value="type" className="space-y-4">
            <div>
              <Label className="text-base font-medium">Selecione o Tipo de Widget</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Escolha o tipo de visualização que melhor representa seus dados
              </p>
            </div>
            {renderTypeSelection()}
          </TabsContent>

          <TabsContent value="basic" className="space-y-4">
            {renderBasicConfig()}
          </TabsContent>

          <TabsContent value="config" className="space-y-4">
            <div>
              <Label className="text-base font-medium">Configuração Específica</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Personalize as opções específicas para o tipo de widget selecionado
              </p>
            </div>

            {formData.type === 'chart' && renderChartConfig()}
            {formData.type === 'metric' && renderMetricConfig()}
            {formData.type === 'table' && renderTableConfig()}
            {formData.type === 'insights' && renderInsightsConfig()}
            {formData.type === 'themes' && (
              <div className="text-center text-muted-foreground py-8">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Os temas são detectados automaticamente pela IA</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            {renderAdvancedConfig()}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!formData.title.trim()}>
            {widget ? 'Atualizar Widget' : 'Criar Widget'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
