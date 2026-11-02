# Community Care Request System 
Zion Church take-home project #5

## How to run locally
How to run locally (install, env vars, seed, run)


## Tech stack
Tech stack used and why
React + TypeScript + Vite



## Technical decision and why
At least one technical decision and why (e.g. RPC for lookup, urgency as ranked)


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
Test reference codes and staff test login
### Staff Logins
| Name | Email | Password |
|---|---|---|
| Grace Thompson | grace.staff@example.com | HjXEsOG2rmw_8KPw |
| Marcus Bell | marcus.staff@example.com | vA2jQKDKRxKeimdx |
| Ruth Alvarez | ruth.staff@example.com | 4sLGc0aMrTDNWJ97 |

### Reference codes
|  |
|---|
| ZC-C85U-286R |
| ZC-HQBU-U3UP |
| ZC-XAUH-Y8WU |
| ZC-EXS7-FQTH |
| ZC-MRER-6EJH |
| ZC-CNDK-2QR4 |
| ZC-36K8-EDY9 |
| ZC-PS2U-7GFX |
| ZC-JEC7-YEQ6 |
| ZC-ASA6-TTN6 |
| ZC-CFF7-S36A |
| ZC-QKUR-HNQH |

## What I would finish next
- **Nothing limits how often requests can be submitted.** A CAPTCHA or rate limit would be the next
  step if spam became a problem.
