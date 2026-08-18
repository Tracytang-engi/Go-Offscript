"use client";

import { motion } from "framer-motion";
import WaitlistForm from "./WaitlistForm";

export default function WaitlistCTA() {
  return (
    <section id="waitlist" style={{ backgroundColor: "#E8603A", padding: "96px 0" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ width: "100%" }}
        >
          <h2 style={{ fontSize: 42, fontWeight: 900, color: "#FFFFFF", marginBottom: 12 }}>
            Ready to go off script?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 16, marginBottom: 36, lineHeight: 1.6 }}>
            Join the waitlist and be first in line when we open to new users.
            No spam — just an invite when your spot is ready.
          </p>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <WaitlistForm size="large" variant="onOrange" />
          </div>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, marginTop: 20 }}>
            Free during beta. No credit card required.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
