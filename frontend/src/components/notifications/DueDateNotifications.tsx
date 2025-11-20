import { useEffect, useState, useRef } from 'react';
import { Notification, Text, Stack } from '@mantine/core';
import { IconClock, IconAlertCircle, IconX } from '@tabler/icons-react';
import { useTasks } from '@/hooks/useTasks';
import { parseDateInMalaysiaTimezone } from '@/constants/base.constant';

interface NotificationItem {
  id: number;
  taskId: number;
  title: string;
  message: string;
  type: 'warning' | 'danger';
  icon: React.ReactNode;
}

const NOTIFICATION_KEY = 'lastNotificationTime';
const OVERDUE_INDEX_KEY = 'overdueTaskIndex';
const SESSION_SHOWN_KEY = 'notificationsShownThisSession';

export const DueDateNotifications = () => {
  const { tasks, isLoading } = useTasks();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const hasShownInitialNotifications = useRef(false);

  useEffect(() => {
    // Don't do anything if tasks are still loading
    if (isLoading) {
      return;
    }

    // Don't process if we have no tasks yet (initial load)
    if (tasks.length === 0) {
      return;
    }

    const now = new Date();
    const lastNotificationTime = localStorage.getItem(NOTIFICATION_KEY);
    const sessionShown = sessionStorage.getItem(SESSION_SHOWN_KEY);
    const isFirstLoadAfterLogin = !lastNotificationTime && !sessionShown;

    // Get all overdue tasks
    const overdueTasks = tasks.filter((task) => {
      if (!task.dueDate) return false;

      const dueDate = parseDateInMalaysiaTimezone(
        typeof task.dueDate === 'string' ? task.dueDate : task.dueDate
      );

      const timeDiff = dueDate.getTime() - now.getTime();

      // Check if task is not completed
      const completionPercent = task.subtasks && task.subtasks.length > 0
        ? Math.round((task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100)
        : 0;

      return completionPercent !== 100 && timeDiff < 0;
    });

    // On first load after login (localStorage was cleared on logout),
    // show ALL notifications once (overdue, due soon, upcoming)
    if (isFirstLoadAfterLogin && !hasShownInitialNotifications.current) {
      const newNotifications: NotificationItem[] = [];

      tasks.forEach((task) => {
        if (!task.dueDate) return;

        const dueDate = parseDateInMalaysiaTimezone(
          typeof task.dueDate === 'string' ? task.dueDate : task.dueDate
        );

        const timeDiff = dueDate.getTime() - now.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

        const completionPercent = task.subtasks && task.subtasks.length > 0
          ? Math.round((task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100)
          : 0;

        if (completionPercent === 100) return;

        // Overdue tasks
        if (timeDiff < 0) {
          newNotifications.push({
            id: Date.now() + task.id + Math.random(),
            taskId: task.id,
            title: 'Overdue Task',
            message: `"${task.title}" is overdue!`,
            type: 'danger',
            icon: <IconAlertCircle size={20} />,
          });
        }
        // Due within 24 hours
        else if (hoursDiff <= 24 && hoursDiff > 0) {
          newNotifications.push({
            id: Date.now() + task.id + Math.random(),
            taskId: task.id,
            title: 'Due Soon',
            message: `"${task.title}" is due in ${Math.round(hoursDiff)} hour${Math.round(hoursDiff) !== 1 ? 's' : ''}`,
            type: 'warning',
            icon: <IconClock size={20} />,
          });
        }
        // Due within 3 days
        else if (daysDiff <= 3 && daysDiff > 1) {
          newNotifications.push({
            id: Date.now() + task.id + Math.random(),
            taskId: task.id,
            title: 'Upcoming Deadline',
            message: `"${task.title}" is due in ${Math.ceil(daysDiff)} day${Math.ceil(daysDiff) !== 1 ? 's' : ''}`,
            type: 'warning',
            icon: <IconClock size={20} />,
          });
        }
      });

      setNotifications(newNotifications);
      localStorage.setItem(NOTIFICATION_KEY, now.getTime().toString());
      sessionStorage.setItem(SESSION_SHOWN_KEY, 'true');
      hasShownInitialNotifications.current = true;
      return;
    }

    // After first load, show overdue tasks one at a time every 3 minutes
    const showNextOverdueTask = () => {
      if (overdueTasks.length === 0) {
        setNotifications([]);
        return;
      }

      const lastTime = parseInt(localStorage.getItem(NOTIFICATION_KEY) || '0');
      const timeSinceLastNotification = now.getTime() - lastTime;

      // Only show notification if 3 minutes have passed
      if (timeSinceLastNotification >= 180000) { // 3 minutes in milliseconds
        const currentIndex = parseInt(localStorage.getItem(OVERDUE_INDEX_KEY) || '0');
        const task = overdueTasks[currentIndex % overdueTasks.length];

        if (task) {
          setNotifications([{
            id: Date.now() + task.id,
            taskId: task.id,
            title: 'Overdue Task',
            message: `"${task.title}" is overdue!`,
            type: 'danger',
            icon: <IconAlertCircle size={20} />,
          }]);

          localStorage.setItem(NOTIFICATION_KEY, now.getTime().toString());
          localStorage.setItem(OVERDUE_INDEX_KEY, ((currentIndex + 1) % overdueTasks.length).toString());
        }
      }
    };

    // Check immediately
    showNextOverdueTask();

    // Then check every minute (but only show if 3 minutes have passed)
    const interval = setInterval(showNextOverdueTask, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [tasks, isLoading]);

  const handleClose = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 9999,
        maxWidth: '400px',
        width: '100%',
      }}
    >
      <Stack gap="sm">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            icon={notification.icon}
            color={notification.type === 'danger' ? 'red' : 'orange'}
            title={notification.title}
            onClose={() => handleClose(notification.id)}
            closeButtonProps={{ icon: <IconX size={16} /> }}
            style={{
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              animation: 'slideInRight 0.3s ease-out',
            }}
          >
            <Text size="sm">{notification.message}</Text>
          </Notification>
        ))}
      </Stack>

      <style>
        {`
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};
