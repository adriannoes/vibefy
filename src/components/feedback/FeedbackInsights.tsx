import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Users,
  MessageSquare,
  Target,
  Lightbulb
} from 'lucide-react';
import { CustomerFeedback } from '@/types/feedback';

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
  const insights = useMemo((): InsightData[] => {
    if (feedback.length === 0) return [];

    const totalFeedback = feedback.length;
    const newFeedback = feedback.filter(f => f.status === 'new').length;
    const resolvedFeedback = feedback.filter(f => f.status === 'resolved').length;
    const positiveFeedback = feedback.filter(f =>
      f.sentiment === 'positive' || f.sentiment === 'very_positive'
    ).length;
    const negativeFeedback = feedback.filter(f =>
      f.sentiment === 'negative' || f.sentiment === 'very_negative'
    ).length;

    const positivePercentage = (positiveFeedback / totalFeedback) * 100;
    const negativePercentage = (negativeFeedback / totalFeedback) * 100;
    const resolutionRate = totalFeedback > 0 ? (resolvedFeedback / totalFeedback) * 100 : 0;

    const result: InsightData[] = [];

    // Sentiment insights
    if (positivePercentage > 70) {
      result.push({
        title: 'High Customer Satisfaction',
        description: `${positivePercentage.toFixed(1)}% of feedback is positive. Keep up the great work!`,
        type: 'positive',
        metric: `${positivePercentage.toFixed(1)}% positive`,
        trend: 'up',
      });
    } else if (negativePercentage > 30) {
      result.push({
        title: 'Attention Needed',
        description: `${negativePercentage.toFixed(1)}% of feedback is negative. Consider prioritizing these issues.`,
        type: 'warning',
        metric: `${negativePercentage.toFixed(1)}% negative`,
        trend: 'down',
        actionable: true,
      });
    }

    // Resolution rate insights
    if (resolutionRate > 80) {
      result.push({
        title: 'Excellent Resolution Rate',
        description: `You've resolved ${resolutionRate.toFixed(1)}% of feedback. Your team is doing great!`,
        type: 'positive',
        metric: `${resolutionRate.toFixed(1)}% resolved`,
      });
    } else if (resolutionRate < 50) {
      result.push({
        title: 'Improve Resolution Rate',
        description: `Only ${resolutionRate.toFixed(1)}% of feedback has been resolved. Consider increasing team capacity.`,
        type: 'warning',
        metric: `${resolutionRate.toFixed(1)}% resolved`,
        actionable: true,
      });
    }

    // New feedback insights
    if (newFeedback > 10) {
      result.push({
        title: 'High Volume of New Feedback',
        description: `${newFeedback} new feedback items need attention. Consider triaging them soon.`,
        type: 'info',
        metric: `${newFeedback} new items`,
        actionable: true,
      });
    }

    // Feature request insights
    const featureRequests = feedback.filter(f => f.feature_request).length;
    if (featureRequests > 0) {
      const featurePercentage = (featureRequests / totalFeedback) * 100;
      result.push({
        title: 'Feature Request Opportunities',
        description: `${featureRequests} feedback items (${featurePercentage.toFixed(1)}%) are feature requests. These could drive your roadmap.`,
        type: 'info',
        metric: `${featureRequests} requests`,
        actionable: true,
      });
    }

    // Bug report insights
    const bugReports = feedback.filter(f => f.bug_report).length;
    if (bugReports > 0) {
      const bugPercentage = (bugReports / totalFeedback) * 100;
      result.push({
        title: 'Bug Reports to Address',
        description: `${bugReports} feedback items (${bugPercentage.toFixed(1)}%) are bug reports. Prioritize these for product stability.`,
        type: 'warning',
        metric: `${bugReports} bugs`,
        actionable: true,
      });
    }

    // Source insights
    const sources = feedback.reduce((acc, f) => {
      acc[f.source] = (acc[f.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topSource = Object.entries(sources).sort(([,a], [,b]) => b - a)[0];
    if (topSource) {
      const [source, count] = topSource;
      const sourcePercentage = (count / totalFeedback) * 100;
      result.push({
        title: 'Primary Feedback Source',
        description: `Most feedback (${sourcePercentage.toFixed(1)}%) comes from ${source}. Consider optimizing this channel.`,
        type: 'info',
        metric: `${source} (${count})`,
      });
    }

    return result.slice(0, 6); // Limit to 6 insights
  }, [feedback]);

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

  if (insights.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Insights Yet</h3>
          <p className="text-muted-foreground">
            Insights will appear here as you collect more customer feedback.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
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
              <Target className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {feedback.filter(f => f.feature_request).length}
                </p>
                <p className="text-sm text-muted-foreground">Features</p>
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
