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
import { Check, Flame, Plus, SkipForward, X } from 'lucide-react-native';
import {
  listHabits,
  getHabitLogs,
  createHabit,
  logHabit,
  computeStreak,
  type Habit,
  type HabitLog,
} from '@astor/core';
import { useTheme } from '@astor/design-tokens/mobile';
import { useDomainContext } from '@/lib/domain';
import { useRealtime } from '@/lib/use-realtime';
import { Heatmap } from '@/components/heatmap';

export default function HabitsScreen() {
  const t = useTheme();
  const ctx = useDomainContext();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<Record<string, HabitLog[]>>({});
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!ctx) return;
    const hs = await listHabits(ctx);
    const since = DateTime.now().setZone(ctx.timezone).minus({ days: 140 }).toISODate() ?? undefined;
    const byHabit: Record<string, HabitLog[]> = {};
    await Promise.all(
      hs.map(async (h) => {
        byHabit[h.id] = await getHabitLogs(ctx, h.id, since);
      }),
    );
    setHabits(hs);
    setLogs(byHabit);
    setLoading(false);
  }, [ctx?.userId]);

  useEffect(() => {
    void load();
  }, [load]);

  useRealtime('habit_logs', ctx?.userId, () => void load());

  async function log(habit: Habit, status: 'done' | 'skipped') {
    if (!ctx) return;
    const today = DateTime.now().setZone(ctx.timezone).toISODate() ?? '';
    await logHabit(ctx, { habitId: habit.id, date: today, status });
    void load();
  }

  async function create() {
    if (!ctx || !name.trim()) return;
    setSaving(true);
    await createHabit(ctx, { name: name.trim() });
    setName('');
    setSaving(false);
    setModal(false);
    void load();
  }

  const todayKey = DateTime.now().setZone(ctx?.timezone ?? 'utc').toISODate() ?? '';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.color.surface.base }}>
      <View style={{ paddingHorizontal: t.space['300'], paddingTop: t.space['200'], paddingBottom: t.space['100'] }}>
        <Text style={{ color: t.color.text.default, fontSize: t.fontSize['700'], fontWeight: '700' }}>
          Hábitos
        </Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={t.color.brand.default} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: t.space['300'], gap: t.space['300'] }}>
          {habits.length === 0 && (
            <Text style={{ color: t.color.text.subtlest, fontSize: t.fontSize['200'], textAlign: 'center', marginTop: 40 }}>
              Sin hábitos aún. Tocá + para crear uno.
            </Text>
          )}
          {habits.map((h) => {
            const hLogs = logs[h.id] ?? [];
            const lite = hLogs.map((l) => ({ date: l.date, status: l.status }));
            const streak = computeStreak(lite, DateTime.now().setZone(ctx?.timezone ?? 'utc').startOf('day'));
            const todayStatus = hLogs.find((l) => l.date === todayKey)?.status ?? null;
            return (
              <View
                key={h.id}
                style={{
                  backgroundColor: t.color.surface.raised,
                  borderColor: t.color.border.subtle,
                  borderWidth: 1,
                  borderRadius: t.radius.lg,
                  padding: t.space['300'],
                  gap: t.space['300'],
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: t.color.text.default, fontSize: t.fontSize['400'], fontWeight: '600' }}>
                    {h.name}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Flame color={streak.current > 0 ? t.color.signature.default : t.color.text.subtlest} size={15} />
                    <Text style={{ color: t.color.text.default, fontSize: t.fontSize['200'] }}>{streak.current}</Text>
                  </View>
                </View>

                <Heatmap logs={lite} timezone={ctx?.timezone ?? 'utc'} />

                <View style={{ flexDirection: 'row', gap: t.space['150'] }}>
                  <Pressable
                    onPress={() => void log(h, 'done')}
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      paddingVertical: t.space['150'],
                      borderRadius: t.radius.md,
                      borderWidth: 1,
                      borderColor: todayStatus === 'done' ? t.color.signature.default : t.color.border.default,
                      backgroundColor: todayStatus === 'done' ? t.color.signature.soft : 'transparent',
                    }}
                  >
                    <Check color={todayStatus === 'done' ? t.color.signature.text : t.color.text.subtle} size={16} />
                    <Text style={{ color: todayStatus === 'done' ? t.color.signature.text : t.color.text.subtle, fontSize: t.fontSize['200'], fontWeight: '600' }}>
                      {todayStatus === 'done' ? 'Hecho hoy' : 'Marcar hecho'}
                    </Text>
                  </Pressable>
                  {h.allow_skip && (
                    <Pressable
                      onPress={() => void log(h, 'skipped')}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        paddingHorizontal: t.space['300'],
                        paddingVertical: t.space['150'],
                        borderRadius: t.radius.md,
                        borderWidth: 1,
                        borderColor: t.color.border.default,
                        backgroundColor: todayStatus === 'skipped' ? t.color.surface.overlay : 'transparent',
                      }}
                    >
                      <SkipForward color={t.color.text.subtle} size={16} />
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

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
                Nuevo hábito
              </Text>
              <Pressable onPress={() => setModal(false)}>
                <X color={t.color.text.subtle} size={20} />
              </Pressable>
            </View>
            <TextInput
              value={name}
              onChangeText={setName}
              autoFocus
              placeholder="Meditar, correr, leer…"
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
              disabled={saving || !name.trim()}
              style={{
                backgroundColor: t.color.signature.default,
                borderRadius: t.radius.md,
                paddingVertical: t.space['150'],
                alignItems: 'center',
                opacity: saving || !name.trim() ? 0.6 : 1,
              }}
            >
              <Text style={{ color: '#1a1204', fontSize: t.fontSize['300'], fontWeight: '600' }}>
                {saving ? 'Creando…' : 'Crear hábito'}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
