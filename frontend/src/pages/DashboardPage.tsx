import { useState } from 'react';
import {
  Container,
  Title,
  Text,
  Button,
  TextInput,
  Grid,
  Card,
  Badge,
  Group,
  Stack,
  Modal,
  ActionIcon,
  Menu,
  Paper,
} from '@mantine/core';
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconTrash,
  IconDots,
  IconChecklist,
} from '@tabler/icons-react';
import { useTasks } from '@/hooks/useTasks';
import { TaskForm } from '@/components/forms/TaskForm';
import type { Task, CreateTaskPayload } from '@/types';
import type { TaskFormData } from '@/utils/validation';

export const DashboardPage = () => {
  const {
    tasks,
    selectedTask,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
    setSelectedTask,
    setFilters,
    filters,
  } = useTasks();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateTask = async (data: TaskFormData) => {
    await createTask(data as CreateTaskPayload);
    setIsCreateModalOpen(false);
  };

  const handleEditTask = async (data: TaskFormData) => {
    if (!selectedTask) return;
    await updateTask({ ...(data as CreateTaskPayload), id: selectedTask.id });
    setIsEditModalOpen(false);
    setSelectedTask(null);
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    await deleteTask(taskToDelete.id);
    setIsDeleteModalOpen(false);
    setTaskToDelete(null);
  };

  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (task: Task) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setFilters({ ...filters, search: value });
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      LOW: 'blue',
      MEDIUM: 'yellow',
      HIGH: 'orange',
      URGENT: 'red',
    };
    return colors[priority] || 'gray';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      TODO: 'gray',
      IN_PROGRESS: 'blue',
      COMPLETED: 'green',
    };
    return colors[status] || 'gray';
  };

  return (
    <Container size="xl" px={0}>
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Title order={2}>Tasks</Title>
            <Text c="dimmed" size="sm">
              Manage your tasks efficiently and stay productive
            </Text>
          </div>
          <Button leftSection={<IconPlus size={16} />} onClick={() => setIsCreateModalOpen(true)}>
            New Task
          </Button>
        </Group>

        {/* Search */}
        <TextInput
          placeholder="Search tasks..."
          leftSection={<IconSearch size={16} />}
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          radius="md"
        />

        {/* Tasks Grid */}
        {isLoading ? (
          <Text>Loading...</Text>
        ) : tasks.length === 0 ? (
          <Paper p="xl" radius="md" withBorder style={{ textAlign: 'center' }}>
            <Stack align="center" gap="md">
              <IconChecklist size={48} stroke={1.5} style={{ opacity: 0.5 }} />
              <div>
                <Title order={4}>No tasks found</Title>
                <Text c="dimmed" size="sm">
                  {searchQuery || filters.status?.length
                    ? 'Try adjusting your filters or search query'
                    : 'Get started by creating your first task'}
                </Text>
              </div>
              <Button leftSection={<IconPlus size={16} />} onClick={() => setIsCreateModalOpen(true)}>
                Create Task
              </Button>
            </Stack>
          </Paper>
        ) : (
          <Grid>
            {tasks.map((task) => (
              <Grid.Col key={task.id} span={{ base: 12, sm: 6, md: 4 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Card.Section withBorder inheritPadding py="xs">
                    <Group justify="space-between">
                      <Text fw={500} lineClamp={1}>
                        {task.title}
                      </Text>
                      <Menu shadow="md" width={150}>
                        <Menu.Target>
                          <ActionIcon variant="subtle" color="gray">
                            <IconDots size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            leftSection={<IconEdit size={14} />}
                            onClick={() => openEditModal(task)}
                          >
                            Edit
                          </Menu.Item>
                          <Menu.Item
                            leftSection={<IconTrash size={14} />}
                            color="red"
                            onClick={() => openDeleteModal(task)}
                          >
                            Delete
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Group>
                  </Card.Section>

                  <Stack gap="xs" mt="md">
                    {task.description && (
                      <Text size="sm" c="dimmed" lineClamp={2}>
                        {task.description}
                      </Text>
                    )}

                    <Group gap="xs">
                      <Badge color={getStatusColor(task.status)} variant="light" size="sm">
                        {task.status.replace('_', ' ')}
                      </Badge>
                      <Badge color={getPriorityColor(task.priority)} variant="light" size="sm">
                        {task.priority}
                      </Badge>
                    </Group>

                    {task.category && (
                      <Badge variant="outline" size="sm">
                        {task.category}
                      </Badge>
                    )}

                    {task.dueDate && (
                      <Text size="xs" c="dimmed">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </Text>
                    )}
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        )}
      </Stack>

      {/* Create Modal */}
      <Modal
        opened={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Task"
        centered
      >
        <TaskForm
          onSubmit={handleCreateTask}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={isLoading}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        opened={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTask(null);
        }}
        title="Edit Task"
        centered
      >
        {selectedTask && (
          <TaskForm
            task={selectedTask}
            onSubmit={handleEditTask}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedTask(null);
            }}
            isLoading={isLoading}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTaskToDelete(null);
        }}
        title="Delete Task"
        centered
      >
        <Stack gap="md">
          {taskToDelete && (
            <Paper p="md" withBorder>
              <Text fw={500}>{taskToDelete.title}</Text>
              {taskToDelete.description && (
                <Text size="sm" c="dimmed" mt={4}>
                  {taskToDelete.description}
                </Text>
              )}
            </Paper>
          )}
          <Group grow>
            <Button color="red" onClick={handleDeleteTask} loading={isLoading}>
              Delete
            </Button>
            <Button
              variant="default"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setTaskToDelete(null);
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};
