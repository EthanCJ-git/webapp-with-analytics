# Analytics Pipeline

This is the heart of the project: a small, first-party, cookieless tracker. This document is
the contract for how it behaves and why.

## End-to-end flow

1. A visitor loads a page. `<AnalyticsTracker />` (a client component in the root layout)
   fires once on mount and again on every client-side navigation.
2. It sends a `fetch` beacon to `POST /api/track` with only non-identifying context:
   pathname, referrer, viewport width, and any UTM parameters from the landing URL.
3. The Edge route reads the raw IP and user agent **from request headers** (the browser
   never sends these in the body), then:
   - derives the day's salt,
   - computes `visitor_hash`,
   - resolves country from Vercel geo headers,
   - parses the user agent into browser / OS / device,
   - drops the request if it looks like a bot.
4. For a human request, it inserts one row into `events` using the service role key and
   returns `204 No Content`.

The raw IP is used only in-memory to compute the hash and is never stored or logged.

---

## Endpoint contract: `POST /api/track`

### Request

`Content-Type: application/json`

```jsonc
{
  "path": "/projects/analytics",   // required. pathname only, no query string
  "referrer": "https://news.ycombinator.com/",  // optional. document.referrer
  "screen_width": 1440,            // optional. window.innerWidth
  "utm_source": "resume",          // optional. parsed from landing URL
  "utm_medium": "pdf",             // optional
  "utm_campaign": "spring-2026"    // optional
}
```

The client sends **only** these fields. IP and user agent are read server-side from headers,
never trusted from the body.

### Response

| Status | Meaning                                                        |
| ------ | ------------------------------------------------------------- |
| `204`  | Accepted (or silently dropped as a bot). No body.             |
| `400`  | Malformed body / missing `path`.                              |
| `405`  | Method other than POST.                                       |

The endpoint is intentionally forgiving and side-effect-only: the browser ignores the
response. Failures never surface to the visitor and never block page interactivity.

### Headers read server-side

| Header                    | Used for                                  |
| ------------------------- | ----------------------------------------- |
| `x-forwarded-for`         | Client IP (first entry) → hash input only |
| `user-agent`              | Hash input + browser/OS/device parsing    |
| `x-vercel-ip-country`     | 2-letter country code                     |

---

## The visitor hash

```
day     = current UTC date, formatted YYYY-MM-DD
salt    = SHA-256( ANALYTICS_SALT_SECRET + "|" + day )
visitor_hash = SHA-256( salt + "|" + ip + "|" + user_agent )
```

- `ANALYTICS_SALT_SECRET` is a long random string in server-only env.
- The salt changes every UTC midnight, so the same person produces a **different** hash
  tomorrow. Within a day, their hash is stable, which is what lets us count uniques and
  stitch sessions.
- The stored value is a one-way hash. Without the secret you cannot go from a stored hash
  back to an IP; with a rotated day you cannot link a person across days.

### Why a daily-rotating hash

The alternative — a persistent cookie or UUID — buys long-term identity at the cost of
storing a durable personal identifier and (in the EU/UK) generally needing a consent banner.
The daily hash is a deliberate middle ground:

- **We can:** count unique visitors within a day, measure sessions, see returning-within-a-day
  behavior.
- **We can't (by design):** recognize the same person across days, build a long-term profile,
  or reverse a hash to an identity.

**Honest limitations:**

- Multi-day "unique visitors" is really *unique-visitor-days*. The dashboard labels it as
  such; see [DATA_MODEL](DATA_MODEL.md#a-note-on-unique-visitors).
- Two people behind the same NAT with identical user agents can collide into one hash. Rare
  at this scale and an acceptable trade for storing no IPs.
- Because the salt is derived from a fixed secret plus the date, the server *could*
  recompute any past day's salt. Since raw IPs are never stored, this can't be used to
  re-identify stored rows. If you want the stronger guarantee where even the operator can't
  recompute old salts, generate a **random** salt per day, store it in a `salts` table, and
  delete salts older than two days via a scheduled job. The derived-salt approach is the
  documented default for its simplicity — this is exactly the kind of trade worth stating
  out loud in a review.

---

## Bot filtering

Bots and preview crawlers (Slack, link unfurlers, uptime checks, search engines) would
otherwise inflate counts. We filter on the user agent before inserting.

- Use a maintained list such as the `isbot` package, or a curated regex of
  `bot|crawler|spider|crawling|preview|monitor|headless|lighthouse` as a lightweight start.
- Filtered requests still return `204` — we just don't insert. From the caller's view nothing
  differs, which avoids giving scrapers a signal.

Because filtering is one function at the top of the handler, the rule set is easy to tune as
you notice junk in the data.

---

## Reference implementation

Illustrative, not exhaustive — error handling and the UA parser are sketched. Treat this as
the contract made concrete.

**`components/analytics-tracker.tsx`** (client)

```tsx
"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const body = JSON.stringify({
      path: pathname,
      referrer: document.referrer || undefined,
      screen_width: window.innerWidth,
      utm_source: params.get("utm_source") || undefined,
      utm_medium: params.get("utm_medium") || undefined,
      utm_campaign: params.get("utm_campaign") || undefined,
    });

    // keepalive lets the beacon complete even if the page is unloading
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {}); // never let analytics break the page
  }, [pathname]);

  return null;
}
```

**`app/api/track/route.ts`** (Edge)

```ts
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

const admin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // server-only, bypasses RLS
);

async function sha256(input: string) {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(null, { status: 400 });
  }
  if (!body?.path || typeof body.path !== "string") {
    return new Response(null, { status: 400 });
  }

  const ua = req.headers.get("user-agent") ?? "";
  if (isBot(ua)) return new Response(null, { status: 204 }); // dropped

  const ip =
    (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "0.0.0.0";
  const country = req.headers.get("x-vercel-ip-country") ?? null;

  const day = new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
  const salt = await sha256(`${process.env.ANALYTICS_SALT_SECRET}|${day}`);
  const visitor_hash = await sha256(`${salt}|${ip}|${ua}`);

  const { browser, os, device_type } = parseUserAgent(ua);
  const referrer_domain = body.referrer ? safeHost(body.referrer) : null;

  await admin.from("events").insert({
    visitor_hash,
    path: body.path,
    referrer: body.referrer ?? null,
    referrer_domain,
    utm_source: body.utm_source ?? null,
    utm_medium: body.utm_medium ?? null,
    utm_campaign: body.utm_campaign ?? null,
    country,
    browser,
    os,
    device_type,
    screen_width: Number.isInteger(body.screen_width) ? body.screen_width : null,
  });

  return new Response(null, { status: 204 });
}

function safeHost(url: string): string | null {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return null; }
}

// isBot(): use the `isbot` package, or a curated regex to start.
// parseUserAgent(): use `ua-parser-js`, or a minimal hand-rolled matcher.
```

> The route imports `@supabase/supabase-js` and reads `SUPABASE_SERVICE_ROLE_KEY`. Confirm
> that key is **never** referenced in any client component or `NEXT_PUBLIC_` variable.

---

## Privacy posture

What is collected, and the reasoning:

| Collected                         | Why                        | Identifying? |
| --------------------------------- | -------------------------- | ------------ |
| Path                              | which pages get viewed     | no           |
| Referrer + domain                 | where traffic comes from   | no           |
| UTM params                        | which of *your* links work | no           |
| Country (2-letter)                | rough audience geography   | no           |
| Browser / OS / device             | device-mix chart           | no           |
| Screen width                      | device-mix chart           | no           |
| `visitor_hash` (daily, salted)    | same-day uniques + sessions | no (one-way, rotating) |

What is **never** collected or stored: cookies, localStorage IDs, raw IP addresses,
full user-agent strings, city/region geo, query strings, form contents, or any account data
for visitors.

Design intent: this collects the minimum needed to understand traffic and is built along
GDPR/CCPA data-minimization lines (no cookies, no persistent identifiers, no raw IPs at
rest), which is the situation in which analytics typically avoids a consent banner. This is
a description of the design, **not legal advice** — if you deploy it, confirm your own
obligations for your audience and jurisdiction, and add a short privacy note to the site
describing what you measure.
