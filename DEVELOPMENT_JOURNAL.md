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

## Feature 12 — Email deliverability & swapping providers (Resend → Brevo/Nodemailer)

**Problem:** With Resend wired up, **no verification emails arrived**, yet no error showed in
the UI.

**Diagnosis:** The sender was Resend's sandbox address `onboarding@resend.dev`, which **only
delivers to the Resend account owner's email** until a domain is verified. Every other
recipient was silently rejected — and `sendMail` *catches* send errors (logs, returns), so the
request still succeeded with nothing delivered. The clue was in the backend log:
`Email send failed: You can only send testing emails to your own address…`.

**Recovery / decision:** After hitting repeated deliverability friction, we **switched the
provider to Brevo SMTP via Nodemailer**. The key design choice that made this painless: the
mailer is a **single abstraction** — `sendMail(to, subject, html)` + `isMailConfigured`. Only
`utils/mailer.ts` and the env keys changed (Resend client → Nodemailer SMTP transport;
`RESEND_API_KEY` → `SMTP_HOST/PORT/USER/PASS`). **No calling code changed** — verification,
reset, welcome, and cancel-OTP all kept working untouched.

**Dev-testing improvement:** the OTP/verification code now logs to the server console in *all*
non-production runs (previously only when email was unconfigured), so the flow is testable even
while a real SMTP sender is mid-setup. Codes are never logged in production or returned over
HTTP in production.

**Interview talking point:** Wrapping the provider behind one `sendMail` function turned a
provider migration into a ~20-line change. The deliverability bug was a reminder that a
*caught-and-logged* failure can be worse than a thrown one — it hides the problem.

---

## Feature 13 — Verify-before-create signup + branded emails

**Requirement:** Don't persist a user until their email OTP is verified — only on a correct
code should the account be created, the user logged in, and redirected to the dashboard.

### 13a. Pending registration in Redis (no DB write until verified)
**Approach:** `register` no longer creates a `User`. It validates, checks the email/username
aren't already taken, hashes the password, and stores a **pending registration in Redis**
(`pendingreg:<email>`, 15-min TTL) holding `{ email, username, passwordHash, displayName,
code }`. It emails the code and returns `202 { email, devCode? }` — **no user row, no token**.
`verifyRegistration(email, code)` checks the code, then **creates the user** (`emailVerified:
true`), deletes the pending key, issues tokens, and sends the welcome email.

**Consequences handled:**
- `verify-email` / `resend-verification` became **public** (no user exists yet) with validation
  + rate-limiting; payloads changed to `{ email, code }` / `{ email }`.
- **Duplicate detection** shifted: a duplicate is caught at register if a *created* user already
  exists, otherwise by the unique constraint at verify time.
- **Tests rewritten** to the two-step flow (register → verify with the returned `devCode`); all
  11 pass.

### 13b. The bug: verification popup never showed
**Symptom:** after registering, the app jumped straight to the dashboard — the modal never
appeared. **Cause:** `/signup` is wrapped in `PublicOnlyRoute`, which redirects *any* logged-in
user to `/dashboard`; the old `signup()` set the user in the store on success, so the redirect
fired and unmounted the page instantly.

**Fix:** don't treat the user as logged-in until verified. `signup()` now stores **nothing**
(register returns no token); the user + token are set only after `verify-email` succeeds. So
`user` stays null through the modal, `PublicOnlyRoute` doesn't redirect, and the popup shows.

**Interview talking point:** A route guard that keys off "is there a user?" will fight any
flow that wants to keep an authed-but-not-finished user on a public page. The fix was to make
"logged in" mean "verified," not "registered."

### 13c. Branded transactional emails
Added three reusable HTML templates in `utils/emailTemplates.ts` — **verification OTP**,
**password reset**, and **welcome** — all matching the app's look.
- The mockups referenced `https://yourdomain.com/logo.png`; since the app's logo is a *lucide
  React icon* (no hosted image), that would render broken. I substituted an **email-safe text
  logo** (`🧠 QuizMind AI`) that displays in every client (Gmail strips SVGs).
- Links (`/dashboard`, reset link) are built from `FRONTEND_URL` so they work per-environment.
- The reset email's "valid for 30 minutes" is **backed by reality** — I set the reset token
  TTL to 30 min to match the copy.

### 13d. Forgot-password redesign (two stages, one page)
`/forgot-password` now renders its own header/footer (the global Navbar hides on auth routes)
and switches between: a **request** stage (email → branded reset email) and a **set-new-password**
stage reached via the emailed `?token=` link — with a live **strength meter** and a
**requirements checklist** (8+ chars, number, special char, match) that gates the submit button.

**Interview talking point:** Email HTML is its own constraint world — no React components, SVGs
or external CSS are reliable, so a "logo" often has to be hosted PNG or plain text. I chose text
to keep it dependency-free.

## Feature 14 — UI polish pass, tiered quiz limits & paginated Discover

A round of front-end refinements plus two substantive changes (real plan limits and
infinite scroll). Grouped here because they shipped together in one session.

### 14a. Navbar redesign — bell + profile dropdown
**Requirement:** Match a provided header mockup, keep the existing nav items, remove the
standalone Logout button, add a notification bell, and turn the profile into a dropdown
(Profile Settings · Create · Logout).

**Challenge:** The mockup used shadcn `Avatar`/`AvatarImage`/`AvatarFallback` components that
**don't exist** in this project (we only have a small hand-rolled `ui.tsx`). Pulling in shadcn
just for an avatar was overkill.

**Approach/Solution:** Built the avatar inline — render `user.avatarUrl` as a plain `<img>`,
falling back to the user's initials when null. Implemented the dropdown with local `useState`
and a transparent full-screen overlay (`fixed inset-0`) to close on outside-click — no extra
dependency. Restyled nav items with lucide icons and the active-item bottom-border treatment.

**Interview talking point:** Don't adopt a component library to copy one widget — reproduce the
piece you need with the primitives you already have.

### 14b. Centering the nav + spacing
**Requirement:** Center the nav items; widen the gap between bell and profile.

**Challenge:** With a two-group `justify-between` header, the nav sat left-of-center because the
logo and actions groups had unequal widths.

**Solution:** Switched to a **three-section flex** (`logo | nav | actions`) with the two side
sections set to `flex-1`, so the centre nav is truly centred regardless of side widths. Bell↔
profile gap set to `gap-10` (per request, after stepping up from 4→6→10).

### 14c. Discover card button alignment
**Requirement:** Make the "Take quiz" button sit at the bottom of each card so buttons line up
across a row.

**Challenge:** Cards have variable-height metadata, so buttons floated at different heights.

**Solution:** Grid items already stretch to equal row height, so adding `flex-1` to the card's
middle content section pushes the action button to the bottom — instant alignment, one class.

### 14d. Top-6 per section on Discover
**Requirement:** Each Discover section (Live/Async/Upcoming) shows only 6; "View all" shows the
rest. **Solution:** `items.slice(0, 6)` in the section grid — the "View all" link already routed
to `/discover/:type` (the QuizList page), so no other change was needed.

### 14e. New "Medical" category
**Requirement:** Add a Medical subject in Create Quiz "and update backend + database."

**Finding (and correction):** No backend/DB change was needed. `subject` is **free-text**
(`z.string().max(100)` in Zod; `String? @db.VarChar(100)` in Prisma), **not an enum** — any value
is already accepted and stored. I flagged this rather than inventing a migration.

**Solution:** Added the `<option>` in CreateQuiz and mapped Medical → `Stethoscope` in the
`subjectIcon` helper on both card pages (Discover + QuizList).

**Interview talking point:** Verify the constraint before "updating the database" — here the
field was deliberately schemaless, so the right answer was *no* migration.

### 14f. Countdown formats
**Requirement:** Waiting-room countdown should be `day:hr:min:sec` (was `min:sec`); live cards'
"Ends in" should be `hr:min:sec`. **Solution:** Derived the extra units from the same remaining-ms
value. For the waiting room I rendered the four units from an array with a `Fragment` separator,
keeping the original accented "Sec" box.

### 14g. Real tiered quiz limits (Premium: unlimited → 120/month)
**Requirement:** Premium should allow 120 quizzes/month instead of "unlimited," across
frontend + backend + database.

**Challenge / key finding:** The limits (free 10 / pro 30 / premium ∞) were **display-only
copy** — `QuizService.create` enforced **nothing**, and there's no per-user limit column
(tier is just an enum). So "update the database" had no target.

**Approach/Solution:**
- *Frontend:* changed the Pricing feature and the Profile plan (`limit: Infinity → 120`, copy).
- *Backend:* added `TIER_QUIZ_LIMITS = { free: 10, pro: 30, premium: 120 }` and enforcement in
  `create` — count the user's quizzes since the start of the month and throw `403` once the cap
  is hit. This makes the number *real*.
- *Database:* no migration — limits are config, not stored state.

**Flagged to the user:** because enforcement didn't exist before, it now also enforces free/pro
(matching the already-advertised numbers); offered to scope it to premium-only if undesired.

### 14h. Infinite scroll on the "View all" list
**Requirement:** The QuizList page shouldn't load all quizzes at once — load 50, then another
50 when the user scrolls to the bottom.

**Challenge:** The live/async/upcoming split is **client-side**, derived from each quiz's
schedule via `effectiveQuizStatus` (depends on `scheduledAt` + `durationMins` + now). That can't
be expressed as a simple Prisma `where`, so the server can't cleanly paginate *per section*.

**Approach/Solution:** Kept the client-side variant filter, but replaced the one-shot
`limit=100` fetch with paginated `limit=50&offset=<loaded>` calls that **append**. An
`IntersectionObserver` watches a bottom sentinel; while it's in view it pulls the next page
(guarded by a `loadingRef`, stopped using the server's `total`). Because a sparse-variant batch
might yield few matches, the observer's "in view" state auto-chains `loadMore` until the viewport
fills or everything's loaded. No backend change — `list` already returned `{ total, limit, offset }`.

**Interview talking point:** When a derived/time-based filter lives on the client, true
server-side pagination of that filter needs raw SQL; the pragmatic middle ground is paged raw
fetches + client filter + an observer that keeps pulling until the view is satisfied.

## Feature 15 — In-app notification system

**Requirement:** Notify users on six events — **upcoming quiz**, **major system update**,
**subscription expiring within 5 days**, **monthly quiz-creation limit reached**, **plan
cancelled**, and **plan purchased** — surfaced via the navbar bell, with a full notifications
page reachable through "View all."

### System design (the architecture I'd whiteboard)
**Data model.** One `Notification` row per user-facing event:
`{ id, userId, type (enum), title, body?, link?, read, createdAt }`, indexed on
`(userId, read)` so the unread-count and per-user list queries stay cheap. `type` is a Postgres
enum of the six cases; `link` is an optional in-app deep link (e.g. `/pricing`, `/join/:id`).

**Two ways notifications are born:**
1. **Event-driven (push at write time).** A reusable `NotificationService.create()` is called
   from the code paths that already own the event:
   - `payment.verifyAndUpgrade` → `plan_purchased`
   - `payment.cancel` → `plan_cancelled`
   - `quiz.create` → `quiz_limit_reached` (fires the moment the just-created quiz hits the cap)
2. **Derived (materialized lazily on read).** Time-based events have no natural write moment, so
   `syncDerived(userId)` runs at the top of `list()` and `unreadCount()` and inserts (deduped)
   any notifications that have become "true" since last check:
   - `subscription_expiring` when `subscriptionEndsAt` is within 5 days
   - `upcoming_quiz` for the user's own scheduled quizzes starting within 24h

**API surface** (`/api/v1/notifications`, all auth-guarded):
`GET /` (latest 50), `GET /unread-count`, `PATCH /:id/read`, `PATCH /read-all`, `DELETE /:id`.

**Frontend.** A `NotificationBell` polls `unread-count` every 30s for the badge, loads the list
on open, shows the **5 most recent** with "View all," and marks-read / mark-all-read. The full
`/notifications` page reuses the same API with tabs (All/Unread/Quizzes/System), Today/Yesterday/
Older grouping, and dismiss.

### Challenges & decisions

**1. Time-based triggers with no scheduler.** "Expiring in 5 days" and "starts in 24h" usually
imply a cron job. Adding a background scheduler to a single-process app is extra moving parts
(and double-fires across restarts). **Decision:** generate these **lazily on fetch** — when the
user actually looks at notifications, `syncDerived` checks the conditions and inserts what's due.
No scheduler, and notifications can't exist unseen. *Trade-off:* a user who never opens the app
never gets them — acceptable for in-app (vs email) notifications.

**2. Idempotency / no duplicate spam.** Lazy generation runs on every fetch, so it must not
re-insert. **Solution:** dedupe per event — `upcoming_quiz` is deduped by its `link`
(`/join/:quizId`); `subscription_expiring` by "does one already exist created within this 5-day
window" (`createdAt >= endsAt − 5d`), which also lets a *new* notification fire after renewal.

**3. "Subscription expiring" had no data to stand on.** The app never stored a real expiry —
the Profile page faked a renewal date from `createdAt`. **Solution:** added
`User.subscriptionEndsAt`, set to `now + 30d` on purchase and `null` on cancel, so the 5-day
trigger is backed by a real field instead of a UI guess.

**4. "Upcoming quiz" — notify whom?** There's no pre-registration: a user has no relationship to
a future quiz until they join at start time. The only concrete link in the data is **creator →
their scheduled quiz**. **Decision:** notify the creator that *their* quiz goes live soon, and
flagged the assumption rather than inventing a "followers"/registration table.

**5. "System update" is a broadcast with no admin.** There's no admin UI to author one.
**Decision:** ship the `system_update` type + the `create()` helper (so it can be triggered from
a script/seed) but don't fake an auto-generator. Honest about the gap.

**6. Windows file-lock on `prisma generate` (EPERM).** Generation kept failing renaming
`query_engine-windows.dll.node` — the running `tsx watch` dev server holds the DLL. **Key
insight:** Prisma writes the **TypeScript types first**, then swaps the engine binary; the types
*did* update (backend typechecked clean), only the runtime binary was locked. So the fix was just
"restart the dev server," not a code problem. I didn't kill the user's servers unilaterally.

**7. Migration drift → near data loss.** `prisma migrate dev` reported drift (earlier columns
like `duration_mins` were added via `db push`, not migrations) and wanted to **reset the database
(drop all data)**. **Decision:** used `prisma db push --skip-generate` instead — it applies only
the additive diff (new table + nullable column) directly, non-destructively, and `--skip-generate`
sidesteps the locked engine. Recognising *why* the two tools behaved differently (history vs
state) was the important part.

**8. Mockup used a component kit we don't have.** The provided design leaned on shadcn
`Tabs/Avatar/Card` and its own `<header>`. **Decision:** rebuilt it with the project's own
`Button/Card/Badge` + a tiny state-driven tab strip, and **dropped the duplicate header** because
the global `Navbar` already renders on every route. Reproduce the look with the primitives you
have rather than pulling in a kit for one page.

**9. Route ordering.** `PATCH /read-all` is declared before `PATCH /:id/read` so "read-all"
isn't swallowed as an `:id`. Small, but the kind of bug that 404s silently.

**10. Unread badge freshness.** Chose **30s polling** of a cheap indexed `count` over wiring
notifications into the existing Socket.IO layer — far less complexity for a badge that doesn't
need millisecond freshness. Noted Socket.IO as the upgrade path if real-time is required.

**Interview talking points:**
- *Event vs derived notifications* — push the ones with a clear write moment; lazily materialize
  the time-based ones to avoid a scheduler, with per-type dedupe for idempotency.
- *`db push` vs `migrate dev`* — one syncs schema→DB by **state**, the other by **history**;
  under drift, only `db push` avoids a destructive reset.
- *Honest scoping* — notify the only audience the data supports (quiz creators), and don't fake an
  admin broadcaster; flag both instead of pretending.

---

## Feature 16 — "Remind me" for upcoming quizzes (opt-in two-stage reminders)

**Requirement:** On the Discover "Upcoming" cards, the **Remind me** button should register the
user for a quiz they don't own, fire **two** notifications — one shortly **before it starts** and
one **when it goes live** — and, after clicking, flip to **🔔 Reminder set · Cancel** so it can be
undone.

### Design
**New table `QuizReminder`** = the user's *intent* to be reminded: `{ userId, quizId,
notifiedSoon, notifiedLive }` with `@@unique([userId, quizId])`. The two boolean flags double as
**per-stage dedupe** — far cleaner than encoding a stage into the notification's `link`.

**Reuses the lazy generator.** No new scheduler: `syncDerived` (from Feature 15) now also walks the
user's reminders and, using the quiz's `scheduledAt`/`durationMins`:
- fires **"starts soon"** once when start is `< 60 min` away (sets `notifiedSoon`),
- fires **"live now"** once while `now ∈ [start, start + duration)` (sets `notifiedLive`).

**Endpoints:** `POST /quizzes/:id/remind` (upsert — idempotent), `DELETE /quizzes/:id/remind`
(cancel), `GET /quizzes/reminders` (the user's reminded quiz IDs, to render the correct state on
load).

### Challenges & decisions

**1. Two notifications for one quiz without duplicate spam.** Lazy generation re-runs on every
fetch. Reusing Feature 15's "dedupe by `type + link`" couldn't distinguish the two stages (same
quiz, same link). **Decision:** put the dedupe **on the reminder row** via `notifiedSoon` /
`notifiedLive` flags, set transactionally as each notification is created. Each stage fires
exactly once, and the design stays readable.

**2. Reminding a non-creator.** Feature 15's `upcoming_quiz` only covered a creator's *own*
quizzes. A reminder is an explicit opt-in by *any* user for *any* upcoming quiz — hence the
separate intent table rather than overloading the creator logic.

**3. Idempotent button + correct state after reload.** Optimistic local state alone would lie
after a refresh (button reverts to "Remind me" even though the DB still holds the reminder).
**Decision:** `POST` is an **upsert** (double-click is harmless) and the page loads
`GET /quizzes/reminders` on mount into a `Set<quizId>`, so the **🔔 Reminder set · Cancel** state
is accurate across reloads — not just optimistic.

**4. Route shadowing.** `GET /quizzes/reminders` had to be declared **before** `GET /:id`, or
"reminders" would be parsed as a quiz id and 404/throw. Same class of bug as the notifications
`/read-all` vs `/:id/read` ordering.

**5. Lazy-generation gap (flagged, not hidden).** Because reminders materialize on fetch (bell
polls every 30s while the app is open), a user who keeps the app closed through the whole
pre-start hour will miss "starts soon" (only "live now" fires later). Honest trade-off of the
no-scheduler approach; the upgrade path is a background job or email/push.

**Interview talking point:** Model the **intent** (a reminder row) separately from the **effect**
(notifications), and dedupe on the intent's own state flags. It keeps "fire exactly once per
stage" trivial and avoids hacks like stuffing a stage marker into a URL.

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
