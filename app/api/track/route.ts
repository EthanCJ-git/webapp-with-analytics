import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isbot } from "isbot";
import { hashVisitor, parseUserAgent, safeHost } from "@/lib/analytics";

export const runtime = "edge";

let admin: SupabaseClient | undefined;

function getAdmin() {
  if (!admin) {
    admin = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }
  return admin;
}

interface TrackBody {
  path: string;
  referrer?: string;
  screen_width?: number;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

function isTrackBody(body: unknown): body is TrackBody {
  return (
    typeof body === "object" &&
    body !== null &&
    typeof (body as TrackBody).path === "string"
  );
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(null, { status: 400 });
  }
  if (!isTrackBody(body)) {
    return new Response(null, { status: 400 });
  }

  const ua = req.headers.get("user-agent") ?? "";
  if (isbot(ua)) return new Response(null, { status: 204 });

  const ip =
    (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "0.0.0.0";
  const country = req.headers.get("x-vercel-ip-country") ?? null;

  const visitor_hash = await hashVisitor(process.env.ANALYTICS_SALT_SECRET!, ip, ua);
  const { browser, os, device_type } = parseUserAgent(ua);
  const referrer_domain = body.referrer ? safeHost(body.referrer) : null;

  await getAdmin().from("events").insert({
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
