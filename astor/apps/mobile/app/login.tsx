import { useState } from 'react';
import { Text, TextInput, Pressable, View } from 'react-native';
import { Redirect } from 'expo-router';
import * as Linking from 'expo-linking';
import { useTheme } from '@astor/design-tokens/mobile';
import { useSession } from '@/contexts/session';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const t = useTheme();
  const { session, loading } = useSession();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');

  if (!loading && session) return <Redirect href="/" />;

  async function send() {
    setStatus('loading');
    const redirectTo = Linking.createURL('/auth/callback');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });
    setStatus(error ? 'error' : 'sent');
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: t.color.surface.base,
        alignItems: 'center',
        justifyContent: 'center',
        padding: t.space['300'],
      }}
    >
      <View
        style={{
          width: '100%',
          maxWidth: 380,
          backgroundColor: t.color.surface.raised,
          borderColor: t.color.border.subtle,
          borderWidth: 1,
          borderRadius: t.radius.lg,
          padding: t.space['500'],
        }}
      >
        <Text style={{ color: t.color.text.default, fontSize: t.fontSize['700'], fontWeight: '700' }}>
          Astor
        </Text>
        <Text style={{ color: t.color.text.subtle, fontSize: t.fontSize['300'], marginTop: t.space['100'] }}>
          Ingresá con tu email. Te mandamos un enlace mágico.
        </Text>

        {status === 'sent' ? (
          <Text style={{ color: t.color.success.text, fontSize: t.fontSize['300'], marginTop: t.space['400'] }}>
            Listo. Revisá tu email ({email}) y abrí el enlace desde este dispositivo.
          </Text>
        ) : (
          <View style={{ marginTop: t.space['400'], gap: t.space['200'] }}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="vos@ejemplo.com"
              placeholderTextColor={t.color.text.subtlest}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
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
              onPress={send}
              disabled={status === 'loading'}
              style={{
                backgroundColor: t.color.brand.default,
                borderRadius: t.radius.md,
                paddingVertical: t.space['150'],
                alignItems: 'center',
                opacity: status === 'loading' ? 0.6 : 1,
              }}
            >
              <Text style={{ color: t.color.text.inverse, fontSize: t.fontSize['300'], fontWeight: '600' }}>
                {status === 'loading' ? 'Enviando…' : 'Enviar enlace'}
              </Text>
            </Pressable>
            {status === 'error' ? (
              <Text style={{ color: t.color.danger.text, fontSize: t.fontSize['200'] }}>
                No se pudo enviar. Revisá el email.
              </Text>
            ) : null}
          </View>
        )}
      </View>
    </View>
  );
}
