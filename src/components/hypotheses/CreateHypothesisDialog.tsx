import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb, Plus, X, CheckCircle } from 'lucide-react';
import { Hypothesis, HypothesisType, HypothesisStatus, HypothesisPriority, HYPOTHESIS_TEMPLATES } from '@/types/hypothesis';

interface CreateHypothesisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (hypothesis: Omit<Hypothesis, 'id' | 'created_at' | 'updated_at' | 'experiments'>) => void;
}

const hypothesisTypes: { value: HypothesisType; label: string; description: string }[] = [
  {
    value: 'problem_validation',
    label: 'Problem Validation',
    description: 'Validate that a real problem exists for your target customers'
  },
  {
    value: 'solution_validation',
    label: 'Solution Validation',
    description: 'Validate that your proposed solution actually solves the problem'
  },
  {
    value: 'market_validation',
    label: 'Market Validation',
    description: 'Validate market demand and opportunity size'
  },
  {
    value: 'technical_validation',
    label: 'Technical Validation',
    description: 'Validate technical feasibility and constraints'
  },
];

const priorities: { value: HypothesisPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

export const CreateHypothesisDialog: React.FC<CreateHypothesisDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
}) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'template'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'solution_validation' as HypothesisType,
    status: 'draft' as HypothesisStatus,
    priority: 'medium' as HypothesisPriority,
    problem_statement: '',
    solution_statement: '',
    expected_outcome: '',
    success_criteria: [''],
    confidence_level: 5,
    risk_level: 5,
    effort_estimate: 8,
  });

  const handleTemplateSelect = (templateId: string) => {
    const template = HYPOTHESIS_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setFormData(prev => ({
        ...prev,
        type: template.type,
        problem_statement: template.template.problem_statement,
        solution_statement: template.template.solution_statement,
        success_criteria: [...template.template.success_criteria],
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.problem_statement.trim() || !formData.solution_statement.trim()) {
      return;
    }

    // Filter out empty success criteria
    const filteredCriteria = formData.success_criteria.filter(criteria => criteria.trim());

    onSubmit({
      product_id: '1', // Default product - in real app this would be dynamic
      ...formData,
      success_criteria: filteredCriteria,
      created_by: 'current-user', // In real app, get from auth context
    });

    // Reset form
    setFormData({
      title: '',
      description: '',
      type: 'solution_validation',
      status: 'draft',
      priority: 'medium',
      problem_statement: '',
      solution_statement: '',
      expected_outcome: '',
      success_criteria: [''],
      confidence_level: 5,
      risk_level: 5,
      effort_estimate: 8,
    });
    setSelectedTemplate(null);
    setActiveTab('template');

    onOpenChange(false);
  };

  const addSuccessCriterion = () => {
    setFormData(prev => ({
      ...prev,
      success_criteria: [...prev.success_criteria, ''],
    }));
  };

  const updateSuccessCriterion = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      success_criteria: prev.success_criteria.map((criteria, i) =>
        i === index ? value : criteria
      ),
    }));
  };

  const removeSuccessCriterion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      success_criteria: prev.success_criteria.filter((_, i) => i !== index),
    }));
  };

  const getConfidenceColor = (level: number) => {
    if (level >= 8) return 'text-green-600';
    if (level >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskColor = (level: number) => {
    if (level <= 3) return 'text-green-600';
    if (level <= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Create New Hypothesis
          </DialogTitle>
          <DialogDescription>
            Define a hypothesis to test your assumptions through scientific experimentation.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'manual' | 'template')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="template">Use Template</TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <TabsContent value="template" className="space-y-4">
              <div>
                <Label className="text-base font-medium">Choose a Template</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {HYPOTHESIS_TEMPLATES.map((template) => (
                    <Card
                      key={template.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedTemplate === template.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => handleTemplateSelect(template.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 w-3 h-3 rounded-full flex-shrink-0 ${
                            selectedTemplate === template.id ? 'bg-primary' : 'bg-muted'
                          }`} />
                          <div className="flex-1">
                            <h4 className="font-medium">{template.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {template.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="manual" className="space-y-4">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Brief hypothesis title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as HypothesisType }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {hypothesisTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-muted-foreground">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed description of the hypothesis..."
                  className="min-h-20"
                />
              </div>

              {/* Hypothesis Statements */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Hypothesis Statement</Label>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="problem">Problem Statement *</Label>
                    <Textarea
                      id="problem"
                      value={formData.problem_statement}
                      onChange={(e) => setFormData(prev => ({ ...prev, problem_statement: e.target.value }))}
                      placeholder="We believe that [target customers] are experiencing [specific problem]..."
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="solution">Solution Statement *</Label>
                    <Textarea
                      id="solution"
                      value={formData.solution_statement}
                      onChange={(e) => setFormData(prev => ({ ...prev, solution_statement: e.target.value }))}
                      placeholder="We will know we are right when [proposed solution] achieves [specific outcome]..."
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="outcome">Expected Outcome</Label>
                    <Textarea
                      id="outcome"
                      value={formData.expected_outcome}
                      onChange={(e) => setFormData(prev => ({ ...prev, expected_outcome: e.target.value }))}
                      placeholder="What measurable outcome do you expect to see?"
                    />
                  </div>
                </div>
              </div>

              {/* Success Criteria */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Success Criteria</Label>
                {formData.success_criteria.map((criteria, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={criteria}
                      onChange={(e) => updateSuccessCriterion(index, e.target.value)}
                      placeholder="Define what success looks like..."
                      className="flex-1"
                    />
                    {formData.success_criteria.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeSuccessCriterion(index)}
                        className="flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addSuccessCriterion}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Success Criterion
                </Button>
              </div>

              {/* Assessment Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label>Confidence Level (1-10)</Label>
                  <div className="space-y-2">
                    <Slider
                      value={[formData.confidence_level]}
                      onValueChange={([value]) => setFormData(prev => ({ ...prev, confidence_level: value }))}
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm">
                      <span>Low</span>
                      <span className={`font-medium ${getConfidenceColor(formData.confidence_level)}`}>
                        {formData.confidence_level}/10
                      </span>
                      <span>High</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Risk Level (1-10)</Label>
                  <div className="space-y-2">
                    <Slider
                      value={[formData.risk_level]}
                      onValueChange={([value]) => setFormData(prev => ({ ...prev, risk_level: value }))}
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm">
                      <span>Low</span>
                      <span className={`font-medium ${getRiskColor(formData.risk_level)}`}>
                        {formData.risk_level}/10
                      </span>
                      <span>High</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Effort Estimate (Story Points)</Label>
                  <div className="space-y-2">
                    <Slider
                      value={[formData.effort_estimate]}
                      onValueChange={([value]) => setFormData(prev => ({ ...prev, effort_estimate: value }))}
                      max={21}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="text-center">
                      <span className="font-medium text-lg">{formData.effort_estimate}</span>
                      <span className="text-sm text-muted-foreground ml-1">points</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as HypothesisPriority }))}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Create Hypothesis
              </Button>
            </DialogFooter>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
