import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, Target, Users, Zap, CheckCircle, ArrowRight } from 'lucide-react';
import { HYPOTHESIS_TEMPLATES } from '@/types/hypothesis';

interface HypothesisTemplatesProps {
  onSelectTemplate: () => void;
}

const templateIcons = {
  problem_validation: Target,
  solution_validation: CheckCircle,
  market_validation: Users,
  technical_validation: Zap,
};

export const HypothesisTemplates: React.FC<HypothesisTemplatesProps> = ({
  onSelectTemplate
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Lightbulb className="h-12 w-12 mx-auto text-primary" />
        <h2 className="text-2xl font-bold">Hypothesis Templates</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Get started quickly with proven hypothesis templates. Each template provides a structured framework
          for testing different types of assumptions about your product and market.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {HYPOTHESIS_TEMPLATES.map((template) => {
          const Icon = templateIcons[template.type];

          return (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {template.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  {template.description}
                </p>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm mb-1">Problem Statement Template:</h4>
                    <div className="text-sm text-muted-foreground bg-muted p-3 rounded border-l-2 border-primary/20">
                      {template.template.problem_statement}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-1">Solution Statement Template:</h4>
                    <div className="text-sm text-muted-foreground bg-muted p-3 rounded border-l-2 border-primary/20">
                      {template.template.solution_statement}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-2">Success Criteria:</h4>
                    <ul className="space-y-1">
                      {template.template.success_criteria.map((criteria, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{criteria}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Button
                  onClick={onSelectTemplate}
                  className="w-full"
                  variant="outline"
                >
                  Use This Template
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-muted/50 rounded-lg p-6 text-center">
        <h3 className="font-semibold mb-2">Need a Custom Template?</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Don't see a template that fits your needs? You can always create a hypothesis manually
          or contact us to suggest new templates for the community.
        </p>
        <Button variant="outline" onClick={onSelectTemplate}>
          Create Custom Hypothesis
        </Button>
      </div>
    </div>
  );
};
