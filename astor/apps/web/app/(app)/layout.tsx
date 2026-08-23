import { redirect } from 'next/navigation';
import { getProfile } from '@/lib/profile';
import { Sidebar } from '@/components/sidebar';
import { BottomNav } from '@/components/bottom-nav';
import { RealtimeRefresher } from '@/components/realtime-refresher';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();
  if (!profile) redirect('/login');

  return (
    <div className="flex min-h-screen">
      <RealtimeRefresher userId={profile.user_id} />
      <Sidebar profile={profile} />
      <main className="flex-1 overflow-y-auto px-4 pb-24 pt-6 sm:px-6 lg:px-12 lg:pb-8 lg:pt-8">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
