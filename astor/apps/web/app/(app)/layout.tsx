import { redirect } from 'next/navigation';
import { getProfile } from '@/lib/profile';
import { Sidebar } from '@/components/sidebar';
import { RealtimeRefresher } from '@/components/realtime-refresher';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();
  if (!profile) redirect('/login');

  return (
    <div className="flex min-h-screen">
      <RealtimeRefresher userId={profile.user_id} />
      <Sidebar profile={profile} />
      <main className="flex-1 overflow-y-auto px-600 py-500">{children}</main>
    </div>
  );
}
