import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.58ff670530d44109adf514b868fb935a',
  appName: 'Fortivus',
  webDir: 'dist',
  server: {
    url: 'https://58ff6705-30d4-4109-adf5-14b868fb935a.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  plugins: {
    CapacitorHealth: {
      // Health permissions will be requested at runtime
    },
  },
};

export default config;
