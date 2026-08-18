"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    icon: "&#128196;",
    title: "Upload your CV",
    description:
      "Nova reads your CV and extracts your real skills — no manual tagging, no guessing. In seconds it knows what you're already good at.",
  },
  {
    number: "02",
    icon: "&#10022;",
    title: "Talk with Nova",
    description:
      "A short conversation where Nova learns your values, working style, and ambitions. Less like a quiz, more like chatting with a smart friend who gets careers.",
  },
  {
    number: "03",
    icon: "&#128640;",
    title: "Get your paths — and make them happen",
    description:
      "Nova surfaces career paths you match, with real jobs, fellowships, and events filtered to each one. Then connects you to actual mentors for personalised outreach.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-cream py-24">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-orange text-xs font-bold uppercase tracking-widest mb-4">
            how it works
          </span>
          <h2 className="text-4xl font-black text-dark">Three steps to clarity.</h2>
          <p className="text-muted mt-3 max-w-md mx-auto">
            From zero to a concrete career plan in under 10 minutes.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative grid md:grid-cols-3 gap-0">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="relative flex flex-col items-center md:items-start text-center md:text-left px-6"
            >
              {/* Connector line (between steps, desktop only) */}
              {i < steps.length - 1 && (
                <div
                  aria-hidden
                  className="hidden md:block absolute top-10 left-[calc(50%+32px)] right-[-calc(50%-32px)] h-px bg-border"
                  style={{ right: "-24px", left: "calc(50% + 40px)" }}
                />
              )}

              {/* Number + Icon circle */}
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full bg-orange-light flex items-center justify-center">
                  <span className="text-3xl" dangerouslySetInnerHTML={{ __html: step.icon }} />
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-orange text-white text-xs font-black flex items-center justify-center">
                  {step.number.replace("0", "")}
                </span>
              </div>

              <h3 className="text-lg font-black text-dark mb-3">{step.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
