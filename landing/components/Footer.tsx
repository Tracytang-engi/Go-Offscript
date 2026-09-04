"use client";

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "#2A2A2A", color: "#FFFFFF", padding: "40px 0" }}>
      <div
        style={{
          maxWidth: 1024,
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 20,
        }}
      >
        <div>
          <p style={{ fontWeight: 800, fontSize: 16, margin: 0 }}>
            <span style={{ color: "#fff" }}>go </span>
            <span style={{ color: "#E8603A" }}>offscript.</span>
          </p>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 4 }}>
            &copy; {new Date().getFullYear()} Go Off Script. All rights reserved.
          </p>
        </div>
        <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
          <a href="/privacy" style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, textDecoration: "none" }}>
            Privacy
          </a>
          <a href="/terms" style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, textDecoration: "none" }}>
            Terms
          </a>
          <a href="/support" style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, textDecoration: "none" }}>
            Support
          </a>
          <a
            href="mailto:gooffscript6@gmail.com"
            style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, textDecoration: "none" }}
          >
            gooffscript6@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}
