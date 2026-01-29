import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Task } from '../../types/Task';
import { localStorageService } from '../../services/localStorageService';
import { aiService } from '../../services/aiService';

interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

const initialState: TasksState = {
  tasks: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (userId: string) => {
    return await localStorageService.getTasks(userId);
  }
);

export const createTaskWithBreakdown = createAsyncThunk(
  'tasks/createTaskWithBreakdown',
  async ({ taskDescription, userId }: { taskDescription: string; userId: string }) => {
    // Generate subtasks using AI (Claude)
    const aiSubtasks = await aiService.breakdownTask(taskDescription);

    // Transform AI subtasks to include required status field
    const subtasks = aiSubtasks.map(st => ({
      ...st,
      status: 'pending' as const,
    }));

    // Create task in local storage
    const task = await localStorageService.createTask({
      title: taskDescription,
      description: taskDescription,
      status: 'pending',
      priority: 'medium',
      user_id: userId,
      subtasks,
    });

    return task;
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId: string) => {
    await localStorageService.deleteTask(taskId);
    return taskId;
  }
);

export const persistToggleSubtask = createAsyncThunk(
  'tasks/persistToggleSubtask',
  async ({ taskId, subtaskId }: { taskId: string; subtaskId: string }) => {
    await localStorageService.toggleSubtaskStatus(taskId, subtaskId);
    return { taskId, subtaskId };
  }
);

export const persistTaskStatus = createAsyncThunk(
  'tasks/persistTaskStatus',
  async ({ taskId, status }: { taskId: string; status: Task['status'] }) => {
    await localStorageService.updateTask(taskId, { status });
    return { taskId, status };
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    updateTaskStatus: (state, action: PayloadAction<{ taskId: string; status: Task['status'] }>) => {
      const task = state.tasks.find(t => t.id === action.payload.taskId);
      if (task) {
        task.status = action.payload.status;
      }
    },
    toggleSubtask: (state, action: PayloadAction<{ taskId: string; subtaskId: string }>) => {
      const task = state.tasks.find(t => t.id === action.payload.taskId);
      if (task && task.subtasks) {
        const subtask = task.subtasks.find(st => st.id === action.payload.subtaskId);
        if (subtask) {
          subtask.status = subtask.status === 'completed' ? 'pending' : 'completed';
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tasks';
      })
      .addCase(createTaskWithBreakdown.pending, (state) => {
        state.loading = true;
      })
      .addCase(createTaskWithBreakdown.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.unshift(action.payload);
      })
      .addCase(createTaskWithBreakdown.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create task';
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(t => t.id !== action.payload);
      })
      .addCase(persistToggleSubtask.fulfilled, (state, action) => {
        const task = state.tasks.find(t => t.id === action.payload.taskId);
        if (task && task.subtasks) {
          const subtask = task.subtasks.find(st => st.id === action.payload.subtaskId);
          if (subtask) {
            subtask.status = subtask.status === 'completed' ? 'pending' : 'completed';
          }
        }
      })
      .addCase(persistTaskStatus.fulfilled, (state, action) => {
        const task = state.tasks.find(t => t.id === action.payload.taskId);
        if (task) {
          task.status = action.payload.status;
        }
      });
  },
});

export const { updateTaskStatus, toggleSubtask } = tasksSlice.actions;
export default tasksSlice.reducer;
