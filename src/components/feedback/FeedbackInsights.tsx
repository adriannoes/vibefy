import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Users,
  MessageSquare,
  Target,
  Lightbulb,
  Sparkles,
  Brain,
  Zap,
  ArrowRight
} from 'lucide-react';
import { CustomerFeedback } from '@/types/feedback';
import { useFeedbackInsights } from '@/hooks/useFeedback';

interface FeedbackInsightsProps {
  feedback: CustomerFeedback[];
}

interface InsightData {
  title: string;
  description: string;
  type: 'positive' | 'warning' | 'info';
  metric?: string;
  trend?: 'up' | 'down' | 'stable';
  actionable?: boolean;
}

export const FeedbackInsights: React.FC<FeedbackInsightsProps> = ({ feedback }) => {
  const { insights, recommendations, summary } = useFeedbackInsights(feedback);

  // Convert AI insights to component format
  const insightData = useMemo((): InsightData[] => {
    if (feedback.length === 0) return [];

    const result: InsightData[] = [];

    // Add AI-powered insights
    insights.slice(0, 4).forEach(insight => {
      const negativeCount = insight.sentiment_breakdown.negative + insight.sentiment_breakdown.very_negative;
      const positiveCount = insight.sentiment_breakdown.positive + insight.sentiment_breakdown.very_positive;
      const negativeRatio = negativeCount / insight.count;

      if (negativeRatio > 0.5) {
        result.push({
          title: `${insight.theme} Theme Needs Attention`,
          description: `${Math.round(negativeRatio * 100)}% negative sentiment in "${insight.theme}". AI detected this as a priority area.`,
          type: 'warning',
          metric: `${insight.count} items`,
          trend: insight.trend === 'increasing' ? 'down' : 'stable',
          actionable: true,
        });
      } else if (positiveCount > negativeCount) {
        result.push({
          title: `Strong Performance in ${insight.theme}`,
          description: `"${insight.theme}" shows positive sentiment trends. AI suggests maintaining current approach.`,
          type: 'positive',
          metric: `${insight.count} items`,
          trend: insight.trend === 'increasing' ? 'up' : 'stable',
        });
      }
    });

    // Add traditional insights as fallback
    if (result.length < 3) {
      const totalFeedback = feedback.length;
      const newFeedback = feedback.filter(f => f.status === 'new').length;
      const resolvedFeedback = feedback.filter(f => f.status === 'resolved').length;
      const positiveFeedback = feedback.filter(f =>
        f.sentiment === 'positive' || f.sentiment === 'very_positive'
      ).length;

      const positivePercentage = (positiveFeedback / totalFeedback) * 100;
      const resolutionRate = totalFeedback > 0 ? (resolvedFeedback / totalFeedback) * 100 : 0;

      if (positivePercentage > 70) {
        result.push({
          title: 'High Customer Satisfaction',
          description: `${positivePercentage.toFixed(1)}% of feedback is positive. Keep up the great work!`,
          type: 'positive',
          metric: `${positivePercentage.toFixed(1)}% positive`,
          trend: 'up',
        });
      }

      if (resolutionRate > 80) {
        result.push({
          title: 'Excellent Resolution Rate',
          description: `You've resolved ${resolutionRate.toFixed(1)}% of feedback. Your team is doing great!`,
          type: 'positive',
          metric: `${resolutionRate.toFixed(1)}% resolved`,
        });
      }

      if (newFeedback > 5) {
        result.push({
          title: 'Active Feedback Stream',
          description: `${newFeedback} new feedback items require attention.`,
          type: 'info',
          metric: `${newFeedback} new items`,
          actionable: true,
        });
      }
    }

    return result.slice(0, 6);
  }, [feedback, insights]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'info':
        return <Lightbulb className="h-5 w-5 text-blue-500" />;
      default:
        return <MessageSquare className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  if (feedback.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Brain className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">AI-Powered Insights Ready</h3>
          <p className="text-muted-foreground">
            Add customer feedback and our AI will automatically detect themes, sentiment, and provide actionable recommendations.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Summary Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">AI-Powered Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Analyzed {summary.totalFeedback} feedback items • {summary.themesDiscovered} themes detected
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{summary.positiveSentiment}</div>
              <div className="text-sm text-muted-foreground">Positive</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{summary.negativeSentiment}</div>
              <div className="text-sm text-muted-foreground">Negative</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{summary.themesDiscovered}</div>
              <div className="text-sm text-muted-foreground">Themes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{summary.urgentIssues}</div>
              <div className="text-sm text-muted-foreground">Urgent</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations Section */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-500" />
              AI Recommendations
              <Badge variant="secondary">{recommendations.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.slice(0, 3).map((rec, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className={`p-1 rounded ${
                    rec.type === 'urgent' ? 'bg-red-100 text-red-600' :
                    rec.type === 'priority' ? 'bg-orange-100 text-orange-600' :
                    rec.type === 'feature' ? 'bg-blue-100 text-blue-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {rec.type === 'urgent' ? <AlertTriangle className="h-4 w-4" /> :
                     rec.type === 'priority' ? <Target className="h-4 w-4" /> :
                     rec.type === 'feature' ? <Lightbulb className="h-4 w-4" /> :
                     <TrendingUp className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{rec.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {rec.impact} impact
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {rec.effort} effort
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{rec.description}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{feedback.length}</p>
                <p className="text-sm text-muted-foreground">Total Feedback</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {feedback.filter(f => f.status === 'resolved').length}
                </p>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{summary.themesDiscovered}</p>
                <p className="text-sm text-muted-foreground">AI Themes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">
                  {new Set(feedback.map(f => f.customer_email).filter(Boolean)).size}
                </p>
                <p className="text-sm text-muted-foreground">Customers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, index) => (
          <Card key={index} className={`transition-all hover:shadow-md ${
            insight.type === 'warning' ? 'border-orange-200' :
            insight.type === 'positive' ? 'border-green-200' : ''
          }`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {getInsightIcon(insight.type)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{insight.title}</h4>
                    {insight.trend && getTrendIcon(insight.trend)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {insight.description}
                  </p>
                  <div className="flex items-center justify-between">
                    {insight.metric && (
                      <Badge variant="secondary" className="text-xs">
                        {insight.metric}
                      </Badge>
                    )}
                    {insight.actionable && (
                      <Badge variant="outline" className="text-xs">
                        Actionable
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sentiment Breakdown Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Sentiment Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { label: 'Very Positive', count: feedback.filter(f => f.sentiment === 'very_positive').length, color: 'bg-green-500' },
              { label: 'Positive', count: feedback.filter(f => f.sentiment === 'positive').length, color: 'bg-green-400' },
              { label: 'Neutral', count: feedback.filter(f => f.sentiment === 'neutral').length, color: 'bg-gray-400' },
              { label: 'Negative', count: feedback.filter(f => f.sentiment === 'negative').length, color: 'bg-orange-400' },
              { label: 'Very Negative', count: feedback.filter(f => f.sentiment === 'very_negative').length, color: 'bg-red-500' },
            ].map((item) => {
              const percentage = feedback.length > 0 ? (item.count / feedback.length) * 100 : 0;
              return (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{item.label}</span>
                    <span>{item.count} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
