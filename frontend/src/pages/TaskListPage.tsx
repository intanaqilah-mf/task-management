import { useState } from 'react';
import { Container, Title, Tabs, Card, Group, Text, Badge, Stack, ActionIcon, Modal, TextInput, Textarea, Select, Divider, Button, Menu } from '@mantine/core';
import { IconClock, IconChevronLeft, IconPlus, IconTrash, IconFilter } from '@tabler/icons-react';
import { useTasks } from '@/hooks/useTasks';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BottomNav } from '@/components/layout/BottomNav';
import { CreateTaskModal } from '@/components/modals/CreateTaskModal';
import type { TaskCategory } from '@/types';
import { BASE_CONSTANTS, parseDateInMalaysiaTimezone } from '@/constants/base.constant';

interface SubTask {
  id?: number;
  title: string;
  completed?: boolean;
}

export const TaskListPage = () => {
  const { tasks, createTask, updateTask, deleteTask } = useTasks();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);

  // Helper function to get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'red';
      case 'HIGH':
        return 'orange';
      case 'MEDIUM':
        return 'yellow';
      case 'LOW':
        return 'gray';
      default:
        return 'blue';
    }
  };

  // Helper function to get category badge color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'WORK':
        return 'violet';
      case 'PERSONAL':
        return 'green';
      case 'SHOPPING':
        return 'yellow';
      case 'HEALTH':
        return 'pink';
      case 'FINANCE':
        return 'teal';
      case 'EDUCATION':
        return 'blue';
      default:
        return 'gray';
    }
  };

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<TaskCategory | ''>('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editSubTasks, setEditSubTasks] = useState<SubTask[]>([]);
  const [newSubTask, setNewSubTask] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateTask = async (taskData: any) => {
    try {
      await createTask({
        title: taskData.title,
        description: taskData.description,
        category: taskData.category,
        dueDate: taskData.dueDate,
        startTime: taskData.startTime,
        endTime: taskData.endTime,
        status: 'TODO',
        priority: 'MEDIUM',
        subtasks: taskData.subtasks || [],
      });
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleOpenEditModal = (task: any) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditCategory(task.category || '');
    setEditDueDate(task.dueDate ? (typeof task.dueDate === 'string' ? task.dueDate.split('T')[0] : task.dueDate) : '');
    setEditStartTime(task.startTime || '');
    setEditEndTime(task.endTime || '');
    setEditNotes(task.description || '');
    setEditSubTasks(task.subtasks || []);
    setIsEditModalOpen(true);
  };

  const handleAddSubTask = () => {
    if (newSubTask.trim()) {
      setEditSubTasks([...editSubTasks, { title: newSubTask, completed: false }]);
      setNewSubTask('');
    }
  };

  const handleRemoveSubTask = (index: number) => {
    setEditSubTasks(editSubTasks.filter((_, i) => i !== index));
  };

  const handleEditTask = async () => {
    if (!editingTask) return;
    setIsSubmitting(true);
    try {
      await updateTask({
        id: editingTask.id,
        title: editTitle,
        description: editNotes,
        category: (editCategory as TaskCategory) || undefined,
        dueDate: editDueDate ? `${editDueDate}T00:00:00` : undefined,
        startTime: editStartTime,
        endTime: editEndTime,
        status: editingTask.status,
        priority: editingTask.priority,
        subtasks: editSubTasks.map(st => ({
          title: st.title,
          completed: st.completed || false
        })),
      });
      setIsEditModalOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingTask(null);
    setNewSubTask('');
    setIsSubmitting(false);
  };

  const handleDeleteTask = async (taskId: number) => {
    setTaskToDelete(taskId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (taskToDelete === null) return;
    try {
      await deleteTask(String(taskToDelete));
      setDeleteConfirmOpen(false);
      setTaskToDelete(null);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setTaskToDelete(null);
  };

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes(); // minutes since midnight

  // Get date from URL parameter or use today
  const dateParam = searchParams.get('date');
  const targetDate = dateParam ? parseDateInMalaysiaTimezone(dateParam) : new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;

  // Get tasks for the target date (from URL or today)
  const dateTasks = tasks.filter(t => {
    if (t.status === 'COMPLETED') return false;
    if (!t.dueDate) return false;
    const dueDateStr = typeof t.dueDate === 'string' ? t.dueDate.split('T')[0] : t.dueDate;
    return dueDateStr === targetDateStr;
  });

  // Apply category filter if selected
  let filteredTasks = dateTasks;
  if (category) {
    filteredTasks = filteredTasks.filter(t => t.category === category);
  }

  // Apply priority filter
  if (selectedPriority) {
    filteredTasks = filteredTasks.filter(t => t.priority === selectedPriority);
  }

  // Apply status filter
  if (selectedStatus) {
    filteredTasks = filteredTasks.filter(t => t.status === selectedStatus);
  }

  // Classify today's tasks based on time
  const dueSoon = filteredTasks.filter((t) => {
    // Tasks without time are shown in "Due Soon"
    if (!t.startTime) return true;

    // Check if it's ongoing or starting soon (within next 2 hours)
    const [startHour, startMin] = t.startTime.split(':').map(Number);
    const startTimeMinutes = startHour * 60 + startMin;

    // If task has end time, check if it's currently ongoing
    if (t.endTime) {
      const [endHour, endMin] = t.endTime.split(':').map(Number);
      const endTimeMinutes = endHour * 60 + endMin;
      // Task is ongoing if current time is between start and end
      if (currentTime >= startTimeMinutes && currentTime <= endTimeMinutes) {
        return true;
      }
    }

    // Otherwise, check if it's starting soon (within next 2 hours)
    const timeDiff = startTimeMinutes - currentTime;
    return timeDiff > 0 && timeDiff <= 120; // Within next 2 hours
  });

  const upcoming = filteredTasks.filter((t) => {
    // Tasks without time are not shown in "Upcoming"
    if (!t.startTime) return false;

    // Check if it's upcoming (more than 2 hours away)
    const [startHour, startMin] = t.startTime.split(':').map(Number);
    const startTimeMinutes = startHour * 60 + startMin;
    const timeDiff = startTimeMinutes - currentTime;
    return timeDiff > 120; // More than 2 hours away
  });

  const overdue = filteredTasks.filter((t) => {
    // Tasks without time are not shown in "Overdue"
    if (!t.endTime) return false;

    // Check if end time has passed
    const [endHour, endMin] = t.endTime.split(':').map(Number);
    const endTimeMinutes = endHour * 60 + endMin;
    return currentTime > endTimeMinutes;
  });

  const formatTimeRange = (startTime?: string, endTime?: string) => {
    if (!startTime || !endTime) return null;

    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
    };

    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  // Helper function to calculate task completion percentage
  const getTaskCompletionPercent = (task: any) => {
    if (!task.subtasks || task.subtasks.length === 0) return 0;
    const completedCount = task.subtasks.filter((s: any) => s.completed).length;
    return Math.round((completedCount / task.subtasks.length) * 100);
  };

  // Helper function to sort tasks - completed tasks go to bottom
  const sortTasks = (tasksToSort: any[]) => {
    return [...tasksToSort].sort((a, b) => {
      const aPercent = getTaskCompletionPercent(a);
      const bPercent = getTaskCompletionPercent(b);

      // If both are 100% or both are not 100%, maintain original order
      if ((aPercent === 100 && bPercent === 100) || (aPercent !== 100 && bPercent !== 100)) {
        return 0;
      }

      // Move 100% tasks to bottom
      if (aPercent === 100) return 1;
      if (bPercent === 100) return -1;

      return 0;
    });
  };

  const TaskCard = ({ task }: { task: any }) => {
    const completionPercent = getTaskCompletionPercent(task);
    const isCompleted = completionPercent === 100;
    const completedCount = task.subtasks?.filter((s: any) => s.completed).length || 0;
    const totalSubtasks = task.subtasks?.length || 0;

    const handleCardClick = () => {
      navigate(`/tasks/${task.id}`);
    };

    const handleEdit = (e: React.MouseEvent) => {
      e.stopPropagation();
      handleOpenEditModal(task);
    };

    const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      handleDeleteTask(task.id);
    };

    return (
      <Card
        p="lg"
        radius="lg"
        withBorder
        style={{
          cursor: 'pointer',
          opacity: isCompleted ? 0.6 : 1,
          backgroundColor: isCompleted ? '#f5f5f5' : 'white',
          position: 'relative',
        }}
        onClick={handleCardClick}
      >
        <Group justify="space-between" mb="sm">
          <Group gap="xs">
            <IconClock size={16} color="#999" />
            <Text
              size="sm"
              c="dimmed"
              td={isCompleted ? 'line-through' : 'none'}
            >
              {task.startTime && task.endTime
                ? `Today, ${formatTimeRange(task.startTime, task.endTime)}`
                : task.dueDate
                ? new Date(task.dueDate).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: BASE_CONSTANTS.MALAYSIA_TIMEZONE,
                  })
                : 'No due date'}
            </Text>
            {totalSubtasks > 0 && (
              <Badge variant="light" color="violet" leftSection="📋">
                {completedCount}/{totalSubtasks}
              </Badge>
            )}
            {task.priority && (
              <Badge variant="light" color={getPriorityColor(task.priority)}>
                {task.priority}
              </Badge>
            )}
            {task.category && (
              <Badge variant="light" color={getCategoryColor(task.category)}>
                {task.category}
              </Badge>
            )}
          </Group>

          <Group gap="xs">
            <ActionIcon
              size="md"
              radius="md"
              variant="subtle"
              color="blue"
              onClick={handleEdit}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </ActionIcon>
            <ActionIcon
              size="md"
              radius="md"
              variant="subtle"
              color="red"
              onClick={handleDelete}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        </Group>

        <Title
          order={4}
          size="h5"
          c={isCompleted ? 'dimmed' : 'inherit'}
          td={isCompleted ? 'line-through' : 'none'}
        >
          {task.title}
        </Title>
      </Card>
    );
  };

  // Use target date's tasks for category counts (before category filtering)
  const categoryCards = [
    {
      title: 'Work',
      count: dateTasks.filter((t) => t.category === 'WORK').length,
      color: '#6C5DD3',
      gradient: 'linear-gradient(135deg, #6C5DD3 0%, #8B7FE8 100%)',
      category: 'WORK',
    },
    {
      title: 'Business',
      count: dateTasks.filter((t) => t.category === 'SHOPPING').length,
      color: '#FFD93D',
      gradient: 'linear-gradient(135deg, #FFD93D 0%, #FFE566 100%)',
      category: 'SHOPPING',
    },
    {
      title: 'Personal',
      count: dateTasks.filter((t) => t.category === 'PERSONAL').length,
      color: '#4ADE80',
      gradient: 'linear-gradient(135deg, #4ADE80 0%, #6EE7A8 100%)',
      category: 'PERSONAL',
    },
  ];

  return (
    <>
      <Container size="xl" px="md" pb={100}>
        <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between" align="center">
          <ActionIcon variant="subtle" size="lg" onClick={() => navigate('/dashboard')}>
            <IconChevronLeft size={24} />
          </ActionIcon>
          <Title order={2} size="h2" fw={600}>
            {(() => {
              const today = new Date();
              const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

              if (targetDateStr === todayStr) {
                return 'Today';
              }

              return targetDate.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                timeZone: BASE_CONSTANTS.MALAYSIA_TIMEZONE,
              });
            })()}
          </Title>
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <ActionIcon variant="subtle" size="lg">
                <IconFilter size={24} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Filter by Priority</Menu.Label>
              <Menu.Item onClick={() => setSelectedPriority(null)}>
                <Text size="sm" fw={selectedPriority === null ? 600 : 400}>All Priorities</Text>
              </Menu.Item>
              <Menu.Item onClick={() => setSelectedPriority('URGENT')}>
                <Group gap="xs">
                  <Badge size="sm" color="red">URGENT</Badge>
                  {selectedPriority === 'URGENT' && <Text size="xs">✓</Text>}
                </Group>
              </Menu.Item>
              <Menu.Item onClick={() => setSelectedPriority('HIGH')}>
                <Group gap="xs">
                  <Badge size="sm" color="orange">HIGH</Badge>
                  {selectedPriority === 'HIGH' && <Text size="xs">✓</Text>}
                </Group>
              </Menu.Item>
              <Menu.Item onClick={() => setSelectedPriority('MEDIUM')}>
                <Group gap="xs">
                  <Badge size="sm" color="yellow">MEDIUM</Badge>
                  {selectedPriority === 'MEDIUM' && <Text size="xs">✓</Text>}
                </Group>
              </Menu.Item>
              <Menu.Item onClick={() => setSelectedPriority('LOW')}>
                <Group gap="xs">
                  <Badge size="sm" color="gray">LOW</Badge>
                  {selectedPriority === 'LOW' && <Text size="xs">✓</Text>}
                </Group>
              </Menu.Item>

              <Menu.Divider />

              <Menu.Label>Filter by Status</Menu.Label>
              <Menu.Item onClick={() => setSelectedStatus(null)}>
                <Text size="sm" fw={selectedStatus === null ? 600 : 400}>All Statuses</Text>
              </Menu.Item>
              <Menu.Item onClick={() => setSelectedStatus('TODO')}>
                <Group gap="xs">
                  <Text size="sm">To Do</Text>
                  {selectedStatus === 'TODO' && <Text size="xs">✓</Text>}
                </Group>
              </Menu.Item>
              <Menu.Item onClick={() => setSelectedStatus('IN_PROGRESS')}>
                <Group gap="xs">
                  <Text size="sm">In Progress</Text>
                  {selectedStatus === 'IN_PROGRESS' && <Text size="xs">✓</Text>}
                </Group>
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        {/* Category Cards */}
        <Group grow={!category}>
          {categoryCards.map((cat) => {
            // If a category is selected, only show that category
            if (category && cat.category !== category) {
              return null;
            }

            return (
              <Card
                key={cat.title}
                p="md"
                radius="xl"
                style={{
                  background: cat.gradient,
                  color: cat.title === 'Business' ? '#333' : 'white',
                  cursor: 'pointer',
                  minHeight: '100px',
                  // When a category is selected, make it take full width
                  ...(category ? { flex: 1, width: '100%' } : {}),
                }}
                onClick={() => {
                  // If clicking the already selected category, deselect it
                  if (category === cat.category) {
                    const params = new URLSearchParams(searchParams);
                    params.delete('category');
                    navigate(`/tasks?${params.toString()}`);
                  } else {
                    // Otherwise, select this category
                    const params = new URLSearchParams(searchParams);
                    params.set('category', cat.category);
                    navigate(`/tasks?${params.toString()}`);
                  }
                }}
              >
                <Stack gap="xs" align="center">
                  <Title order={3} c="inherit" size="h5" fw={600}>
                    {cat.title}
                  </Title>
                  <Text size="lg" fw={500} opacity={0.9}>
                    {cat.count} remaining task{cat.count !== 1 ? 's' : ''}
                  </Text>
                </Stack>
              </Card>
            );
          })}
        </Group>

        {/* Tabs */}
        <Tabs defaultValue="dueSoon" variant="pills">
          <Tabs.List grow>
            <Tabs.Tab value="dueSoon">Due Soon</Tabs.Tab>
            <Tabs.Tab value="upcoming">Upcoming</Tabs.Tab>
            <Tabs.Tab value="overdue">Overdue</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="dueSoon" pt="xl">
            <Stack gap="md">
              {dueSoon.length > 0 ? (
                sortTasks(dueSoon).map((task) => <TaskCard key={task.id} task={task} />)
              ) : (
                <Card p="xl" radius="lg" withBorder style={{ textAlign: 'center' }}>
                  <Text c="dimmed">No tasks due soon</Text>
                </Card>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="upcoming" pt="xl">
            <Stack gap="md">
              {upcoming.length > 0 ? (
                sortTasks(upcoming).map((task) => <TaskCard key={task.id} task={task} />)
              ) : (
                <Card p="xl" radius="lg" withBorder style={{ textAlign: 'center' }}>
                  <Text c="dimmed">No upcoming tasks</Text>
                </Card>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="overdue" pt="xl">
            <Stack gap="md">
              {overdue.length > 0 ? (
                sortTasks(overdue).map((task) => <TaskCard key={task.id} task={task} />)
              ) : (
                <Card p="xl" radius="lg" withBorder style={{ textAlign: 'center' }}>
                  <Text c="dimmed">No overdue tasks</Text>
                </Card>
              )}
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>

    {/* Bottom Navigation */}
    <BottomNav onCreateTask={() => setIsCreateModalOpen(true)} />

    {/* Create Task Modal */}
    <CreateTaskModal
      opened={isCreateModalOpen}
      onClose={() => setIsCreateModalOpen(false)}
      onSubmit={handleCreateTask}
    />

    {/* Edit Task Modal */}
    <Modal
      opened={isEditModalOpen}
      onClose={handleCloseEditModal}
      title={
        <Text size="lg" fw={600}>
          Edit Task
        </Text>
      }
      size="md"
      styles={{
        inner: {
          paddingTop: '2rem',
        },
        header: {
          paddingBottom: '1rem',
        },
        body: {
          paddingTop: 0,
          paddingBottom: '2rem',
          maxHeight: 'calc(100vh - 200px)',
          overflowY: 'auto',
        },
      }}
    >
      <Stack gap="md">
        {/* Task Title */}
        <TextInput
          label="Task Title"
          placeholder="Research and Planning"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          required
          styles={{
            label: { fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' },
          }}
        />

        {/* Project Folder (Category) */}
        <Select
          label="Project Folder"
          placeholder="Select category"
          value={editCategory}
          onChange={(value) => setEditCategory((value as TaskCategory) || '')}
          data={[
            { value: 'PERSONAL', label: 'Personal' },
            { value: 'WORK', label: 'Work' },
            { value: 'SHOPPING', label: 'Business' },
          ]}
          styles={{
            label: { fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' },
          }}
        />

        {/* Due Date */}
        <TextInput
          label="Due Date"
          type="date"
          placeholder="Pick date"
          value={editDueDate}
          onChange={(e) => setEditDueDate(e.target.value)}
          styles={{
            label: { fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' },
          }}
        />

        {/* Time Range */}
        <Group grow>
          <TextInput
            label="Start Time"
            type="time"
            value={editStartTime}
            onChange={(e) => setEditStartTime(e.target.value)}
            styles={{
              label: { fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' },
            }}
          />

          <TextInput
            label="End Time"
            type="time"
            value={editEndTime}
            onChange={(e) => setEditEndTime(e.target.value)}
            styles={{
              label: { fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' },
            }}
          />
        </Group>

        {/* Notes */}
        <Textarea
          label="Notes"
          placeholder="Gather insights on user needs, market trends..."
          value={editNotes}
          onChange={(e) => setEditNotes(e.target.value)}
          minRows={3}
          styles={{
            label: { fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' },
          }}
        />

        <Divider />

        {/* Task List (Subtasks) */}
        <div>
          <Text size="sm" fw={500} mb="sm">
            Task List
          </Text>

          {/* Existing Subtasks */}
          <Stack gap="xs" mb="sm">
            {editSubTasks.map((subTask, index) => (
              <Group key={index} justify="space-between" wrap="nowrap">
                <Text size="sm" style={{ flex: 1 }}>
                  {subTask.title}
                </Text>
                <ActionIcon
                  size="sm"
                  color="red"
                  variant="subtle"
                  onClick={() => handleRemoveSubTask(index)}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            ))}
          </Stack>

          {/* Add New Subtask */}
          <Group gap="xs" wrap="nowrap">
            <TextInput
              placeholder="Add new subtask..."
              value={newSubTask}
              onChange={(e) => setNewSubTask(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddSubTask();
                }
              }}
              style={{ flex: 1 }}
            />
            <ActionIcon
              size="lg"
              color="violet"
              variant="light"
              onClick={handleAddSubTask}
            >
              <IconPlus size={18} />
            </ActionIcon>
          </Group>
        </div>

        {/* Submit Button */}
        <Button
          fullWidth
          size="lg"
          color="violet"
          onClick={handleEditTask}
          disabled={!editTitle.trim() || isSubmitting}
          loading={isSubmitting}
          mt="md"
        >
          Update Task
        </Button>
      </Stack>
    </Modal>

    {/* Delete Confirmation Modal */}
    <Modal
      opened={deleteConfirmOpen}
      onClose={cancelDelete}
      title={
        <Text size="lg" fw={600}>
          Confirm Delete
        </Text>
      }
      size="sm"
      centered
    >
      <Stack gap="md">
        <Text size="sm">
          Are you sure you want to delete this task? This action cannot be undone.
        </Text>
        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={cancelDelete}>
            Cancel
          </Button>
          <Button color="red" onClick={confirmDelete}>
            Delete
          </Button>
        </Group>
      </Stack>
    </Modal>
  </>
  );
};
