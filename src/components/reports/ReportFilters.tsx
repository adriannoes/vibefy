import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ReportFilters as ReportFiltersType, DateRangePreset, ExportOptions } from '@/types/analytics';

interface ReportFiltersProps {
  filters: ReportFiltersType;
  onFiltersChange: (filters: ReportFiltersType) => void;
  onExport: (options: ExportOptions) => void;
  onRefresh: () => void;
  loading?: boolean;
}

const dateRangePresets: { value: DateRangePreset; label: string }[] = [
  { value: 'last_7_days', label: 'Last 7 days' },
  { value: 'last_30_days', label: 'Last 30 days' },
  { value: 'last_3_months', label: 'Last 3 months' },
  { value: 'last_6_months', label: 'Last 6 months' },
  { value: 'this_year', label: 'This year' },
  { value: 'custom', label: 'Custom range' }
];

const exportFormats = [
  { value: 'pdf', label: 'PDF' },
  { value: 'csv', label: 'CSV' },
  { value: 'excel', label: 'Excel' }
];

export const ReportFilters = ({ 
  filters, 
  onFiltersChange, 
  onExport, 
  onRefresh,
  loading = false 
}: ReportFiltersProps) => {
  const [selectedPreset, setSelectedPreset] = useState<DateRangePreset>('last_30_days');
  const [isExportOpen, setIsExportOpen] = useState(false);

  const handlePresetChange = (preset: DateRangePreset) => {
    setSelectedPreset(preset);
    
    if (preset === 'custom') return;

    const now = new Date();
    let startDate: Date;

    switch (preset) {
      case 'last_7_days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'last_30_days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'last_3_months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case 'last_6_months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case 'this_year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    onFiltersChange({
      ...filters,
      dateRange: {
        start: startDate,
        end: now
      }
    });
  };

  const handleCustomDateChange = (date: Date | undefined, type: 'start' | 'end') => {
    if (!date) return;

    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [type]: date
      }
    });
  };

  const handleExport = (format: string) => {
    const exportOptions: ExportOptions = {
      format: format as 'pdf' | 'csv' | 'excel',
      includeCharts: true,
      dateRange: filters.dateRange
    };
    
    onExport(exportOptions);
    setIsExportOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Report Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Range Presets */}
        <div>
          <label className="text-sm font-medium mb-2 block">Time Period</label>
          <Select value={selectedPreset} onValueChange={handlePresetChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dateRangePresets.map((preset) => (
                <SelectItem key={preset.value} value={preset.value}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Custom Date Range */}
        {selectedPreset === 'custom' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange.start ? (
                      format(filters.dateRange.start, 'dd/MM/yyyy', { locale: ptBR })
                    ) : (
                      'Select start date'
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.dateRange.start}
                    onSelect={(date) => handleCustomDateChange(date, 'start')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange.end ? (
                      format(filters.dateRange.end, 'dd/MM/yyyy', { locale: ptBR })
                    ) : (
                      'Select end date'
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.dateRange.end}
                    onSelect={(date) => handleCustomDateChange(date, 'end')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-4 border-t">
          <Button 
            onClick={onRefresh} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Popover open={isExportOpen} onOpenChange={setIsExportOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48">
              <div className="space-y-2">
                <p className="text-sm font-medium">Export Format</p>
                {exportFormats.map((format) => (
                  <Button
                    key={format.value}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleExport(format.value)}
                  >
                    {format.label}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Current Filter Summary */}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          <p>
            Showing data from{' '}
            <span className="font-medium">
              {format(filters.dateRange.start, 'dd/MM/yyyy', { locale: ptBR })}
            </span>{' '}
            to{' '}
            <span className="font-medium">
              {format(filters.dateRange.end, 'dd/MM/yyyy', { locale: ptBR })}
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
