# QuizMind AI — Development Journal (Challenges & Solutions)

A feature-by-feature record of what was built, the problems hit along the way, the
approach taken, and how each was solved. Written to help explain the work in an interview.

**Stack:** React 18 + Vite + TypeScript + Zustand + Tailwind (frontend) · Node/Express 5 +
TypeScript + Prisma + PostgreSQL + Redis + Socket.IO (backend).

**Core architecture idea:** REST for durable CRUD/scoring; Redis + Socket.IO for the
real-time hot path; Prisma as the single source of truth for persisted data.

---

## Feature 1 — Quizzes (Discover) page redesign + participant counts

**Requirement:** Restyle the Quizzes page to a new mockup that prominently shows how many
people have taken each quiz.

**Challenge:** The card design needed a *participant count per quiz*, but the list API
didn't return it. The data is nested two relations deep: `Quiz → QuizSession → Participant`.
Prisma's convenient `_count` only counts a **direct** relation, so I couldn't count
participants of a quiz in one `_count`.

**Approach:** Avoid an N+1 query. After fetching the page of quizzes, run **one** extra
query for that quiz's sessions including each session's participant `_count`, then aggregate
in JS by `quizId`.

**Solution:** `QuizService.list` now fetches sessions for the returned quiz IDs and sums
participants per quiz before returning them.

```ts
const sessions = await prisma.quizSession.findMany({
  where: { quizId: { in: quizzes.map((q) => q.id) } },
  select: { quizId: true, participants: { select: { score: true, completedAt: true } } },
});
// reduce into a Map<quizId, {count, scoreSum, completed}>
```

**Side issue found:** The frontend uses `noUnusedLocals`, and the build (`tsc --noEmit`)
flagged two pre-existing unused imports (`ArrowRight`, `FileQuestion`). I resolved both as
part of the change (used `ArrowRight` in the new "View all" links, swapped `FileQuestion`
for the `Users` icon I needed).

**Interview talking point:** Know your ORM's limits — `_count` is one level deep, so for a
two-hop aggregate I chose a single bounded query + in-memory reduce over a per-row N+1.

---

## Feature 2 — Real asynchronous (self-paced) participation

**Reported bug:** "Why can't I participate in asynchronous quizzes?"

**Root-cause diagnosis (the important part):** The whole app was **host-driven and live**.
Clicking "Take quiz" routed the user to the live lobby (`/play`), where a non-host just sees
*"Waiting for the host to start…"* forever — there was **no host** to start an async quiz.
Separately, the join endpoint outright rejected `ended` quizzes. So "async" was a UI label
with no real self-paced flow behind it.

**Approach & key decision:** I deliberately built a **separate REST self-paced flow** rather
than hacking the socket/host machinery. Reusing the live flow would have meant letting a
participant "self-host," but the live `endQuiz` has a **global side effect** (it marks the
whole quiz `ended` for everyone and flushes Redis). Isolating async as REST avoided breaking
live multiplayer.

**Solution:**
- New page `TakeQuiz.tsx` (route `/take/:sessionId`) — fetch questions, answer, submit.
- New endpoint `POST /sessions/:id/submit` — scores answers against the DB (`correctAnswer`),
  stores `Answer` rows, sets `participant.score / completedAt / attemptType = later`, in a
  transaction.
- Relaxed `join` so published quizzes past their live window remain takeable.

**Tradeoff:** REST self-paced is simpler and side-effect-free, at the cost of not reusing the
existing socket UI. Correctness and not breaking the live path won over code reuse.

**Interview talking point:** I diagnosed a "missing feature disguised as a bug," then chose
the architecture (REST vs socket) based on **blast radius / side effects**, not on which was
fewer lines.

---

## Feature 3 — Time-driven quiz lifecycle (scheduled → live → async, no host)

**Requirement:** On create, the author sets **date + time + duration**. The quiz auto-goes
live at the scheduled time (no host approval), stays live for the duration, then becomes
asynchronous. Upcoming quizzes must display their schedule.

**Challenge:** How do you make a quiz "go live automatically" without a background
job/cron, and survive server restarts?

**Approach — derive status from time instead of storing transitions.** A new
`effectiveQuizStatus(quiz)` computes the lifecycle on read from `scheduledAt + durationMins`
vs `now`. No scheduler, no drift, no persistence problem — any request after the start time
simply *sees* it as live.

```ts
if (now < start) return "scheduled";   // Upcoming
if (now < end)   return "live";         // Live window
return "ended";                          // Asynchronous
```

**Solution:**
- Added `durationMins` to the `Quiz` model (Prisma migration).
- `effectiveQuizStatus` used to override the status in the list response and to **gate joins**
  (reject `scheduled`/`draft`, allow `live`/`ended`).
- CreateQuiz form now collects date/time/duration and sends `scheduledAt` + `durationMins`.
- Live cards show a **real "Ends in" countdown** computed from `scheduledAt + durationMins`.

**Difficulty hit (and fix):** `prisma generate` failed with `EPERM: operation not permitted,
rename ...query_engine...` because the **running dev server held a lock** on the engine
binary. I verified the **TypeScript types had still been regenerated** (the field was present
in the generated client), so the typecheck passed; the engine rename was harmless because the
schema change was additive and the engine version was unchanged. I applied the column to the
DB with `prisma db push --skip-generate` (which doesn't rename the binary).

**Tradeoffs (called out honestly):**
- No live polling — the page reflects transitions on the next load/fetch, not in real time.
- The old host-driven `/play` socket flow is now **orphaned** (left intact, non-destructive).
- Pre-existing quizzes without `scheduledAt` fall back to their stored status.

**Interview talking point:** "Derived state over stored state" — computing status from a
timestamp eliminated an entire class of problems (cron reliability, restart recovery, state
drift) for free.

---

## Feature 4 — One-question-at-a-time take page

**Requirement:** Present questions one at a time with Prev/Next, a progress map, flagging, a
countdown timer, and submit (matching a provided design).

**Challenge — a classic React stale-closure bug:** The countdown's `setInterval` is created
once (empty deps). Its auto-submit callback closed over the **initial** `answers` (empty),
so when the timer hit 0 it would have submitted *no answers*.

**Solution:** Mirror the latest answers into a ref and have `submit` read the ref, so even the
interval's original closure sees current data. A `submittedRef` guard prevents double-submit
(timer + manual click).

```ts
const answersRef = useRef(answers);
answersRef.current = answers;            // always latest
// submit() builds payload from answersRef.current, not the captured `answers`
```

**Also implemented:** clickable question chips colored by state (current / answered / flagged
/ unanswered), progress bar, and a deadline = remaining live-window time if still live, else
`durationMins` from start; auto-submit on expiry.

**Honest deviation from mockup:** The "28 students currently attempting" + fake avatar initials
was real-time presence I didn't yet have, so I first showed the **real attempt count** instead
of fabricating data (then made it truly live — see Feature 5).

**Interview talking point:** Recognizing the stale-closure trap and fixing it with a ref
(instead of adding the value to the dependency array, which would re-create the timer every
keystroke and reset the countdown).

---

## Feature 5 — Live presence ("currently attempting" + avatars)

**Requirement:** Make the presence count, avatar stack, and "Connected" indicator real.

**Challenges:**
1. Count **unique users** (someone with two tabs shouldn't count twice).
2. **Decrement on disconnect** when a user closes the page.
3. Get usernames/avatars for the stack (a room only knows socket IDs).

**Approach:** Use Socket.IO rooms on the existing JWT-authenticated `/quiz` namespace.
- On `presence_join`, look up the user, stash `{ userId, name, avatarUrl }` on `socket.data`,
  and join `presence:<sessionId>`.
- Build the live list via `nsp.in(room).fetchSockets()` and **dedupe by `userId`**.
- Listen for `disconnecting` (the socket is still in the room here) and re-broadcast the list
  **excluding the leaving socket** so the count drops immediately.

**Tradeoff:** The default in-memory adapter works for a single server. Horizontal scaling
would need the **Redis Socket.IO adapter** so room membership is shared across instances.

**Interview talking point:** Presence is "soft state" — derived from live connections, not the
database. I leaned on the room abstraction + `disconnecting` lifecycle and deduped by identity.

---

## Feature 6 — One attempt per user + read-only revisit

**Requirement:** A user can take a quiz once. On revisit they see their first-attempt answers
and **cannot** change them.

**Approach:** The data model already enforced single-attempt (one `Participant` per
user/session; `submitAttempt` rejects re-submission once `completedAt` is set). The missing
piece was *surfacing* the prior attempt.

**Solution:**
- `join` now returns `completed` and `savedAnswers` (map of questionId → submitted answer).
- `TakeQuiz` **prefills** from `savedAnswers`, and when `completed` is true it locks the UI:
  options/input/submit disabled, the countdown/auto-submit is skipped, and a read-only banner
  is shown.

**Decision called out:** The lock keys off **completed** (submitted), not merely **joined**,
so a user who closes the tab before submitting can still resume and submit once. (Easy to
switch to lock-on-join if stricter behavior is wanted.)

**Interview talking point:** Defense in depth — the *server* is the source of truth
(`completedAt` guard rejects a second submit), and the UI lock is a usability layer on top, not
the security boundary.

---

## Feature 7 — Create Quiz rebuilt as a 3-step wizard

**Requirement:** Replace the single-page create form with a 3-step wizard
(**Quiz Details → Add Questions → Review & Publish**), built incrementally one slide at a time.

**Challenge:** Restructure an existing, *working* single-page flow (AI generate → preview →
publish) into multi-step without losing functionality, while only the first slide's design was
available up front.

**Approach:** Introduce a single `step` state (1–3) and **one shared form-state object** that
all steps read/write, so navigating back and forth never loses data. Keep the proven
generate/publish logic intact and slot it into steps 2 and 3 as functional content until their
designs arrive — so the flow stays end-to-end usable at every point.

**Solution:**
- A `Stepper` component renders the progress indicator (active/done states + connectors).
- **Step 1 (Quiz Details)** built to the mockup: name, description, subject/category select,
  Easy/Medium/Hard segmented control, Public/Private type cards (password shown only when
  private), and an "allow late join" checkbox. Per the request, the duration row also collects
  **Schedule Date + Start Time** (feeding the existing `scheduledAt` lifecycle).
- "Next" is gated by validation (`step1Valid`); steps 2/3 have Back/Next; publish sends the new
  `description`, `subject`, and `allowLateJoin` fields alongside `scheduledAt`/`durationMins`.

**Decisions called out:**
- Used native `<select>/<textarea>/<input type=checkbox>` (matching existing code conventions)
  instead of adding a component library — minimal footprint, same UX.
- Did **not** duplicate the navbar/footer from the mockup; the app's existing `Navbar` already
  renders above the page (per earlier guidance to "only change the body").
- Subject is a free-text column, so extending the category list (General, Literature,
  Geography, Education, Other, …) needed **no** backend change.

**Step 2 (Add Questions) — AI generation + editable questions:**
- The **"Describe your quiz topic"** textarea is the actual prompt sent to the AI provider
  (`POST /ai/generate-questions` with `topic: topicPrompt`) — not the quiz title. This decoupled
  *what the quiz is called* from *what the AI is told to write about*.
- Generated questions are **appended** to the working list so AI output and manually added
  questions coexist; "Add Question Manually" inserts a blank MCQ.
- Each question is an **editable card** (`QuestionEditor`): type (MCQ/True-False), text, options,
  per-question difficulty, explanation, delete.

  *Challenge here:* keeping `correctAnswer` consistent with the options as the user edits.
  Marking an option correct rewrites every option's `isCorrect` flag **and** sets
  `correctAnswer` to that option's id in one update, so the object stays valid for the publish
  payload. Switching a question's type **reshapes** its options (MCQ ⇄ fixed True/False) and
  resets the correct answer accordingly.
- "Next" is gated on `questions.length > 0`; final validity (non-empty option text, a marked
  correct answer) is enforced by the backend Zod schema on publish — server stays the
  source of truth.

**Interview talking point (Step 2):** The subtle bug class in editable forms is *derived data
drift* — here, `correctAnswer` vs the options' `isCorrect`. I update them together in a single
immutable state change so they can never disagree.

**Interview talking point:** A wizard is just "one state machine + shared form state." Keeping
old logic working inside the new shell meant the app was never broken mid-refactor — I could
ship and verify each slide independently.

---

## Feature 8 — Public/Private quiz visibility + password-gated join

**Requirement:** Show **all** quizzes (public *and* private) on the Quizzes page, label each
card with its type, and when a user tries to join a private one, warn them and require the
password.

**Challenge — the security catch:** The Discover list returned **full quiz rows**. It had been
safe only because it filtered to public quizzes (whose `passwordHash`/`accessCode` are null).
The moment private quizzes are included, that response would **leak the password hash and the
secret access code** to everyone.

**Approach & solution:**
- **List:** dropped the `quizType: "public"` filter so every quiz is returned and bucketed into
  Live/Async/Upcoming by its derived status — but **stripped `passwordHash` and `accessCode`**
  from each row (rest-destructure omit) so existence is visible while secrets are not.
- **Card label:** a corner badge driven by `quizType` — **Public** (green + globe) vs **Private**
  (amber + lock).
- **Join gate:** relaxed `SessionService.join` so a listed private quiz can be joined **by id +
  correct password** (previously it strictly demanded the access code). The frontend `joinCard`
  warns *"…is a private quiz. Enter the password"* and submits the password; wrong password →
  `401 Invalid quiz password`. The access-code sidebar path still works.

**Decision called out:** Since the card already identifies the quiz, I prompt for the
**password only** (not the code) — the code is the *discovery* secret, the password is the
*entry* secret, and discovery is now intentionally public.

**Interview talking point:** When you widen what a list returns, re-audit the payload for
secrets. Here, removing one `where` clause silently changed a safe response into a leaky one —
the fix (field stripping) matters more than the feature itself.

---

## Feature 9 — "My Quizzes" page (created vs joined) + owner delete + shareable links

**Requirement:** From the Dashboard, open a page with two sections — quizzes the user
**created** (with share details) and quizzes they **joined** (created by others). Owners can
delete their quizzes, and a Share button copies a link that actually works.

### 9a. Two sections from two data shapes
**Challenge:** "Created" needs owner-only data including the **join code** (which the public
list deliberately strips); "Joined" needs the user's participations *excluding their own*
quizzes.

**Solution:**
- New owner-scoped endpoint `GET /quizzes/mine` — like the public list but filtered to
  `creatorId`, **keeps `accessCode`** (owner needs it), strips `passwordHash`, returns a
  `hasPassword` flag (we can only show *that* a password exists, never the value).
- Reused `/users/me/history`, adding `creatorId` to each participation so the frontend filters
  `joined = participated.filter(p => p.creatorId !== me)`.

**Decision:** Password shows as `••••••`, not the real value — we store only a bcrypt hash, so
it's *unrecoverable by design*. Good security, with a known usability cost (creators must
remember the password they set, or reset it).

### 9b. Delete crashed with "Internal server error" — a cascade gap
**Problem:** `DELETE /quizzes/:id` 500'd. **Diagnosis:** deleting a quiz cascades to its
`Question`s, but the `Answer → Question` relation had **no `onDelete` rule**, so Postgres
refused to delete a question that still had answer rows (FK violation). The other paths
(quiz→sessions→participants→answers) *were* cascaded, which is what masked the gap.

**Fix:** added `onDelete: Cascade` to `Answer.question` and `prisma db push`'d the constraint
(no client regen needed — referential actions are enforced in the DB, not the TS types).

**Interview talking point:** A delete that works for one object can fail once real child data
exists. The bug only appears after answers are recorded — exactly the kind of thing a "happy
path" demo misses. The fix lives in the schema's referential actions, not application code.

### 9c. Rank showed "—" (again) — derived vs stored state
**Problem:** Joined cards (and earlier the Results page) showed `#—`. **Cause:** the self-paced
`submitAttempt` never writes `participant.rank` (only the old live flow did), so the stored
field is null.

**Fix:** compute rank from score order at read time. In `history`, one extra query fetches all
participants' scores for the relevant sessions; `rank = 1 + (# scoring higher)`. Same approach
the Results endpoint uses, so the two stay consistent and always fresh.

### 9d. Shareable join link that actually works
**Requirement:** Share copies a link; opening it joins a **public** quiz directly and prompts
for a **password** on a **private** one.

**Challenge:** we don't know the quiz's visibility on the client before trying, and joining is
auth-gated.

**Solution:** a `/join/:quizId` page that **optimistically attempts the join**:
- success → straight into `/take/:sessionId` (public case);
- **HTTP 401** → render a password form and retry with the password (private case);
- other errors (not started / not published) → toast + redirect to Discover.

Using the **status code as the branch** avoided a separate "is this private?" lookup. The quiz
id lives in the URL, so private only needs the password (no code entry). A `tried` ref guards
React StrictMode's double-effect so we don't double-join.

**Interview talking point:** I let the API's response *drive* the UI state machine
(`200 → enter`, `401 → ask password`) instead of pre-fetching metadata — fewer round-trips and
no client-side duplication of the server's access rules.

---

## Feature 10 — Waiting room for scheduled quizzes (via shared link) + live waiting count

**Requirement:** Opening a share link for a quiz that **hasn't started yet** should show a
waiting-room page with a countdown, then pull the user into the quiz automatically once it goes
live — and show how many students are currently waiting.

### 10a. Getting metadata for a quiz you can't join yet
**Problem:** the waiting room needs the quiz's title, schedule, question count, duration and
host — but the join attempt for a scheduled quiz just throws `400 "hasn't started"` with no
data, and `GET /quizzes/:id` forbids private quizzes for non-creators.

**Solution:** a dedicated, low-risk `GET /quizzes/:id/info` returning **only safe scheduling
metadata** (no questions, answers, or password) for any quiz. The page fetches this first and
branches on the **derived status**:
- `scheduled` → waiting room;
- `live`/`ended` → attempt join (public enters, private → password form);
- `draft`/not found → toast + redirect.

### 10b. Auto-entering when it goes live
A 1-second interval drives the **Min:Sec countdown** to `scheduledAt`. When it hits zero (or the
user clicks **Refresh status**), the page re-fetches `/info`; since status is derived from time,
it now reads `live`, so the page runs the join flow and moves the user in. A `reachedStart` ref
ensures the auto-join fires **once**, avoiding a re-fetch loop from clock skew.

### 10c. "0 Joined" → live presence instead
**Problem reported:** the waiting room showed **0 Joined**. **Why:** in this app you *can't*
join a quiz until it's live (no host-driven lobby), so a scheduled quiz genuinely has 0
participant records — the count was correct but useless.

**Fix — reuse presence, rekey it:** the take-page presence system keys rooms by *session id*,
but a scheduled quiz has **no session yet**. The presence handler treats its room key as an
opaque string, so the waiting room simply emits `presence_join` with the **quiz id** as the key.
The stat became **"Waiting"** and now shows the real-time count of everyone on the waiting page
(deduped by user, updating as people come and go). **Zero backend changes** — the existing
handler already accepted any room key.

**Decisions called out:**
- Dropped the mockup's static "in the waiting room" avatar list — it implies a pre-start lobby
  the data model doesn't have; the live *count* is the honest, backable piece.
- No websocket "go live" push exists (status is time-derived, not event-driven), so entry is
  driven by the client countdown + a manual Refresh — consistent with the cron-free design.

**Interview talking point:** The most reusable abstraction here was presence keyed by an opaque
room id. Because I didn't hard-code "session" into it, the *same* code powered a brand-new
"students waiting" feature for an entity (a scheduled quiz) that has no session at all.

---

## Feature 11 — Email integration (Resend) + emailed cancellation OTP

**Requirement:** Send real emails — a welcome email on signup, a password‑reset link, and a
**one‑time code (OTP)** that must be verified before a paid plan can be cancelled.

### 11a. Picking the right tool — the testmail.app mix‑up
**Challenge:** The first instruction was "use testmail.app for the email API." But **testmail.app
doesn't send email** — it's a *testing/capture* service: it gives you inbox addresses
(`{namespace}.{tag}@inbox.testmail.app`) and an API to **read** received emails so you can assert
them in automated tests. Wiring it as a sender would have been a dead end.

**Thought process / recovery:** Rather than build the wrong thing, I separated the two concerns —
*sending* vs *verifying* — explained that testmail.app only does the latter, and asked for a real
sender. We landed on **Resend**, a transactional email API. (testmail.app can still be the test
inbox later, but it needs a verified sending domain in Resend to receive from us.)

**Interview talking point:** Recognizing a tool/requirement mismatch early and pausing to
re‑scope saved building an integration that could never work.

### 11b. Integrating the API key safely
- Added the `resend` SDK and a single **mailer util** (`utils/mailer.ts`) exposing
  `sendMail(to, subject, html)` and an `isMailConfigured` flag.
- The key lives in env (`RESEND_API_KEY`, optional) validated by Zod, plus a `MAIL_FROM`
  (defaults to Resend's test sender `onboarding@resend.dev`). It's documented in `.env.example`
  and **kept out of git** (`.env` is git‑ignored).
- **Graceful degradation:** if the key is unset, `sendMail` **no‑ops with a warning** instead of
  throwing — so signup/reset never break in environments without email. The Resend client is
  created only when the key exists.

### 11c. The OTP workflow (generate → store → email → verify)
This is the core of the cancellation flow. Two endpoints:

1. `POST /payments/cancel/request-otp`
   - **Generate:** a 6‑digit numeric code — `String(Math.floor(100000 + Math.random()*900000))`.
   - **Store:** in **Redis** under `cancelotp:<userId>` with a **600s (10‑min) TTL**
     (`redis.set(key, code, "EX", 600)`). Redis is the right home — it's short‑lived, auto‑expiring,
     and never needs to live in Postgres.
   - **Email:** the code is sent to the user via Resend. **The plaintext code is never stored in
     the database and never returned in the API response** (the response is just `{ ok: true }`).
   - **Dev fallback:** if email isn't configured *and* not production, the code is written to the
     **server log** so the flow is testable without a real inbox — but never exposed over HTTP.

2. `POST /payments/cancel` (now requires `{ otp }`)
   - **Validate:** read `cancelotp:<userId>` from Redis and compare to the submitted code. Missing
     or mismatched → `400 "Invalid or expired code"`. Expiry is handled *for free* by the TTL —
     no manual timestamp checks.
   - **Consume + act:** on success, **delete the key** (single‑use) and downgrade the user to
     `free`, returning the updated user.

**Where the code lives / doesn't:**
- ✅ In **Redis**, briefly, as the source of truth for verification (TTL‑expiring, single‑use).
- ✅ In the **user's inbox** (delivered by Resend).
- ❌ **Never** in Postgres, never hashed‑and‑stored long‑term, never sent back in any API
  response. (It's a short‑lived secret, so plaintext‑in‑Redis‑with‑TTL is acceptable, unlike the
  account password which is bcrypt‑hashed forever.)

**Frontend wiring:** "Yes, Cancel Plan" calls `request-otp` (emails the code) and opens the OTP
modal; entering the code calls `/payments/cancel`. The `OtpModal` was refactored from a
placeholder stub into a reusable component with `onSubmit(code)` / `onResend()` props, so the
verification logic lives in the parent and the modal stays generic.

**Password reset** reuses the same idea: a `randomUUID` token in Redis (15‑min TTL) emailed as a
`/forgot-password?token=…` link; the page reads the token from the query string. The dev‑token
fallback is now only used when **neither** production **nor** email is configured.

**Interview talking point:** OTPs and reset tokens are *ephemeral secrets* — Redis with a TTL is
the natural store (auto‑expiry = built‑in "code expired" logic, `DEL` = single‑use), and the
plaintext should never touch the database or a response body.

---

## Cross-cutting engineering practices

- **Read before write:** read the relevant modules before changing them; matched existing
  conventions (module = routes → controller → service → schema; Zod validation; `ApiError`).
- **Verify every change:** ran `tsc --noEmit` on **both** workspaces after each feature; fixed
  errors before calling it done.
- **Non-destructive & honest:** left orphaned code intact rather than ripping it out; never
  fabricated data (showed real counts, not fake presence) and flagged each deviation.
- **Security note:** real credentials live in `backend/.env`, which **is** git-ignored
  (verified). If it were ever committed, those keys should be rotated.

---

## 30-second summary (elevator version)

> I took a host-driven live quiz app and turned it into a scheduled, self-service platform.
> The headline decisions: **derive lifecycle status from time** instead of running a scheduler;
> build **self-paced taking over REST** to avoid the global side effects of the live socket
> path; fix a **stale-closure** in the auto-submit timer with a ref; and make **presence** real
> using Socket.IO rooms deduped by user. Throughout I verified with typechecks on both
> workspaces and kept changes minimal and non-destructive.
