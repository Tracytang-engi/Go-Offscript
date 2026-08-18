"use client";

import { motion } from "framer-motion";

const quotes = [
  {
    text: "I had no idea what I actually wanted to do after graduation. Nova asked me three questions and surfaced paths I'd never even considered — one of them is exactly where I'm heading now.",
    name: "Priya S.",
    detail: "Economics, Cambridge",
  },
  {
    text: "The mentor feature is insane. I got a properly personalised cold message drafted in 30 seconds and actually heard back from someone senior at McKinsey.",
    name: "James T.",
    detail: "Engineering, Cambridge",
  },
  {
    text: "Finally something that doesn't just tell you to 'network more'. Nova actually understands your CV and gives you specific, real opportunities. Feels like having a career advisor available 24/7.",
    name: "Mei L.",
    detail: "Natural Sciences, Cambridge",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5 },
  }),
};

export default function SocialProof() {
  return (
    <section className="bg-white py-24 border-t border-border">
      <div className="max-w-6xl mx-auto px-6">
        {/* Cambridge badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center mb-14"
        >
          {/* Cambridge shield SVG (simplified heraldic shape) */}
          <div className="mb-4">
            <CambridgeShield />
          </div>
          <p className="text-lg font-black text-dark text-center">
            Built by Cambridge students.
          </p>
          <p className="text-muted text-center mt-1">
            Tested with Cambridge students — and the feedback speaks for itself.
          </p>
        </motion.div>

        {/* Quote cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {quotes.map((q, i) => (
            <motion.div
              key={i}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="bg-cream rounded-2xl p-6 border border-border flex flex-col gap-4"
            >
              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, s) => (
                  <span key={s} className="text-orange text-sm">&#9733;</span>
                ))}
              </div>

              <p className="text-dark text-sm leading-relaxed flex-1">
                &ldquo;{q.text}&rdquo;
              </p>

              <div>
                <p className="text-sm font-bold text-dark">{q.name}</p>
                <p className="text-xs text-muted">{q.detail}</p>
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
          className="mt-14 flex flex-wrap justify-center gap-12"
        >
          {[
            { value: "100%", label: "of beta testers would recommend to a friend" },
            { value: "3 min", label: "average time to your first career path" },
            { value: "Cambridge", label: "University — where we built and tested it" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-black text-orange">{stat.value}</p>
              <p className="text-sm text-muted mt-1 max-w-[180px] mx-auto">{stat.label}</p>
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
      {/* Simplified shield shape */}
      <path
        d="M24 2L44 10V28C44 40 34 50 24 54C14 50 4 40 4 28V10L24 2Z"
        fill="#E8603A"
        fillOpacity="0.12"
        stroke="#E8603A"
        strokeWidth="2"
      />
      {/* Cross */}
      <path d="M22 14H26V42H22V14Z" fill="#E8603A" />
      <path d="M10 24H38V28H10V24Z" fill="#E8603A" />
    </svg>
  );
}
