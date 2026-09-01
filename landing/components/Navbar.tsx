"use client";

import { useState, useEffect } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: scrolled ? "rgba(255, 248, 243, 0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        boxShadow: scrolled ? "0 1px 0 rgba(232,96,58,0.12)" : "none",
      }}
    >
      <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
        <a href="#" className="text-[17px] font-extrabold tracking-tight">
          <span style={{ color: "#2A2A2A" }}>go </span>
          <span className="brand-gradient">offscript.</span>
        </a>
        <a
          href="#waitlist"
          className="cta-gradient text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm hover:opacity-90 transition-opacity"
        >
          join waitlist
        </a>
      </div>
    </nav>
  );
}
