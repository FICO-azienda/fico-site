import { NextResponse } from "next/server";
import { Resend } from "resend";

/**
 * Riceve il brief compilato in ASK FICO e manda due email:
 * una allo studio con la richiesta, una di conferma a chi l'ha inviata.
 *
 * Finché non c'è un dominio verificato su Resend la funzione risponde
 * `unconfigured`: il sito lo sa e propone di aprire il programma di posta,
 * così nessuna richiesta va persa nel frattempo.
 */

const TO = process.env.CONTACT_TO ?? "ficolc78@gmail.com";
const FROM = process.env.CONTACT_FROM; // es. "FICO <ciao@vostrodominio.it>"
const KEY = process.env.RESEND_API_KEY;

interface Payload {
  locale?: "it" | "en";
  brief?: Record<string, string | string[]>;
  summary?: string;
  contact?: {
    name?: string;
    company?: string;
    email?: string;
    phone?: string;
    link?: string;
    note?: string;
  };
}

const esc = (v: unknown) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const rows = (obj: Record<string, unknown>) =>
  Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== "" && !(Array.isArray(v) && !v.length))
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 18px 6px 0;color:#7d9a88;font-size:13px;vertical-align:top">${esc(k)}</td>` +
        `<td style="padding:6px 0;color:#163628;font-size:14px">${esc(Array.isArray(v) ? v.join(", ") : v)}</td></tr>`,
    )
    .join("");

const shell = (title: string, body: string) => `
<div style="background:#fcf4dd;padding:40px 24px;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif">
  <div style="max-width:560px;margin:0 auto">
    <p style="margin:0 0 28px;letter-spacing:.38em;font-size:11px;color:#7d9a88;text-transform:uppercase">FICO</p>
    <h1 style="margin:0 0 20px;font-size:26px;line-height:1.15;font-weight:400;color:#163628">${title}</h1>
    ${body}
    <p style="margin:36px 0 0;padding-top:18px;border-top:1px solid rgba(22,54,40,.16);font-size:12px;color:#7d9a88">
      FICO — Websites for a brighter tomorrow
    </p>
  </div>
</div>`;

export async function POST(request: Request) {
  let payload: Payload;
  try {
    payload = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ ok: false, error: "bad-request" }, { status: 400 });
  }

  const { contact = {}, brief = {}, summary = "", locale = "it" } = payload;

  if (!contact.email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact.email)) {
    return NextResponse.json({ ok: false, error: "invalid-email" }, { status: 422 });
  }

  // Nessuna chiave o nessun mittente verificato: lo diciamo apertamente invece
  // di far credere che la richiesta sia partita.
  if (!KEY || !FROM) {
    return NextResponse.json({ ok: false, error: "unconfigured" }, { status: 503 });
  }

  const resend = new Resend(KEY);
  const who = contact.name?.trim() || contact.email;

  const studio = shell(
    `Nuova richiesta da ${esc(who)}`,
    `${summary ? `<p style="margin:0 0 22px;font-size:15px;line-height:1.6;color:#163628">${esc(summary)}</p>` : ""}
     <table style="border-collapse:collapse;width:100%">${rows({ ...contact, ...brief })}</table>`,
  );

  const confirmIt = shell(
    "Ricevuto.",
    `<p style="margin:0;font-size:15px;line-height:1.65;color:#163628">
       Ciao ${esc(contact.name || "")}, abbiamo ricevuto la tua richiesta.<br><br>
       Cesare e Leonardo la leggeranno personalmente e ti ricontatteranno a questo indirizzo.
       Se nel frattempo ti viene in mente altro, rispondi pure a questa email.
     </p>`,
  );

  const confirmEn = shell(
    "Received.",
    `<p style="margin:0;font-size:15px;line-height:1.65;color:#163628">
       Hi ${esc(contact.name || "")}, we've got your request.<br><br>
       Cesare and Leonardo will read it personally and get back to you at this address.
       If anything else comes to mind in the meantime, just reply to this email.
     </p>`,
  );

  try {
    await Promise.all([
      resend.emails.send({
        from: FROM,
        to: TO,
        replyTo: contact.email,
        subject: `FICO — nuova richiesta: ${who}`,
        html: studio,
      }),
      resend.emails.send({
        from: FROM,
        to: contact.email,
        subject: locale === "en" ? "FICO — we've got your request" : "FICO — abbiamo ricevuto la tua richiesta",
        html: locale === "en" ? confirmEn : confirmIt,
      }),
    ]);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "send-failed" }, { status: 502 });
  }
}
