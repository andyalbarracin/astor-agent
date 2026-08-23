import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DateTime } from 'luxon';
import { Check, Plus, Sunrise, Moon, ListChecks } from 'lucide-react-native';
import {
  listRoutines,
  getRoutineCompletions,
  toggleRoutineItem,
  addRoutineItem,
  listTasks,
  createTask,
  completeTask,
  setTaskStatus,
  type RoutineWithItems,
  type RoutineKind,
  type Task,
} from '@astor/core';
import { useTheme } from '@astor/design-tokens/mobile';
import { useDomainContext } from '@/lib/domain';
import { useRealtime } from '@/lib/use-realtime';

const KIND_ICON: Record<RoutineKind, typeof Sunrise> = {
  morning: Sunrise,
  night: Moon,
  custom: ListChecks,
};

function CheckRow({
  label,
  done,
  onToggle,
  onColor,
}: {
  label: string;
  done: boolean;
  onToggle: () => void;
  onColor: string;
}) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onToggle}
      style={{ flexDirection: 'row', alignItems: 'center', gap: t.space['200'], paddingVertical: 8 }}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          borderWidth: 1.5,
          borderColor: done ? onColor : t.color.border.default,
          backgroundColor: done ? t.color.signature.soft : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {done && <Check color={onColor} size={14} />}
      </View>
      <Text
        style={{
          flex: 1,
          color: done ? t.color.text.subtlest : t.color.text.default,
          fontSize: t.fontSize['300'],
          textDecorationLine: done ? 'line-through' : 'none',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function ProductividadScreen() {
  const t = useTheme();
  const ctx = useDomainContext();
  const [routines, setRoutines] = useState<RoutineWithItems[]>([]);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTodo, setNewTodo] = useState('');

  const today = DateTime.now().setZone(ctx?.timezone ?? 'utc').toISODate() ?? '';

  const load = useCallback(async () => {
    if (!ctx) return;
    const [rs, comp, tk] = await Promise.all([
      listRoutines(ctx),
      getRoutineCompletions(ctx, today),
      listTasks(ctx, { status: ['todo', 'doing'] }),
    ]);
    setRoutines([...rs].sort((a, b) => kindOrder(a.kind) - kindOrder(b.kind)));
    setCompleted(new Set(comp));
    setTasks(tk);
    setLoading(false);
  }, [ctx?.userId, today]);

  useEffect(() => {
    void load();
  }, [load]);
  useRealtime('routine_completions', ctx?.userId, () => void load());
  useRealtime('tasks', ctx?.userId, () => void load());

  async function toggleItem(itemId: string, done: boolean) {
    if (!ctx) return;
    setCompleted((prev) => {
      const n = new Set(prev);
      if (done) n.add(itemId);
      else n.delete(itemId);
      return n;
    });
    await toggleRoutineItem(ctx, itemId, today, done);
    void load();
  }
  async function completeTodo(task: Task) {
    if (!ctx) return;
    setTasks((cur) => cur.filter((x) => x.id !== task.id));
    await completeTask(ctx, task.id);
    void load();
  }
  async function addTodo() {
    if (!ctx || !newTodo.trim()) return;
    const scheduledAt = DateTime.now().setZone(ctx.timezone).set({ hour: 9 }).toISO() ?? undefined;
    await createTask(ctx, { title: newTodo.trim(), scheduledAt });
    setNewTodo('');
    void load();
  }
  async function addStep(routineId: string, label: string) {
    if (!ctx || !label.trim()) return;
    await addRoutineItem(ctx, { routineId, label: label.trim() });
    void load();
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.color.surface.base }}>
      <View style={{ paddingHorizontal: t.space['300'], paddingTop: t.space['200'] }}>
        <Text style={{ color: t.color.text.default, fontSize: t.fontSize['700'], fontWeight: '700' }}>
          Productividad
        </Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={t.color.brand.default} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: t.space['300'], gap: t.space['300'] }}>
          {/* To-do de hoy */}
          <View style={card(t)}>
            <Text style={cardTitle(t)}>To-do de hoy</Text>
            {tasks.length === 0 && (
              <Text style={{ color: t.color.text.subtlest, fontSize: t.fontSize['200'], paddingVertical: 6 }}>
                Nada pendiente. 🎉
              </Text>
            )}
            {tasks.map((task) => (
              <CheckRow
                key={task.id}
                label={task.title}
                done={false}
                onToggle={() => void completeTodo(task)}
                onColor={t.color.signature.text}
              />
            ))}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <Plus color={t.color.text.subtlest} size={16} />
              <TextInput
                value={newTodo}
                onChangeText={setNewTodo}
                onSubmitEditing={() => void addTodo()}
                placeholder="Agregar tarea…"
                placeholderTextColor={t.color.text.subtlest}
                style={{ flex: 1, color: t.color.text.default, fontSize: t.fontSize['300'], paddingVertical: 6 }}
              />
            </View>
          </View>

          {/* Rutinas */}
          {routines.map((r) => {
            const Icon = KIND_ICON[r.kind];
            const doneCount = r.items.filter((i) => completed.has(i.id)).length;
            return (
              <View key={r.id} style={card(t)}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space['200'], marginBottom: 6 }}>
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 9,
                      backgroundColor: t.color.signature.soft,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon color={t.color.signature.text} size={17} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: t.color.text.default, fontSize: t.fontSize['400'], fontWeight: '600' }}>
                      {r.name}
                    </Text>
                    <Text style={{ color: t.color.text.subtlest, fontSize: t.fontSize['100'] }}>
                      {doneCount}/{r.items.length}
                    </Text>
                  </View>
                </View>
                {r.items.map((item) => (
                  <CheckRow
                    key={item.id}
                    label={item.label}
                    done={completed.has(item.id)}
                    onToggle={() => void toggleItem(item.id, !completed.has(item.id))}
                    onColor={t.color.signature.default}
                  />
                ))}
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function kindOrder(k: RoutineKind): number {
  return k === 'morning' ? 0 : k === 'custom' ? 1 : 2;
}
function card(t: ReturnType<typeof useTheme>) {
  return {
    backgroundColor: t.color.surface.raised,
    borderColor: t.color.border.subtle,
    borderWidth: 1,
    borderRadius: t.radius.lg,
    padding: t.space['300'],
  };
}
function cardTitle(t: ReturnType<typeof useTheme>) {
  return { color: t.color.text.default, fontSize: t.fontSize['400'], fontWeight: '600' as const, marginBottom: 4 };
}
