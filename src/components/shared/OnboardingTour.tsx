import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, ChevronLeft, ChevronRight, SkipForward, Check } from 'lucide-react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { cn } from '@/lib/utils';

interface OnboardingTourProps {
  children?: React.ReactNode;
}

interface SpotlightProps {
  target: Element;
  padding?: number;
}

const Spotlight: React.FC<SpotlightProps> = ({ target, padding = 8 }) => {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const updateRect = () => {
      const elementRect = target.getBoundingClientRect();
      setRect(elementRect);
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect);

    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
    };
  }, [target]);

  if (!rect) return null;

  const spotlightStyle = {
    position: 'fixed' as const,
    top: rect.top - padding,
    left: rect.left - padding,
    width: rect.width + (padding * 2),
    height: rect.height + (padding * 2),
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    border: '2px solid rgb(59, 130, 246)',
    borderRadius: '8px',
    zIndex: 9998,
    pointerEvents: 'none' as const,
  };

  return createPortal(<div style={spotlightStyle} />, document.body);
};

interface TooltipProps {
  step: {
    title: string;
    content: string;
    placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
    disableInteraction?: boolean;
    hideCloseButton?: boolean;
    hideFooter?: boolean;
  };
  target: Element | null;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onClose: () => void;
  stepIndex: number;
  totalSteps: number;
  canGoPrev: boolean;
}

const Tooltip: React.FC<TooltipProps> = ({
  step,
  target,
  onNext,
  onPrev,
  onSkip,
  onClose,
  stepIndex,
  totalSteps,
  canGoPrev,
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!target) return;

    const updatePosition = () => {
      const rect = target.getBoundingClientRect();
      let top = 0;
      let left = 0;

      switch (step.placement) {
        case 'top':
          top = rect.top - 10;
          left = rect.left + rect.width / 2;
          break;
        case 'bottom':
          top = rect.bottom + 10;
          left = rect.left + rect.width / 2;
          break;
        case 'left':
          top = rect.top + rect.height / 2;
          left = rect.left - 10;
          break;
        case 'right':
          top = rect.top + rect.height / 2;
          left = rect.right + 10;
          break;
        case 'center':
          top = window.innerHeight / 2;
          left = window.innerWidth / 2;
          break;
      }

      setPosition({ top, left });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [target, step.placement]);

  const tooltipContent = (
    <Card
      className={cn(
        "max-w-sm shadow-lg border-2 border-blue-200 dark:border-blue-800",
        step.placement === 'center' && "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[10000]"
      )}
      style={step.placement !== 'center' ? {
        position: 'fixed',
        top: position.top,
        left: position.left,
        transform: step.placement === 'center' ? 'none' : 'translateX(-50%)',
        zIndex: 9999,
      } : undefined}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {step.title}
            <Badge variant="secondary" className="text-xs">
              {stepIndex + 1} of {totalSteps}
            </Badge>
          </CardTitle>
          {!step.hideCloseButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {step.content}
        </p>

        {!step.hideFooter && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {canGoPrev && (
                <Button variant="outline" size="sm" onClick={onPrev}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={onSkip}>
                <SkipForward className="h-4 w-4 mr-1" />
                Skip Tour
              </Button>
            </div>
            <Button onClick={onNext}>
              {stepIndex === totalSteps - 1 ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Finish
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return createPortal(tooltipContent, document.body);
};

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ children }) => {
  const {
    currentStep,
    currentStepIndex,
    isActive,
    totalSteps,
    nextStep,
    prevStep,
    skipTour,
    stopTour,
  } = useOnboarding();

  const [targetElement, setTargetElement] = useState<Element | null>(null);

  useEffect(() => {
    if (!currentStep || !isActive) {
      setTargetElement(null);
      return;
    }

    const element = document.querySelector(currentStep.target);
    setTargetElement(element);
  }, [currentStep, isActive]);

  useEffect(() => {
    if (isActive && currentStep?.disableInteraction) {
      document.body.style.pointerEvents = 'none';
      // Allow interaction with the tooltip
      const tooltip = document.querySelector('[data-radix-popper-content-wrapper]');
      if (tooltip) {
        (tooltip as HTMLElement).style.pointerEvents = 'auto';
      }
    } else {
      document.body.style.pointerEvents = '';
    }

    return () => {
      document.body.style.pointerEvents = '';
    };
  }, [isActive, currentStep?.disableInteraction]);

  if (!isActive || !currentStep || !targetElement) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 z-[9997]"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Spotlight */}
      {currentStep.placement !== 'center' && <Spotlight target={targetElement} />}

      {/* Tooltip */}
      <Tooltip
        step={currentStep}
        target={targetElement}
        onNext={nextStep}
        onPrev={prevStep}
        onSkip={skipTour}
        onClose={stopTour}
        stepIndex={currentStepIndex}
        totalSteps={totalSteps}
        canGoPrev={currentStepIndex > 0}
      />

      {children}
    </>
  );
};
