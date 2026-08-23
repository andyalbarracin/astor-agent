import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@astor/design-tokens/mobile';
import { supabase } from '@/lib/supabase';

/**
 * Destino del deep link del enlace mágico (astor://auth/callback?code=…).
 * Intercambia el code por una sesión y vuelve al inicio; el guard de (app)
 * decide login/app según la sesión resultante.
 */
export default function AuthCallback() {
  const t = useTheme();
  const { code } = useLocalSearchParams<{ code?: string }>();

  useEffect(() => {
    (async () => {
      if (code) await supabase.auth.exchangeCodeForSession(code);
      router.replace('/');
    })();
  }, [code]);

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
