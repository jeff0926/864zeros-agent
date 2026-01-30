import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';
import { Task, CreateTaskRequest } from '../types/Task';

const supabaseUrl = SUPABASE_URL || '';
const supabaseKey = SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

class SupabaseService {
  async getTasks(userId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        subtasks (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {throw error;}
    return data || [];
  }

  async createTask(taskData: CreateTaskRequest): Promise<Task> {
    const { subtasks, ...taskFields } = taskData;

    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert([{
        ...taskFields,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (taskError) {throw taskError;}

    // Create subtasks if provided
    if (subtasks && subtasks.length > 0) {
      const subtaskData = subtasks.map((subtask, index) => ({
        ...subtask,
        parent_task_id: task.id,
        order: index,
      }));

      const { data: createdSubtasks, error: subtasksError } = await supabase
        .from('subtasks')
        .insert(subtaskData)
        .select();

      if (subtasksError) {throw subtasksError;}

      return { ...task, subtasks: createdSubtasks };
    }

    return task;
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) {throw error;}
    return data;
  }

  async deleteTask(taskId: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {throw error;}
  }

  async updateSubtask(subtaskId: string, updates: Partial<any>): Promise<any> {
    const { data, error } = await supabase
      .from('subtasks')
      .update(updates)
      .eq('id', subtaskId)
      .select()
      .single();

    if (error) {throw error;}
    return data;
  }
}

export const supabaseService = new SupabaseService();
