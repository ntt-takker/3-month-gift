import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getRelationshipDays,
  initialProfile,
  initialTruthOrDare,
  initialCompliments,
  initialMilestones,
  initialPlaylist,
  initialChatMessages,
  initialTodos,
  formatSpotifyEmbedUrl,
  deduplicateMessages,
  checkIsMilestoneToday,
} from './storage';

test('getRelationshipDays calculates elapsed days correctly', () => {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const days = getRelationshipDays(oneDayAgo);
  assert.ok(days >= 1, 'Should be at least 1 day');

  const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const zeroDays = getRelationshipDays(futureDate);
  assert.equal(zeroDays, 0, 'Future anniversary should return 0 days');
});

test('initialProfile has valid partner profiles and mutual nickname settings', () => {
  assert.ok(initialProfile.partner1.name, 'Partner 1 should have a name');
  assert.ok(initialProfile.partner2.name, 'Partner 2 should have a name');
  assert.equal(initialProfile.partner1.nicknameSetBy, 'partner2', 'Partner 1 nickname must be set by partner2');
  assert.equal(initialProfile.partner2.nicknameSetBy, 'partner1', 'Partner 2 nickname must be set by partner1');
  assert.equal(initialProfile.passcode, '0731', 'Default passcode should be 0731');
});

test('initialTruthOrDare covers all 3 distinct game modes with truths and dares', () => {
  const modes = ['apart', 'public', 'dark'] as const;
  for (const mode of modes) {
    const truths = initialTruthOrDare.filter((c) => c.mode === mode && c.type === 'truth');
    const dares = initialTruthOrDare.filter((c) => c.mode === mode && c.type === 'dare');
    assert.ok(truths.length > 0, `Mode ${mode} should have truths`);
    assert.ok(dares.length > 0, `Mode ${mode} should have dares`);
  }
});

test('initialCompliments has compliments for both partners', () => {
  const forPartner2 = initialCompliments.filter((c) => c.to === 'partner2');
  const forPartner1 = initialCompliments.filter((c) => c.to === 'partner1');
  assert.ok(forPartner2.length > 0, 'Should have compliments for Partner 2');
  assert.ok(forPartner1.length > 0, 'Should have compliments for Partner 1 (Him)');
});

test('initialMilestones includes 3rd Month Anniversary', () => {
  const month3 = initialMilestones.find((m) => m.title.includes('3rd Month') || m.title.includes('3 Months'));
  assert.ok(month3, 'Must contain 3rd Month milestone');
});

test('formatSpotifyEmbedUrl formats playlist and track links properly', () => {
  const playlistUrl = 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=123';
  const embed = formatSpotifyEmbedUrl(playlistUrl);
  assert.ok(embed.includes('open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M'), 'Should format to embed url');

  const trackUrl = 'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT';
  const trackEmbed = formatSpotifyEmbedUrl(trackUrl);
  assert.ok(trackEmbed.includes('open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT'), 'Should format track to embed url');
});

test('initialPlaylist and initialChatMessages are valid', () => {
  assert.ok(initialPlaylist.url, 'Playlist URL should exist');
  assert.ok(initialPlaylist.embedUrl.includes('open.spotify.com/embed/'), 'Playlist embed URL must be valid');
  assert.ok(initialChatMessages.length >= 2, 'Should have initial anniversary messages');
});

test('deduplicateMessages eliminates duplicate IDs while preserving order and content', () => {
  const duplicates = [
    { id: 'msg-1793466673336-gzvd', from: 'partner1' as const, text: 'Hello', timestamp: 100 },
    { id: 'msg-1793466673336-gzvd', from: 'partner1' as const, text: 'Hello', timestamp: 100 },
    { id: 'msg-1793466873453-msmb', from: 'partner2' as const, text: 'Love you', timestamp: 200 },
    { id: 'msg-1793466873453-msmb', from: 'partner2' as const, text: 'Love you', timestamp: 200 },
    { id: 'msg-3', from: 'partner1' as const, text: 'Unique message', timestamp: 300 },
  ];

  const result = deduplicateMessages(duplicates);
  assert.equal(result.length, 3, 'Should remove duplicate entries');
  assert.equal(result[0].id, 'msg-1793466673336-gzvd');
  assert.equal(result[1].id, 'msg-1793466873453-msmb');
  assert.equal(result[2].id, 'msg-3');

  // Test edge cases
  assert.deepEqual(deduplicateMessages([]), []);
  assert.deepEqual(deduplicateMessages(null as any), []);
});

test('initialProfile configures separate passcodes for both partners', () => {
  assert.equal(initialProfile.partner1Passcode, '1214', 'Partner 1 (Manil) must have private passcode');
  assert.equal(initialProfile.partner2Passcode, '0418', 'Partner 2 (Her) must have private passcode');
  assert.notEqual(initialProfile.partner1Passcode, initialProfile.partner2Passcode, 'Passcodes must be distinct for separate side login');
});

test('checkIsMilestoneToday returns milestone on milestone days and null on regular days', () => {
  // Test monthly anniversary milestone (Oct 31, 2026 is 3 months from July 31, 2026)
  const oct31 = new Date('2026-10-31T12:00:00Z').getTime();
  const milestoneToday = checkIsMilestoneToday('2026-07-31', oct31, initialMilestones);
  assert.ok(milestoneToday, 'Should detect 3rd month anniversary milestone');
  assert.ok(milestoneToday.isMilestone);

  // Test regular non-milestone day (e.g. Nov 5, 2026)
  const nov5 = new Date('2026-11-05T12:00:00Z').getTime();
  const nonMilestone = checkIsMilestoneToday('2026-07-31', nov5, []);
  assert.equal(nonMilestone, null, 'Non-milestone day should return null so milestone card does not appear');

  // Test 100 days milestone
  const day100 = new Date('2026-07-31T00:00:00Z').getTime() + 100 * 24 * 60 * 60 * 1000 + 10000;
  const hundredDaysMilestone = checkIsMilestoneToday('2026-07-31', day100, []);
  assert.ok(hundredDaysMilestone, 'Should detect 100 days milestone');
  assert.ok(hundredDaysMilestone.title.includes('100 Days'));
});

test('initialTodos includes planned dates with targetDate for Calendar overlay', () => {
  assert.ok(initialTodos.length > 0, 'Should have initial todos');
  const plannedWithDate = initialTodos.filter((t) => t.targetDate);
  assert.ok(plannedWithDate.length >= 2, 'Should have at least 2 planned dates with targetDate');
  assert.match(plannedWithDate[0].targetDate!, /^\d{4}-\d{2}-\d{2}$/, 'targetDate must be YYYY-MM-DD format');
});

