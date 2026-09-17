// Single source of truth for "what are the valid booking slots right now."
// Both the slots-listing endpoint and the reservation-creation endpoint use
// this — so a slot the frontend shows as bookable is *guaranteed* to be one
// the backend will actually accept. If this logic lived in two places, they
// could drift apart (e.g. someone tweaks the frontend's slot list without
// remembering the backend has its own copy), silently breaking bookings.

const SLOT_DURATION_HOURS = 2;
const DAYS_AHEAD = 2; // today + tomorrow

// Parses a Postgres TIME value like "08:00:00" into { hours, minutes }.
function parseTimeOfDay(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return { hours, minutes };
}

// Builds fixed slots for a room across a rolling window of days (today +
// DAYS_AHEAD - 1 more), from opens_at to closes_at, in SLOT_DURATION_HOURS
// increments. Returns Date objects (not strings) so callers can compare or
// format them freely.
//
// This window matters in practice, not just in theory: if slots only ever
// covered "today," opening the app after closing time would show nothing
// bookable at all, for the rest of the day, with no way to plan ahead for
// tomorrow morning.
function getUpcomingSlots(room) {
  const opens = parseTimeOfDay(room.opens_at);
  const closes = parseTimeOfDay(room.closes_at);

  const slots = [];

  for (let dayOffset = 0; dayOffset < DAYS_AHEAD; dayOffset += 1) {
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    dayStart.setDate(dayStart.getDate() + dayOffset);

    let slotStart = new Date(dayStart);
    slotStart.setHours(opens.hours, opens.minutes, 0, 0);

    const dayEnd = new Date(dayStart);
    dayEnd.setHours(closes.hours, closes.minutes, 0, 0);

    while (slotStart < dayEnd) {
      const slotEnd = new Date(slotStart.getTime() + SLOT_DURATION_HOURS * 60 * 60 * 1000);
      if (slotEnd > dayEnd) break; // don't create a partial slot that overruns closing time

      slots.push({ startTime: new Date(slotStart), endTime: slotEnd });
      slotStart = slotEnd;
    }
  }

  return slots;
}

// Server-side check: does this exact (start, end) pair match one of the
// currently valid slots for this room? Never trust the client to only send
// valid slots — this is what actually enforces library hours on every
// booking, today's or tomorrow's.
function isValidSlot(room, startTime, endTime) {
  const slots = getUpcomingSlots(room);
  return slots.some(
    (slot) => slot.startTime.getTime() === startTime.getTime() && slot.endTime.getTime() === endTime.getTime()
  );
}

module.exports = { SLOT_DURATION_HOURS, getUpcomingSlots, isValidSlot };
