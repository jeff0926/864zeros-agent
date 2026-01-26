import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Task, Subtask } from '../../types/Task';
import { supabaseService } from '../../services/supabaseService';
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
    return await supabaseService.getTasks(userId);
  }
);

export const createTaskWithBreakdown = createAsyncThunk(
  'tasks/createTaskWithBreakdown',
  async ({ taskDescription, userId }: { taskDescription: string; userId: string }) => {
    // Generate subtasks using AI
    const subtasks = await aiService.breakdownTask(taskDescription);
    
    // Create task in database
    const task = await supabaseService.createTask({
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

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    updateTaskStatus: (state, action: PayloadAction<{ taskId: string; status: string }>) => {
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
        state.tasks.push(action.payload);
      })
      .addCase(createTaskWithBreakdown.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create task';
      });
  },
});

export const { updateTaskStatus, toggleSubtask } = tasksSlice.actions;
export default tasksSlice.reducer;