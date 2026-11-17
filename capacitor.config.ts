import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.astabr.mangastudiounlimited',
  appName: 'Manga Studio Unlimited',
  webDir: 'dist',
  bundledWebRuntime: false,
  android: {
    backgroundColor: '#10131b',
    allowMixedContent: false,
  },
};

export default config;
