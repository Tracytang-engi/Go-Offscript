"use client";

import { motion } from "framer-motion";

const features = [
  {
    icon: "📄",
    title: "CV skill extraction",
    description: "Upload a PDF — Nova pulls real skills automatically. Works with any format.",
    highlight: "powered by AI",
  },
  {
    icon: "✦",
    title: "Nova chat",
    description: "A short, personalised convo that builds your career profile — not a generic quiz.",
    highlight: "adaptive",
  },
  {
    icon: "🗺️",
    title: "career path matching",
    description: "Swipe cards for AI-generated paths with match rate, skills you have, and gaps to close.",
    highlight: "swipe to decide",
  },
  {
    icon: "🔍",
    title: "real opportunities",
    description: "Jobs, projects & events from the live web — filtered to your exact paths.",
    highlight: "live search",
  },
  {
    icon: "👤",
    title: "mentor matching",
    description: "Find real LinkedIn pros and draft personalised cold messages in seconds.",
    highlight: "real people",
  },
  {
    icon: "📊",
    title: "application dashboard",
    description: "Track saved opps, pending & completed apps — with Nova one tap away.",
    highlight: "stay on track",
  },
];

export default function Features() {
  return (
    <section className="aurora-bg py-24 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span
            className="inline-block text-[11px] font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-full"
            style={{ backgroundColor: "rgba(232,96,58,0.12)", color: "#E8603A" }}
          >
            features
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: "#2A2A2A" }}>
            everything you need to go off script.
          </h2>
          <p className="mt-3 text-[15px] max-w-md mx-auto" style={{ color: "#7A8494" }}>
            from CV to career path to first conversation — Nova handles the heavy lifting.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 3) * 0.08 }}
              className="rounded-3xl p-6 flex flex-col gap-3"
              style={{
                backgroundColor: "rgba(255,255,255,0.9)",
                border: "1px solid rgba(232,96,58,0.12)",
                boxShadow: "0 8px 24px rgba(232,96,58,0.06)",
              }}
            >
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-lg"
                style={{ backgroundColor: "#FDE8E0" }}
              >
                {f.icon}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#E8603A" }}>
                {f.highlight}
              </span>
              <h3 className="text-[16px] font-extrabold" style={{ color: "#2A2A2A" }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#6B7280" }}>{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
