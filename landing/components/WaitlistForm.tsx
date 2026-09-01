"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  size?: "default" | "large";
  variant?: "onOrange" | "onWhite" | "onLight";
}

export default function WaitlistForm({ size = "default", variant = "onLight" }: Props) {
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
  const onLight = variant === "onLight" || variant === "onWhite";

  const inputStyle: React.CSSProperties = {
    flex: 1,
    borderRadius: 16,
    border: onOrange ? "1.5px solid rgba(255,255,255,0.7)" : "1.5px solid rgba(232,96,58,0.22)",
    backgroundColor: onOrange ? "rgba(255,255,255,0.92)" : "#FFFFFF",
    color: "#2A2A2A",
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: isLarge ? 16 : 13,
    paddingBottom: isLarge ? 16 : 13,
    fontSize: isLarge ? 16 : 14,
    outline: "none",
    boxShadow: onLight ? "0 2px 10px rgba(232,96,58,0.06)" : "none",
  };

  const btnStyle: React.CSSProperties = {
    borderRadius: 16,
    background: onOrange
      ? "#FFFFFF"
      : "linear-gradient(90deg, #E8603A 0%, #F07850 45%, #FF8A5B 100%)",
    color: onOrange ? "#E8603A" : "#FFFFFF",
    fontWeight: 800,
    paddingLeft: isLarge ? 28 : 18,
    paddingRight: isLarge ? 28 : 18,
    paddingTop: isLarge ? 16 : 13,
    paddingBottom: isLarge ? 16 : 13,
    fontSize: isLarge ? 16 : 14,
    whiteSpace: "nowrap" as const,
    cursor: "pointer",
    border: "none",
    transition: "opacity 0.15s",
    boxShadow: onOrange ? "none" : "0 6px 16px rgba(232,96,58,0.28)",
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
              style={{
                backgroundColor: onOrange ? "rgba(255,255,255,0.2)" : "#FDE8E0",
                color: onOrange ? "#fff" : "#E8603A",
              }}
            >
              ✓
            </div>
            <p
              className={`font-semibold ${isLarge ? "text-lg" : "text-base"}`}
              style={{ color: onOrange ? "#fff" : "#2A2A2A" }}
            >
              you&apos;re on the list!
            </p>
            <p style={{ color: onOrange ? "rgba(255,255,255,0.7)" : "#6B7280", fontSize: 14 }}>
              we&apos;ll reach out with early access soon.
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "row",
              gap: 8,
              width: "100%",
              maxWidth: isLarge ? 480 : "100%",
              flexWrap: "wrap",
              margin: "0 auto",
              justifyContent: "center",
            }}
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              style={{ ...inputStyle, minWidth: 160, flexGrow: 1 }}
            />
            <button
              type="submit"
              disabled={status === "loading"}
              style={{ ...btnStyle, opacity: status === "loading" ? 0.7 : 1 }}
            >
              {status === "loading" ? "joining..." : "get early access →"}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div style={{ marginTop: 10, minHeight: 20, textAlign: "center" }}>
        {status === "error" && (
          <p style={{ fontSize: 13, color: onOrange ? "rgba(255,255,255,0.85)" : "#EF4444" }}>
            {errorMsg}
          </p>
        )}
        {status !== "success" && (
          <p style={{ fontSize: 12, color: onOrange ? "rgba(255,255,255,0.65)" : "#8A93A3" }}>
            {count === null
              ? "loading waitlist..."
              : count === 0
              ? "be the first on the waitlist!"
              : `${count.toLocaleString()} ${count === 1 ? "person" : "people"} already joined`}
          </p>
        )}
      </div>
    </div>
  );
}
