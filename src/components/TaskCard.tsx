import { Task } from "@/types/task";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, ArrowUp, Minus } from "lucide-react";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

const TaskCard = ({ task, onClick }: TaskCardProps) => {
  const getPriorityIcon = () => {
    switch (task.priority) {
      case "high":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case "medium":
        return <ArrowUp className="h-4 w-4 text-orange-500" />;
      case "low":
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPriorityColor = () => {
    switch (task.priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
    }
  };

  return (
    <Card
      className="p-4 cursor-pointer transition-all hover:shadow-md hover:border-primary/50 group"
      onClick={onClick}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium leading-tight group-hover:text-primary transition-colors">
            {task.title}
          </h3>
          {getPriorityIcon()}
        </div>
        
        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center gap-2">
          <Badge variant={getPriorityColor()} className="text-xs">
            {task.priority}
          </Badge>
        </div>
      </div>
    </Card>
  );
};

export default TaskCard;
