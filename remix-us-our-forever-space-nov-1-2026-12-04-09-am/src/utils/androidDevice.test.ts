import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isAndroidUserAgent,
  HAPTIC_PATTERNS,
  generateAndroidProjectBundle,
} from './androidDevice';

test('isAndroidUserAgent correctly detects Android devices', () => {
  const pixelUa = 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
  const samsungUa = 'Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36';
  const iphoneUa = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
  const desktopUa = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  assert.equal(isAndroidUserAgent(pixelUa), true, 'Google Pixel must be identified as Android');
  assert.equal(isAndroidUserAgent(samsungUa), true, 'Samsung Galaxy must be identified as Android');
  assert.equal(isAndroidUserAgent(iphoneUa), false, 'iPhone must NOT be identified as Android');
  assert.equal(isAndroidUserAgent(desktopUa), false, 'Desktop Mac must NOT be identified as Android');
});

test('HAPTIC_PATTERNS has tactile patterns configured for all interactions', () => {
  const keys = ['tap', 'heartbeat', 'kiss', 'hug', 'unlock', 'chime', 'success', 'error'] as const;
  for (const key of keys) {
    const pattern = HAPTIC_PATTERNS[key];
    assert.ok(Array.isArray(pattern), `Pattern for ${key} must be an array`);
    assert.ok(pattern.length > 0, `Pattern for ${key} must have at least 1 duration`);
    pattern.forEach((num) => {
      assert.ok(typeof num === 'number' && num > 0, `Durations must be positive numbers`);
    });
  }
});

test('generateAndroidProjectBundle generates complete Android Studio / TWA configs', () => {
  const bundle = generateAndroidProjectBundle('https://ms-verse.example.com');

  assert.ok(bundle.twaManifest.includes('com.msverse.app'), 'Must contain package id');
  assert.ok(bundle.twaManifest.includes('ms-verse.example.com'), 'Must match domain');
  assert.ok(bundle.androidManifest.includes('android.permission.VIBRATE'), 'Must declare VIBRATE permission');
  assert.ok(bundle.androidManifest.includes('android.permission.WAKE_LOCK'), 'Must declare WAKE_LOCK permission');
  assert.ok(bundle.buildGradle.includes('androidx.browser:browser'), 'Must reference browser library');
  assert.ok(bundle.stringsXml.includes('MS Verse'), 'Must set app name');
  assert.ok(bundle.assetLinks.includes('com.msverse.app'), 'Must include Digital Asset Links');
  assert.ok(bundle.cliCommand.includes('bubblewrap build'), 'Must provide Bubblewrap CLI command');
});
