import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  MessageSquare,
  Plus,
  Filter,
  Search,
  TrendingUp,
  Users,
  ThumbsUp,
  ThumbsDown,
  Tag,
  BarChart3,
  PieChart,
  AlertTriangle,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';
import { FeedbackCard } from '@/components/feedback/FeedbackCard';
import { FeedbackFilters } from '@/components/feedback/FeedbackFilters';
import { CreateFeedbackDialog } from '@/components/feedback/CreateFeedbackDialog';
import { FeedbackThemes } from '@/components/feedback/FeedbackThemes';
import { FeedbackInsights } from '@/components/feedback/FeedbackInsights';
import { AppHeader } from '@/components/shared/AppHeader';
import { EmptyFeedback } from '@/components/shared/EmptyState';
import { CustomerFeedback, FeedbackStatus, FeedbackPriority, FeedbackSentiment } from '@/types/feedback';

// Mock data - will be replaced with real Supabase queries
const mockFeedback: CustomerFeedback[] = [
  {
    id: '1',
    product_id: '1',
    title: 'Dark mode toggle is confusing',
    content: 'The dark mode toggle is hard to find and doesn\'t work consistently across all pages. Users are frustrated when they can\'t find it.',
    source: 'intercom',
    status: 'in_review',
    priority: 'high',
    sentiment: 'negative',
    customer_email: 'sarah@techcorp.com',
    customer_name: 'Sarah Johnson',
    customer_segment: 'Enterprise',
    feature_request: true,
    votes: 15,
    tags: ['ui', 'dark-mode', 'usability'],
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    product_id: '1',
    title: 'Love the new dashboard!',
    content: 'The new dashboard is fantastic! Much better than before. Keep up the great work!',
    source: 'survey',
    status: 'resolved',
    priority: 'low',
    sentiment: 'very_positive',
    customer_email: 'mike@startup.io',
    customer_name: 'Mike Chen',
    customer_segment: 'Startup',
    general_feedback: true,
    votes: 8,
    tags: ['dashboard', 'positive'],
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    product_id: '1',
    title: 'Export feature crashes on large datasets',
    content: 'When trying to export more than 10,000 rows, the application crashes. This is blocking our reporting workflow.',
    source: 'zendesk',
    status: 'in_progress',
    priority: 'critical',
    sentiment: 'very_negative',
    customer_email: 'anna@enterprise.com',
    customer_name: 'Anna Schmidt',
    customer_segment: 'Enterprise',
    bug_report: true,
    votes: 23,
    tags: ['export', 'crash', 'performance'],
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

export const Feedback: React.FC = () => {
  const [feedback, setFeedback] = useState<CustomerFeedback[]>(mockFeedback);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<FeedbackStatus | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<FeedbackPriority | 'all'>('all');
  const [selectedSentiment, setSelectedSentiment] = useState<FeedbackSentiment | 'all'>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Filter feedback based on current filters
  const filteredFeedback = useMemo(() => {
    return feedback.filter(item => {
      const matchesSearch = !searchTerm ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customer_email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
      const matchesPriority = selectedPriority === 'all' || item.priority === selectedPriority;
      const matchesSentiment = selectedSentiment === 'all' || item.sentiment === selectedSentiment;
      const matchesTags = selectedTags.length === 0 ||
        selectedTags.some(tag => item.tags.includes(tag));

      return matchesSearch && matchesStatus && matchesPriority && matchesSentiment && matchesTags;
    });
  }, [feedback, searchTerm, selectedStatus, selectedPriority, selectedSentiment, selectedTags]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = feedback.length;
    const newCount = feedback.filter(f => f.status === 'new').length;
    const inProgress = feedback.filter(f => f.status === 'in_progress').length;
    const resolved = feedback.filter(f => f.status === 'resolved').length;
    const positive = feedback.filter(f => f.sentiment === 'positive' || f.sentiment === 'very_positive').length;
    const negative = feedback.filter(f => f.sentiment === 'negative' || f.sentiment === 'very_negative').length;

    return { total, newCount, inProgress, resolved, positive, negative };
  }, [feedback]);

  const handleCreateFeedback = (newFeedback: Omit<CustomerFeedback, 'id' | 'created_at' | 'updated_at' | 'votes'>) => {
    const feedbackItem: CustomerFeedback = {
      ...newFeedback,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      votes: 0,
    };
    setFeedback(prev => [feedbackItem, ...prev]);
  };

  const handleUpdateFeedback = (id: string, updates: Partial<CustomerFeedback>) => {
    setFeedback(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates, updated_at: new Date().toISOString() } : item
    ));
  };

  const handleDeleteFeedback = (id: string) => {
    setFeedback(prev => prev.filter(item => item.id !== id));
  };

  const handleVote = (id: string, voteType: 'up' | 'down') => {
    setFeedback(prev => prev.map(item =>
      item.id === id
        ? { ...item, votes: voteType === 'up' ? item.votes + 1 : Math.max(0, item.votes - 1) }
        : item
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
              <MessageSquare className="h-8 w-8 text-primary" />
              Customer Feedback
            </h1>
            <p className="text-muted-foreground mt-1">
              Collect, categorize, and analyze customer feedback to drive product decisions
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Feedback
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Feedback</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.newCount}</p>
                  <p className="text-sm text-muted-foreground">New</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.resolved}</p>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <ThumbsUp className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.positive}</p>
                  <p className="text-sm text-muted-foreground">Positive</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <ThumbsDown className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.negative}</p>
                  <p className="text-sm text-muted-foreground">Negative</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="feedback" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              All Feedback
            </TabsTrigger>
            <TabsTrigger value="themes" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Themes & Tags
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feedback" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search feedback..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <FeedbackFilters
                status={selectedStatus}
                priority={selectedPriority}
                sentiment={selectedSentiment}
                tags={selectedTags}
                onStatusChange={setSelectedStatus}
                onPriorityChange={setSelectedPriority}
                onSentimentChange={setSelectedSentiment}
                onTagsChange={setSelectedTags}
              />
            </div>

            {/* Feedback List */}
            <div className="space-y-4">
              {filteredFeedback.length === 0 ? (
                <EmptyFeedback onCreateFeedback={() => setIsCreateDialogOpen(true)} />
              ) : (
                filteredFeedback.map((item) => (
                  <FeedbackCard
                    key={item.id}
                    feedback={item}
                    onUpdate={handleUpdateFeedback}
                    onDelete={handleDeleteFeedback}
                    onVote={handleVote}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="themes">
            <FeedbackThemes feedback={feedback} />
          </TabsContent>

          <TabsContent value="insights">
            <FeedbackInsights feedback={feedback} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Feedback Dialog */}
      <CreateFeedbackDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateFeedback}
      />
    </div>
  );
};

export default Feedback;
