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
  StudyProgramKind,
  StudyStatus,
  TopicStatus,
  ResourceKind,
  AccountType,
  FxRateType,
  TransactionKind,
  FinanceCatKind,
  TransactionSource,
  NetWorthKind,
  InstallmentStatus,
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
  renameRoutine,
  deleteRoutine,
  renameRoutineItem,
  reorderRoutines,
  reorderRoutineItems,
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
  renameTodoItem,
  reorderTodoSections,
  reorderTodoItems,
  type TodoSection,
  type TodoItem,
  type TodoSectionWithItems,
} from './todos/functions';

// Estudios
export * from './studies/schema';
export {
  listProgramsWithProgress,
  getProgram,
  createProgram,
  updateProgram,
  deleteProgram,
  listSubjectsWithTopics,
  createSubject,
  deleteSubject,
  createTopic,
  setTopicStatus,
  deleteTopic,
  logStudySession,
  getStudyOverview,
  listResources,
  addResource,
  deleteResource,
  type Program,
  type Subject,
  type Topic,
  type StudySession,
  type StudyResource,
  type ProgramWithProgress,
  type SubjectWithTopics,
} from './studies/functions';

// Enfoque (Pomodoro)
export * from './focus/schema';
export { logFocusSession, getFocusToday, type FocusSession } from './focus/functions';

// Finanzas
export * from './finance/schema';
export {
  listTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  importTransactions,
  listFinanceCategories,
  createFinanceCategory,
  deleteFinanceCategory,
  listAccounts,
  createAccount,
  deleteAccount,
  getFinanceReport,
  getSpendingReport,
  latestFxRates,
  listNetWorth,
  createNetWorthItem,
  updateNetWorthItem,
  deleteNetWorthItem,
  getNetWorthSummary,
  type Transaction,
  type FinanceCategory,
  type Account,
  type FxRate,
  type FinanceReport,
  type SpendingReport,
  type NetWorthItem,
  type NetWorthSummary,
} from './finance/functions';

// Cuotas + Tarjetas AR
export * from './cards/schema';
export {
  listCreditCards,
  createCreditCard,
  createInstallmentPlan,
  listInstallmentPlans,
  listUpcomingInvoices,
  getInflacionMensual,
  type CreditCard,
  type CardInvoice,
  type InstallmentPlan,
  type Installment,
  type PlanWithProgress,
  type InvoiceWithCard,
} from './cards/functions';
