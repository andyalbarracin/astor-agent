/**
 * @astor/core — capa de dominio única. Toda mutación pasa por acá, validada con
 * Zod. UI / REST / MCP / Telegram / webhooks son adaptadores finos sobre estas
 * funciones. El LLM devuelve tool-calls cuyos args se validan con estos schemas.
 */

export { DomainError, assertNoDbError } from './errors';
export type { DomainContext } from './context';

// Tipos de enum del esquema (re-exportados para adaptadores)
export type {
  TaskStatus,
  TaskEisenhower,
  TaskSource,
  CategoryKind,
  HabitPeriod,
  HabitLogStatus,
  RoutineKind,
} from '@astor/supabase';

// Tareas
export * from './tasks/schema';
export { nextOccurrence } from './tasks/recurrence';
export {
  createTask,
  updateTask,
  setTaskStatus,
  completeTask,
  deleteTask,
  listTasks,
  createCategory,
  listCategories,
  addChecklistItem,
  toggleChecklistItem,
  listChecklist,
  type Task,
  type Category,
  type ChecklistItem,
} from './tasks/functions';

// Hábitos
export * from './habits/schema';
export { computeStreak, buildHeatmap, type HabitLogLite } from './habits/streak';
export {
  createHabit,
  updateHabit,
  archiveHabit,
  listHabits,
  logHabit,
  getHabitLogs,
  getHabitStreak,
  type Habit,
  type HabitLog,
} from './habits/functions';

// Rutinas
export * from './routines/schema';
export {
  listRoutines,
  getRoutineCompletions,
  toggleRoutineItem,
  createRoutine,
  addRoutineItem,
  deleteRoutineItem,
  type Routine,
  type RoutineItem,
  type RoutineWithItems,
} from './routines/functions';

// To-do seccionado
export * from './todos/schema';
export {
  listTodoSections,
  ensureDefaultTodoSections,
  createTodoSection,
  renameTodoSection,
  deleteTodoSection,
  addTodoItem,
  toggleTodoItem,
  deleteTodoItem,
  type TodoSection,
  type TodoItem,
  type TodoSectionWithItems,
} from './todos/functions';
