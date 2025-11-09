import { useEffect, useState } from 'react';
import {
    CreateTodoData,
    Todo,
    TodoCategory,
    UpdateTodoData,
    addSubtask,
    createCategory,
    createTodo,
    deleteCategory,
    deleteCompletedTodos,
    deleteSubtask,
    deleteTodo,
    getTodoStats,
    markAllTodosComplete,
    subscribeToUserCategories,
    subscribeToUserTodos,
    toggleSubtaskComplete,
    toggleTodoComplete,
    updateTodo
} from '../firebase/todos';

interface UseTodosReturn {
  todos: Todo[];
  categories: TodoCategory[];
  loading: boolean;
  error: string | null;
  stats: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    byPriority: { high: number; medium: number; low: number };
    byCategory: Record<string, number>;
    completionRate: number;
  } | null;
  
  // Todo operations
  addTodo: (todoData: CreateTodoData) => Promise<string>;
  editTodo: (todoId: string, updates: UpdateTodoData) => Promise<void>;
  removeTodo: (todoId: string) => Promise<void>;
  toggleComplete: (todoId: string, completed: boolean) => Promise<void>;
  
  // Subtask operations
  addTodoSubtask: (todoId: string, subtaskTitle: string) => Promise<void>;
  toggleSubtaskComplete: (todoId: string, subtaskId: string, completed: boolean) => Promise<void>;
  removeSubtask: (todoId: string, subtaskId: string) => Promise<void>;
  
  // Category operations
  addCategory: (name: string, color: string) => Promise<string>;
  removeCategory: (categoryId: string) => Promise<void>;
  
  // Bulk operations
  clearCompleted: () => Promise<void>;
  markAllComplete: () => Promise<void>;
  
  // Utility functions
  refreshStats: () => Promise<void>;
}

export const useTodos = (userId: string | undefined): UseTodosReturn => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [categories, setCategories] = useState<TodoCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UseTodosReturn['stats']>(null);

  // Subscribe to todos
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribeTodos = subscribeToUserTodos(userId, (updatedTodos) => {
      setTodos(updatedTodos);
      setLoading(false);
    });

    const unsubscribeCategories = subscribeToUserCategories(userId, (updatedCategories) => {
      setCategories(updatedCategories);
    });

    return () => {
      unsubscribeTodos();
      unsubscribeCategories();
    };
  }, [userId]);

  // Update stats when todos change
  useEffect(() => {
    if (userId && todos.length >= 0) {
      refreshStats();
    }
  }, [todos, userId]);

  const refreshStats = async (): Promise<void> => {
    if (!userId) return;
    
    try {
      const newStats = await getTodoStats(userId);
      setStats(newStats);
    } catch (err) {
      console.error('Error refreshing stats:', err);
    }
  };

  const addTodo = async (todoData: CreateTodoData): Promise<string> => {
    if (!userId) throw new Error('User not authenticated');
    
    try {
      const todoId = await createTodo(userId, todoData);
      return todoId;
    } catch (err) {
      console.error('Error adding todo:', err);
      setError('Failed to add todo');
      throw err;
    }
  };

  const editTodo = async (todoId: string, updates: UpdateTodoData): Promise<void> => {
    try {
      await updateTodo(todoId, updates);
    } catch (err) {
      console.error('Error updating todo:', err);
      setError('Failed to update todo');
      throw err;
    }
  };

  const removeTodo = async (todoId: string): Promise<void> => {
    try {
      await deleteTodo(todoId);
    } catch (err) {
      console.error('Error deleting todo:', err);
      setError('Failed to delete todo');
      throw err;
    }
  };

  const toggleComplete = async (todoId: string, completed: boolean): Promise<void> => {
    try {
      await toggleTodoComplete(todoId, completed);
    } catch (err) {
      console.error('Error toggling todo completion:', err);
      setError('Failed to update todo');
      throw err;
    }
  };

  const addTodoSubtask = async (todoId: string, subtaskTitle: string): Promise<void> => {
    try {
      await addSubtask(todoId, subtaskTitle);
    } catch (err) {
      console.error('Error adding subtask:', err);
      setError('Failed to add subtask');
      throw err;
    }
  };

  const toggleSubtaskCompleteHandler = async (
    todoId: string, 
    subtaskId: string, 
    completed: boolean
  ): Promise<void> => {
    try {
      await toggleSubtaskComplete(todoId, subtaskId, completed);
    } catch (err) {
      console.error('Error toggling subtask completion:', err);
      setError('Failed to update subtask');
      throw err;
    }
  };

  const removeSubtask = async (todoId: string, subtaskId: string): Promise<void> => {
    try {
      await deleteSubtask(todoId, subtaskId);
    } catch (err) {
      console.error('Error deleting subtask:', err);
      setError('Failed to delete subtask');
      throw err;
    }
  };

  const addCategory = async (name: string, color: string): Promise<string> => {
    if (!userId) throw new Error('User not authenticated');
    
    try {
      const categoryId = await createCategory(userId, name, color);
      return categoryId;
    } catch (err) {
      console.error('Error adding category:', err);
      setError('Failed to add category');
      throw err;
    }
  };

  const removeCategory = async (categoryId: string): Promise<void> => {
    try {
      await deleteCategory(categoryId);
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Failed to delete category');
      throw err;
    }
  };

  const clearCompleted = async (): Promise<void> => {
    if (!userId) throw new Error('User not authenticated');
    
    try {
      await deleteCompletedTodos(userId);
    } catch (err) {
      console.error('Error clearing completed todos:', err);
      setError('Failed to clear completed todos');
      throw err;
    }
  };

  const markAllComplete = async (): Promise<void> => {
    if (!userId) throw new Error('User not authenticated');
    
    try {
      await markAllTodosComplete(userId);
    } catch (err) {
      console.error('Error marking all todos complete:', err);
      setError('Failed to mark all todos complete');
      throw err;
    }
  };

  return {
    todos,
    categories,
    loading,
    error,
    stats,
    addTodo,
    editTodo,
    removeTodo,
    toggleComplete,
    addTodoSubtask,
    toggleSubtaskComplete: toggleSubtaskCompleteHandler,
    removeSubtask,
    addCategory,
    removeCategory,
    clearCompleted,
    markAllComplete,
    refreshStats
  };
};