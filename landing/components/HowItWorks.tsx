"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "1",
    icon: "📄",
    title: "upload your CV",
    description: "Nova pulls your real skills in seconds — no manual tagging, no vibes-only guesswork.",
    media: "/how-it-works/step-1-cv.gif",
  },
  {
    number: "2",
    icon: "✦",
    title: "chat with Nova",
    description: "A short convo about values, style & ambitions. Less quiz, more smart bestie energy.",
    media: "/how-it-works/step2.gif",
  },
  {
    number: "3",
    icon: "🚀",
    title: "get paths + make moves",
    description: "Swipe career paths, then unlock real jobs, events & mentors filtered to what you liked.",
    media: "/how-it-works/step3.gif",
  },
];

export default function HowItWorks() {
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
            how it works
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: "#2A2A2A" }}>
            three steps to clarity.
          </h2>
          <p className="mt-3 text-[15px]" style={{ color: "#7A8494" }}>
            from zero to a concrete plan in under 10 minutes.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="rounded-3xl p-6 flex flex-col gap-4"
              style={{
                backgroundColor: "rgba(255,255,255,0.88)",
                border: "1px solid rgba(232,96,58,0.14)",
                boxShadow: "0 8px 28px rgba(232,96,58,0.08)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
                  style={{ backgroundColor: "#FDE8E0" }}
                >
                  {step.icon}
                </div>
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold text-white"
                  style={{ backgroundColor: "#E8603A" }}
                >
                  {step.number}
                </span>
              </div>
              <h3 className="text-lg font-extrabold" style={{ color: "#2A2A2A" }}>
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#6B7280" }}>
                {step.description}
              </p>
              <div
                className="mt-1 overflow-hidden rounded-2xl"
                style={{
                  border: "1px solid rgba(232,96,58,0.1)",
                  backgroundColor: "#FAF5EE",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={step.media}
                  alt={step.title}
                  className="w-full h-auto block"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
