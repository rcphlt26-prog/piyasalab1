import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type ContactPayload = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
};

function buildMailto(payload: Required<ContactPayload>) {
  const subject = encodeURIComponent(`VeriAkış İletişim: ${payload.subject}`);
  const body = encodeURIComponent(
    `Ad: ${payload.name}\nE-posta: ${payload.email}\nKonu: ${payload.subject}\n\nMesaj:\n${payload.message}`,
  );
  return `mailto:rcphlt26@gmail.com?subject=${subject}&body=${body}`;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as ContactPayload;

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const subject = body.subject?.trim() ?? "";
  const message = body.message?.trim() ?? "";

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "Lütfen tüm alanları doldurun." }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Geçerli bir e-posta adresi girin." }, { status: 400 });
  }

  const payload = { name, email, subject, message };
  const admin = getSupabaseAdminClient();

  if (!admin) {
    return NextResponse.json({ ok: true, stored: false, fallbackMailto: buildMailto(payload) });
  }

  const { error } = await admin
    .from("contact_messages")
    .insert({
      name,
      email,
      subject,
      message,
      created_at: new Date().toISOString(),
    });

  if (error) {
    return NextResponse.json({ ok: true, stored: false, fallbackMailto: buildMailto(payload) });
  }

  return NextResponse.json({ ok: true, stored: true });
}
