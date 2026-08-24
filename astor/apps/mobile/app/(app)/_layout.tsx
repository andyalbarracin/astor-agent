import { ActivityIndicator, View } from 'react-native';
import { Redirect, Tabs } from 'expo-router';
import { LayoutDashboard, ListTodo, SquareCheckBig, Repeat, GraduationCap } from 'lucide-react-native';
import { useTheme } from '@astor/design-tokens/mobile';
import { useSession } from '@/contexts/session';

export default function AppLayout() {
  const t = useTheme();
  const { session, loading } = useSession();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: t.color.surface.base,
        }}
      >
        <ActivityIndicator color={t.color.brand.default} />
      </View>
    );
  }

  if (!session) return <Redirect href="/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.color.signature.default,
        tabBarInactiveTintColor: t.color.text.subtlest,
        tabBarStyle: {
          backgroundColor: t.color.surface.raised,
          borderTopColor: t.color.border.subtle,
        },
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Hoy', tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="productividad"
        options={{ title: 'Día', tabBarIcon: ({ color, size }) => <ListTodo color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="tasks"
        options={{ title: 'Tareas', tabBarIcon: ({ color, size }) => <SquareCheckBig color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="habits"
        options={{ title: 'Hábitos', tabBarIcon: ({ color, size }) => <Repeat color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="estudios"
        options={{ title: 'Estudios', tabBarIcon: ({ color, size }) => <GraduationCap color={color} size={size} /> }}
      />
    </Tabs>
  );
}
