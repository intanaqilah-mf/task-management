import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TaskStatus, TaskPriority, type Task } from '@/types';
import { formatRelativeTime, isOverdue } from '@/utils/format';
import { Edit, Trash2, Calendar, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const getStatusColor = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.TODO:
      return 'default';
    case TaskStatus.IN_PROGRESS:
      return 'warning';
    case TaskStatus.COMPLETED:
      return 'success';
    default:
      return 'default';
  }
};

const getPriorityColor = (priority: TaskPriority) => {
  switch (priority) {
    case TaskPriority.LOW:
      return 'secondary';
    case TaskPriority.MEDIUM:
      return 'default';
    case TaskPriority.HIGH:
      return 'warning';
    case TaskPriority.URGENT:
      return 'destructive';
    default:
      return 'default';
  }
};

const formatStatus = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.TODO:
      return 'To Do';
    case TaskStatus.IN_PROGRESS:
      return 'In Progress';
    case TaskStatus.COMPLETED:
      return 'Completed';
  }
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {
  const isDueDateOverdue = task.dueDate && isOverdue(task.dueDate);

  return (
    <Card className={cn(
      'transition-all hover:shadow-md',
      task.status === TaskStatus.COMPLETED && 'opacity-75'
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className={cn(
            'text-lg font-semibold flex-1',
            task.status === TaskStatus.COMPLETED && 'line-through text-muted-foreground'
          )}>
            {task.title}
          </h3>
          <div className="flex gap-2">
            <Badge variant={getStatusColor(task.status)}>
              {formatStatus(task.status)}
            </Badge>
            <Badge variant={getPriorityColor(task.priority)}>
              {task.priority}
            </Badge>
          </div>
        </div>
      </CardHeader>

      {task.description && (
        <CardContent className="pb-3">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        </CardContent>
      )}

      <CardFooter className="flex flex-col sm:flex-row justify-between gap-3">
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {task.category && (
            <div className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              <span>{task.category}</span>
            </div>
          )}
          {task.dueDate && (
            <div className={cn(
              'flex items-center gap-1',
              isDueDateOverdue && 'text-destructive font-medium'
            )}>
              <Calendar className="h-3 w-3" />
              <span>{formatRelativeTime(task.dueDate)}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(task)}
          >
            <Edit className="h-4 w-4" />
            <span className="ml-1 hidden sm:inline">Edit</span>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(task)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="ml-1 hidden sm:inline">Delete</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
