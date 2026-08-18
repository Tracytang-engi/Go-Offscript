"use client";

import { motion } from "framer-motion";
import WaitlistForm from "./WaitlistForm";

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-cream flex items-center overflow-hidden pt-16">
      {/* Background decorative blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #E8603A 0%, transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 -left-20 w-[400px] h-[400px] rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #E8603A 0%, transparent 70%)" }}
      />

      <div className="relative max-w-6xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16 items-center w-full">
        {/* Left — copy */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block bg-orange-light text-orange text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
              now in beta
            </span>

            <h1 className="text-5xl lg:text-6xl font-black text-dark leading-[1.08] tracking-tight mb-6">
              Your career,{" "}
              <span className="text-orange">off the beaten path.</span>
            </h1>

            <p className="text-lg text-muted leading-relaxed mb-8 max-w-md">
              Nova is an AI career companion that reads your CV, learns your values, and
              finds real paths you{"\u2019"}ve never considered — then connects you to the
              opportunities and mentors to make them happen.
            </p>

            <WaitlistForm />
          </motion.div>
        </div>

        {/* Right — visual: stylised Nova phone mockup */}
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
      <div className="absolute inset-0 rounded-[44px] bg-dark shadow-2xl border-4 border-dark overflow-hidden">
        {/* Screen */}
        <div className="absolute inset-[3px] rounded-[40px] bg-cream overflow-hidden flex flex-col">
          {/* Status bar */}
          <div className="h-8 bg-cream flex items-center justify-center">
            <div className="w-20 h-4 rounded-full bg-dark/10" />
          </div>

          {/* Chat content */}
          <div className="flex-1 px-3 py-2 flex flex-col gap-3 overflow-hidden">
            {/* Nova avatar + name */}
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-orange flex items-center justify-center text-white text-xs font-bold">
                &#10022;
              </div>
              <div>
                <p className="text-[10px] font-black text-dark">Nova</p>
                <p className="text-[8px] text-muted">online</p>
              </div>
            </div>

            {/* Nova bubble 1 */}
            <NovaBubble text="Hey! Based on your CV and values, I see some interesting directions for you." />

            {/* User bubble */}
            <UserBubble text="I want something creative but stable" />

            {/* Nova bubble 2 */}
            <NovaBubble text="Got it. You thrive where creativity meets structure — here are 3 paths built for you." />

            {/* Mini card preview */}
            <div className="bg-white rounded-2xl p-3 border border-border shadow-sm">
              <div className="flex justify-between items-start mb-1.5">
                <p className="text-[10px] font-black text-dark">Brand Strategy</p>
                <span className="text-[8px] font-bold text-orange bg-orange-light px-1.5 py-0.5 rounded-full">
                  92% match
                </span>
              </div>
              <p className="text-[8px] text-muted leading-relaxed">
                Combines analytical thinking with creative storytelling...
              </p>
              <div className="flex gap-1 mt-2">
                {["Strategy", "Writing"].map((t) => (
                  <span key={t} className="text-[7px] bg-cream rounded-full px-1.5 py-0.5 text-muted">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Option chips */}
            <div className="flex gap-1.5">
              <button className="flex-1 text-[8px] font-bold border border-orange text-orange rounded-lg py-1.5">
                A: love this
              </button>
              <button className="flex-1 text-[8px] font-bold border border-border text-muted rounded-lg py-1.5">
                B: show more
              </button>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="h-12 bg-white border-t border-border flex items-center px-3 gap-2">
            <div className="flex-1 bg-cream rounded-full h-6 px-3 flex items-center">
              <p className="text-[8px] text-muted">chat with Nova...</p>
            </div>
            <div className="w-6 h-6 rounded-full bg-orange flex items-center justify-center">
              <span className="text-white text-[10px]">&#8594;</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating badge */}
      <div className="absolute -right-8 top-20 bg-white rounded-2xl shadow-lg px-3 py-2 border border-border">
        <p className="text-[10px] font-black text-dark">&#10003; 3 paths found</p>
        <p className="text-[8px] text-muted">based on your profile</p>
      </div>

      {/* Floating badge 2 */}
      <div className="absolute -left-8 bottom-32 bg-orange rounded-2xl shadow-lg px-3 py-2">
        <p className="text-[10px] font-black text-white">5 mentors matched</p>
        <p className="text-[8px] text-white/70">ready to connect</p>
      </div>
    </div>
  );
}

function NovaBubble({ text }: { text: string }) {
  return (
    <div className="flex gap-1.5 items-end">
      <div className="w-5 h-5 rounded-full bg-orange-light flex items-center justify-center flex-shrink-0">
        <span className="text-orange text-[8px]">&#10022;</span>
      </div>
      <div className="bg-white rounded-2xl rounded-bl-sm px-2.5 py-2 max-w-[75%] border border-border">
        <p className="text-[9px] text-dark leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="bg-orange rounded-2xl rounded-br-sm px-2.5 py-2 max-w-[70%]">
        <p className="text-[9px] text-white leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
