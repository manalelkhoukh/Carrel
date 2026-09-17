import { Vibration } from 'react-native';

// A true background-surviving alarm (one that fires even while the app is
// closed or the phone is locked) requires the OS's own notification system.
// On Android, Expo Go's precompiled client no longer includes that
// functionality at all (removed as of SDK 53) — using it crashes the app
// immediately, even for purely local/scheduled notifications, not just
// remote push. Getting it back requires a "development build": your own
// custom-compiled version of the app with that native module actually
// included, instead of the generic Expo Go app. That's a real step, but
// the right time for it is later, when preparing for app store submission
// (which needs a real build anyway) — not as a detour for one feature.
//
// Until then, this is a foreground-only alarm: a vibration pattern fired
// the instant the countdown reaches zero, while the Session screen is open
// and the app is in the foreground. It does nothing if the app is
// backgrounded or the screen is closed — that limitation is real and
// worth remembering, not hidden behind a reassuring function name.
const ALARM_PATTERN = [0, 500, 200, 500, 200, 500];

export function triggerSessionEndVibration() {
  Vibration.vibrate(ALARM_PATTERN);
}
