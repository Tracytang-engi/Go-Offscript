"use client";

import { motion } from "framer-motion";
import WaitlistForm from "./WaitlistForm";

export default function WaitlistCTA() {
  return (
    <section
      id="waitlist"
      className="py-24 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #E8603A 0%, #F07850 40%, #FF8A5B 70%, #F4A068 100%)",
      }}
    >
      <span className="absolute text-white/20 text-3xl" style={{ top: "18%", left: "10%" }}>✦</span>
      <span className="absolute text-white/15 text-2xl" style={{ bottom: "20%", right: "12%" }}>✧</span>

      <div className="relative max-w-lg mx-auto px-6 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="w-full"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">
            ready to go off script?
          </h2>
          <p className="text-white/85 text-[15px] mb-8 leading-relaxed">
            join the waitlist and be first when we open. no spam — just an invite when your spot is ready.
          </p>
          <WaitlistForm size="large" variant="onOrange" />
          <p className="text-white/55 text-xs mt-5">free during beta. no credit card required.</p>
        </motion.div>
      </div>
    </section>
  );
}
