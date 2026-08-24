import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DateTime } from 'luxon';
import { Plus, X, Circle, CircleDashed, CheckCircle2, ChevronDown, ChevronRight, CalendarClock } from 'lucide-react-native';
import {
  listProgramsWithProgress,
  listSubjectsWithTopics,
  createProgram,
  createTopic,
  setTopicStatus,
  type ProgramWithProgress,
  type SubjectWithTopics,
  type TopicStatus,
  type StudyProgramKind,
} from '@astor/core';
import { useTheme } from '@astor/design-tokens/mobile';
import { useDomainContext } from '@/lib/domain';

const KIND_LABEL: Record<StudyProgramKind, string> = { curso: 'Curso', carrera: 'Carrera', examen: 'Examen', otro: 'Otro' };
const NEXT: Record<TopicStatus, TopicStatus> = { todo: 'learning', learning: 'learned', learned: 'todo' };

export default function EstudiosScreen() {
  const t = useTheme();
  const ctx = useDomainContext();
  const [programs, setPrograms] = useState<ProgramWithProgress[]>([]);
  const [subsByProgram, setSubs] = useState<Record<string, SubjectWithTopics[]>>({});
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [name, setName] = useState('');
  const [kind, setKind] = useState<StudyProgramKind>('curso');
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    if (!ctx) return;
    const ps = await listProgramsWithProgress(ctx);
    const map: Record<string, SubjectWithTopics[]> = {};
    await Promise.all(ps.map(async (p) => { map[p.id] = await listSubjectsWithTopics(ctx, p.id); }));
    setPrograms(ps);
    setSubs(map);
    setLoading(false);
  }, [ctx?.userId]);

  useEffect(() => { void load(); }, [load]);

  function toggleExpand(id: string) {
    setExpanded((p) => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }
  function cycle(programId: string, subjectId: string, topicId: string, status: TopicStatus) {
    if (!ctx) return;
    const next = NEXT[status];
    setSubs((cur) => ({
      ...cur,
      [programId]: (cur[programId] ?? []).map((s) => (s.id === subjectId ? { ...s, topics: s.topics.map((tp) => (tp.id === topicId ? { ...tp, status: next } : tp)) } : s)),
    }));
    void setTopicStatus(ctx, topicId, next);
  }
  async function addTopic(programId: string, subjectId: string) {
    const title = (drafts[subjectId] ?? '').trim();
    if (!ctx || !title) return;
    setDrafts((p) => ({ ...p, [subjectId]: '' }));
    await createTopic(ctx, { subjectId, title });
    void load();
  }
  async function createProg() {
    if (!ctx || !name.trim()) return;
    await createProgram(ctx, { name: name.trim(), kind });
    setName(''); setKind('curso'); setModal(false);
    void load();
  }

  const statusIcon = (s: TopicStatus) =>
    s === 'learned' ? <CheckCircle2 color={t.color.success.default} size={18} />
    : s === 'learning' ? <CircleDashed color={t.color.signature.default} size={18} />
    : <Circle color={t.color.text.subtlest} size={18} />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.color.surface.base }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: t.space['300'], paddingTop: t.space['200'] }}>
        <Text style={{ color: t.color.text.default, fontSize: t.fontSize['700'], fontWeight: '700' }}>Estudios</Text>
        <Pressable onPress={() => setModal(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: t.color.signature.default, borderRadius: t.radius.md, paddingHorizontal: 10, paddingVertical: 6 }}>
          <Plus color="#1a1204" size={16} />
          <Text style={{ color: '#1a1204', fontSize: t.fontSize['200'], fontWeight: '600' }}>Programa</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={t.color.brand.default} /></View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: t.space['300'], gap: t.space['200'] }}>
          {programs.map((p) => {
            const color = p.color ?? '#3FA9B8';
            const open = expanded.has(p.id);
            let cd: string | null = null;
            if (p.kind === 'examen' && p.target_date) {
              const days = Math.round(DateTime.fromISO(p.target_date, { zone: ctx?.timezone ?? 'utc' }).startOf('day').diff(DateTime.now().setZone(ctx?.timezone ?? 'utc').startOf('day'), 'days').days);
              cd = days < 0 ? 'pasó' : days === 0 ? 'hoy' : `faltan ${days}d`;
            }
            return (
              <View key={p.id} style={{ backgroundColor: t.color.surface.raised, borderColor: t.color.border.subtle, borderWidth: 1, borderRadius: t.radius.lg, overflow: 'hidden' }}>
                <View style={{ height: 5, backgroundColor: color }} />
                <Pressable onPress={() => toggleExpand(p.id)} style={{ padding: t.space['300'], gap: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {open ? <ChevronDown color={t.color.text.subtlest} size={16} /> : <ChevronRight color={t.color.text.subtlest} size={16} />}
                    <Text style={{ color, fontSize: t.fontSize['100'], fontWeight: '600' }}>{KIND_LABEL[p.kind]}</Text>
                    {cd && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginLeft: 'auto' }}>
                        <CalendarClock color={t.color.signature.text} size={12} />
                        <Text style={{ color: t.color.signature.text, fontSize: t.fontSize['100'] }}>{cd}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ color: t.color.text.default, fontSize: t.fontSize['400'], fontWeight: '600' }}>{p.name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={{ flex: 1, height: 6, backgroundColor: t.color.surface.sunken, borderRadius: 3, overflow: 'hidden' }}>
                      <View style={{ width: `${p.progress}%`, height: '100%', backgroundColor: color, borderRadius: 3 }} />
                    </View>
                    <Text style={{ color: t.color.text.subtle, fontSize: t.fontSize['100'] }}>{p.topicsLearned}/{p.topicsTotal}</Text>
                  </View>
                </Pressable>

                {open && (subsByProgram[p.id] ?? []).map((s) => (
                  <View key={s.id} style={{ paddingHorizontal: t.space['300'], paddingBottom: t.space['200'] }}>
                    <Text style={{ color: t.color.text.subtle, fontSize: t.fontSize['200'], fontWeight: '600', marginTop: 8, marginBottom: 4 }}>{s.name}</Text>
                    {s.topics.map((tp) => (
                      <Pressable key={tp.id} onPress={() => cycle(p.id, s.id, tp.id, tp.status)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 }}>
                        {statusIcon(tp.status)}
                        <Text style={{ flex: 1, color: tp.status === 'learned' ? t.color.text.subtlest : t.color.text.default, fontSize: t.fontSize['300'], textDecorationLine: tp.status === 'learned' ? 'line-through' : 'none' }}>{tp.title}</Text>
                      </Pressable>
                    ))}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 }}>
                      <Plus color={t.color.text.subtlest} size={15} />
                      <TextInput value={drafts[s.id] ?? ''} onChangeText={(v) => setDrafts((d) => ({ ...d, [s.id]: v }))} onSubmitEditing={() => void addTopic(p.id, s.id)} placeholder="Agregar tema…" placeholderTextColor={t.color.text.subtlest} style={{ flex: 1, color: t.color.text.default, fontSize: t.fontSize['300'], paddingVertical: 2 }} />
                    </View>
                  </View>
                ))}
              </View>
            );
          })}
        </ScrollView>
      )}

      <Modal visible={modal} transparent animationType="slide" onRequestClose={() => setModal(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(5,7,10,0.6)' }}>
          <View style={{ backgroundColor: t.color.surface.raised, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: t.space['400'], gap: t.space['300'] }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: t.color.text.default, fontSize: t.fontSize['500'], fontWeight: '600' }}>Nuevo programa</Text>
              <Pressable onPress={() => setModal(false)}><X color={t.color.text.subtle} size={20} /></Pressable>
            </View>
            <TextInput value={name} onChangeText={setName} autoFocus placeholder="Nombre" placeholderTextColor={t.color.text.subtlest} style={{ color: t.color.text.default, fontSize: t.fontSize['300'], backgroundColor: t.color.surface.base, borderColor: t.color.border.default, borderWidth: 1, borderRadius: t.radius.md, paddingHorizontal: t.space['200'], paddingVertical: t.space['150'] }} />
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {(Object.keys(KIND_LABEL) as StudyProgramKind[]).map((k) => (
                <Pressable key={k} onPress={() => setKind(k)} style={{ flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: t.radius.md, borderWidth: 1, borderColor: kind === k ? t.color.signature.default : t.color.border.default, backgroundColor: kind === k ? t.color.signature.soft : 'transparent' }}>
                  <Text style={{ color: kind === k ? t.color.signature.text : t.color.text.subtle, fontSize: t.fontSize['100'], fontWeight: '600' }}>{KIND_LABEL[k]}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable onPress={() => void createProg()} disabled={!name.trim()} style={{ backgroundColor: t.color.signature.default, borderRadius: t.radius.md, paddingVertical: t.space['150'], alignItems: 'center', opacity: name.trim() ? 1 : 0.6 }}>
              <Text style={{ color: '#1a1204', fontSize: t.fontSize['300'], fontWeight: '600' }}>Crear</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
