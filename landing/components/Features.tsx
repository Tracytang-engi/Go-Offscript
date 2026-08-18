"use client";

import { motion } from "framer-motion";

const features = [
  {
    icon: "&#128196;",
    title: "CV & Skills Extraction",
    tag: "Smart Onboarding",
    description:
      "Upload your CV once. Nova reads it, pulls out your real skills, and builds an accurate picture of where you actually stand — no manual input, no guessing. It handles everything from Python to presentation skills.",
    highlight: "Automatic, zero effort",
  },
  {
    icon: "&#10022;",
    title: "Values & Interest Alignment",
    tag: "Know Yourself",
    description:
      "Choose what genuinely matters to you — creativity, financial security, impact, flexibility. You can also upload your social media browsing history or describe your interests, and Nova's AI analyses them to build a fuller picture of who you are beyond your CV.",
    highlight: "Goes deeper than any career quiz",
  },
  {
    icon: "&#128172;",
    title: "Nova Chat",
    tag: "AI Conversation",
    description:
      "A short back-and-forth with Nova that feels like talking to a smart friend. Nova asks 1–2 focused questions — sometimes offering A/B choices — then delivers a precise statement of your professional identity. It understands context that no form ever could.",
    highlight: "Builds your portrait in minutes",
  },
  {
    icon: "&#128145;",
    title: "Career Path Cards",
    tag: "Personalised Paths",
    description:
      "Swipe through AI-generated career paths with match scores, skill gap analysis, and real explanations of why each one fits you. Like or skip each card to tell Nova what resonates. You can explore new directions anytime with a conversation, and liked paths are preserved.",
    highlight: "Match scores + skill gaps for every path",
  },
  {
    icon: "&#128640;",
    title: "Real Opportunities",
    tag: "Curated for You",
    description:
      "Jobs, fellowships, short projects, coaching sessions, and in-person events — all filtered to your specific career paths. Nova searches in real time so results are always fresh, not a static database. Switch between paths to see what's out there for each direction.",
    highlight: "Live search, not a stale database",
  },
  {
    icon: "&#128101;",
    title: "Mentor Outreach",
    tag: "Real Connections",
    description:
      "Nova finds real professionals in your target fields and generates a personalised cold message using your career portrait and their public profile. Edit the draft directly, or ask Nova to refine it ('make it shorter', 'sound more casual'). One tap to contact on LinkedIn.",
    highlight: "AI-drafted messages that actually get replies",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

export default function Features() {
  return (
    <section className="bg-white py-24 border-t border-border">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-orange text-xs font-bold uppercase tracking-widest mb-4">
            features
          </span>
          <h2 className="text-4xl font-black text-dark">
            Everything you need to{" "}
            <span className="text-orange">go off script.</span>
          </h2>
          <p className="text-muted mt-3 max-w-lg mx-auto">
            Not a generic job board. Not another quiz. A full system that takes you from
            confused to confident — and keeps helping as you grow.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={cardVariants}
              className="group bg-cream rounded-2xl p-6 border border-border hover:border-orange/40 hover:shadow-md transition-all duration-300 flex flex-col gap-4"
            >
              {/* Icon + tag */}
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-orange-light flex items-center justify-center text-2xl">
                  <span dangerouslySetInnerHTML={{ __html: f.icon }} />
                </div>
                <span className="text-[10px] font-bold text-orange bg-orange-light rounded-full px-2.5 py-1 uppercase tracking-wide">
                  {f.tag}
                </span>
              </div>

              <div>
                <h3 className="text-base font-black text-dark mb-2">{f.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{f.description}</p>
              </div>

              {/* Highlight pill */}
              <div className="mt-auto">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-dark bg-white border border-border rounded-full px-3 py-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange inline-block" />
                  {f.highlight}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
