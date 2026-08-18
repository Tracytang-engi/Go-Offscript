"use client";

import { motion } from "framer-motion";
import WaitlistForm from "./WaitlistForm";

export default function WaitlistCTA() {
  return (
    <section id="waitlist" className="bg-orange py-24">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block bg-white/20 text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            early access
          </span>

          <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-4">
            Stop following the default path.
          </h2>
          <p className="text-white/80 text-lg mb-10">
            {
              "We\u2019re letting in early users by invite. Drop your email and we\u2019ll reach out with access \u2014 no spam, ever."
            }
          </p>

          {/* Form — centred, light version */}
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <WaitlistForm size="large" />
            </div>
          </div>

          <p className="text-white/50 text-xs mt-6">
            Built at the University of Cambridge &middot; No credit card required
          </p>
        </motion.div>
      </div>
    </section>
  );
}
