"use client";

import { motion } from "framer-motion";

const quotes = [
  {
    text: "I had no idea what I wanted after graduation. Nova asked three questions and surfaced paths I'd never considered — one of them is exactly where I'm heading now.",
    name: "Priya S.",
    detail: "Economics, Cambridge",
  },
  {
    text: "The mentor feature is insane. I got a personalised cold message in 30 seconds and actually heard back from someone senior.",
    name: "James T.",
    detail: "Engineering, Cambridge",
  },
  {
    text: "Finally something that doesn't just say 'network more'. Nova gives specific, real opportunities. Feels like a career advisor on tap.",
    name: "Mei L.",
    detail: "Natural Sciences, Cambridge",
  },
];

export default function SocialProof() {
  return (
    <section
      className="py-24 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #FFF8F3 0%, #FFE8DC 40%, #FFF5F0 100%)",
      }}
    >
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span
            className="inline-block text-[11px] font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-full"
            style={{ backgroundColor: "rgba(232,96,58,0.12)", color: "#E8603A" }}
          >
            social proof
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: "#2A2A2A" }}>
            built with Cambridge students.
          </h2>
          <p className="mt-3 text-[15px]" style={{ color: "#7A8494" }}>
            beta testers said it better than we could.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {quotes.map((q, i) => (
            <motion.div
              key={q.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-3xl p-6 flex flex-col gap-4"
              style={{
                backgroundColor: "rgba(255,255,255,0.92)",
                border: "1px solid rgba(232,96,58,0.12)",
                boxShadow: "0 8px 24px rgba(232,96,58,0.07)",
              }}
            >
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, s) => (
                  <span key={s} style={{ color: "#E8603A", fontSize: 13 }}>★</span>
                ))}
              </div>
              <p className="text-sm leading-relaxed flex-1" style={{ color: "#3A3A3A" }}>
                &ldquo;{q.text}&rdquo;
              </p>
              <div>
                <p className="text-sm font-bold" style={{ color: "#2A2A2A" }}>{q.name}</p>
                <p className="text-xs mt-0.5" style={{ color: "#8A93A3" }}>{q.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-14 flex flex-wrap justify-center gap-10"
        >
          {[
            { value: "100%", label: "of beta testers would recommend" },
            { value: "3 min", label: "to your first career path" },
            { value: "Cambridge", label: "where we built & tested it" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-extrabold" style={{ color: "#E8603A" }}>{stat.value}</p>
              <p className="text-xs mt-1 max-w-[140px]" style={{ color: "#7A8494" }}>{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
