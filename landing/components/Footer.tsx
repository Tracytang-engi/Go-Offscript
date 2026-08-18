"use client";

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "#1A1A1A", color: "#FFFFFF", padding: "48px 0" }}>
      <div
        style={{
          maxWidth: 1152,
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
          <p style={{ fontWeight: 900, fontSize: 18, margin: 0, color: "#E8603A" }}>go off script</p>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, marginTop: 4 }}>
            &copy; {new Date().getFullYear()} Go Off Script. All rights reserved.
          </p>
        </div>
        <div style={{ display: "flex", gap: 28 }}>
          {["Privacy", "Terms", "Contact"].map((link) => (
            <a
              key={link}
              href="#"
              style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, textDecoration: "none" }}
            >
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
