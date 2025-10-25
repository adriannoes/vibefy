import { Task, TaskStatus } from "@/types/task";
import TaskCard from "./TaskCard";

interface KanbanColumnProps {
  status: TaskStatus;
  label: string;
  count: number;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskStatusChange: (taskId: string, updates: Partial<Task>) => void;
}

const KanbanColumn = ({
  label,
  count,
  tasks,
  onTaskClick,
}: KanbanColumnProps) => {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            {label}
          </h2>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
            {count}
          </span>
        </div>
      </div>
      
      <div className="flex-1 space-y-3 rounded-lg bg-muted/30 p-3 min-h-[400px]">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => onTaskClick(task)}
          />
        ))}
      </div>
    </div>
  );
};

export default KanbanColumn;
