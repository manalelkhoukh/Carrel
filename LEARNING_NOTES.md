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
