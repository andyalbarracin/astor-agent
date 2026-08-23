import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Los paquetes del workspace se consumen como TS source (sin build previo).
  transpilePackages: ['@astor/design-tokens', '@astor/core', '@astor/supabase'],
};

export default nextConfig;
