import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { DateTime } from 'luxon';
import { LogOut, SquareCheckBig, Repeat } from 'lucide-react-native';
import { listTasks, listHabits, type Task, type Habit } from '@astor/core';
import { useTheme } from '@astor/design-tokens/mobile';
import { useDomainContext } from '@/lib/domain';
import { useRealtime } from '@/lib/use-realtime';
import { supabase } from '@/lib/supabase';
import { getProfile } from '@/lib/profile';

function greeting(hour: number): string {
  if (hour < 6) return 'Buenas noches';
  if (hour < 13) return 'Buen día';
  if (hour < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

export default function TodayScreen() {
  const t = useTheme();
  const router = useRouter();
  const ctx = useDomainContext();
  const [name, setName] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todayDone, setTodayDone] = useState(0);

  const load = useCallback(async () => {
    if (!ctx) return;
    const [tk, hs, profile] = await Promise.all([
      listTasks(ctx, { status: ['todo', 'doing'] }),
      listHabits(ctx),
      getProfile(),
    ]);
    setTasks(tk);
    setHabits(hs);
    setName(profile?.display_name?.split(' ')[0] ?? '');
    const todayKey = DateTime.now().setZone(ctx.timezone).toISODate() ?? '';
    const { data } = await ctx.supabase
      .from('habit_logs')
      .select('habit_id')
      .eq('date', todayKey)
      .eq('status', 'done');
    setTodayDone(data?.length ?? 0);
  }, [ctx?.userId]);

  useEffect(() => {
    void load();
  }, [load]);
  useRealtime('tasks', ctx?.userId, () => void load());
  useRealtime('habit_logs', ctx?.userId, () => void load());

  const now = DateTime.now().setZone(ctx?.timezone ?? 'utc').setLocale('es-AR');
  const pendingHabits = Math.max(0, habits.length - todayDone);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.color.surface.base }}>
      <ScrollView contentContainerStyle={{ padding: t.space['300'], gap: t.space['400'] }}>
        <View>
          <Text style={{ color: t.color.text.default, fontSize: t.fontSize['700'], fontWeight: '700' }}>
            {greeting(now.hour)}
            {name ? `, ${name}` : ''}.
          </Text>
          <Text style={{ color: t.color.text.subtle, fontSize: t.fontSize['300'], marginTop: 4, textTransform: 'capitalize' }}>
            {now.toLocaleString(DateTime.DATE_HUGE)}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: t.space['200'] }}>
          <Pressable
            onPress={() => router.push('/tasks')}
            style={{
              flex: 1,
              backgroundColor: t.color.surface.raised,
              borderColor: t.color.border.subtle,
              borderWidth: 1,
              borderRadius: t.radius.lg,
              padding: t.space['300'],
              gap: 8,
            }}
          >
            <SquareCheckBig color={t.color.brand.text} size={20} />
            <Text style={{ color: t.color.text.default, fontSize: t.fontSize['700'], fontWeight: '700' }}>
              {tasks.length}
            </Text>
            <Text style={{ color: t.color.text.subtle, fontSize: t.fontSize['200'] }}>tareas pendientes</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/habits')}
            style={{
              flex: 1,
              backgroundColor: t.color.surface.raised,
              borderColor: t.color.border.subtle,
              borderWidth: 1,
              borderRadius: t.radius.lg,
              padding: t.space['300'],
              gap: 8,
            }}
          >
            <Repeat color={t.color.signature.text} size={20} />
            <Text style={{ color: t.color.text.default, fontSize: t.fontSize['700'], fontWeight: '700' }}>
              {pendingHabits}
            </Text>
            <Text style={{ color: t.color.text.subtle, fontSize: t.fontSize['200'] }}>hábitos por marcar</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() => void supabase.auth.signOut()}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: t.space['200'] }}
        >
          <LogOut color={t.color.text.subtle} size={16} />
          <Text style={{ color: t.color.text.subtle, fontSize: t.fontSize['200'] }}>Cerrar sesión</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
