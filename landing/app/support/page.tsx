import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Support — go offscript",
  description: "Get help with Go Off Script — account, app, privacy, and feedback.",
};

const EMAIL = "gooffscript6@gmail.com";

const categories = [
  {
    title: "Account & login",
    blurb: "Sign up, email verification, password, or can’t get into your account.",
    subject: "Support: Account & login",
  },
  {
    title: "App & features",
    blurb: "CV upload, Nova chat, career paths, opportunities, mentors, or dashboard.",
    subject: "Support: App & features",
  },
  {
    title: "Bugs & technical issues",
    blurb: "Something crashed, won’t load, or looks wrong on your device.",
    subject: "Support: Bug report",
  },
  {
    title: "Privacy & data",
    blurb: "Chat history, downloads, or questions about how we use your data.",
    subject: "Support: Privacy & data",
  },
  {
    title: "Feedback & other",
    blurb: "Ideas, partnerships, press, or anything else.",
    subject: "Support: Feedback",
  },
] as const;

const pStyle: CSSProperties = {
  fontSize: 15,
  lineHeight: 1.65,
  color: "#4B5563",
  margin: "0 0 10px",
};

function mailtoFor(subject: string) {
  return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}`;
}

export default function SupportPage() {
  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#FAF7F4" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 80px" }}>
        <Link
          href="/"
          style={{
            color: "#E8603A",
            fontSize: 13,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          ← go offscript
        </Link>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 800,
            color: "#2A2A2A",
            margin: "20px 0 8px",
            letterSpacing: "-0.02em",
          }}
        >
          Support
        </h1>
        <p style={{ ...pStyle, marginBottom: 8 }}>
          Pick a topic below and email us. We usually reply within a few days.
        </p>
        <p style={{ ...pStyle, marginBottom: 32 }}>
          <a href={`mailto:${EMAIL}`} style={{ color: "#E8603A", fontWeight: 700 }}>
            {EMAIL}
          </a>
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {categories.map((cat) => (
            <a
              key={cat.title}
              href={mailtoFor(cat.subject)}
              style={{
                display: "block",
                padding: "18px 20px",
                borderRadius: 16,
                backgroundColor: "rgba(255,255,255,0.88)",
                border: "1px solid rgba(232,96,58,0.14)",
                textDecoration: "none",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 800,
                  color: "#2A2A2A",
                }}
              >
                {cat.title}
              </p>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: "#6B7280",
                }}
              >
                {cat.blurb}
              </p>
              <p
                style={{
                  margin: "10px 0 0",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#E8603A",
                }}
              >
                Email this topic →
              </p>
            </a>
          ))}
        </div>

        <p style={{ ...pStyle, marginTop: 36, color: "#9CA3AF", fontSize: 13 }}>
          Also see our{" "}
          <Link href="/privacy" style={{ color: "#E8603A" }}>
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/terms" style={{ color: "#E8603A" }}>
            Terms
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
