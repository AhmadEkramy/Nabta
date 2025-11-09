import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
    writeBatch
} from 'firebase/firestore';
import { db } from './config';

// Todo interfaces
export interface Todo {
  id: string;
  userId: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  subtasks?: Subtask[];
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export interface TodoCategory {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: Date;
}

export interface CreateTodoData {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate?: Date;
  tags?: string[];
}

export interface UpdateTodoData {
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  dueDate?: Date;
  tags?: string[];
  completed?: boolean;
}

// Todo CRUD operations
export const createTodo = async (userId: string, todoData: CreateTodoData): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'todos'), {
      ...todoData,
      userId,
      completed: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      subtasks: []
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating todo:', error);
    throw error;
  }
};

export const getUserTodos = async (userId: string): Promise<Todo[]> => {
  try {
    const q = query(
      collection(db, 'todos'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const todos: Todo[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      todos.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        dueDate: data.dueDate?.toDate() || undefined,
        subtasks: data.subtasks || []
      } as Todo);
    });
    
    return todos;
  } catch (error) {
    console.error('Error fetching todos:', error);
    throw error;
  }
};

export const subscribeToUserTodos = (
  userId: string,
  callback: (todos: Todo[]) => void
): (() => void) => {
  const q = query(
    collection(db, 'todos'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const todos: Todo[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      todos.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        dueDate: data.dueDate?.toDate() || undefined,
        subtasks: data.subtasks || []
      } as Todo);
    });
    
    callback(todos);
  });
};

export const updateTodo = async (todoId: string, updates: UpdateTodoData): Promise<void> => {
  try {
    const todoRef = doc(db, 'todos', todoId);
    await updateDoc(todoRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating todo:', error);
    throw error;
  }
};

export const toggleTodoComplete = async (todoId: string, completed: boolean): Promise<void> => {
  try {
    const todoRef = doc(db, 'todos', todoId);
    await updateDoc(todoRef, {
      completed,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error toggling todo completion:', error);
    throw error;
  }
};

export const deleteTodo = async (todoId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'todos', todoId));
  } catch (error) {
    console.error('Error deleting todo:', error);
    throw error;
  }
};

// Subtask operations
export const addSubtask = async (todoId: string, subtaskTitle: string): Promise<void> => {
  try {
    const todoRef = doc(db, 'todos', todoId);
    const todoDoc = await getDocs(query(collection(db, 'todos'), where('__name__', '==', todoId)));
    
    if (!todoDoc.empty) {
      const todoData = todoDoc.docs[0].data();
      const currentSubtasks = todoData.subtasks || [];
      
      const newSubtask: Subtask = {
        id: Date.now().toString(),
        title: subtaskTitle,
        completed: false,
        createdAt: new Date()
      };
      
      await updateDoc(todoRef, {
        subtasks: [...currentSubtasks, newSubtask],
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error adding subtask:', error);
    throw error;
  }
};

export const toggleSubtaskComplete = async (
  todoId: string, 
  subtaskId: string, 
  completed: boolean
): Promise<void> => {
  try {
    const todoRef = doc(db, 'todos', todoId);
    const todoDoc = await getDocs(query(collection(db, 'todos'), where('__name__', '==', todoId)));
    
    if (!todoDoc.empty) {
      const todoData = todoDoc.docs[0].data();
      const currentSubtasks = todoData.subtasks || [];
      
      const updatedSubtasks = currentSubtasks.map((subtask: Subtask) =>
        subtask.id === subtaskId ? { ...subtask, completed } : subtask
      );
      
      await updateDoc(todoRef, {
        subtasks: updatedSubtasks,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error toggling subtask completion:', error);
    throw error;
  }
};

export const deleteSubtask = async (todoId: string, subtaskId: string): Promise<void> => {
  try {
    const todoRef = doc(db, 'todos', todoId);
    const todoDoc = await getDocs(query(collection(db, 'todos'), where('__name__', '==', todoId)));
    
    if (!todoDoc.empty) {
      const todoData = todoDoc.docs[0].data();
      const currentSubtasks = todoData.subtasks || [];
      
      const updatedSubtasks = currentSubtasks.filter((subtask: Subtask) => subtask.id !== subtaskId);
      
      await updateDoc(todoRef, {
        subtasks: updatedSubtasks,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error deleting subtask:', error);
    throw error;
  }
};

// Category operations
export const createCategory = async (
  userId: string, 
  name: string, 
  color: string
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'todoCategories'), {
      name,
      color,
      userId,
      createdAt: serverTimestamp()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

export const getUserCategories = async (userId: string): Promise<TodoCategory[]> => {
  try {
    const q = query(
      collection(db, 'todoCategories'),
      where('userId', '==', userId),
      orderBy('createdAt', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const categories: TodoCategory[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      categories.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date()
      } as TodoCategory);
    });
    
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const subscribeToUserCategories = (
  userId: string,
  callback: (categories: TodoCategory[]) => void
): (() => void) => {
  const q = query(
    collection(db, 'todoCategories'),
    where('userId', '==', userId),
    orderBy('createdAt', 'asc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const categories: TodoCategory[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      categories.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date()
      } as TodoCategory);
    });
    
    callback(categories);
  });
};

export const deleteCategory = async (categoryId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'todoCategories', categoryId));
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

// Bulk operations
export const deleteCompletedTodos = async (userId: string): Promise<void> => {
  try {
    const q = query(
      collection(db, 'todos'),
      where('userId', '==', userId),
      where('completed', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);
    
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error deleting completed todos:', error);
    throw error;
  }
};

export const markAllTodosComplete = async (userId: string): Promise<void> => {
  try {
    const q = query(
      collection(db, 'todos'),
      where('userId', '==', userId),
      where('completed', '==', false)
    );
    
    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);
    
    querySnapshot.forEach((doc) => {
      batch.update(doc.ref, {
        completed: true,
        updatedAt: serverTimestamp()
      });
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error marking all todos complete:', error);
    throw error;
  }
};

// Statistics
export const getTodoStats = async (userId: string) => {
  try {
    const todos = await getUserTodos(userId);
    
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const pending = total - completed;
    const overdue = todos.filter(todo => 
      todo.dueDate && 
      !todo.completed && 
      todo.dueDate < new Date()
    ).length;
    
    const byPriority = {
      high: todos.filter(todo => todo.priority === 'high' && !todo.completed).length,
      medium: todos.filter(todo => todo.priority === 'medium' && !todo.completed).length,
      low: todos.filter(todo => todo.priority === 'low' && !todo.completed).length
    };
    
    const byCategory = todos.reduce((acc, todo) => {
      if (!todo.completed) {
        acc[todo.category] = (acc[todo.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total,
      completed,
      pending,
      overdue,
      byPriority,
      byCategory,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  } catch (error) {
    console.error('Error getting todo stats:', error);
    throw error;
  }
};