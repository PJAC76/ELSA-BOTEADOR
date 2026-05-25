import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";

/**
 * Initialize native plugins (StatusBar + SplashScreen).
 * Safe no-op on web.
 */
export async function initNative() {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await StatusBar.setStyle({ style: Style.Dark });
    if (Capacitor.getPlatform() === "android") {
      await StatusBar.setBackgroundColor({ color: "#E64C9C" });
    }
    // Don't overlay — let safe-area insets push our UI below the status bar.
    await StatusBar.setOverlaysWebView({ overlay: false });
  } catch (e) {
    console.warn("[native] StatusBar init failed", e);
  }

  try {
    await SplashScreen.hide({ fadeOutDuration: 300 });
  } catch (e) {
    console.warn("[native] SplashScreen hide failed", e);
  }
}
