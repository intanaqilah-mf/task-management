import React from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useTaskStore } from '@/stores/taskStore';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { TaskStatus, TaskPriority } from '@/types';
import { LayoutDashboard, CheckSquare, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);
  const { tasks, filters, setFilters, clearFilters } = useTaskStore();

  const taskCounts = {
    all: tasks.length,
    todo: tasks.filter((t) => t.status === TaskStatus.TODO).length,
    inProgress: tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length,
    completed: tasks.filter((t) => t.status === TaskStatus.COMPLETED).length,
    high: tasks.filter((t) => t.priority === TaskPriority.HIGH || t.priority === TaskPriority.URGENT).length,
  };

  const filterByStatus = (status: TaskStatus) => {
    if (filters.status?.includes(status)) {
      clearFilters();
    } else {
      setFilters({ status: [status] });
    }
  };

  const navItems = [
    {
      icon: LayoutDashboard,
      label: 'All Tasks',
      count: taskCounts.all,
      onClick: () => clearFilters(),
      active: !filters.status?.length,
    },
    {
      icon: CheckSquare,
      label: 'To Do',
      count: taskCounts.todo,
      onClick: () => filterByStatus(TaskStatus.TODO),
      active: filters.status?.includes(TaskStatus.TODO),
    },
    {
      icon: Clock,
      label: 'In Progress',
      count: taskCounts.inProgress,
      onClick: () => filterByStatus(TaskStatus.IN_PROGRESS),
      active: filters.status?.includes(TaskStatus.IN_PROGRESS),
    },
    {
      icon: CheckCircle2,
      label: 'Completed',
      count: taskCounts.completed,
      onClick: () => filterByStatus(TaskStatus.COMPLETED),
      active: filters.status?.includes(TaskStatus.COMPLETED),
    },
    {
      icon: AlertCircle,
      label: 'High Priority',
      count: taskCounts.high,
      onClick: () => setFilters({ priority: [TaskPriority.HIGH, TaskPriority.URGENT] }),
      active: filters.priority?.includes(TaskPriority.HIGH),
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-background transition-transform duration-300 md:sticky md:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <nav className="flex flex-col gap-2 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={item.onClick}
                className={cn(
                  'flex items-center justify-between w-full px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  item.active
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </div>
                <Badge
                  variant={item.active ? 'secondary' : 'outline'}
                  className="ml-auto"
                >
                  {item.count}
                </Badge>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
