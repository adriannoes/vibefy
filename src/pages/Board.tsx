import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import KanbanColumn from "@/components/KanbanColumn";
import TaskDialog from "@/components/TaskDialog";
import { Task, TaskStatus } from "@/types/task";

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Set up project structure",
    description: "Initialize the project with all necessary configurations",
    status: "done",
    priority: "high",
    createdAt: new Date().toISOString()
  },
  {
    id: "2",
    title: "Design kanban board UI",
    description: "Create mockups for the main board interface",
    status: "in-progress",
    priority: "high",
    createdAt: new Date().toISOString()
  },
  {
    id: "3",
    title: "Implement drag and drop",
    description: "Add drag and drop functionality to task cards",
    status: "todo",
    priority: "medium",
    createdAt: new Date().toISOString()
  },
  {
    id: "4",
    title: "Add task filtering",
    description: "Implement filters for tasks by priority and assignee",
    status: "backlog",
    priority: "low",
    createdAt: new Date().toISOString()
  }
];

const Board = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();

  const columns: { status: TaskStatus; label: string; count: number }[] = [
    { status: "backlog", label: "Backlog", count: tasks.filter(t => t.status === "backlog").length },
    { status: "todo", label: "To Do", count: tasks.filter(t => t.status === "todo").length },
    { status: "in-progress", label: "In Progress", count: tasks.filter(t => t.status === "in-progress").length },
    { status: "done", label: "Done", count: tasks.filter(t => t.status === "done").length }
  ];

  const handleCreateTask = (task: Omit<Task, "id" | "createdAt">) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setTasks([...tasks, newTask]);
    setIsDialogOpen(false);
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, ...updates } : t));
    setEditingTask(undefined);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    setEditingTask(undefined);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                Vibefy
              </span>
            </Link>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </div>
        </div>
      </header>

      {/* Board */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Project Board</h1>
          <p className="text-muted-foreground">
            Manage your tasks and track progress
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((column) => (
            <KanbanColumn
              key={column.status}
              status={column.status}
              label={column.label}
              count={column.count}
              tasks={tasks.filter(t => t.status === column.status)}
              onTaskClick={handleEditTask}
              onTaskStatusChange={handleUpdateTask}
            />
          ))}
        </div>
      </main>

      <TaskDialog
        open={isDialogOpen || !!editingTask}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingTask(undefined);
        }}
        onSubmit={editingTask ? 
          (task) => handleUpdateTask(editingTask.id, task) : 
          handleCreateTask
        }
        onDelete={editingTask ? () => handleDeleteTask(editingTask.id) : undefined}
        initialData={editingTask}
      />
    </div>
  );
};

export default Board;
