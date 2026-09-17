# 📘 Study Notes — Library Seat Reservation System

*A running record of what I've learned, session by session.*

---

## 🗂 Index

- [Session 1 — Choosing a Tech Stack](#session-1--choosing-a-tech-stack)
- [Session 2 — Development Environment Setup (Windows)](#session-2--development-environment-setup-windows)
- [Session 3 — Pivot: Web to Mobile, and Goal Clarification](#session-3--pivot-web-to-mobile-and-goal-clarification)
- [Project Roadmap (living reference)](#project-roadmap-living-reference)

---

## Project Roadmap (living reference)

**Stack:** Node.js + Express + PostgreSQL (backend) · React Native (mobile app) · simple static site (landing page)

| # | Feature | Touches | Status |
|---|---|---|---|
| 0 | Project scaffolding (folders, Git, README) | Tooling | ✅ Done |
| 1 | Database design — `users`, `rooms`, `seats`, `reservations` | Database | ⏭ Next |
| 2 | Backend foundation — minimal Express server | Backend | — |
| 3 | Connect backend to PostgreSQL | Backend + DB | — |
| 4 | Seats API — list seats + availability | Backend | — |
| 5 | Reservation API — book a seat, prevent double-booking | Backend + DB | — |
| 6 | User authentication (signup/login) | Backend + DB | — |
| 7 | React Native environment setup (Android Studio, emulator) | Mobile tooling | — |
| 8 | React Native app foundation — navigation, screens | Mobile | — |
| 9 | Mobile: view seats | Mobile | — |
| 10 | Mobile: make a reservation | Mobile | — |
| 11 | Mobile: authentication screens | Mobile | — |
| 12 | Admin features | Full stack | — |
| 13 | **Landing page** — simple static site introducing the app, with App Store/Play Store download links. Does NOT need the backend/database. | Web (static) | — |
| 14 | Polish, testing, app store submission prep | Full stack + infra | — |

---

## Session 1 — Choosing a Tech Stack

**Status:** ✅ finalized — **PERN** (PostgreSQL, Express, React, Node.js)

**Why finalized this way:** Frontend (React) requires JS regardless of backend choice. Given that, one language (JS) end-to-end means less context-switching and faster path to feeling competent, even though Python (Django) would have reinforced prior school knowledge and aligned more with future data/AI interest. Chose speed-to-competence now; Python can be picked up later.

**What it is**
A tech stack = the technologies that make up an app: frontend, backend, database, and infrastructure/tools.

**Why it matters**
Different stacks trade off differently on learning ease, performance, scalability, and hiring demand. Choosing deliberately — not by hype — is a core engineering skill.

**Key insight for this project**
Seat booking must prevent two people reserving the same seat at once (a *race condition*). Relational databases (PostgreSQL) prevent this natively via transactions + constraints. NoSQL (MongoDB) would require building that safety manually.

**Stacks compared**

| Stack | Frontend | Backend | Database |
|---|---|---|---|
| PERN | React | Node + Express | PostgreSQL |
| MERN | React | Node + Express | MongoDB |
| Django + React | React | Django (Python) | PostgreSQL/MySQL |
| Spring Boot + React | React | Java | PostgreSQL/MySQL |

**Leaning toward:** PERN — one language (JS) to learn, PostgreSQL matches the relational nature of seats/rooms/bookings, strong job market for React + Node.

**Trade-off to remember:** Django/Spring Boot enforce good architecture automatically; with Express, we have to build that discipline ourselves.

**Takeaway**
Seat reservation = relational data + concurrency safety → favors a relational database.

---

*More sessions will be added below as we go.*

---

## Session 2 — Development Environment Setup (Windows)

**Tools installed:** Git, Node.js (+ npm), PostgreSQL (installed + confirmed running as a service), Postman. VS Code already present.

**Postman** — installed as our API testing tool: lets us test backend endpoints (e.g., "book a seat") directly, before a frontend even exists, by sending requests manually and inspecting responses.

**Verifying a running service, not just an install**
Installed ≠ running. Confirmed PostgreSQL was actually active via:
- Windows **Services** app (status = Running)
- `pg_isready` — a small utility that checks if the database server is accepting connections

**Environment status: ✅ complete.** Ready to start building the actual application.

**Key concepts learned**
- **Terminal** — a text-based way to give the computer commands directly (used PowerShell on Windows).
- **PATH** — the list of folders Windows searches through when you type a command name. If a tool's folder isn't in PATH, the terminal says "not recognized," even if the program is genuinely installed.
- **Package manager** — a tool that downloads and manages reusable code (npm for JS packages, Chocolatey for system-level Windows software).
- **Execution policy** — a Windows/PowerShell security setting controlling whether script files (`.ps1`) are allowed to run. Default is very strict; `RemoteSigned` (scoped to current user) is the standard developer setting.
- Windows **hides known file extensions** by default in File Explorer — `psql.exe` displays as just `psql`, which can look like a missing file when it isn't.
- New terminal windows must be opened after installing tools or changing PATH — already-open terminals don't see the update.

**Commands used**
```
git --version
git config --global user.name "..."
git config --global user.email "..."
node --version
npm --version
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
psql --version
pg_isready
$env:Path -split ';' | Select-String "Postgre"
```

**Real debugging encountered**
1. **npm blocked by execution policy** — fixed by setting `RemoteSigned` for the current user.
2. **`psql` not recognized** — root cause was PostgreSQL's `bin` folder never actually being added to PATH (an earlier attempt silently failed to save). Diagnosed using `$env:Path` to check the terminal's live, actual PATH rather than trusting the Settings UI — then redid the PATH edit carefully, confirming with OK on every nested window.

**Common mistakes to remember**
- Assuming a UI setting saved just because you clicked through it — verify with a command (`$env:Path`) instead of trusting appearances.
- Clicking Cancel/X on an outer settings window can silently discard changes made in an inner one.
- Judging a file as "missing its extension" without checking that Explorer might just be hiding it.

**Key takeaways**
- Reading an error message closely (what category of failure it is) narrows the fix fast — "not recognized" (PATH problem) vs. "execution disabled" (security policy problem) are different bugs with different fixes.
- Verify assumptions against real system state before trying fixes — don't guess-and-check blindly.

---

*More sessions will be added below as we go.*

---

## Session 3 — Pivot: Web to Mobile, and Goal Clarification

**What changed:** Original plan was a PERN web app (React frontend). Decided instead to build a real installable mobile app (App Store/Play Store), not just a mobile-friendly website.

**Key concept: mobile app options compared**
- **Native** (Swift for iOS, Kotlin for Android) — best performance/hardware access, but two separate languages and codebases.
- **React Native** — one codebase for both platforms, uses React/JS (same as original plan).
- **Flutter** — one codebase for both platforms, uses Dart (a new language).
- **PWA** — really just a website made installable; not distributed via app stores, limited hardware access.

**Important realization:** The backend (Node.js + Express + PostgreSQL) doesn't change at all with this pivot. A backend serves API requests regardless of what frontend calls it (web, React Native, or Flutter). Everything done in Session 2 (Git repo, environment setup, backend scaffolding, Express install) remains valid and reusable.

**Decision:** **React Native** — chosen because it keeps one language (JS) across the whole stack, continuing existing momentum rather than restarting frontend learning in Dart.

**Real goal clarified:** The student's actual objective is to learn to **direct AI to build software and be able to audit/report on what it produces** — not necessarily hand-write every line personally. Mentor's response: this goal *requires* the same foundational understanding (concepts, debugging, architecture) as hands-on development — you can't meaningfully review AI-generated code without understanding what correct code looks like. Teaching approach stays concept-first; emphasis will gradually shift toward code review and reasoning about AI-generated output, not just typing everything manually.

**Key takeaways**
- A frontend framework choice does not require redoing backend/database/environment work — these are genuinely separate concerns (ties back to Session 2's separation-of-concerns lesson).
- Being able to effectively direct and audit AI-written code is itself a skill built on understanding fundamentals, not a shortcut around them.

---

*More sessions will be added below as we go.*

---

## Session 4 — Workflow Shift: Design-First, Explain-After

**What changed:** Switched from step-by-step Socratic teaching (question before every answer) to a faster mode: Claude designs/implements directly, then explains the reasoning in a report afterward. Applies for the rest of the project.

**Why:** Better matches the real goal established in Session 3 — directing AI and auditing its output — without needing every micro-decision walked through interactively first.

**What stays the same:** Explanations are still real and complete, just delivered after the work instead of before it. Understanding the "why" is still the point.

---

## Session 22 — Feature 17: Study Session Screen

**What we built:**
After a successful booking, the app now navigates to a dedicated `SessionScreen` instead of a plain "success" alert. It shows one of three phases based on real time:
- **Before**: countdown to the session start
- **During**: countdown to the session end
- **After**: a static "session ended" card with a Return Home button

**Key concept — timestamp-derived countdowns:**
We compute remaining time fresh on every render as `endTime - Date.now()`, never by decrementing a stored counter. A decrementing counter drifts or freezes when the app is backgrounded (the JS timer doesn't run while the app is in the background); computing from real timestamps self-corrects the instant the screen re-renders, however long the app was backgrounded. This is the same pattern used in the Pomodoro timer (Feature 16).

**Phase logic (verified exact quote):**
```js
const now = Date.now();
const phase = now < startMs ? 'before' : now < endMs ? 'during' : 'after';
```

**Verification:**
- Tested all three phases using a temporary debug button (`handleDebugSessionBefore`) that jumped straight into the "before" phase with a short countdown
- Verified the before→during and during→after transitions happen automatically and correctly with real elapsed time, including after backgrounding the app
- Confirmed the debug button and its supporting code were fully removed afterward — `HomeScreen.js` came back byte-identical to the last commit, no leftovers

**Files changed:**
- `frontend/src/screens/SessionScreen.js` (new)
- `frontend/src/screens/SeatMapScreen.js` — `handleConfirmBooking` now navigates to `Session` on a 201 response instead of showing an alert
- `frontend/src/navigation/AppNavigator.js` — registered the `Session` route ("Your Session") between `SeatMap` and `Login`
- `.gitignore` — added `.claude/` (Claude Code's local, per-machine settings folder was untracked and should never be committed)

**Common mistake avoided:** decrementing a stored number for a timer/countdown. It looks correct while the app stays in the foreground and silently breaks the moment the OS suspends your JS timers.

**Mini challenge:** Without looking at the code, write out from memory the one-line phase logic above, and explain in your own words why `Date.now()` is called fresh each render instead of once when the component mounts.

**Questions to check understanding:**
1. Why does deriving time from timestamps survive app backgrounding when a decrementing counter doesn't?
2. Why do we trust `startTime`/`endTime` from the server response instead of computing them ourselves on the client after booking?
3. What would break if `phase` were computed once in a `useEffect` on mount instead of on every render?

## Session 23 — Feature 18: Ember Mascot, Feature 19: Session-End Alarm

**Feature 18 — Ember:**
A motivational mascot on the Session screen: a small bouncing circular badge with a 🔥 emoji and a speech bubble showing a phase-appropriate message (different pools for before/during/after).

**Design iteration (worth remembering):** the first version hand-drew a "flame" shape from overlapping rounded `View`s. On a real device it read as a face with a pink hair-clip, not fire — a reminder that a shape's CSS/geometry description can look right on paper and still fail the "what does this actually look like" test. The fix wasn't tweaking pixel offsets; it was recognizing the underlying approach was wrong and switching to a plain emoji (already an established convention in this app, e.g. the 🐞 debug-button marker), which is professionally illustrated and renders consistently — zero custom shape-drawing risk.

**Key concept — `useMemo` keyed correctly:** `SessionScreen` re-renders every second for the countdown. Ember's message is chosen with `useMemo(() => pickRandomMessage(phase), [phase])` — it only recomputes when `phase` itself changes value, not on every render. Verified by watching the message stay fixed for 15+ seconds while the countdown ticked.

**Feature 19 — Session-end alarm, and a real platform limitation:**
Original ask: buzz/alert when the countdown reaches zero, even if the app is backgrounded. First attempt used `expo-notifications` to schedule a real OS-level local notification ahead of time (the technically correct way to survive backgrounding, since a JS `setTimeout` pauses while the app isn't in the foreground — same lesson as the timestamp-based countdowns).

**This broke the entire app.** On Android, Expo Go's precompiled client has removed *all* `expo-notifications` functionality as of SDK 53 — not just remote push, but local/scheduled notifications too, and just importing/configuring the module throws and crashes on startup. Docs are ambiguous about this (they emphasize "remote push"), but the real device error was unambiguous. A true background-surviving alarm on Android now requires a "development build" — a custom-compiled version of the app with the native module actually included, instead of the generic Expo Go client. That's a real step (and one that will be needed anyway for eventual app store submission), but not one to take mid-feature as a detour.

**Actual implementation:** `expo-notifications` was fully reverted (uninstalled, plugin entry removed from `app.json`). The alarm is now a foreground-only vibration (`Vibration.vibrate()`, built into React Native core, zero new dependencies), triggered the instant `SessionScreen`'s own `phase` value transitions to `'after'`.

**Key concept — dependency arrays already deduplicate:** the first version of this guarded against re-firing with a manual `useRef` flag, on the (wrong) assumption that the effect would re-run every second along with the countdown tick. It doesn't: `useEffect(() => {...}, [phase])` only re-runs when `phase`'s *value* changes between renders, and `'after'` stays the same string on every subsequent tick — so the effect already fires exactly once per transition, with no manual guard needed. The simpler version is also the correct one.

**Debugging process worth noting:** rather than guess at "why doesn't X show up," each ambiguous symptom ("nothing showing up," "it's ugly," a network proxy error, an Android crash) was narrowed with a specific, falsifiable question before touching code — a stale-cache theory was confirmed by checking the actual grep result and screenshot, a design failure was confirmed by seeing the real screenshot, and the Android crash was confirmed via the exact terminal error text plus a targeted web search, not assumed from memory.

**Files changed:**
- `frontend/src/components/EmberMascot.js` (new)
- `frontend/src/constants/emberMessages.js` (new)
- `frontend/src/utils/sessionAlarm.js` (new) — vibration-based, foreground-only
- `frontend/src/screens/SessionScreen.js` — renders `EmberMascot`, fires the vibration on the `phase → 'after'` transition
- `frontend/package.json` / `package-lock.json` — net-zero after installing then fully reverting `expo-notifications`

**Common mistakes avoided:**
- Trusting a hand-drawn shape's code instead of the rendered result
- Adding a manual "already fired" guard for something `useEffect`'s dependency array already handles
- Pushing forward with a native module without first confirming Expo Go still supports it on the target platform

**Mini challenge:** Explain, without looking at the code, why `useEffect(() => {...}, [phase])` fires exactly once when the countdown ends, even though the component re-renders every second for the rest of the "after" phase.

**Questions to check understanding:**
1. Why does a `useRef`-based "already fired" flag behave differently from relying on the effect's own dependency array?
2. Why does a JS `setTimeout`-based alarm fail to survive the app being backgrounded, and why doesn't handing the same timing off to the OS have that problem?
3. What's the practical difference between "removed from Expo Go" and "requires a development build," and why does that distinction matter for planning when to make that transition?

## Session 24 — Feature 20: Real Time-Slot Booking (Backend)

**What changed:** Booking used to be hardcoded to "right now, for a fixed 2 hours," with zero regard for library hours — there was no time-slot concept at all. Replaced with fixed 2-hour slots (8-10, 10-12, ..., 18-20) generated from each room's real `opens_at`/`closes_at` (migrated to 8am-8pm), validated server-side on every booking.

**Key concept — single source of truth for valid slots:** `backend/src/utils/timeSlots.js` generates the slot list, and BOTH the slots-listing endpoint and the reservation-creation endpoint call the same function. If this logic were duplicated (e.g. the frontend independently computing "what slots should exist"), the two copies could silently drift apart over time, and a slot the UI shows as bookable might get rejected by the backend, or vice versa.

**Key concept — migrations vs. schema.sql:** `schema.sql` only builds a database from nothing (rerunning it would drop and recreate tables, destroying real data). Changing an already-running database's data or defaults needs a migration — a small, one-time SQL script (`backend/migrations/001_set_library_hours.sql`) that alters what's there in place.

**Real gap found via testing, not code review:** the first version only generated slots for *today*. Testing at 9:41pm — after the library's 8pm close — showed every slot as `isPast: true`, and the entire rest of the test chain (seat lookup, booking, cancel) cascaded into empty/null values as a result. This wasn't a coding bug so much as a design gap: an app that can only show today's slots is unusable after closing time. Fixed by generating a rolling 2-day window (today + tomorrow) instead of just today.

**Second gap found via testing:** the first test room ("A3") had zero seats in the database at all — confirmed by checking the plain `/seats` endpoint (no time filter) independently, which also returned empty. This ruled out the new time-filtering code as the cause before assuming a bug existed. Switched to "Group Study Hall," which had real seat data, and the full flow worked.

**New endpoints:**
- `GET /api/rooms/:roomId/slots` — today + tomorrow's fixed slots, each flagged `isPast`
- `GET /api/rooms/:roomId/seats?start_time=&end_time=` — availability for a *specific* slot, not just "right now" (a seat can be free now but booked for a later slot)
- `GET /api/reservations/me` — the logged-in user's own reservations
- `PATCH /api/reservations/:id/cancel` — cancel your own reservation (ownership-checked; distinguishes 404 "not found/not yours" from 409 "already cancelled/completed," same pattern as the earlier admin cancel logic)

**Verified via real HTTP requests (PowerShell):**
- A booking against a real slot succeeds (201)
- The same seat/slot booked twice: second attempt correctly fails (409)
- A booking with a time that doesn't match any real slot boundary: correctly fails (400)
- Cancelling correctly frees the seat and shows up in `/me`

**Common mistakes avoided:**
- Trusting the client to only ever send valid slot times, instead of re-validating server-side on every booking
- Editing `schema.sql` directly for a change to an already-running database
- Assuming "it's after hours" data was a bug in the new code, instead of checking the plain unfiltered endpoint first to isolate where the problem actually was

**Mini challenge:** Explain why `isValidSlot` re-generates the slot list and checks membership, rather than just checking "is `start_time`'s hour one of [8,10,12,14,16,18]" directly.

**Questions to check understanding:**
1. Why would duplicating the slot-generation logic between frontend and backend be dangerous, even if both copies start out correct?
2. Why does a `LEFT JOIN` (rather than an `INNER JOIN`) matter in the seat-availability query?
3. What specifically told us the "all slots are past" result was a design gap in the code, not bad test data or a fluke?
