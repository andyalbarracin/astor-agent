import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '@astor/design-tokens/mobile';
import { SessionProvider } from '@/contexts/session';

export default function RootLayout() {
  return (
    <SessionProvider>
      {/* initialPreference 'system' = dark-first respetando el dispositivo.
          El override por profiles.theme se puede cablear en una pantalla de ajustes. */}
      <ThemeProvider initialPreference="system">
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }} />
      </ThemeProvider>
    </SessionProvider>
  );
}
