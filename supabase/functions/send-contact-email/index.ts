import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const token = Deno.env.get("POSTMARK_SERVER_TOKEN");
    if (!token) throw new Error("POSTMARK_SERVER_TOKEN not configured");

    const body: ContactRequest = await req.json();

    // Server-side validation
    if (!body.name?.trim() || !body.email?.trim() || !body.subject?.trim() || !body.message?.trim()) {
      return new Response(JSON.stringify({ error: "All fields are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email.trim())) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const name = body.name.trim().slice(0, 100);
    const email = body.email.trim().slice(0, 255);
    const subject = body.subject.trim().slice(0, 200);
    const message = body.message.trim().slice(0, 2000);

    const postmarkUrl = "https://api.postmarkapp.com/email";
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Postmark-Server-Token": token,
    };

    // Email 1: content to talk@ackinax.com
    const contentEmail = fetch(postmarkUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        From: "Ackinax Contact <contact@syks.co>",
        To: "talk@ackinax.com",
        Subject: `[Website Contact] ${subject}`,
        ReplyTo: email,
        MessageStream: "outbound",
        LayoutTemplate: "basic",
        HtmlBody: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
          <hr/>
          <p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>
        `,
        TextBody: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`,
      }),
    });

    // Email 2: confirmation to submitter
    const confirmEmail = fetch(postmarkUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        From: "Ackinax <contact@syks.co>",
        To: email,
        Subject: "We received your message",
        MessageStream: "outbound",
        LayoutTemplate: "basic",
        HtmlBody: `
          <p>Hi ${escapeHtml(name)},</p>
          <p>Thanks for reaching out! We've received your message and our team will get back to you as soon as possible.</p>
          <p>— The Ackinax Team</p>
        `,
        TextBody: `Hi ${name},\n\nThanks for reaching out! We've received your message and our team will get back to you as soon as possible.\n\n— The Ackinax Team`,
      }),
    });

    const [r1, r2] = await Promise.all([contentEmail, confirmEmail]);

    if (!r1.ok || !r2.ok) {
      const err1 = !r1.ok ? await r1.text() : "";
      const err2 = !r2.ok ? await r2.text() : "";
      console.error("Postmark errors:", err1, err2);
      throw new Error("Failed to send one or more emails");
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("send-contact-email error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
