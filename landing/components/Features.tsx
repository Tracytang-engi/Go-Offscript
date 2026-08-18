"use client";

import { motion } from "framer-motion";

const features = [
  {
    icon: "&#128196;",
    title: "CV Skill Extraction",
    description: "Upload your PDF and Nova pulls out your real skills automatically — no manual tagging. Works with any format.",
    highlight: "Powered by AI",
    bg: "#FDE8E0",
    accent: "#E8603A",
  },
  {
    icon: "&#10022;",
    title: "Nova Chat",
    description: "A short, personalised conversation that builds your career profile. Nova asks, listens, and learns — not a generic quiz.",
    highlight: "Adaptive AI",
    bg: "#FAF5EE",
    accent: "#E8603A",
  },
  {
    icon: "&#127752;",
    title: "Career Path Matching",
    description: "Tinder-style swipe cards for 3 AI-generated paths, each with match rate, what skills you already have, and what to build.",
    highlight: "Swipe to decide",
    bg: "#FDE8E0",
    accent: "#E8603A",
  },
  {
    icon: "&#128269;",
    title: "Real Opportunities",
    description: "Jobs, projects, and in-person events pulled from the live web and filtered to your exact paths — not generic job boards.",
    highlight: "Live search",
    bg: "#FAF5EE",
    accent: "#E8603A",
  },
  {
    icon: "&#128100;",
    title: "Mentor Matching",
    description: "Nova finds real LinkedIn professionals in your target fields and drafts personalised cold messages for you to send.",
    highlight: "Real people",
    bg: "#FDE8E0",
    accent: "#E8603A",
  },
  {
    icon: "&#128202;",
    title: "Application Dashboard",
    description: "Track saved opportunities, pending and completed applications — with a Nova chat button always one tap away.",
    highlight: "Stay on track",
    bg: "#FAF5EE",
    accent: "#E8603A",
  },
];

export default function Features() {
  return (
    <section style={{ backgroundColor: "#FAF5EE", padding: "96px 0", borderTop: "1px solid rgba(232,96,58,0.12)" }}>
      <div style={{ maxWidth: 1152, margin: "0 auto", padding: "0 24px" }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: "center", marginBottom: 64 }}
        >
          <span style={{ color: "#E8603A", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 16 }}>
            features
          </span>
          <h2 style={{ fontSize: 40, fontWeight: 900, color: "#1A1A1A", margin: 0 }}>
            Everything you need to go off script.
          </h2>
          <p style={{ color: "#6B7280", marginTop: 12, maxWidth: 440, margin: "12px auto 0" }}>
            From CV to career path to first conversation — Nova handles the heavy lifting.
          </p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 3) * 0.1, duration: 0.5 }}
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 20,
                padding: 28,
                border: "1px solid #E5E7EB",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: f.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                <span dangerouslySetInnerHTML={{ __html: f.icon }} />
              </div>
              <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: f.accent }}>
                {f.highlight}
              </span>
              <h3 style={{ fontSize: 17, fontWeight: 900, color: "#1A1A1A", margin: 0 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.65, margin: 0 }}>{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
