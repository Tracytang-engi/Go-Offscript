"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  size?: "default" | "large";
}

export default function WaitlistForm({ size = "default" }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/waitlist?count=1")
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.count === "number") setCount(d.count);
      })
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
            <span className="text-2xl">&#10003;</span>
            <p className={`font-semibold text-dark ${isLarge ? "text-lg" : "text-base"}`}>
              {"You're on the list!"}
            </p>
            <p className="text-muted text-sm">{"We'll reach out with early access soon."}</p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            className={`flex flex-col sm:flex-row gap-3 w-full ${isLarge ? "max-w-lg mx-auto" : "max-w-md"}`}
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className={`flex-1 rounded-xl border border-border bg-white px-4 outline-none focus:border-orange transition-colors text-dark placeholder:text-muted ${isLarge ? "py-4 text-base" : "py-3 text-sm"}`}
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className={`rounded-xl bg-orange text-white font-bold whitespace-nowrap hover:bg-orange/90 transition-colors disabled:opacity-60 ${isLarge ? "px-8 py-4 text-base" : "px-6 py-3 text-sm"}`}
            >
              {status === "loading" ? "joining..." : "get early access \u2192"}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Live count + error */}
      <div className="mt-2 min-h-[20px]">
        {status === "error" && (
          <p className="text-sm text-red-500">{errorMsg}</p>
        )}
        {status !== "success" && count !== null && count > 0 && (
          <p
            className={`text-muted ${isLarge ? "text-sm text-center" : "text-xs"}`}
          >
            Join {count.toLocaleString()} {count === 1 ? "person" : "others"} already on the waitlist
          </p>
        )}
      </div>
    </div>
  );
}
