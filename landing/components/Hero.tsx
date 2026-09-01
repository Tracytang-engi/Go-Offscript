"use client";

import { motion } from "framer-motion";
import WaitlistForm from "./WaitlistForm";

const PILLS = [
  { icon: "⚡", label: "2 min chat" },
  { icon: "🗺️", label: "path mapping" },
  { icon: "🎓", label: "real opps" },
  { icon: "📄", label: "AI CV scan" },
];

export default function Hero() {
  return (
    <section className="aurora-bg relative min-h-screen flex items-center overflow-hidden pt-14">
      {/* Decorative sparkles */}
      <span className="sparkle text-2xl" style={{ top: "18%", left: "8%" }}>✦</span>
      <span className="sparkle text-lg" style={{ top: "28%", right: "12%" }}>✧</span>
      <span className="sparkle text-xl" style={{ bottom: "22%", left: "14%" }}>✦</span>
      <span className="sparkle text-base" style={{ bottom: "30%", right: "10%" }}>✧</span>
      <span className="sparkle text-sm" style={{ top: "42%", left: "22%", opacity: 0.5 }}>✦</span>

      <div className="relative w-full max-w-xl mx-auto px-6 py-20 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="flex flex-col items-center w-full"
        >
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-4 py-1.5 rounded-full mb-7"
            style={{
              backgroundColor: "rgba(255,255,255,0.85)",
              border: "1px solid rgba(232,96,58,0.25)",
              color: "#E8603A",
              boxShadow: "0 2px 12px rgba(232,96,58,0.08)",
            }}
          >
            ✦ free career mapping tool ✦
          </span>

          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.05] mb-4">
            <span style={{ color: "#2A2A2A" }}>go </span>
            <span className="brand-gradient">offscript.</span>
          </h1>

          <p className="text-base sm:text-lg font-medium mb-4" style={{ color: "#5A6270" }}>
            bestie, your degree doesn&apos;t define you.
          </p>

          <p
            className="text-sm sm:text-[15px] leading-relaxed mb-8 max-w-md"
            style={{ color: "#7A8494" }}
          >
            upload your CV, chat with Nova — we&apos;ll map career paths that fit your skills &amp; values,
            then pull real jobs, events &amp; mentors. no default script. no cap.
          </p>

          <a
            href="#waitlist"
            className="cta-gradient w-full max-w-sm text-white font-extrabold text-base sm:text-lg py-4 px-6 rounded-2xl shadow-lg hover:opacity-95 transition-opacity mb-5"
            style={{ boxShadow: "0 10px 28px rgba(232, 96, 58, 0.35)" }}
          >
            let&apos;s go off script →
          </a>

          <div className="w-full max-w-sm mb-8">
            <WaitlistForm variant="onLight" size="default" />
          </div>

          <div className="flex flex-wrap justify-center gap-2.5">
            {PILLS.map((p) => (
              <span
                key={p.label}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full"
                style={{
                  backgroundColor: "rgba(255,255,255,0.9)",
                  border: "1px solid rgba(232,96,58,0.15)",
                  color: "#3A3A3A",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                <span>{p.icon}</span>
                {p.label}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
