// Ember's message pools, grouped by the situation she's reacting to.
// Kept as plain data (not JSX/logic) so it's trivial to extend later —
// adding a new line here never risks touching the component's rendering logic.

export const EMBER_MESSAGES = {
  before: [
    "You've got this. Get your notes ready — I'll keep watch on the clock.",
    'Almost time to focus. Take one deep breath first.',
    "I'll be right here the whole time, cheering you on.",
  ],
  during: [
    "You're doing great. Stay in the zone!",
    'One page at a time. I believe in you.',
    "However far in you are, you're further than when you started.",
  ],
  after: [
    'Session complete! You showed up for yourself today.',
    "That's a wrap. Time to rest — you earned it.",
    "Proud of you. Come back anytime, I'll be here.",
  ],
};

export function pickRandomMessage(phase) {
  const pool = EMBER_MESSAGES[phase] ?? [];
  if (pool.length === 0) return '';
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}
