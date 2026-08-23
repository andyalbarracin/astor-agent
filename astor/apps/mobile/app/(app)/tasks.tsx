import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DateTime } from 'luxon';
import { Check, Plus, X } from 'lucide-react-native';
import {
  listTasks,
  createTask,
  completeTask,
  setTaskStatus,
  type Task,
  type TaskStatus,
} from '@astor/core';
import { useTheme } from '@astor/design-tokens/mobile';
import { useDomainContext } from '@/lib/domain';
import { useRealtime } from '@/lib/use-realtime';

const PRIO_COLOR: Record<number, 'danger' | 'warning' | 'brand' | 'text'> = {
  1: 'danger',
  2: 'warning',
  3: 'brand',
  4: 'text',
};

const SECTIONS: { status: TaskStatus; label: string }[] = [
  { status: 'todo', label: 'Por hacer' },
  { status: 'doing', label: 'Haciendo' },
  { status: 'done', label: 'Hecho' },
];

export default function TasksScreen() {
  const t = useTheme();
  const ctx = useDomainContext();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!ctx) return;
    const data = await listTasks(ctx, { status: ['todo', 'doing', 'done'] });
    setTasks(data);
    setLoading(false);
  }, [ctx?.userId]);

  useEffect(() => {
    void load();
  }, [load]);

  useRealtime('tasks', ctx?.userId, () => void load());

  async function complete(task: Task) {
    if (!ctx) return;
    setTasks((cur) => cur.map((x) => (x.id === task.id ? { ...x, status: 'done' } : x)));
    if (task.status === 'done') await setTaskStatus(ctx, task.id, 'todo');
    else await completeTask(ctx, task.id);
    void load();
  }

  async function create() {
    if (!ctx || !title.trim()) return;
    setSaving(true);
    await createTask(ctx, { title: title.trim() });
    setTitle('');
    setSaving(false);
    setModal(false);
    void load();
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.color.surface.base }}>
      <View style={{ paddingHorizontal: t.space['300'], paddingTop: t.space['200'], paddingBottom: t.space['100'] }}>
        <Text style={{ color: t.color.text.default, fontSize: t.fontSize['700'], fontWeight: '700' }}>
          Tareas
        </Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={t.color.brand.default} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: t.space['300'], gap: t.space['400'] }}>
          {SECTIONS.map((section) => {
            const list = tasks.filter((x) => x.status === section.status);
            return (
              <View key={section.status} style={{ gap: t.space['150'] }}>
                <Text style={{ color: t.color.text.subtle, fontSize: t.fontSize['200'], fontWeight: '600' }}>
                  {section.label} · {list.length}
                </Text>
                {list.length === 0 && (
                  <Text style={{ color: t.color.text.subtlest, fontSize: t.fontSize['200'] }}>Vacío</Text>
                )}
                {list.map((task) => {
                  const due = task.due_at
                    ? DateTime.fromISO(task.due_at, { zone: ctx?.timezone ?? 'utc' }).setLocale('es-AR').toFormat('d LLL')
                    : null;
                  const done = task.status === 'done';
                  return (
                    <View
                      key={task.id}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: t.space['200'],
                        backgroundColor: t.color.surface.raised,
                        borderColor: t.color.border.subtle,
                        borderWidth: 1,
                        borderRadius: t.radius.lg,
                        padding: t.space['300'],
                      }}
                    >
                      <Pressable
                        onPress={() => void complete(task)}
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 6,
                          borderWidth: 1.5,
                          borderColor: done ? t.color.signature.default : t.color.border.default,
                          backgroundColor: done ? t.color.signature.soft : 'transparent',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {done && <Check color={t.color.signature.text} size={14} />}
                      </Pressable>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            color: done ? t.color.text.subtlest : t.color.text.default,
                            fontSize: t.fontSize['300'],
                            textDecorationLine: done ? 'line-through' : 'none',
                          }}
                        >
                          {task.title}
                        </Text>
                        <View style={{ flexDirection: 'row', gap: t.space['200'], marginTop: 4 }}>
                          <Text style={{ color: t.color[PRIO_COLOR[task.priority] ?? 'text'].default, fontSize: t.fontSize['100'] }}>
                            P{task.priority}
                          </Text>
                          {due && (
                            <Text style={{ color: t.color.text.subtlest, fontSize: t.fontSize['100'] }}>{due}</Text>
                          )}
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* FAB */}
      <Pressable
        onPress={() => setModal(true)}
        style={{
          position: 'absolute',
          right: t.space['300'],
          bottom: t.space['400'],
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: t.color.signature.default,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Plus color="#1a1204" size={26} />
      </Pressable>

      <Modal visible={modal} transparent animationType="slide" onRequestClose={() => setModal(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(5,7,10,0.6)' }}>
          <View
            style={{
              backgroundColor: t.color.surface.raised,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: t.space['400'],
              gap: t.space['300'],
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: t.color.text.default, fontSize: t.fontSize['500'], fontWeight: '600' }}>
                Nueva tarea
              </Text>
              <Pressable onPress={() => setModal(false)}>
                <X color={t.color.text.subtle} size={20} />
              </Pressable>
            </View>
            <TextInput
              value={title}
              onChangeText={setTitle}
              autoFocus
              placeholder="Título…"
              placeholderTextColor={t.color.text.subtlest}
              style={{
                color: t.color.text.default,
                fontSize: t.fontSize['300'],
                backgroundColor: t.color.surface.base,
                borderColor: t.color.border.default,
                borderWidth: 1,
                borderRadius: t.radius.md,
                paddingHorizontal: t.space['200'],
                paddingVertical: t.space['150'],
              }}
            />
            <Pressable
              onPress={() => void create()}
              disabled={saving || !title.trim()}
              style={{
                backgroundColor: t.color.signature.default,
                borderRadius: t.radius.md,
                paddingVertical: t.space['150'],
                alignItems: 'center',
                opacity: saving || !title.trim() ? 0.6 : 1,
              }}
            >
              <Text style={{ color: '#1a1204', fontSize: t.fontSize['300'], fontWeight: '600' }}>
                {saving ? 'Creando…' : 'Crear tarea'}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
