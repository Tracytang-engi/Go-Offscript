"use client";

import { motion } from "framer-motion";
import WaitlistForm from "./WaitlistForm";

export default function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden pt-16"
      style={{ backgroundColor: "#E8603A" }}
    >
      {/* Decorative blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 65%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 -left-20 w-[500px] h-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 65%)" }}
      />

      <div className="relative max-w-6xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16 items-center w-full">
        {/* Left — copy */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span
              className="inline-block text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6"
              style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "#fff" }}
            >
              now in beta
            </span>

            <h1 className="text-5xl lg:text-6xl font-black text-white leading-[1.08] tracking-tight mb-6">
              Your career, off the beaten path.
            </h1>

            <p className="text-lg leading-relaxed mb-8 max-w-md" style={{ color: "rgba(255,255,255,0.85)" }}>
              Nova is an AI career companion that reads your CV, learns your values, and
              finds real paths you&apos;ve never considered — then connects you to the
              opportunities and mentors to make them happen.
            </p>

            <WaitlistForm />
          </motion.div>
        </div>

        {/* Right — phone mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex justify-center lg:justify-end"
        >
          <PhoneMockup />
        </motion.div>
      </div>
    </section>
  );
}

function PhoneMockup() {
  return (
    <div className="relative w-[280px] h-[560px]">
      {/* Phone shell */}
      <div
        className="absolute inset-0 rounded-[44px] overflow-hidden"
        style={{ backgroundColor: "#1A1A1A", boxShadow: "0 32px 80px rgba(0,0,0,0.35)", border: "4px solid #1A1A1A" }}
      >
        {/* Screen */}
        <div
          className="absolute inset-[3px] rounded-[40px] overflow-hidden flex flex-col"
          style={{ backgroundColor: "#FAF5EE" }}
        >
          {/* Status bar */}
          <div className="h-8 flex items-center justify-center" style={{ backgroundColor: "#FAF5EE" }}>
            <div className="w-20 h-4 rounded-full" style={{ backgroundColor: "rgba(26,26,26,0.1)" }} />
          </div>

          {/* Chat content */}
          <div className="flex-1 px-3 py-2 flex flex-col gap-3 overflow-hidden">
            {/* Nova avatar + name */}
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: "#E8603A" }}
              >
                &#10022;
              </div>
              <div>
                <p className="text-[10px] font-black" style={{ color: "#1A1A1A" }}>Nova</p>
                <p className="text-[8px]" style={{ color: "#6B7280" }}>online</p>
              </div>
            </div>

            <NovaBubble text="Hey! Based on your CV and values, I see some interesting directions for you." />
            <UserBubble text="I want something creative but stable" />
            <NovaBubble text="Got it — here are 3 paths built exactly for you." />

            {/* Mini card */}
            <div
              className="rounded-2xl p-3"
              style={{ backgroundColor: "#fff", border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            >
              <div className="flex justify-between items-start mb-1.5">
                <p className="text-[10px] font-black" style={{ color: "#1A1A1A" }}>Brand Strategy</p>
                <span
                  className="text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: "#FDE8E0", color: "#E8603A" }}
                >
                  92% match
                </span>
              </div>
              <p className="text-[8px] leading-relaxed" style={{ color: "#6B7280" }}>
                Combines analytical thinking with creative storytelling...
              </p>
              <div className="flex gap-1 mt-2">
                {["Strategy", "Writing"].map((t) => (
                  <span
                    key={t}
                    className="text-[7px] rounded-full px-1.5 py-0.5"
                    style={{ backgroundColor: "#FAF5EE", color: "#6B7280" }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Option chips */}
            <div className="flex gap-1.5">
              <button
                className="flex-1 text-[8px] font-bold rounded-lg py-1.5"
                style={{ border: "1.5px solid #E8603A", color: "#E8603A" }}
              >
                A: love this
              </button>
              <button
                className="flex-1 text-[8px] font-bold rounded-lg py-1.5"
                style={{ border: "1px solid #E5E7EB", color: "#6B7280" }}
              >
                B: show more
              </button>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="h-12 flex items-center px-3 gap-2"
            style={{ backgroundColor: "#fff", borderTop: "1px solid #E5E7EB" }}
          >
            <div
              className="flex-1 h-6 rounded-full flex items-center px-3"
              style={{ backgroundColor: "#FAF5EE" }}
            >
              <p className="text-[8px]" style={{ color: "#6B7280" }}>chat with Nova...</p>
            </div>
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#E8603A" }}
            >
              <span className="text-white text-[10px]">&#8594;</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating badge — paths found */}
      <div
        className="absolute -right-6 top-20 rounded-2xl px-3 py-2"
        style={{ backgroundColor: "#fff", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", border: "1px solid #E5E7EB" }}
      >
        <p className="text-[10px] font-black" style={{ color: "#1A1A1A" }}>&#10003; 3 paths found</p>
        <p className="text-[8px]" style={{ color: "#6B7280" }}>based on your profile</p>
      </div>

      {/* Floating badge — mentors */}
      <div
        className="absolute -left-6 bottom-32 rounded-2xl px-3 py-2"
        style={{ backgroundColor: "#1A1A1A", boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}
      >
        <p className="text-[10px] font-black text-white">5 mentors matched</p>
        <p className="text-[8px]" style={{ color: "rgba(255,255,255,0.6)" }}>ready to connect</p>
      </div>
    </div>
  );
}

function NovaBubble({ text }: { text: string }) {
  return (
    <div className="flex gap-1.5 items-end">
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: "#FDE8E0" }}
      >
        <span style={{ color: "#E8603A", fontSize: 8 }}>&#10022;</span>
      </div>
      <div
        className="rounded-2xl rounded-bl-sm px-2.5 py-2 max-w-[75%]"
        style={{ backgroundColor: "#fff", border: "1px solid #E5E7EB" }}
      >
        <p className="text-[9px] leading-relaxed" style={{ color: "#1A1A1A" }}>{text}</p>
      </div>
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="rounded-2xl rounded-br-sm px-2.5 py-2 max-w-[70%]" style={{ backgroundColor: "#E8603A" }}>
        <p className="text-[9px] text-white leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
