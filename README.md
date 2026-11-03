# Community Care Request System 
Zion Church take-home project #5

**Live site: https://zion-care-requests.vercel.app**
**Care team: https://zion-care-requests.vercel.app/staff/login** with a [staff test login](#staff-logins)

## How to run locally

The app is a single-page React app that talks straight to a hosted Supabase project. There's no
server of its own to run.

### 1. Install

You need Node.js 24 (the version is pinned in `package.json` for [Volta](https://volta.sh)) and npm.

```bash
git clone https://github.com/Nai-Code222/zion-care-requests.git
cd zion-care-requests
npm install
```

### 2. Environment variables

Copy the example file and fill in the two values:

```bash
cp .env.example .env
```

| Variable | What it is |
|---|---|
| `VITE_SUPABASE_URL` | The Supabase project URL, `https://<project-ref>.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | The project's publishable key (starts with `sb_publishable_`) |

Both are in the Supabase dashboard under **Project Settings → API Keys**. The publishable key is
meant to be public: it's built into the app that runs in the browser, and the database's own rules
decide what it can reach (see [Security & Privacy](#security--privacy)). **Never put the secret
key in this file**: anything starting with `VITE_` ends up in the browser.

### 3. Seed data

No seed step is needed for the hosted project. It already holds:

- the lookup values (request types, urgency levels, contact methods, statuses);
- 12 sample requests (see [Reference codes](#reference-codes));
- the 3 staff accounts (see [Staff Logins](#staff-logins)).

The schema itself is in [supabase/migrations/](supabase/migrations/), and
[docs/database.md](docs/database.md) explains every table, rule and trigger.

To build the same database from scratch, [supabase/seed.sql](supabase/seed.sql) adds the lookup
values, the 3 staff accounts and the 12 sample requests, with the same reference codes and logins
as [Testing](#testing). With Docker running, `npx supabase start` then `npx supabase db reset`
creates a local database with the migrations and seed applied. Point `.env` at the local URL and
publishable key that `npx supabase status` prints. Two of the sample requests have different
names and descriptions locally, because the hosted ones were real test submissions.

### 4. Run

```bash
npm run dev
```

Open the address Vite prints (usually http://localhost:5173).

- **Members:** `/` to send a request, `/status` to check one.
- **Staff:** `/staff/login`, using an account from [Staff Logins](#staff-logins).

| Command | What it does |
|---|---|
| `npm run dev` | Starts the dev server with live reload |
| `npm run build` | Type-checks, then builds the production site into `dist/` |
| `npm run preview` | Serves the `dist/` build locally |
| `npm run lint` | Runs ESLint |
| `npm run db:types` | Regenerates `src/types/database.types.ts` from the linked Supabase project |


## Tech stack

- **Frontend:** React + TypeScript
- **Build tool:** Vite
- **Backend:** Supabase (serverless)

I chose this stack primarily to demonstrate hands-on experience with Supabase. React and TypeScript provide a type-safe, component-based frontend, while Vite offers fast local development and production builds.

## Technical decision and why

### Urgency has an explicit rank column

`urgency_type.urgency_rank` holds Routine 1, Soon 2, Urgent 3, and the dashboard's
**Most urgent first** sort orders requests by it, highest first.

**Why:** sorting by the label is alphabetical, which puts Routine before Urgent. Sorting by ID
only works by accident of insert order. The rank keeps the order correct even if a level is added
later. The database also requires every level to have a rank, and no two levels can share one, so
the order can't be left ambiguous.


## Security & Privacy

### Members can't read the tables at all

Members never sign in. Every table has row level security (RLS) turned on: database rules that decide,
row by row, who can see or change what. No rule lets an anonymous visitor read `care_requests` (names,
contact details, internal notes) or `activity_log` (the update history, including internal notes).
A direct query returns an empty list. A query against the `staff` table is refused outright.

### The status lookup returns only safe columns

A member reaches their own request through two database functions (`get_care_request` and
`get_request_updates`) that take a reference code. They return a fixed list of columns:

- the reference code, request type and status;
- the member's own description;
- the dates;
- the messages staff wrote for the member.

Internal notes, names, phone numbers, emails and which staff member made a change are not in that
list, so they can't come back from the lookup however it's called. That's how **internal notes
never reach the status lookup**: they're excluded where the data is read, not hidden on the screen.

Internal notes also live in their own column, apart from the member-facing message, so staff never
type both into the same box. On the request page they're labelled and highlighted as **Internal**.

### Members can only add requests, through one function

Members can't insert rows directly. They submit through `submit_care_request`, which:

- always sets the status to Received;
- always leaves internal notes empty;
- lets the database generate the reference code.

A member can't pick their own status, plant a note or choose a code.

### Staff access needs a login and a staff listing

Signing in isn't enough. A user's account must also be listed in the `staff` table, which can only
be edited from the Supabase dashboard. Every staff rule checks that listing (`private.is_staff()`).
A signed-in account that isn't listed sees nothing. Removing someone's `staff` row cuts off their
access straight away, even if they're still signed in.

### Nothing can be deleted

No rule allows deleting anything through the app, for anyone. Completed requests are archived,
not removed: marking a request Completed sets its archived flag in the database, and staff can
still open it from **Archived**. Every status change is recorded in `activity_log` with who made it
and when, and log rows can't be edited.

### Reference codes are hard to guess

Codes look like `ZC-7K3M-9QXP`. The database builds each one at random from 31 letters and digits,
leaving out the look-alikes `0 O 1 I L`. That gives about 850 billion possible codes, and the
database checks that each new one isn't already taken.

### What a reference code does reveal

Anyone holding a code can see that request's status, type, dates, the member's own description and
the staff messages. That lets a member check back on their request without an account. Staff are
told on the update form that the member note is visible to anyone with the code. The confirmation
message greets the member by first name only, never the last name, and only if they gave a name
and didn't choose to stay anonymous.

## Testing
Test reference codes and staff test logins. All of this is sample data: made-up people,
`@example.com` emails and 555 phone numbers.

### Staff Logins
Sign in at `/staff/login`. All three accounts have the same access.

| Name | Email | Password |
|---|---|---|
| Grace Thompson | grace.staff@example.com | HjXEsOG2rmw_8KPw |
| Marcus Bell | marcus.staff@example.com | vA2jQKDKRxKeimdx |
| Ruth Alvarez | ruth.staff@example.com | 4sLGc0aMrTDNWJ97 |

### Reference codes
Enter any of these at `/status`. Upper or lower case both work. Statuses are as of 2026-11-02 and
will change as staff update the requests.

| Reference code | Urgency | Type | Status |
|---|---|---|---|
| ZC-C85U-286R | Urgent | Hospital Visit | Received |
| ZC-HQBU-U3UP | Soon | Meal Delivery | Received |
| ZC-XAUH-Y8WU | Routine | Prayer Support (anonymous) | Received |
| ZC-EXS7-FQTH | Soon | Counseling Referral | Received |
| ZC-MRER-6EJH | Soon | Hospital Visit | Received |
| ZC-CNDK-2QR4 | Urgent | Meal Delivery | Assigned, with a member note and an internal note |
| ZC-36K8-EDY9 | Routine | Other | Received |
| ZC-PS2U-7GFX | Soon | Prayer Support | Received |
| ZC-JEC7-YEQ6 | Routine | Counseling Referral (anonymous) | Received |
| ZC-ASA6-TTN6 | Routine | Meal Delivery | In Review, with a member note and an internal note |
| ZC-CFF7-S36A | Soon | Hospital Visit (anonymous) | Received |
| ZC-QKUR-HNQH | Soon | Prayer Support | Received |

**Try the internal-notes rule:** ZC-ASA6-TTN6 and ZC-CNDK-2QR4 have internal notes. Open one on the staff
dashboard to see the note, then look up the same code at `/status`: the internal note isn't there.

## What I would finish next
- **Nothing limits how often requests can be submitted.** A CAPTCHA or rate limit would be the next
  step if spam became a problem.
