import type { CapacitorConfig } from '@capacitor/cli';

// Toggle standalone (offline) mode:
//   CAP_STANDALONE=1 npx cap sync android   -> empaqueta el dist local, sin server.url
//   npx cap sync android                    -> modo dev con hot reload desde el preview de Lovable
const isStandalone = process.env.CAP_STANDALONE === '1';

const config: CapacitorConfig = {
  appId: 'app.lovable.a323d17d449e4414a6373c9c23c9178e',
  appName: 'ELSA-BOTEADOR',
  webDir: 'dist',
  ...(isStandalone
    ? {}
    : {
        server: {
          url: 'https://a323d17d-449e-4414-a637-3c9c23c9178e.lovableproject.com?forceHideBadge=true',
          cleartext: true,
        },
      }),
  android: {
    allowMixedContent: true,
  },
  ios: {
    contentInset: 'always',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#E64C9C',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#E64C9C',
      overlaysWebView: false,
    },
  },
};

export default config;
