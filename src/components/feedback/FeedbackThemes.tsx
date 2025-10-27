import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tag, TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';
import { CustomerFeedback } from '@/types/feedback';

interface FeedbackThemesProps {
  feedback: CustomerFeedback[];
}

interface ThemeData {
  name: string;
  count: number;
  percentage: number;
  sentimentBreakdown: {
    very_positive: number;
    positive: number;
    neutral: number;
    negative: number;
    very_negative: number;
  };
  trend: 'increasing' | 'stable' | 'decreasing';
  topTags: string[];
}

export const FeedbackThemes: React.FC<FeedbackThemesProps> = ({ feedback }) => {
  // Extract themes from feedback tags and content
  const themes = useMemo((): ThemeData[] => {
    // Group feedback by tags to create themes
    const tagGroups: Record<string, CustomerFeedback[]> = {};

    feedback.forEach((item) => {
      item.tags.forEach((tag) => {
        if (!tagGroups[tag]) {
          tagGroups[tag] = [];
        }
        tagGroups[tag].push(item);
      });
    });

    // Convert to theme data
    const themeData: ThemeData[] = Object.entries(tagGroups).map(([tag, items]) => {
      const sentimentBreakdown = {
        very_positive: items.filter(i => i.sentiment === 'very_positive').length,
        positive: items.filter(i => i.sentiment === 'positive').length,
        neutral: items.filter(i => i.sentiment === 'neutral').length,
        negative: items.filter(i => i.sentiment === 'negative').length,
        very_negative: items.filter(i => i.sentiment === 'very_negative').length,
      };

      // Mock trend calculation - in real app, this would compare with historical data
      const trend: 'increasing' | 'stable' | 'decreasing' =
        Math.random() > 0.6 ? 'increasing' :
        Math.random() > 0.3 ? 'stable' : 'decreasing';

      return {
        name: tag,
        count: items.length,
        percentage: (items.length / feedback.length) * 100,
        sentimentBreakdown,
        trend,
        topTags: [tag], // For now, just the main tag
      };
    });

    // Sort by count descending
    return themeData.sort((a, b) => b.count - a.count);
  }, [feedback]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'very_positive': return 'bg-green-500';
      case 'positive': return 'bg-green-400';
      case 'neutral': return 'bg-gray-400';
      case 'negative': return 'bg-orange-400';
      case 'very_negative': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendLabel = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'Increasing';
      case 'decreasing': return 'Decreasing';
      default: return 'Stable';
    }
  };

  if (themes.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Tag className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Themes Yet</h3>
          <p className="text-muted-foreground">
            Themes will appear here as you add tags to feedback items.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{themes.length}</p>
                <p className="text-sm text-muted-foreground">Themes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {themes.filter(t => t.trend === 'increasing').length}
                </p>
                <p className="text-sm text-muted-foreground">Growing</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">
                  {themes.filter(t => t.trend === 'decreasing').length}
                </p>
                <p className="text-sm text-muted-foreground">Declining</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Themes List */}
      <div className="space-y-4">
        {themes.map((theme) => (
          <Card key={theme.name}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  {theme.name}
                  <Badge variant="secondary">{theme.count} items</Badge>
                </CardTitle>
                <div className="flex items-center gap-2">
                  {getTrendIcon(theme.trend)}
                  <span className="text-sm text-muted-foreground">
                    {getTrendLabel(theme.trend)}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Prevalence</span>
                  <span>{theme.percentage.toFixed(1)}%</span>
                </div>
                <Progress value={theme.percentage} className="h-2" />
              </div>

              {/* Sentiment Breakdown */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Sentiment Distribution</h4>
                <div className="flex gap-1 h-4">
                  {Object.entries(theme.sentimentBreakdown).map(([sentiment, count]) => {
                    if (count === 0) return null;
                    const percentage = (count / theme.count) * 100;
                    return (
                      <div
                        key={sentiment}
                        className={getSentimentColor(sentiment)}
                        style={{ width: `${percentage}%` }}
                        title={`${sentiment}: ${count} (${percentage.toFixed(1)}%)`}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  {Object.entries(theme.sentimentBreakdown).map(([sentiment, count]) => {
                    if (count === 0) return null;
                    return (
                      <span key={sentiment}>
                        {sentiment.replace('_', ' ')}: {count}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
                <Button variant="outline" size="sm">
                  Create Roadmap Item
                </Button>
                <Button variant="outline" size="sm">
                  Generate Insights
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
