import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.a323d17d449e4414a6373c9c23c9178e',
  appName: 'ELSA-BOTEADOR',
  webDir: 'dist',
  server: {
    url: 'https://a323d17d-449e-4414-a637-3c9c23c9178e.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
