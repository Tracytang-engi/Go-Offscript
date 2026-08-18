"use client";

import { useState, useEffect } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: scrolled ? "rgba(232, 96, 58, 0.97)" : "transparent",
        backdropFilter: scrolled ? "blur(8px)" : "none",
        boxShadow: scrolled ? "0 1px 0 rgba(255,255,255,0.15)" : "none",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="text-white font-black text-xl tracking-tight">
          go off script
        </a>
        <a
          href="#waitlist"
          style={{ backgroundColor: "rgba(255,255,255,0.2)", border: "1.5px solid rgba(255,255,255,0.5)" }}
          className="text-white text-sm font-bold px-5 py-2.5 rounded-full hover:bg-white/30 transition-colors"
        >
          join waitlist
        </a>
      </div>
    </nav>
  );
}
