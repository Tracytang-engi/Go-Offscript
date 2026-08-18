"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "1",
    icon: "&#128196;",
    title: "Upload your CV",
    description: "Nova reads your CV and extracts your real skills automatically. In seconds it knows what you're already good at.",
  },
  {
    number: "2",
    icon: "&#10022;",
    title: "Talk with Nova",
    description: "A short conversation where Nova learns your values, working style, and ambitions. Less like a quiz, more like chatting with a smart friend who gets careers.",
  },
  {
    number: "3",
    icon: "&#128640;",
    title: "Get your paths — and make them happen",
    description: "Nova surfaces career paths you match, with real jobs and events filtered to each one. Then connects you to actual mentors for personalised outreach.",
  },
];

export default function HowItWorks() {
  return (
    <section style={{ backgroundColor: "#E8603A", padding: "96px 0" }}>
      <div style={{ maxWidth: 1152, margin: "0 auto", padding: "0 24px" }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: "center", marginBottom: 64 }}
        >
          <span style={{ display: "inline-block", color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>
            how it works
          </span>
          <h2 style={{ fontSize: 40, fontWeight: 900, color: "#FFFFFF", margin: 0 }}>Three steps to clarity.</h2>
          <p style={{ color: "rgba(255,255,255,0.75)", marginTop: 12, maxWidth: 400, margin: "12px auto 0" }}>
            From zero to a concrete career plan in under 10 minutes.
          </p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              style={{
                backgroundColor: "#FAF5EE",
                borderRadius: 24,
                padding: "32px 28px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {/* Step number + icon row */}
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  backgroundColor: "#FDE8E0",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0,
                }}>
                  <span dangerouslySetInnerHTML={{ __html: step.icon }} />
                </div>
                <span style={{
                  width: 28, height: 28, borderRadius: "50%",
                  backgroundColor: "#E8603A", color: "#FFFFFF",
                  fontSize: 12, fontWeight: 900,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {step.number}
                </span>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: "#1A1A1A", margin: 0 }}>{step.title}</h3>
              <p style={{ color: "#6B7280", fontSize: 14, lineHeight: 1.7, margin: 0 }}>{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
