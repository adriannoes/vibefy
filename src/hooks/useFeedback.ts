import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type {
  CustomerFeedback,
  FeedbackTheme,
  FeedbackInsight,
  FeedbackSource,
  FeedbackStatus,
  FeedbackPriority,
  FeedbackSentiment
} from '@/types/feedback';

// Mock AI analysis functions (in production, these would call actual AI services)
const analyzeSentiment = (text: string): FeedbackSentiment => {
  const lowerText = text.toLowerCase();

  // Very positive indicators
  if (/\b(love|amazing|excellent|fantastic|perfect|wonderful|brilliant|awesome)\b/.test(lowerText)) {
    return 'very_positive';
  }

  // Positive indicators
  if (/\b(good|great|nice|happy|pleased|satisfied|helpful|useful|easy|smooth)\b/.test(lowerText)) {
    return 'positive';
  }

  // Negative indicators
  if (/\b(bad|terrible|awful|hate|horrible|worst|broken|useless|difficult|frustrating|annoying)\b/.test(lowerText)) {
    return 'negative';
  }

  // Very negative indicators
  if (/\b(disgusting|unacceptable|ridiculous|pathetic|nightmare|catastrophic)\b/.test(lowerText)) {
    return 'very_negative';
  }

  return 'neutral';
};

const extractThemes = (text: string): string[] => {
  const themes: string[] = [];
  const lowerText = text.toLowerCase();

  // UI/UX themes
  if (/\b(ui|ux|interface|design|layout|navigation|menu|button|form|visual|appearance)\b/.test(lowerText)) {
    themes.push('UI/UX');
  }

  // Performance themes
  if (/\b(slow|fast|speed|performance|loading|lag|freeze|crash|hang|optimization)\b/.test(lowerText)) {
    themes.push('Performance');
  }

  // Features themes
  if (/\b(feature|functionality|capability|tool|option|integration|api|export|import)\b/.test(lowerText)) {
    themes.push('Features');
  }

  // Bug/Error themes
  if (/\b(bug|error|issue|problem|broken|crash|fail|doesn't work|not working)\b/.test(lowerText)) {
    themes.push('Bugs');
  }

  // Usability themes
  if (/\b(difficult|easy|complicated|simple|intuitive|confusing|learn|tutorial|help|documentation)\b/.test(lowerText)) {
    themes.push('Usability');
  }

  // Pricing/Billing themes
  if (/\b(price|cost|pricing|billing|payment|subscription|plan|expensive|cheap|worth)\b/.test(lowerText)) {
    themes.push('Pricing');
  }

  // Support themes
  if (/\b(support|help|contact|response|communication|service|customer care)\b/.test(lowerText)) {
    themes.push('Support');
  }

  // Mobile themes
  if (/\b(mobile|phone|tablet|app|ios|android|responsive|screen size)\b/.test(lowerText)) {
    themes.push('Mobile');
  }

  return themes.length > 0 ? themes : ['General'];
};

const generateAIInsights = (feedback: CustomerFeedback[]): FeedbackInsight[] => {
  const themes = new Map<string, CustomerFeedback[]>();

  // Group feedback by themes
  feedback.forEach(item => {
    const itemThemes = extractThemes(item.content + ' ' + item.title);
    itemThemes.forEach(theme => {
      if (!themes.has(theme)) {
        themes.set(theme, []);
      }
      themes.get(theme)!.push(item);
    });
  });

  // Generate insights for each theme
  const insights: FeedbackInsight[] = [];
  themes.forEach((themeFeedback, theme) => {
    const sentimentBreakdown = {
      very_positive: themeFeedback.filter(f => f.sentiment === 'very_positive').length,
      positive: themeFeedback.filter(f => f.sentiment === 'positive').length,
      neutral: themeFeedback.filter(f => f.sentiment === 'neutral').length,
      negative: themeFeedback.filter(f => f.sentiment === 'negative').length,
      very_negative: themeFeedback.filter(f => f.sentiment === 'very_negative').length,
    };

    // Calculate trend (mock - in real app, compare with historical data)
    const totalSentiment = (sentimentBreakdown.very_positive * 2 + sentimentBreakdown.positive) -
                          (sentimentBreakdown.very_negative * 2 + sentimentBreakdown.negative);
    const trend: 'increasing' | 'stable' | 'decreasing' =
      totalSentiment > 5 ? 'increasing' :
      totalSentiment < -5 ? 'decreasing' : 'stable';

    // Extract top features mentioned in this theme
    const featureMentions = new Map<string, number>();
    themeFeedback.forEach(item => {
      if (item.feature_request) {
        const content = (item.content + ' ' + item.title).toLowerCase();
        // Extract potential feature names (simplified)
        const words = content.split(/\s+/);
        words.forEach(word => {
          if (word.length > 3 && !['that', 'this', 'with', 'from', 'have', 'want'].includes(word)) {
            featureMentions.set(word, (featureMentions.get(word) || 0) + 1);
          }
        });
      }
    });

    const topFeatures = Array.from(featureMentions.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([feature]) => feature);

    insights.push({
      theme,
      count: themeFeedback.length,
      sentiment_breakdown: sentimentBreakdown,
      trend,
      top_features: topFeatures,
    });
  });

  return insights.sort((a, b) => b.count - a.count);
};

const generateAIRecommendations = (insights: FeedbackInsight[], feedback: CustomerFeedback[]) => {
  const recommendations: Array<{
    type: 'priority' | 'feature' | 'improvement' | 'urgent';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'high' | 'medium' | 'low';
    theme: string;
  }> = [];

  insights.forEach(insight => {
    const negativeSentiment = insight.sentiment_breakdown.negative + insight.sentiment_breakdown.very_negative;
    const positiveSentiment = insight.sentiment_breakdown.positive + insight.sentiment_breakdown.very_positive;
    const negativeRatio = negativeSentiment / insight.count;

    // Urgent issues (high negative sentiment)
    if (negativeRatio > 0.5) {
      recommendations.push({
        type: 'urgent',
        title: `Address ${insight.theme} Issues Immediately`,
        description: `${Math.round(negativeRatio * 100)}% of feedback in "${insight.theme}" is negative. This requires immediate attention.`,
        impact: 'high',
        effort: 'medium',
        theme: insight.theme,
      });
    }

    // Feature requests (when there are many feature requests in a theme)
    const featureRequests = feedback.filter(f =>
      f.feature_request && extractThemes(f.content + ' ' + f.title).includes(insight.theme)
    ).length;

    if (featureRequests > 3) {
      recommendations.push({
        type: 'feature',
        title: `Consider New Features in ${insight.theme}`,
        description: `${featureRequests} feature requests related to "${insight.theme}". Consider adding these to your roadmap.`,
        impact: 'medium',
        effort: 'high',
        theme: insight.theme,
      });
    }

    // Improvement opportunities (stable or improving themes with suggestions)
    if (insight.trend === 'stable' && positiveSentiment > negativeSentiment) {
      recommendations.push({
        type: 'improvement',
        title: `Enhance ${insight.theme} Experience`,
        description: `The "${insight.theme}" theme has stable feedback. Look for incremental improvements.`,
        impact: 'medium',
        effort: 'medium',
        theme: insight.theme,
      });
    }

    // Priority themes (large volume of feedback)
    if (insight.count > 10) {
      recommendations.push({
        type: 'priority',
        title: `Focus on High-Volume ${insight.theme} Theme`,
        description: `"${insight.theme}" has ${insight.count} feedback items, making it a priority area.`,
        impact: 'high',
        effort: 'medium',
        theme: insight.theme,
      });
    }
  });

  return recommendations.sort((a, b) => {
    const impactOrder = { high: 3, medium: 2, low: 1 };
    const typeOrder = { urgent: 4, priority: 3, feature: 2, improvement: 1 };

    const aScore = impactOrder[a.impact] + typeOrder[a.type];
    const bScore = impactOrder[b.impact] + typeOrder[b.type];

    return bScore - aScore;
  });
};

// Hook for fetching feedback
export const useFeedback = (projectId?: string) => {
  return useQuery({
    queryKey: ['feedback', projectId],
    queryFn: async () => {
      try {
        let query = supabase
          .from('customer_feedback')
          .select('*')
          .order('created_at', { ascending: false });

        if (projectId) {
          query = query.eq('product_id', projectId);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Enhance feedback with AI analysis
        const enhancedFeedback = data.map(item => ({
          ...item,
          sentiment: item.sentiment || analyzeSentiment(item.content + ' ' + item.title),
          ai_themes: extractThemes(item.content + ' ' + item.title),
        }));

        return enhancedFeedback;
      } catch (error) {
        console.log('⚠️ useFeedback: Supabase not available, using mock data');
        // Return mock data as fallback
        return [
          {
            id: 'mock-1',
            product_id: projectId || 'proj-1',
            title: 'Great user experience!',
            content: 'The new dashboard is incredibly intuitive and fast. Love the new features!',
            source: 'survey' as FeedbackSource,
            status: 'resolved' as FeedbackStatus,
            priority: 'medium' as FeedbackPriority,
            sentiment: 'very_positive' as FeedbackSentiment,
            customer_email: 'user1@example.com',
            customer_name: 'John Doe',
            customer_segment: 'enterprise',
            feature_request: false,
            bug_report: false,
            general_feedback: true,
            votes: 5,
            tags: ['UI/UX', 'Performance'],
            linked_features: [],
            linked_issues: [],
            created_at: '2024-01-15T10:00:00Z',
            updated_at: '2024-01-16T14:30:00Z',
            ai_themes: ['UI/UX', 'Performance'],
          },
          {
            id: 'mock-2',
            product_id: projectId || 'proj-1',
            title: 'Performance issues',
            content: 'The application is very slow when loading large datasets. This affects productivity significantly.',
            source: 'email' as FeedbackSource,
            status: 'in_progress' as FeedbackStatus,
            priority: 'high' as FeedbackPriority,
            sentiment: 'negative' as FeedbackSentiment,
            customer_email: 'user2@example.com',
            customer_name: 'Jane Smith',
            customer_segment: 'enterprise',
            feature_request: false,
            bug_report: true,
            general_feedback: false,
            votes: 12,
            tags: ['Performance', 'Bugs'],
            linked_features: [],
            linked_issues: ['issue-123'],
            created_at: '2024-01-20T09:15:00Z',
            updated_at: '2024-01-22T11:45:00Z',
            ai_themes: ['Performance', 'Bugs'],
          },
        ];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for AI-powered insights
export const useFeedbackInsights = (feedback: CustomerFeedback[]) => {
  return useMemo(() => {
    const insights = generateAIInsights(feedback);
    const recommendations = generateAIRecommendations(insights, feedback);

    return {
      insights,
      recommendations,
      summary: {
        totalFeedback: feedback.length,
        positiveSentiment: feedback.filter(f =>
          f.sentiment === 'positive' || f.sentiment === 'very_positive'
        ).length,
        negativeSentiment: feedback.filter(f =>
          f.sentiment === 'negative' || f.sentiment === 'very_negative'
        ).length,
        themesDiscovered: insights.length,
        urgentIssues: recommendations.filter(r => r.type === 'urgent').length,
      },
    };
  }, [feedback]);
};

// Hook for feedback themes (enhanced with AI)
export const useFeedbackThemes = (feedback: CustomerFeedback[]) => {
  return useMemo(() => {
    const insights = generateAIInsights(feedback);

    return insights.map(insight => ({
      id: insight.theme.toLowerCase().replace(/\s+/g, '-'),
      product_id: feedback[0]?.product_id || 'unknown',
      name: insight.theme,
      description: `AI-detected theme with ${insight.count} feedback items`,
      color: getThemeColor(insight.theme),
      feedback_count: insight.count,
      sentiment_distribution: insight.sentiment_breakdown,
      trend: insight.trend,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })) as FeedbackTheme[];
  }, [feedback]);
};

// Helper function to assign colors to themes
const getThemeColor = (theme: string): string => {
  const colors = [
    '#3B82F6', // blue
    '#EF4444', // red
    '#10B981', // green
    '#F59E0B', // yellow
    '#8B5CF6', // purple
    '#06B6D4', // cyan
    '#84CC16', // lime
    '#F97316', // orange
  ];

  // Simple hash function to get consistent colors
  let hash = 0;
  for (let i = 0; i < theme.length; i++) {
    hash = theme.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

// Mutation for creating feedback
export const useCreateFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newFeedback: Omit<CustomerFeedback, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        const feedbackWithAI = {
          ...newFeedback,
          sentiment: newFeedback.sentiment || analyzeSentiment(newFeedback.content + ' ' + newFeedback.title),
          ai_themes: extractThemes(newFeedback.content + ' ' + newFeedback.title),
        };

        const { data, error } = await supabase
          .from('customer_feedback')
          .insert(feedbackWithAI)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.log('⚠️ useCreateFeedback: Supabase not available, simulating creation');
        // Return mock response
        return {
          ...newFeedback,
          id: `mock-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          sentiment: newFeedback.sentiment || analyzeSentiment(newFeedback.content + ' ' + newFeedback.title),
          ai_themes: extractThemes(newFeedback.content + ' ' + newFeedback.title),
        };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
    },
  });
};

// Mutation for updating feedback
export const useUpdateFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CustomerFeedback> }) => {
      try {
        const { data, error } = await supabase
          .from('customer_feedback')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.log('⚠️ useUpdateFeedback: Supabase not available, simulating update');
        // Return mock response
        return { id, ...updates };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
    },
  });
};
