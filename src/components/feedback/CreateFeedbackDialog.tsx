import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { CustomerFeedback, FeedbackSource, FeedbackStatus, FeedbackPriority, FeedbackSentiment } from '@/types/feedback';

interface CreateFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (feedback: Omit<CustomerFeedback, 'id' | 'created_at' | 'updated_at' | 'votes'>) => void;
}

const feedbackSources: { value: FeedbackSource; label: string }[] = [
  { value: 'manual', label: 'Manual Entry' },
  { value: 'email', label: 'Email' },
  { value: 'intercom', label: 'Intercom' },
  { value: 'zendesk', label: 'Zendesk' },
  { value: 'slack', label: 'Slack' },
  { value: 'survey', label: 'Survey' },
  { value: 'api', label: 'API' },
];

const feedbackStatuses: { value: FeedbackStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'in_review', label: 'In Review' },
  { value: 'acknowledged', label: 'Acknowledged' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const feedbackPriorities: { value: FeedbackPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const feedbackSentiments: { value: FeedbackSentiment; label: string }[] = [
  { value: 'very_negative', label: 'Very Negative' },
  { value: 'negative', label: 'Negative' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'positive', label: 'Positive' },
  { value: 'very_positive', label: 'Very Positive' },
];

export const CreateFeedbackDialog: React.FC<CreateFeedbackDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    source: 'manual' as FeedbackSource,
    status: 'new' as FeedbackStatus,
    priority: 'medium' as FeedbackPriority,
    sentiment: 'neutral' as FeedbackSentiment,
    customer_email: '',
    customer_name: '',
    customer_segment: '',
    feature_request: false,
    bug_report: false,
    general_feedback: false,
    tags: [] as string[],
  });

  const [newTag, setNewTag] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      return;
    }

    onSubmit({
      product_id: '1', // Default product - in real app this would be dynamic
      ...formData,
      author_id: 'current-user', // In real app, get from auth context
    });

    // Reset form
    setFormData({
      title: '',
      content: '',
      source: 'manual',
      status: 'new',
      priority: 'medium',
      sentiment: 'neutral',
      customer_email: '',
      customer_name: '',
      customer_segment: '',
      feature_request: false,
      bug_report: false,
      general_feedback: false,
      tags: [],
    });

    onOpenChange(false);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Customer Feedback</DialogTitle>
          <DialogDescription>
            Capture feedback from various sources to understand customer needs and improve your product.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Brief summary of the feedback"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Select
                value={formData.source}
                onValueChange={(value) => setFormData(prev => ({ ...prev, source: value as FeedbackSource }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {feedbackSources.map((source) => (
                    <SelectItem key={source.value} value={source.value}>
                      {source.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Detailed description of the feedback..."
              className="min-h-24"
              required
            />
          </div>

          {/* Classification */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as FeedbackStatus }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {feedbackStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as FeedbackPriority }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {feedbackPriorities.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sentiment</Label>
              <Select
                value={formData.sentiment}
                onValueChange={(value) => setFormData(prev => ({ ...prev, sentiment: value as FeedbackSentiment }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {feedbackSentiments.map((sentiment) => (
                    <SelectItem key={sentiment.value} value={sentiment.value}>
                      {sentiment.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Customer Information */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer_name">Customer Name</Label>
              <Input
                id="customer_name"
                value={formData.customer_name}
                onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer_email">Customer Email</Label>
              <Input
                id="customer_email"
                type="email"
                value={formData.customer_email}
                onChange={(e) => setFormData(prev => ({ ...prev, customer_email: e.target.value }))}
                placeholder="john@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer_segment">Segment</Label>
              <Input
                id="customer_segment"
                value={formData.customer_segment}
                onChange={(e) => setFormData(prev => ({ ...prev, customer_segment: e.target.value }))}
                placeholder="Enterprise, Startup, etc."
              />
            </div>
          </div>

          {/* Feedback Types */}
          <div className="space-y-3">
            <Label>Feedback Type</Label>
            <div className="flex gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="feature_request"
                  checked={formData.feature_request}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({ ...prev, feature_request: checked as boolean }))
                  }
                />
                <Label htmlFor="feature_request" className="text-sm">Feature Request</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="bug_report"
                  checked={formData.bug_report}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({ ...prev, bug_report: checked as boolean }))
                  }
                />
                <Label htmlFor="bug_report" className="text-sm">Bug Report</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="general_feedback"
                  checked={formData.general_feedback}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({ ...prev, general_feedback: checked as boolean }))
                  }
                />
                <Label htmlFor="general_feedback" className="text-sm">General Feedback</Label>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1"
              />
              <Button type="button" onClick={addTag} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Add Feedback
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
