// Mock supabase service
jest.mock('../src/services/supabaseService', () => ({
  supabaseService: {
    getTasks: jest.fn(),
    createTask: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
    updateSubtask: jest.fn(),
  },
  supabase: {},
}));

import tasksReducer, {
  updateTaskStatus,
  toggleSubtask,
} from '../src/store/slices/tasksSlice';
import { Task } from '../src/types/Task';

describe('tasksSlice', () => {
  const initialState = {
    tasks: [],
    loading: false,
    error: null,
  };

  const mockTask: Task = {
    id: 'task-1',
    title: 'Test Task',
    description: 'Test Description',
    status: 'pending',
    priority: 'medium',
    user_id: 'user-1',
    created_at: '2026-01-26T00:00:00Z',
    subtasks: [
      {
        id: 'subtask-1',
        parent_task_id: 'task-1',
        title: 'Subtask 1',
        description: 'Subtask description',
        status: 'pending',
        order: 0,
        estimated_duration: 15,
      },
      {
        id: 'subtask-2',
        parent_task_id: 'task-1',
        title: 'Subtask 2',
        description: 'Subtask description 2',
        status: 'completed',
        order: 1,
        estimated_duration: 20,
      },
    ],
  };

  describe('reducers', () => {
    it('should return initial state', () => {
      expect(tasksReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should update task status', () => {
      const stateWithTask = {
        ...initialState,
        tasks: [mockTask],
      };

      const result = tasksReducer(
        stateWithTask,
        updateTaskStatus({ taskId: 'task-1', status: 'in_progress' })
      );

      expect(result.tasks[0].status).toBe('in_progress');
    });

    it('should not update status for non-existent task', () => {
      const stateWithTask = {
        ...initialState,
        tasks: [mockTask],
      };

      const result = tasksReducer(
        stateWithTask,
        updateTaskStatus({ taskId: 'non-existent', status: 'completed' })
      );

      expect(result.tasks[0].status).toBe('pending');
    });

    it('should toggle subtask status from pending to completed', () => {
      const stateWithTask = {
        ...initialState,
        tasks: [mockTask],
      };

      const result = tasksReducer(
        stateWithTask,
        toggleSubtask({ taskId: 'task-1', subtaskId: 'subtask-1' })
      );

      expect(result.tasks[0].subtasks?.[0].status).toBe('completed');
    });

    it('should toggle subtask status from completed to pending', () => {
      const stateWithTask = {
        ...initialState,
        tasks: [mockTask],
      };

      const result = tasksReducer(
        stateWithTask,
        toggleSubtask({ taskId: 'task-1', subtaskId: 'subtask-2' })
      );

      expect(result.tasks[0].subtasks?.[1].status).toBe('pending');
    });

    it('should not toggle subtask for non-existent task', () => {
      const stateWithTask = {
        ...initialState,
        tasks: [mockTask],
      };

      const result = tasksReducer(
        stateWithTask,
        toggleSubtask({ taskId: 'non-existent', subtaskId: 'subtask-1' })
      );

      expect(result.tasks[0].subtasks?.[0].status).toBe('pending');
    });
  });
});
