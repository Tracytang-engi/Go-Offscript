import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — go offscript",
  description: "Terms governing use of the Go Off Script app and website.",
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

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p style={{ ...pStyle, color: "#9CA3AF", marginBottom: 36 }}>
          Last updated: September 4, 2026. By using Go Off Script (app or website), you agree to
          these terms.
        </p>

        <section style={sectionStyle}>
          <h2 style={h2Style}>The service</h2>
          <p style={pStyle}>
            Go Off Script helps you explore career paths, opportunities, and mentors using your
            CV, preferences, and AI-assisted chat with Nova. Features may change during beta /
            TestFlight.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>Accounts</h2>
          <ul style={ulStyle}>
            <li>You must provide accurate registration information and keep your password secure.</li>
            <li>You are responsible for activity under your account.</li>
            <li>We may suspend accounts that abuse the service or violate these terms.</li>
          </ul>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>Acceptable use</h2>
          <p style={pStyle}>You agree not to:</p>
          <ul style={ulStyle}>
            <li>Upload content you do not have the right to share.</li>
            <li>Attempt to break, scrape, or overload our systems.</li>
            <li>Use the service for unlawful, harassing, or fraudulent purposes.</li>
            <li>Misrepresent AI output as professional legal, medical, or financial advice.</li>
          </ul>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>AI output &amp; no guarantees</h2>
          <p style={pStyle}>
            Career suggestions, opportunity lists, mentor leads, and chat replies are generated
            with AI and third-party data sources. They may be incomplete, outdated, or incorrect.
            Always verify important decisions yourself. Go Off Script does not guarantee jobs,
            admissions, funding, or mentor responses.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>Your content</h2>
          <p style={pStyle}>
            You retain ownership of content you upload (CV, screenshots, messages). You grant us a
            limited license to host and process that content solely to provide and improve the
            service, as described in our{" "}
            <Link href="/privacy" style={{ color: "#E8603A" }}>
              Privacy Policy
            </Link>
            .
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>Third-party services</h2>
          <p style={pStyle}>
            The app may link to LinkedIn, job boards, or other sites. Those services have their
            own terms. We are not responsible for third-party sites or outcomes from outreach you
            send.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>Availability</h2>
          <p style={pStyle}>
            We aim for reliable uptime but do not guarantee uninterrupted access. Beta features
            may be experimental.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>Disclaimer &amp; limitation</h2>
          <p style={pStyle}>
            The service is provided &quot;as is&quot; without warranties of any kind to the fullest
            extent permitted by law. To the extent allowed, we are not liable for indirect or
            consequential damages arising from your use of Go Off Script.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>Changes</h2>
          <p style={pStyle}>
            We may update these terms. Continued use after changes means you accept the updated
            terms. The date at the top reflects the latest revision.
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
