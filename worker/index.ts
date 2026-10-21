interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  RESEND_API_KEY: string;
  CONTACT_LIMITER: { limit(options: { key: string }): Promise<{ success: boolean }> };
}

interface ContactMessage {
  name: string;
  email: string;
  company: string | null;
  message: string;
}

type Outcome = "sent" | "spam" | "invalid" | "rateLimited" | "sendFailed";

const redirectFor: Record<Outcome, string> = {
  sent: "/contact/sent",
  spam: "/contact/sent",
  invalid: "/contact/failed",
  rateLimited: "/contact/failed",
  sendFailed: "/contact/failed",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function field(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function withinLength(value: string, min: number, max: number): boolean {
  return value.length >= min && value.length <= max;
}

function isSpam(form: FormData): boolean {
  return field(form, "website") !== "";
}

function parseContact(form: FormData): ContactMessage | null {
  const name = field(form, "name");
  const email = field(form, "email");
  const company = field(form, "company");
  const message = field(form, "message");

  const valid =
    withinLength(name, 1, 100) &&
    withinLength(email, 1, 200) &&
    EMAIL_PATTERN.test(email) &&
    company.length <= 100 &&
    withinLength(message, 10, 5000);

  return valid ? { name, email, company: company || null, message } : null;
}

function emailBody(contact: ContactMessage): string {
  const header = [
    `Name: ${contact.name}`,
    `Email: ${contact.email}`,
    ...(contact.company ? [`Company: ${contact.company}`] : []),
  ];
  return [...header, "", contact.message].join("\n");
}

async function send(contact: ContactMessage, apiKey: string): Promise<Outcome> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Wedecom Website <website@wedecom-consulting.de>",
      to: ["info@wedecom-consulting.de"],
      reply_to: contact.email,
      subject: `Website contact: ${contact.name.replace(/[\r\n]+/g, " ")}`,
      text: emailBody(contact),
    }),
  });
  if (response.ok) return "sent";
  console.error(`Resend rejected contact message: ${response.status} ${await response.text()}`);
  return "sendFailed";
}

async function handleContact(request: Request, env: Env): Promise<Outcome> {
  const form = await request.formData().catch(() => null);
  if (!form) return "invalid";
  if (isSpam(form)) return "spam";

  const contact = parseContact(form);
  if (!contact) return "invalid";

  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  const { success } = await env.CONTACT_LIMITER.limit({ key: ip });
  if (!success) return "rateLimited";

  return send(contact, env.RESEND_API_KEY).catch((error: unknown): Outcome => {
    console.error(`Resend request failed: ${error instanceof Error ? error.message : String(error)}`);
    return "sendFailed";
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (pathname === "/api/contact") {
      if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405, headers: { Allow: "POST" } });
      }
      const outcome = await handleContact(request, env);
      return new Response(null, { status: 303, headers: { Location: redirectFor[outcome] } });
    }

    if (pathname.startsWith("/api/")) {
      return new Response("Not Found", { status: 404 });
    }

    return env.ASSETS.fetch(request);
  },
};
