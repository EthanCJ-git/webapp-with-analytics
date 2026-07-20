import { UAParser } from "ua-parser-js";

export async function hashVisitor(salt: string, ip: string, ua: string) {
  const data = new TextEncoder().encode(`${salt}|${ip}|${ua}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function parseUserAgent(ua: string) {
  const { browser, os, device } = UAParser(ua);
  return {
    browser: browser.name ?? null,
    os: os.name ?? null,
    device_type: device.type ?? "desktop",
  };
}

export function safeHost(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}
