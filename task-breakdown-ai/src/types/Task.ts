export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  estimated_duration?: number; // minutes
  created_at: string;
  due_date?: string;
  user_id: string;
  subtasks?: Subtask[];
}

export interface Subtask {
  id: string;
  parent_task_id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  order: number;
  estimated_duration?: number; // minutes
  dependencies?: string[];
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  user_id: string;
  subtasks?: Omit<Subtask, 'id' | 'parent_task_id'>[];
}
