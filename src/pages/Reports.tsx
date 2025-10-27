import { useState, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useProductAnalytics } from '@/hooks/useProductAnalytics';
import { ProjectKPIs } from '@/components/reports/ProjectKPIs';
import { IssuesTrendChart } from '@/components/reports/IssuesTrendChart';
import { StatusDistributionChart } from '@/components/reports/StatusDistributionChart';
import { AssigneeDistributionChart } from '@/components/reports/AssigneeDistributionChart';
import { ProductAnalyticsOverview } from '@/components/reports/ProductAnalyticsOverview';
// Lazy load heavy chart components for better initial load performance
const BusinessValueTrendChart = lazy(() => import('@/components/reports/BusinessValueTrendChart').then(module => ({ default: module.BusinessValueTrendChart })));
const RoadmapHealthGauge = lazy(() => import('@/components/reports/RoadmapHealthGauge').then(module => ({ default: module.RoadmapHealthGauge })));
const OKRTrendsChart = lazy(() => import('@/components/reports/OKRTrendsChart').then(module => ({ default: module.OKRTrendsChart })));
import { ReportFilters } from '@/components/reports/ReportFilters';
import { ReportFilters as ReportFiltersType, ExportOptions } from '@/types/analytics';
import { AppHeader } from '@/components/shared/AppHeader';
import {
  BarChart3,
  TrendingUp,
  Users,
  PieChart,
  Download,
  RefreshCw,
  Target,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Loading component for lazy loaded charts
const ChartLoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    <span className="ml-2 text-muted-foreground">Loading chart...</span>
  </div>
);

const Reports = () => {
  const [filters, setFilters] = useState<ReportFiltersType>({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      end: new Date()
    }
  });

  const { 
    kpis, 
    issueTrends, 
    statusDistribution, 
    assigneeWorkload, 
    sprintVelocity, 
    loading,
    refetch 
  } = useAnalytics(filters);

  const { 
    data: productAnalytics, 
    isLoading: productLoading 
  } = useProductAnalytics(filters);

  const handleExport = (options: ExportOptions) => {
    // In a real implementation, this would generate and download the report
    console.log('Exporting report with options:', options);
    
    // Simulate export
    const fileName = `vibefy-report-${format(new Date(), 'yyyy-MM-dd')}.${options.format}`;
    const blob = new Blob(['Mock report data'], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <BarChart3 className="h-8 w-8 text-primary" />
                Reports & Analytics
              </h1>
              <p className="text-muted-foreground mt-1">
                Project insights and performance metrics
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleRefresh} 
                disabled={loading}
                variant="outline"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={() => handleExport({ 
                format: 'pdf', 
                includeCharts: true, 
                dateRange: filters.dateRange 
              })}>
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <ReportFilters
              filters={filters}
              onFiltersChange={setFilters}
              onExport={handleExport}
              onRefresh={handleRefresh}
              loading={loading}
            />
          </div>

          {/* Reports Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="trends" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Trends
                </TabsTrigger>
                <TabsTrigger value="team" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Team
                </TabsTrigger>
                <TabsTrigger value="distribution" className="flex items-center gap-2">
                  <PieChart className="h-4 w-4" />
                  Distribution
                </TabsTrigger>
                <TabsTrigger value="product" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Product
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <ProjectKPIs data={kpis} loading={loading} />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <IssuesTrendChart data={issueTrends} loading={loading} />
                  <StatusDistributionChart data={statusDistribution} loading={loading} />
                </div>
              </TabsContent>

              {/* Trends Tab */}
              <TabsContent value="trends" className="space-y-6">
                <IssuesTrendChart data={issueTrends} loading={loading} />
                
                <Card>
                  <CardHeader>
                    <CardTitle>Sprint Velocity</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Story points completed per sprint
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {sprintVelocity.map((sprint, index) => (
                        <div key={sprint.sprintId} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{sprint.sprintName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(sprint.startDate), 'dd/MM', { locale: ptBR })} - {' '}
                              {format(new Date(sprint.endDate), 'dd/MM/yyyy', { locale: ptBR })}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">
                              {sprint.velocity}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {sprint.completedPoints}/{sprint.committedPoints} points
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Team Tab */}
              <TabsContent value="team" className="space-y-6">
                <AssigneeDistributionChart data={assigneeWorkload} loading={loading} />
                
                <Card>
                  <CardHeader>
                    <CardTitle>Team Performance</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Individual contributor metrics
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {assigneeWorkload.map((member, index) => (
                        <div key={member.assigneeId} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium">
                                {member.assigneeName.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium">{member.assigneeName}</h4>
                              <p className="text-sm text-muted-foreground">
                                {member.totalIssues} issues • {member.storyPoints} story points
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">
                              {Math.round((member.completedIssues / member.totalIssues) * 100)}%
                            </div>
                            <div className="text-sm text-muted-foreground">
                              completion rate
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Distribution Tab */}
              <TabsContent value="distribution" className="space-y-6">
                <StatusDistributionChart data={statusDistribution} loading={loading} />
                
                <Card>
                  <CardHeader>
                    <CardTitle>Issue Types Distribution</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Breakdown by issue type
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { type: 'Story', count: 18, color: 'bg-blue-500' },
                        { type: 'Task', count: 15, color: 'bg-green-500' },
                        { type: 'Bug', count: 8, color: 'bg-red-500' },
                        { type: 'Epic', count: 4, color: 'bg-purple-500' }
                      ].map((item, index) => (
                        <div key={index} className="text-center p-4 border rounded-lg">
                          <div className={`w-12 h-12 ${item.color} rounded-full mx-auto mb-2`}></div>
                          <div className="text-2xl font-bold">{item.count}</div>
                          <div className="text-sm text-muted-foreground">{item.type}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Product Tab */}
              <TabsContent value="product" className="space-y-6">
                {productAnalytics && (
                  <>
                    <ProductAnalyticsOverview
                      kpis={productAnalytics.productKPIs}
                      isLoading={productLoading}
                    />

                    <Suspense fallback={<ChartLoadingSpinner />}>
                      <BusinessValueTrendChart
                        businessValue={productAnalytics.businessValue}
                        isLoading={productLoading}
                      />
                    </Suspense>

                    <Suspense fallback={<ChartLoadingSpinner />}>
                      <RoadmapHealthGauge
                        roadmapHealth={productAnalytics.roadmapHealth}
                        isLoading={productLoading}
                      />
                    </Suspense>

                    <Suspense fallback={<ChartLoadingSpinner />}>
                      <OKRTrendsChart
                        okrTrends={productAnalytics.okrTrends}
                        isLoading={productLoading}
                      />
                    </Suspense>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
