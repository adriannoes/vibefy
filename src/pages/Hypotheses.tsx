import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Lightbulb,
  TestTube,
  Plus,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  BarChart3,
  Users,
  Zap
} from 'lucide-react';
import { HypothesisCard } from '@/components/hypotheses/HypothesisCard';
import { ExperimentCard } from '@/components/hypotheses/ExperimentCard';
import { HypothesisFilters } from '@/components/hypotheses/HypothesisFilters';
import { CreateHypothesisDialog } from '@/components/hypotheses/CreateHypothesisDialog';
import { HypothesisTemplates } from '@/components/hypotheses/HypothesisTemplates';
import { HypothesisInsights } from '@/components/hypotheses/HypothesisInsights';
import { AppHeader } from '@/components/shared/AppHeader';
import { EmptyHypothesis } from '@/components/shared/EmptyState';
import { Hypothesis, Experiment, HypothesisStatus, HypothesisType, HypothesisValidationMetrics, ExperimentMetrics } from '@/types/hypothesis';

// Mock data - will be replaced with real Supabase queries
const mockHypotheses: Hypothesis[] = [
  {
    id: '1',
    product_id: '1',
    title: 'Dark mode reduces user eye strain',
    description: 'Users working late hours will prefer dark mode to reduce eye strain and improve productivity.',
    type: 'solution_validation',
    status: 'in_experiment',
    priority: 'high',
    problem_statement: 'Users working after dark experience eye strain from bright interfaces',
    solution_statement: 'Implementing dark mode will reduce eye strain by 40%',
    expected_outcome: '40% reduction in reported eye strain complaints',
    success_criteria: [
      'User satisfaction survey shows 4+ rating for dark mode',
      'Usage analytics show 60% adoption rate',
      'Eye strain complaints decrease by 50%'
    ],
    confidence_level: 7,
    risk_level: 3,
    effort_estimate: 8,
    experiments: [
      {
        id: 'exp1',
        hypothesis_id: '1',
        title: 'Dark mode A/B test',
        description: 'A/B test comparing user engagement with and without dark mode',
        type: 'a_b_test',
        status: 'running',
        methodology: '50/50 split A/B test with user engagement as primary metric',
        sample_size: 1000,
        duration_days: 14,
        primary_metric: 'User engagement score',
        secondary_metrics: ['Session duration', 'Feature adoption', 'User satisfaction'],
        success_threshold: '15% improvement in engagement score',
        start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        created_by: 'user1',
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ],
    created_by: 'user1',
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    product_id: '1',
    title: 'Mobile users need simplified onboarding',
    description: 'Mobile users abandon the onboarding flow due to complexity and time requirements.',
    type: 'problem_validation',
    status: 'validated',
    priority: 'critical',
    problem_statement: 'Mobile users drop off during onboarding at 60% rate',
    solution_statement: 'Simplifying onboarding will increase completion rate to 85%',
    expected_outcome: '25% improvement in mobile onboarding completion',
    success_criteria: [
      'Onboarding completion rate exceeds 85%',
      'Mobile user retention improves by 20%',
      'User feedback shows simplified flow is preferred'
    ],
    confidence_level: 8,
    risk_level: 2,
    effort_estimate: 5,
    experiments: [
      {
        id: 'exp2',
        hypothesis_id: '2',
        title: 'Onboarding flow usability test',
        description: 'Usability testing of simplified onboarding flow',
        type: 'usability_test',
        status: 'completed',
        methodology: 'Remote usability testing with 20 mobile users',
        sample_size: 20,
        duration_days: 3,
        primary_metric: 'Task completion rate',
        secondary_metrics: ['Time to complete', 'User satisfaction score'],
        success_threshold: '90% task completion rate',
        results: {
          primary_metric_value: 95,
          secondary_metrics_values: {
            'Time to complete': 4.2,
            'User satisfaction score': 4.6
          },
          statistical_significance: 0.99,
          p_value: 0.001
        },
        conclusion: 'Hypothesis validated - simplified onboarding significantly improves completion rates',
        learnings: [
          'Progressive disclosure works well on mobile',
          'Visual cues are more effective than text instructions',
          '3-step flow is optimal for mobile users'
        ],
        next_steps: [
          'Implement simplified onboarding in production',
          'Monitor retention metrics post-launch',
          'Consider A/B testing additional improvements'
        ],
        start_date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        actual_end_date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        created_by: 'user1',
        created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ],
    validated_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    created_by: 'user1',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    product_id: '1',
    title: 'AI-powered recommendations increase engagement',
    description: 'Personalized AI recommendations will boost user engagement and feature discovery.',
    type: 'solution_validation',
    status: 'proposed',
    priority: 'medium',
    problem_statement: 'Users only use 30% of available features due to poor discoverability',
    solution_statement: 'AI recommendations will increase feature usage to 70%',
    expected_outcome: '40% improvement in feature adoption and engagement',
    success_criteria: [
      'Feature usage increases by 40%',
      'User engagement score improves by 25%',
      'Recommendation accuracy exceeds 80%'
    ],
    confidence_level: 6,
    risk_level: 5,
    effort_estimate: 21,
    experiments: [],
    created_by: 'user1',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

export const Hypotheses: React.FC = () => {
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>(mockHypotheses);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<HypothesisStatus | 'all'>('all');
  const [selectedType, setSelectedType] = useState<HypothesisType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Flatten experiments for easier access
  const allExperiments = useMemo(() =>
    hypotheses.flatMap(h => h.experiments),
    [hypotheses]
  );

  // Filter hypotheses based on current filters
  const filteredHypotheses = useMemo(() => {
    return hypotheses.filter(hypothesis => {
      const matchesSearch = !searchTerm ||
        hypothesis.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hypothesis.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = selectedStatus === 'all' || hypothesis.status === selectedStatus;
      const matchesType = selectedType === 'all' || hypothesis.type === selectedType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [hypotheses, searchTerm, selectedStatus, selectedType]);

  // Calculate metrics
  const metrics = useMemo((): { hypotheses: HypothesisValidationMetrics; experiments: ExperimentMetrics } => {
    const hypothesesMetrics: HypothesisValidationMetrics = {
      total_hypotheses: hypotheses.length,
      validated_hypotheses: hypotheses.filter(h => h.status === 'validated').length,
      invalidated_hypotheses: hypotheses.filter(h => h.status === 'invalidated').length,
      in_progress_hypotheses: hypotheses.filter(h => ['in_experiment', 'proposed'].includes(h.status)).length,
      validation_rate: 0,
      average_validation_time: 0,
      top_validated_types: []
    };

    const experimentsMetrics: ExperimentMetrics = {
      total_experiments: allExperiments.length,
      completed_experiments: allExperiments.filter(e => e.status === 'completed').length,
      running_experiments: allExperiments.filter(e => e.status === 'running').length,
      success_rate: 0,
      average_duration: 0,
      top_experiment_types: []
    };

    // Calculate validation rate
    const testableHypotheses = hypotheses.filter(h => h.status !== 'draft' && h.status !== 'cancelled');
    hypothesesMetrics.validation_rate = testableHypotheses.length > 0
      ? (hypothesesMetrics.validated_hypotheses / testableHypotheses.length) * 100
      : 0;

    // Calculate average validation time
    const validatedWithDates = hypotheses.filter(h => h.validated_at && h.created_at);
    if (validatedWithDates.length > 0) {
      const totalDays = validatedWithDates.reduce((sum, h) => {
        const created = new Date(h.created_at).getTime();
        const validated = new Date(h.validated_at!).getTime();
        return sum + ((validated - created) / (1000 * 60 * 60 * 24));
      }, 0);
      hypothesesMetrics.average_validation_time = totalDays / validatedWithDates.length;
    }

    // Calculate experiment success rate
    const completedExperiments = allExperiments.filter(e => e.status === 'completed');
    if (completedExperiments.length > 0) {
      const successful = completedExperiments.filter(e => {
        // Simple success check based on primary metric meeting threshold
        return e.results && e.results.primary_metric_value >= 0.8; // Simplified
      });
      experimentsMetrics.success_rate = (successful.length / completedExperiments.length) * 100;
    }

    // Calculate average experiment duration
    const completedWithDates = allExperiments.filter(e => e.actual_end_date && e.start_date);
    if (completedWithDates.length > 0) {
      const totalDays = completedWithDates.reduce((sum, e) => {
        const start = new Date(e.start_date!).getTime();
        const end = new Date(e.actual_end_date!).getTime();
        return sum + ((end - start) / (1000 * 60 * 60 * 24));
      }, 0);
      experimentsMetrics.average_duration = totalDays / completedWithDates.length;
    }

    return { hypotheses: hypothesesMetrics, experiments: experimentsMetrics };
  }, [hypotheses, allExperiments]);

  const handleCreateHypothesis = (newHypothesis: Omit<Hypothesis, 'id' | 'created_at' | 'updated_at' | 'experiments'>) => {
    const hypothesis: Hypothesis = {
      ...newHypothesis,
      id: Date.now().toString(),
      experiments: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setHypotheses(prev => [hypothesis, ...prev]);
  };

  const handleUpdateHypothesis = (id: string, updates: Partial<Hypothesis>) => {
    setHypotheses(prev => prev.map(h =>
      h.id === id ? { ...h, ...updates, updated_at: new Date().toISOString() } : h
    ));
  };

  const handleDeleteHypothesis = (id: string) => {
    setHypotheses(prev => prev.filter(h => h.id !== id));
  };

  const handleCreateExperiment = (hypothesisId: string, experiment: Omit<Experiment, 'id' | 'hypothesis_id' | 'created_at' | 'updated_at'>) => {
    const newExperiment: Experiment = {
      ...experiment,
      id: Date.now().toString(),
      hypothesis_id: hypothesisId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setHypotheses(prev => prev.map(h =>
      h.id === hypothesisId
        ? { ...h, experiments: [...h.experiments, newExperiment] }
        : h
    ));
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Lightbulb className="h-8 w-8 text-primary" />
              Hypotheses & Experiments
            </h1>
            <p className="text-muted-foreground mt-1">
              Validate ideas through scientific experimentation and data-driven decisions
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Hypothesis
          </Button>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{metrics.hypotheses.total_hypotheses}</p>
                  <p className="text-sm text-muted-foreground">Hypotheses</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{metrics.hypotheses.validated_hypotheses}</p>
                  <p className="text-sm text-muted-foreground">Validated</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{metrics.hypotheses.in_progress_hypotheses}</p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TestTube className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{metrics.experiments.total_experiments}</p>
                  <p className="text-sm text-muted-foreground">Experiments</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{metrics.hypotheses.validation_rate.toFixed(0)}%</p>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{metrics.experiments.success_rate.toFixed(0)}%</p>
                  <p className="text-sm text-muted-foreground">Exp Success</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="hypotheses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="hypotheses" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Hypotheses
            </TabsTrigger>
            <TabsTrigger value="experiments" className="flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              Experiments
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hypotheses" className="space-y-6">
            {/* Filters */}
            <HypothesisFilters
              status={selectedStatus}
              type={selectedType}
              onStatusChange={setSelectedStatus}
              onTypeChange={setSelectedType}
              onSearchChange={setSearchTerm}
              searchTerm={searchTerm}
            />

            {/* Hypotheses List */}
            <div className="space-y-4">
              {filteredHypotheses.length === 0 ? (
                <EmptyHypothesis onCreateHypothesis={() => setIsCreateDialogOpen(true)} />
              ) : (
                filteredHypotheses.map((hypothesis) => (
                  <HypothesisCard
                    key={hypothesis.id}
                    hypothesis={hypothesis}
                    onUpdate={handleUpdateHypothesis}
                    onDelete={handleDeleteHypothesis}
                    onCreateExperiment={handleCreateExperiment}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="experiments">
            <div className="space-y-4">
              {allExperiments.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <TestTube className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Experiments Yet</h3>
                    <p className="text-muted-foreground">
                      Create hypotheses first, then add experiments to validate them.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                allExperiments.map((experiment) => (
                  <ExperimentCard
                    key={experiment.id}
                    experiment={experiment}
                    hypothesis={hypotheses.find(h => h.id === experiment.hypothesis_id)!}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="templates">
            <HypothesisTemplates onSelectTemplate={() => setIsCreateDialogOpen(true)} />
          </TabsContent>

          <TabsContent value="insights">
            <HypothesisInsights
              hypotheses={hypotheses}
              experiments={allExperiments}
              metrics={metrics}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Hypothesis Dialog */}
      <CreateHypothesisDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateHypothesis}
      />
    </div>
  );
};

export default Hypotheses;
