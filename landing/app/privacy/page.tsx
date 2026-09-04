import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — go offscript",
  description: "How Go Off Script collects, uses, and stores your information.",
};

const sectionStyle: CSSProperties = { marginBottom: 28 };
const h2Style: CSSProperties = {
  fontSize: 18,
  fontWeight: 800,
  color: "#2A2A2A",
  margin: "0 0 10px",
};
const pStyle: CSSProperties = {
  fontSize: 15,
  lineHeight: 1.65,
  color: "#4B5563",
  margin: "0 0 10px",
};
const ulStyle: CSSProperties = {
  fontSize: 15,
  lineHeight: 1.65,
  color: "#4B5563",
  margin: "0 0 10px",
  paddingLeft: 20,
};

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p style={{ ...pStyle, color: "#9CA3AF", marginBottom: 36 }}>
          Last updated: September 4, 2026. This is a working policy for Go Off Script beta /
          TestFlight. Contact us if anything is unclear.
        </p>

        <section style={sectionStyle}>
          <h2 style={h2Style}>Who we are</h2>
          <p style={pStyle}>
            Go Off Script (&quot;we&quot;, &quot;us&quot;) provides an AI career companion app
            and website. Questions:{" "}
            <a href="mailto:gooffscript6@gmail.com" style={{ color: "#E8603A" }}>
              gooffscript6@gmail.com
            </a>
            .
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>Information we collect</h2>
          <ul style={ulStyle}>
            <li>
              <strong>Account:</strong> name, email address, and password (stored hashed).
            </li>
            <li>
              <strong>Profile &amp; onboarding:</strong> skills, values, preferences, region, and
              similar answers you provide while chatting with Nova.
            </li>
            <li>
              <strong>Files you upload:</strong> CV / resume documents and optional social
              screenshots from your photo library.
            </li>
            <li>
              <strong>Chat:</strong> by default chats are not kept after you leave a screen. If
              you turn on &quot;save chat history&quot; in Settings, conversation turns are stored
              on your account.
            </li>
            <li>
              <strong>Saved items:</strong> career paths, opportunities, and mentors you save in
              the app.
            </li>
            <li>
              <strong>Waitlist:</strong> if you join from our website, we store your email.
            </li>
          </ul>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>How we use your information</h2>
          <ul style={ulStyle}>
            <li>Create and secure your account (including email verification codes).</li>
            <li>Generate career paths, opportunities, and mentor suggestions with AI.</li>
            <li>Analyze uploaded CVs and screenshots to extract skills and signals.</li>
            <li>Operate, debug, and improve the product.</li>
            <li>Contact you about your account or waitlist when needed.</li>
          </ul>
          <p style={pStyle}>We do not sell your personal information.</p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>Service providers</h2>
          <p style={pStyle}>We use trusted processors to run the product:</p>
          <ul style={ulStyle}>
            <li>
              <strong>Hosting / database:</strong> our API and data are hosted on cloud
              infrastructure (e.g. Render).
            </li>
            <li>
              <strong>AI:</strong> Perplexity (and similar model providers) to power Nova and
              search-style features. Content you send for those features may be processed by
              them under their terms.
            </li>
            <li>
              <strong>File storage:</strong> Cloudinary for CV and screenshot uploads when
              configured.
            </li>
            <li>
              <strong>Email:</strong> SMTP email delivery for one-time verification codes.
            </li>
          </ul>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>Device permissions</h2>
          <p style={pStyle}>
            On iOS, we may request access to your <strong>photo library</strong> only so you can
            choose screenshots to upload. We do not access your library in the background. You
            can also pick CV files through the system document picker.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>Retention</h2>
          <p style={pStyle}>
            We keep account and profile data while your account is active. Uploaded files and
            optional chat history are retained to provide the service. You may request deletion
            by emailing us; in-app account deletion is being completed for full App Store
            release.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>Your choices</h2>
          <ul style={ulStyle}>
            <li>Toggle &quot;save chat history&quot; in Settings.</li>
            <li>Skip optional screenshot uploads.</li>
            <li>Contact us to access, correct, or delete data we hold about you.</li>
          </ul>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>Children</h2>
          <p style={pStyle}>
            Go Off Script is intended for students and young adults. It is not directed at
            children under 13. If you believe we collected data from a child, contact us and we
            will delete it.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>Changes</h2>
          <p style={pStyle}>
            We may update this policy as the product evolves. The &quot;Last updated&quot; date
            at the top will change when we do. Continued use after updates means you accept the
            revised policy.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>Contact</h2>
          <p style={pStyle}>
            <a href="mailto:gooffscript6@gmail.com" style={{ color: "#E8603A" }}>
              gooffscript6@gmail.com
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
