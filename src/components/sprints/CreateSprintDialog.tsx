import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { Sprint, SprintStatus } from '@/types/sprint';
import DateRangePicker from '@/components/shared/DateRangePicker';
import { DateRange } from 'react-day-picker';

interface CreateSprintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (sprint: Omit<Sprint, 'id' | 'created_at'>) => Promise<void>;
  initialData?: Sprint;
  projectId: string;
}

const CreateSprintDialog: React.FC<CreateSprintDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  projectId,
}) => {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setGoal(initialData.goal || '');
      if (initialData.start_date && initialData.end_date) {
        setDateRange({
          from: new Date(initialData.start_date),
          to: new Date(initialData.end_date),
        });
      }
    } else {
      setName('');
      setGoal('');
      setDateRange(undefined);
    }
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const sprintData: Omit<Sprint, 'id' | 'created_at'> = {
        project_id: projectId,
        name: name.trim(),
        goal: goal.trim() || undefined,
        status: (initialData?.status || 'planned') as SprintStatus,
        start_date: dateRange?.from?.toISOString(),
        end_date: dateRange?.to?.toISOString(),
      };

      await onSubmit(sprintData);
      
      // Reset form
      if (!initialData) {
        setName('');
        setGoal('');
        setDateRange(undefined);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Sprint' : 'Create New Sprint'}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? 'Update sprint details and timeline.'
              : 'Create a new sprint to organize your work.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Sprint Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sprint 1"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="goal">Sprint Goal (Optional)</Label>
              <Textarea
                id="goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="What do you want to achieve in this sprint?"
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label>Date Range (Optional)</Label>
              <DateRangePicker
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                placeholder="Select sprint dates"
              />
              <p className="text-xs text-muted-foreground">
                Dates can be set when starting the sprint
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? 'Save Changes' : 'Create Sprint'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSprintDialog;
