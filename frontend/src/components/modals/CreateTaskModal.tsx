import { useState } from 'react';
import {
  Modal,
  Stack,
  TextInput,
  Textarea,
  Select,
  Button,
  Group,
  ActionIcon,
  Text,
  Divider,
} from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';

interface SubTask {
  id?: string;
  title: string;
  completed?: boolean;
}

interface CreateTaskModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (taskData: any) => void;
}

export const CreateTaskModal = ({ opened, onClose, onSubmit }: CreateTaskModalProps) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>('');
  const [dueDate, setDueDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [subTasks, setSubTasks] = useState<SubTask[]>([]);
  const [newSubTask, setNewSubTask] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddSubTask = () => {
    if (newSubTask.trim()) {
      setSubTasks([...subTasks, { id: Date.now().toString(), title: newSubTask, completed: false }]);
      setNewSubTask('');
    }
  };

  const handleRemoveSubTask = (id: string) => {
    setSubTasks(subTasks.filter(st => st.id !== id));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const taskData = {
        title,
        category,
        dueDate: dueDate ? `${dueDate}T00:00:00` : undefined,
        startTime,
        endTime,
        description: notes,
        subtasks: subTasks.map(st => ({
          title: st.title,
          completed: st.completed || false
        })),
      };
      await onSubmit(taskData);
      handleClose();
    } catch (error) {
      console.error('Error submitting task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setTitle('');
    setCategory('');
    setDueDate('');
    setStartTime('');
    setEndTime('');
    setNotes('');
    setSubTasks([]);
    setNewSubTask('');
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Text size="lg" fw={600}>
          New Task
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
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          styles={{
            label: { fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' },
          }}
        />

        {/* Project Folder (Category) */}
        <Select
          label="Project Folder"
          placeholder="Select category"
          value={category}
          onChange={(value) => setCategory(value || '')}
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
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          styles={{
            label: { fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' },
          }}
        />

        {/* Time Range */}
        <Group grow>
          <TextInput
            label="Start Time"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            styles={{
              label: { fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' },
            }}
          />

          <TextInput
            label="End Time"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            styles={{
              label: { fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' },
            }}
          />
        </Group>

        {/* Notes */}
        <Textarea
          label="Notes"
          placeholder="Gather insights on user needs, market trends..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
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
            {subTasks.map((subTask) => (
              <Group key={subTask.id} justify="space-between" wrap="nowrap">
                <Text size="sm" style={{ flex: 1 }}>
                  {subTask.title}
                </Text>
                <ActionIcon
                  size="sm"
                  color="red"
                  variant="subtle"
                  onClick={() => subTask.id && handleRemoveSubTask(subTask.id)}
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
          onClick={handleSubmit}
          disabled={!title.trim() || isSubmitting}
          loading={isSubmitting}
          mt="md"
        >
          Add New Task
        </Button>
      </Stack>
    </Modal>
  );
};
