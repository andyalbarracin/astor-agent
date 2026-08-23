import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DateTime } from 'luxon';
import { Check, ChevronDown, ChevronRight, Plus, Sunrise, Moon, ListChecks, X } from 'lucide-react-native';
import {
  listTodoSections,
  ensureDefaultTodoSections,
  addTodoItem,
  toggleTodoItem,
  deleteTodoItem,
  createTodoSection,
  listRoutines,
  getRoutineCompletions,
  toggleRoutineItem,
  type TodoSectionWithItems,
  type RoutineWithItems,
  type RoutineKind,
} from '@astor/core';
import { useTheme } from '@astor/design-tokens/mobile';
import { useDomainContext } from '@/lib/domain';
import { useRealtime } from '@/lib/use-realtime';

const KIND_ICON: Record<RoutineKind, typeof Sunrise> = { morning: Sunrise, night: Moon, custom: ListChecks };

export default function ProductividadScreen() {
  const t = useTheme();
  const ctx = useDomainContext();
  const [sections, setSections] = useState<TodoSectionWithItems[]>([]);
  const [routines, setRoutines] = useState<RoutineWithItems[]>([]);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [newSection, setNewSection] = useState('');

  const today = DateTime.now().setZone(ctx?.timezone ?? 'utc').toISODate() ?? '';

  const load = useCallback(async () => {
    if (!ctx) return;
    await ensureDefaultTodoSections(ctx);
    const [secs, rs, comp] = await Promise.all([
      listTodoSections(ctx),
      listRoutines(ctx),
      getRoutineCompletions(ctx, today),
    ]);
    setSections(secs);
    setRoutines([...rs].sort((a, b) => kindOrder(a.kind) - kindOrder(b.kind)));
    setCompleted(new Set(comp));
    setExpanded((prev) => (prev.size ? prev : new Set(secs.filter((s) => s.items.length).map((s) => s.id))));
    setLoading(false);
  }, [ctx?.userId, today]);

  useEffect(() => {
    void load();
  }, [load]);
  useRealtime('todo_items', ctx?.userId, () => void load());
  useRealtime('routine_completions', ctx?.userId, () => void load());

  function toggleExpand(id: string) {
    setExpanded((p) => {
      const n = new Set(p);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }
  async function addItem(sectionId: string) {
    const label = (drafts[sectionId] ?? '').trim();
    if (!ctx || !label) return;
    setDrafts((p) => ({ ...p, [sectionId]: '' }));
    await addTodoItem(ctx, { sectionId, label });
    void load();
  }
  async function toggle(itemId: string, done: boolean) {
    if (!ctx) return;
    await toggleTodoItem(ctx, itemId, done);
    void load();
  }
  async function removeItem(itemId: string) {
    if (!ctx) return;
    await deleteTodoItem(ctx, itemId);
    void load();
  }
  async function addSection() {
    if (!ctx || !newSection.trim()) return;
    const name = newSection.trim();
    setNewSection('');
    await createTodoSection(ctx, { name });
    void load();
  }
  async function toggleRoutine(itemId: string, done: boolean) {
    if (!ctx) return;
    await toggleRoutineItem(ctx, itemId, today, done);
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
          {/* Secciones editables */}
          <View style={card(t)}>
            <Text style={cardTitle(t)}>Mi semana</Text>
            {sections.map((s) => {
              const open = expanded.has(s.id);
              const doneCount = s.items.filter((i) => i.done).length;
              return (
                <View key={s.id} style={{ borderTopWidth: 1, borderTopColor: t.color.border.subtle }}>
                  <Pressable
                    onPress={() => toggleExpand(s.id)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10 }}
                  >
                    {open ? (
                      <ChevronDown color={t.color.text.subtlest} size={16} />
                    ) : (
                      <ChevronRight color={t.color.text.subtlest} size={16} />
                    )}
                    <Text style={{ flex: 1, color: t.color.text.default, fontSize: t.fontSize['300'], fontWeight: '600' }}>
                      {s.name}
                    </Text>
                    {s.items.length > 0 && (
                      <Text style={{ color: t.color.text.subtlest, fontSize: t.fontSize['100'] }}>
                        {doneCount}/{s.items.length}
                      </Text>
                    )}
                  </Pressable>
                  {open && (
                    <View style={{ paddingLeft: 22, paddingBottom: 8 }}>
                      {s.items.map((item) => (
                        <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 }}>
                          <Pressable onPress={() => void toggle(item.id, !item.done)}>
                            <Box t={t} done={item.done} />
                          </Pressable>
                          <Text
                            style={{
                              flex: 1,
                              color: item.done ? t.color.text.subtlest : t.color.text.default,
                              fontSize: t.fontSize['300'],
                              textDecorationLine: item.done ? 'line-through' : 'none',
                            }}
                          >
                            {item.label}
                          </Text>
                          <Pressable onPress={() => void removeItem(item.id)} hitSlop={8}>
                            <X color={t.color.text.subtlest} size={15} />
                          </Pressable>
                        </View>
                      ))}
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 }}>
                        <Plus color={t.color.text.subtlest} size={15} />
                        <TextInput
                          value={drafts[s.id] ?? ''}
                          onChangeText={(v) => setDrafts((p) => ({ ...p, [s.id]: v }))}
                          onSubmitEditing={() => void addItem(s.id)}
                          placeholder="Agregar…"
                          placeholderTextColor={t.color.text.subtlest}
                          style={{ flex: 1, color: t.color.text.default, fontSize: t.fontSize['300'], paddingVertical: 4 }}
                        />
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, borderTopWidth: 1, borderTopColor: t.color.border.subtle, paddingTop: 10 }}>
              <Plus color={t.color.signature.default} size={16} />
              <TextInput
                value={newSection}
                onChangeText={setNewSection}
                onSubmitEditing={() => void addSection()}
                placeholder="Nueva sección…"
                placeholderTextColor={t.color.text.subtlest}
                style={{ flex: 1, color: t.color.text.default, fontSize: t.fontSize['300'], paddingVertical: 4 }}
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
                  <View style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: t.color.signature.soft, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon color={t.color.signature.text} size={17} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: t.color.text.default, fontSize: t.fontSize['400'], fontWeight: '600' }}>{r.name}</Text>
                    <Text style={{ color: t.color.text.subtlest, fontSize: t.fontSize['100'] }}>{doneCount}/{r.items.length}</Text>
                  </View>
                </View>
                {r.items.map((item) => {
                  const done = completed.has(item.id);
                  return (
                    <Pressable key={item.id} onPress={() => void toggleRoutine(item.id, !done)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 }}>
                      <Box t={t} done={done} />
                      <Text style={{ flex: 1, color: done ? t.color.text.subtlest : t.color.text.default, fontSize: t.fontSize['300'], textDecorationLine: done ? 'line-through' : 'none' }}>
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function Box({ t, done }: { t: ReturnType<typeof useTheme>; done: boolean }) {
  return (
    <View
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
    </View>
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
