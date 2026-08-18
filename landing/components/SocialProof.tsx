"use client";

import { motion } from "framer-motion";

const quotes = [
  {
    text: "I had no idea what I actually wanted to do after graduation. Nova asked me three questions and surfaced paths I'd never considered — one of them is exactly where I'm heading now.",
    name: "Priya S.",
    detail: "Economics, Cambridge",
  },
  {
    text: "The mentor feature is insane. I got a properly personalised cold message drafted in 30 seconds and actually heard back from someone senior at McKinsey.",
    name: "James T.",
    detail: "Engineering, Cambridge",
  },
  {
    text: "Finally something that doesn't just tell you to 'network more'. Nova gives you specific, real opportunities. Feels like having a career advisor available 24/7.",
    name: "Mei L.",
    detail: "Natural Sciences, Cambridge",
  },
];

export default function SocialProof() {
  return (
    <section style={{ backgroundColor: "#FAF5EE", padding: "96px 0", borderTop: "1px solid rgba(232,96,58,0.15)" }}>
      <div style={{ maxWidth: 1152, margin: "0 auto", padding: "0 24px" }}>
        {/* Cambridge badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 56 }}
        >
          <div style={{ marginBottom: 16 }}>
            <CambridgeShield />
          </div>
          <p style={{ fontSize: 22, fontWeight: 900, color: "#1A1A1A", textAlign: "center", margin: 0 }}>
            Built by Cambridge students.
          </p>
          <p style={{ color: "#6B7280", textAlign: "center", marginTop: 6, fontSize: 15 }}>
            Tested with Cambridge students — and the feedback speaks for itself.
          </p>
        </motion.div>

        {/* Quote cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {quotes.map((q, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 20,
                padding: 24,
                border: "1px solid #E5E7EB",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", gap: 2 }}>
                {Array.from({ length: 5 }).map((_, s) => (
                  <span key={s} style={{ color: "#E8603A", fontSize: 14 }}>&#9733;</span>
                ))}
              </div>
              <p style={{ color: "#1A1A1A", fontSize: 14, lineHeight: 1.65, flex: 1, margin: 0 }}>
                &ldquo;{q.text}&rdquo;
              </p>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#1A1A1A", margin: 0 }}>{q.name}</p>
                <p style={{ fontSize: 12, color: "#6B7280", margin: "2px 0 0" }}>{q.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{ marginTop: 56, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 48 }}
        >
          {[
            { value: "100%", label: "of beta testers would recommend to a friend" },
            { value: "3 min", label: "average time to your first career path" },
            { value: "Cambridge", label: "University — where we built and tested it" },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <p style={{ fontSize: 32, fontWeight: 900, color: "#E8603A", margin: 0 }}>{stat.value}</p>
              <p style={{ fontSize: 13, color: "#6B7280", marginTop: 4, maxWidth: 180 }}>{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function CambridgeShield() {
  return (
    <svg width="48" height="56" viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 2L44 10V28C44 40 34 50 24 54C14 50 4 40 4 28V10L24 2Z" fill="#FDE8E0" stroke="#E8603A" strokeWidth="2" />
      <path d="M22 14H26V42H22V14Z" fill="#E8603A" />
      <path d="M10 24H38V28H10V24Z" fill="#E8603A" />
    </svg>
  );
}
