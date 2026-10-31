/**
 * Android Device & Native WebAPK Integration Utilities
 * Handles haptic vibrations, wake lock, native notifications, back gestures,
 * and TWA (Trusted Web Activity) / Android Studio build asset generation.
 */

export interface AndroidProjectBundle {
  twaManifest: string;
  androidManifest: string;
  buildGradle: string;
  stringsXml: string;
  assetLinks: string;
  cliCommand: string;
}

/**
 * Detects whether the current device is running Android
 */
export function isAndroidUserAgent(ua?: string): boolean {
  const agent = ua || (typeof navigator !== 'undefined' ? navigator.userAgent : '');
  return /android/i.test(agent);
}

/**
 * Detects if the web app is running in installed standalone mode (WebAPK / PWA)
 */
export function isStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

/**
 * Haptic Vibration Patterns for Android Devices (in milliseconds)
 */
export const HAPTIC_PATTERNS = {
  tap: [15],
  heartbeat: [40, 70, 40],
  kiss: [30, 40, 50, 40, 30],
  hug: [50, 80, 50],
  unlock: [25, 45, 60],
  chime: [15, 30, 20, 40],
  success: [30, 50, 30, 50, 60],
  error: [60, 40, 60],
} as const;

export type HapticType = keyof typeof HAPTIC_PATTERNS;

/**
 * Triggers native vibration on supported Android devices
 */
export function triggerHaptic(type: HapticType): boolean {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      const pattern = HAPTIC_PATTERNS[type];
      return navigator.vibrate(pattern as unknown as number[]);
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Screen Wake Lock controller (keeps screen on for nightstand / bedside mode)
 */
class WakeLockController {
  private sentinel: any = null;

  public async requestLock(): Promise<boolean> {
    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
      try {
        this.sentinel = await (navigator as any).wakeLock.request('screen');
        this.sentinel.addEventListener('release', () => {
          this.sentinel = null;
        });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }

  public releaseLock(): boolean {
    if (this.sentinel) {
      try {
        this.sentinel.release();
        this.sentinel = null;
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }

  public isLocked(): boolean {
    return this.sentinel !== null && !this.sentinel.released;
  }
}

export const wakeLockController = new WakeLockController();

/**
 * Generates official Android TWA (Trusted Web Activity) & Bubblewrap project configurations
 */
export function generateAndroidProjectBundle(appUrl: string = 'https://ms-verse.app'): AndroidProjectBundle {
  const cleanUrl = appUrl.replace(/\/+$/, '');
  let domain = 'ms-verse.app';
  try {
    const urlObj = new URL(cleanUrl);
    domain = urlObj.hostname;
  } catch {
    // fallback
  }

  const twaManifest = JSON.stringify(
    {
      packageId: 'com.msverse.app',
      host: domain,
      name: 'MS Verse — Our Forever Space',
      launcherName: 'MS Verse',
      themeColor: '#1A181D',
      themeColorDark: '#1A181D',
      navigationColor: '#1A181D',
      navigationColorDark: '#1A181D',
      backgroundColor: '#1A181D',
      enableNotifications: true,
      startUrl: '/',
      iconUrl: `${cleanUrl}/pwa-512x512.png`,
      maskableIconUrl: `${cleanUrl}/pwa-maskable-512x512.png`,
      splashScreenFadeOutDuration: 300,
      signingKey: {
        path: './android.keystore',
        alias: 'android',
      },
      appVersionName: '1.0.0',
      appVersionCode: 1,
      shortcuts: [
        {
          name: 'Couple Calendar',
          shortName: 'Calendar',
          url: '/?tab=calendar',
          chosenIconUrl: `${cleanUrl}/pwa-192x192.png`,
        },
        {
          name: 'Love Clock & Moments',
          shortName: 'Clock',
          url: '/?tab=dashboard',
          chosenIconUrl: `${cleanUrl}/pwa-192x192.png`,
        },
        {
          name: 'Chat & Whispers',
          shortName: 'Chat',
          url: '/?tab=chat',
          chosenIconUrl: `${cleanUrl}/pwa-192x192.png`,
        },
        {
          name: 'Shared Polaroids',
          shortName: 'Polaroids',
          url: '/?tab=memories',
          chosenIconUrl: `${cleanUrl}/pwa-192x192.png`,
        },
      ],
      features: {
        locationDelegation: { enabled: false },
        playBilling: { enabled: false },
      },
      alphaDependencies: {
        enabled: false,
      },
    },
    null,
    2
  );

  const androidManifest = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.msverse.app">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.Translucent.NoTitleBar">

        <meta-data
            android:name="asset_statements"
            android:resource="@string/asset_statements" />

        <activity
            android:name="com.google.androidbrowserhelper.trusted.LauncherActivity"
            android:label="@string/app_name"
            android:screenOrientation="portrait"
            android:exported="true">

            <meta-data
                android:name="android.support.customtabs.trusted.DEFAULT_URL"
                android:value="${cleanUrl}/" />

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data
                    android:scheme="https"
                    android:host="${domain}" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

  const buildGradle = `apply plugin: 'com.android.application'

android {
    compileSdkVersion 34
    defaultConfig {
        applicationId "com.msverse.app"
        minSdkVersion 21
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }
    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
}

dependencies {
    implementation 'androidx.browser:browser:1.8.0'
    implementation 'com.google.androidbrowserhelper:androidbrowserhelper:2.5.0'
}`;

  const stringsXml = `<resources>
    <string name="app_name">MS Verse</string>
    <string name="asset_statements">
        [{\\"relation\\": [\\"delegate_permission/common.handle_all_urls\\"],
          \\"target\\": {\\"namespace\\": \\"web\\", \\"site\\": \\"${cleanUrl}\\"}}]
    </string>
</resources>`;

  const assetLinks = JSON.stringify(
    [
      {
        relation: ['delegate_permission/common.handle_all_urls'],
        target: {
          namespace: 'android_app',
          package_name: 'com.msverse.app',
          sha256_cert_fingerprints: [
            '14:6D:E9:CD:07:4B:43:A1:D3:8D:91:04:76:7E:AA:8B:29:4B:40:53:2F:81:20:4B:5E:2B:22:98:EE:42:E3:86',
          ],
        },
      },
    ],
    null,
    2
  );

  const cliCommand = `# Step 1: Install Google's official Bubblewrap CLI
npm install -g @bubblewrap/cli

# Step 2: Initialize Android Project from your live manifest
bubblewrap init --manifest="${cleanUrl}/manifest.webmanifest"

# Step 3: Build debug or release Android APK
bubblewrap build`;

  return {
    twaManifest,
    androidManifest,
    buildGradle,
    stringsXml,
    assetLinks,
    cliCommand,
  };
}
