import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, CreateTaskRequest, Subtask } from '../types/Task';

const TASKS_KEY = '@task_breakdown_ai_tasks';

// Generate UUID-like ID
const generateId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

class LocalStorageService {
  private async getAllTasks(): Promise<Task[]> {
    try {
      const data = await AsyncStorage.getItem(TASKS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading tasks:', error);
      return [];
    }
  }

  private async saveTasks(tasks: Task[]): Promise<void> {
    try {
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
      throw error;
    }
  }

  async getTasks(userId: string): Promise<Task[]> {
    const tasks = await this.getAllTasks();
    return tasks.filter(t => t.user_id === userId);
  }

  async createTask(taskData: CreateTaskRequest): Promise<Task> {
    const tasks = await this.getAllTasks();

    const taskId = generateId();
    const newTask: Task = {
      id: taskId,
      title: taskData.title,
      description: taskData.description,
      status: taskData.status,
      priority: taskData.priority,
      user_id: taskData.user_id,
      created_at: new Date().toISOString(),
      subtasks: taskData.subtasks?.map((st, index) => ({
        ...st,
        id: generateId(),
        parent_task_id: taskId,
        order: index,
      })) as Subtask[],
    };

    tasks.push(newTask);
    await this.saveTasks(tasks);

    return newTask;
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    const tasks = await this.getAllTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);

    if (taskIndex === -1) {
      throw new Error('Task not found');
    }

    tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
    await this.saveTasks(tasks);

    return tasks[taskIndex];
  }

  async deleteTask(taskId: string): Promise<void> {
    const tasks = await this.getAllTasks();
    const filteredTasks = tasks.filter(t => t.id !== taskId);
    await this.saveTasks(filteredTasks);
  }

  async updateSubtask(taskId: string, subtaskId: string, updates: Partial<Subtask>): Promise<Subtask> {
    const tasks = await this.getAllTasks();
    const task = tasks.find(t => t.id === taskId);

    if (!task || !task.subtasks) {
      throw new Error('Task or subtask not found');
    }

    const subtaskIndex = task.subtasks.findIndex(st => st.id === subtaskId);
    if (subtaskIndex === -1) {
      throw new Error('Subtask not found');
    }

    task.subtasks[subtaskIndex] = { ...task.subtasks[subtaskIndex], ...updates };
    await this.saveTasks(tasks);

    return task.subtasks[subtaskIndex];
  }

  async toggleSubtaskStatus(taskId: string, subtaskId: string): Promise<Subtask> {
    const tasks = await this.getAllTasks();
    const task = tasks.find(t => t.id === taskId);

    if (!task || !task.subtasks) {
      throw new Error('Task or subtask not found');
    }

    const subtask = task.subtasks.find(st => st.id === subtaskId);
    if (!subtask) {
      throw new Error('Subtask not found');
    }

    subtask.status = subtask.status === 'completed' ? 'pending' : 'completed';
    await this.saveTasks(tasks);

    return subtask;
  }
}

export const localStorageService = new LocalStorageService();
