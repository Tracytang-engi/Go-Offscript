"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  size?: "default" | "large";
  variant?: "onOrange" | "onWhite";
}

export default function WaitlistForm({ size = "default", variant = "onOrange" }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/waitlist?count=1")
      .then((r) => r.json())
      .then((d) => { if (typeof d.count === "number") setCount(d.count); })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus("success");
        setCount((c) => (c !== null ? c + 1 : null));
      } else {
        setStatus("error");
        setErrorMsg(data.error ?? "Something went wrong. Try again.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  };

  const isLarge = size === "large";
  const onOrange = variant === "onOrange";

  const inputStyle: React.CSSProperties = {
    flex: 1,
    borderRadius: 14,
    border: onOrange ? "1.5px solid rgba(255,255,255,0.7)" : "1.5px solid #E5E7EB",
    backgroundColor: onOrange ? "rgba(255,255,255,0.92)" : "#FFFFFF",
    color: onOrange ? "#1A1A1A" : "#1A1A1A",
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: isLarge ? 16 : 12,
    paddingBottom: isLarge ? 16 : 12,
    fontSize: isLarge ? 16 : 14,
    outline: "none",
  };

  const btnStyle: React.CSSProperties = {
    borderRadius: 14,
    backgroundColor: onOrange ? "#FFFFFF" : "#E8603A",
    color: onOrange ? "#E8603A" : "#FFFFFF",
    fontWeight: 800,
    paddingLeft: isLarge ? 32 : 20,
    paddingRight: isLarge ? 32 : 20,
    paddingTop: isLarge ? 16 : 12,
    paddingBottom: isLarge ? 16 : 12,
    fontSize: isLarge ? 16 : 14,
    whiteSpace: "nowrap" as const,
    cursor: "pointer",
    border: "none",
    transition: "opacity 0.15s",
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-2 py-4"
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-black"
              style={{ backgroundColor: onOrange ? "rgba(255,255,255,0.2)" : "#FDE8E0", color: onOrange ? "#fff" : "#E8603A" }}
            >
              &#10003;
            </div>
            <p className={`font-semibold ${onOrange ? "text-white" : "text-dark"} ${isLarge ? "text-lg" : "text-base"}`}>
              {"You're on the list!"}
            </p>
            <p style={{ color: onOrange ? "rgba(255,255,255,0.7)" : "#6B7280", fontSize: 14 }}>
              {"We'll reach out with early access soon."}
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "row", gap: 10, width: "100%", maxWidth: isLarge ? 480 : 400, flexWrap: "wrap" }}
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              style={{ ...inputStyle, minWidth: 180, flexGrow: 1 }}
            />
            <button type="submit" disabled={status === "loading"} style={{ ...btnStyle, opacity: status === "loading" ? 0.7 : 1 }}>
              {status === "loading" ? "joining..." : "get early access \u2192"}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div style={{ marginTop: 10, minHeight: 20 }}>
        {status === "error" && (
          <p style={{ fontSize: 13, color: onOrange ? "rgba(255,255,255,0.8)" : "#EF4444" }}>{errorMsg}</p>
        )}
        {status !== "success" && (
          <p style={{ fontSize: 13, color: onOrange ? "rgba(255,255,255,0.65)" : "#6B7280" }}>
            {count === null
              ? "loading waitlist count..."
              : count === 0
              ? "Be the first on the waitlist!"
              : `${count.toLocaleString()} ${count === 1 ? "person" : "people"} already joined`}
          </p>
        )}
      </div>
    </div>
  );
}
