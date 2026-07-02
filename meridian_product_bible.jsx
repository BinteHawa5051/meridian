import { useState } from "react";

const NAV = [
  { id: "wireframes", label: "Wireframes", icon: "⬚" },
  { id: "dashboard", label: "Dashboard", icon: "◫" },
  { id: "landing", label: "Landing page", icon: "◻" },
  { id: "database", label: "Database", icon: "⬡" },
  { id: "api", label: "REST APIs", icon: "⇄" },
  { id: "ai", label: "AI features", icon: "✦" },
  { id: "notifications", label: "Notifications", icon: "◎" },
  { id: "admin", label: "Admin panel", icon: "⊞" },
  { id: "payments", label: "Payments", icon: "◈" },
  { id: "emails", label: "Emails", icon: "✉" },
  { id: "docs", label: "Docs", icon: "≡" },
  { id: "sprints", label: "Sprints", icon: "▦" },
];

const C = {
  teal: "#1D9E75", teal50: "#E1F5EE", teal800: "#085041",
  blue: "#185FA5", blue50: "#E6F1FB", blue800: "#0C447C",
  amber: "#BA7517", amber50: "#FAEEDA", amber800: "#633806",
  red: "#E24B4A", red50: "#FCEBEB", red800: "#791F1F",
  purple: "#534AB7", purple50: "#EEEDFE", purple800: "#26215C",
  gray: "#888780", gray50: "#F1EFE8", gray100: "#D3D1C7",
  text: "#1a1a18", textSec: "#5f5e5a", textMute: "#888780",
  border: "rgba(0,0,0,0.1)", surface: "#fff", bg: "#f8f7f4",
};

const tag = (label, color, bg) => (
  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: bg, color, fontWeight: 400, display: "inline-block", lineHeight: 1.6 }}>{label}</span>
);

const card = (children, style = {}) => (
  <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 12, overflow: "hidden", ...style }}>{children}</div>
);

const panelHead = (title, sub) => (
  <div style={{ padding: "10px 14px", borderBottom: `0.5px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <span style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{title}</span>
    {sub && <span style={{ fontSize: 11, color: C.textMute }}>{sub}</span>}
  </div>
);

const codeBlock = (code, lang = "") => (
  <div style={{ background: "#16161a", borderRadius: 8, padding: "14px 16px", fontFamily: "monospace", fontSize: 12, color: "#c9d1d9", lineHeight: 1.8, overflowX: "auto", whiteSpace: "pre", margin: "8px 0" }}>
    <div style={{ fontSize: 10, color: "#555", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>{lang}</div>
    {code}
  </div>
);

const sectionTitle = (t) => (
  <div style={{ fontSize: 11, fontWeight: 500, color: C.textMute, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10, marginTop: 20, paddingBottom: 6, borderBottom: `0.5px solid ${C.border}` }}>{t}</div>
);

// ─── WIREFRAMES ────────────────────────────────────────────────────────────────
function Wireframes() {
  const [view, setView] = useState("onboarding");
  const screens = [
    { id: "onboarding", label: "Onboarding" },
    { id: "budget", label: "Budget config" },
    { id: "alert", label: "Alert rule" },
    { id: "customer", label: "Customer detail" },
  ];

  const WireBox = ({ x, y, w, h, label, sub, fill = "#e8e6e0", stroke = "#b4b2a9", bold }) => (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6} fill={fill} stroke={stroke} strokeWidth={0.5} />
      {label && <text x={x + w / 2} y={y + h / 2 - (sub ? 7 : 0)} textAnchor="middle" dominantBaseline="central" fontSize={bold ? 11 : 10} fontWeight={bold ? 500 : 400} fill="#5f5e5a">{label}</text>}
      {sub && <text x={x + w / 2} y={y + h / 2 + 8} textAnchor="middle" dominantBaseline="central" fontSize={9} fill="#888780">{sub}</text>}
    </g>
  );

  const WireText = ({ x, y, t, size = 10, weight = 400, color = "#5f5e5a", anchor = "start" }) => (
    <text x={x} y={y} fontSize={size} fontWeight={weight} fill={color} textAnchor={anchor}>{t}</text>
  );

  const OnboardingWire = () => (
    <svg viewBox="0 0 540 380" style={{ width: "100%", background: "#f8f7f4", borderRadius: 8 }}>
      <WireBox x={0} y={0} w={540} h={380} fill="#f8f7f4" stroke="transparent" />
      <WireBox x={160} y={20} w={220} h={340} fill="#fff" stroke="#d3d1c7" />
      <WireText x={270} y={52} t="meridian" size={16} weight={600} color="#1a1a18" anchor="middle" />
      <WireText x={270} y={68} t="Set up your workspace" size={10} color="#888780" anchor="middle" />
      <WireBox x={180} y={86} w={180} h={28} label="Workspace name" fill="#f1efe8" />
      <WireBox x={180} y={122} w={180} h={28} label="Your email" fill="#f1efe8" />
      <WireBox x={180} y={158} w={180} h={28} label="Password" fill="#f1efe8" />
      <WireBox x={180} y={198} w={180} h={32} label="Create workspace →" fill="#1D9E75" stroke="#1D9E75" bold />
      <rect x={180} y={242} width={180} height={0.5} fill="#d3d1c7" />
      <WireText x={270} y={258} t="Connect your LLM provider" size={9} color="#888780" anchor="middle" />
      <WireBox x={180} y={268} w={86} h={28} label="OpenAI" fill="#f1efe8" />
      <WireBox x={274} y={268} w={86} h={28} label="Anthropic" fill="#f1efe8" />
      <WireBox x={180} y={304} w={180} h={28} label="Paste API key…" fill="#f1efe8" />
      <WireBox x={180} y={340} w={180} h={20} label="Your SDK key will appear here" fill="#e1f5ee" stroke="#1D9E75" />
    </svg>
  );

  const BudgetWire = () => (
    <svg viewBox="0 0 540 380" style={{ width: "100%", background: "#f8f7f4", borderRadius: 8 }}>
      <WireBox x={0} y={0} w={540} h={380} fill="#f8f7f4" stroke="transparent" />
      <WireBox x={30} y={20} w={160} h={340} fill="#fff" stroke="#d3d1c7" />
      <WireText x={50} y={44} t="Navigation" size={9} color="#888780" />
      {["Overview", "Customers", "Budgets", "Billing", "Alerts", "Settings"].map((item, i) => (
        <WireBox key={item} x={40} y={52 + i * 36} w={140} h={28} label={item} fill={item === "Budgets" ? "#e1f5ee" : "#f8f7f4"} stroke={item === "Budgets" ? "#1D9E75" : "transparent"} />
      ))}
      <WireBox x={206} y={20} w={304} h={340} fill="#fff" stroke="#d3d1c7" />
      <WireText x={220} y={44} t="Budget configuration" size={11} weight={500} color="#1a1a18" />
      <WireText x={220} y={58} t="Set daily and monthly spend caps per customer" size={9} color="#888780" />
      <WireText x={220} y={82} t="Customer" size={9} color="#888780" />
      <WireBox x={220} y={90} w={270} h={28} label="Select customer…" fill="#f1efe8" />
      <WireText x={220} y={132} t="Daily limit (USD)" size={9} color="#888780" />
      <WireBox x={220} y={140} w={126} h={28} label="$50.00" fill="#f1efe8" />
      <WireText x={358} y={132} t="Monthly limit (USD)" size={9} color="#888780" />
      <WireBox x={358} y={140} w={132} h={28} label="$500.00" fill="#f1efe8" />
      <WireText x={220} y={182} t="On budget breach" size={9} color="#888780" />
      <WireBox x={220} y={190} w={83} h={28} label="Block call" fill="#fcebeb" stroke="#E24B4A" />
      <WireBox x={311} y={190} w={83} h={28} label="Route down" fill="#faeeda" stroke="#BA7517" />
      <WireBox x={402} y={190} w={88} h={28} label="Alert only" fill="#f1efe8" />
      <WireText x={220} y={232} t="Fallback model (when routing)" size={9} color="#888780" />
      <WireBox x={220} y={240} w={270} h={28} label="gpt-4o-mini" fill="#f1efe8" />
      <WireBox x={220} y={286} w={270} h={32} label="Save budget config →" fill="#1D9E75" stroke="#1D9E75" bold />
      <WireBox x={220} y={326} w={270} h={28} label="Budget active · renews Jun 30" fill="#e1f5ee" stroke="#1D9E75" />
    </svg>
  );

  const AlertWire = () => (
    <svg viewBox="0 0 540 380" style={{ width: "100%", background: "#f8f7f4", borderRadius: 8 }}>
      <WireBox x={0} y={0} w={540} h={380} fill="#f8f7f4" stroke="transparent" />
      <WireBox x={30} y={20} w={480} h={50} fill="#fff" stroke="#d3d1c7" />
      <WireText x={50} y={38} t="Create alert rule" size={11} weight={500} color="#1a1a18" />
      <WireText x={50} y={54} t="Fire when spend crosses a threshold in a given window" size={9} color="#888780" />
      <WireBox x={30} y={84} w={230} h={270} fill="#fff" stroke="#d3d1c7" />
      <WireText x={46} y={106} t="Trigger on" size={9} color="#888780" />
      {["Total org spend", "Per customer", "Per feature", "Per model"].map((d, i) => (
        <WireBox key={d} x={46} y={114 + i * 34} w={198} h={26} label={d} fill={d === "Per customer" ? "#e1f5ee" : "#f1efe8"} stroke={d === "Per customer" ? "#1D9E75" : "#d3d1c7"} />
      ))}
      <WireText x={46} y={266} t="Threshold (USD)" size={9} color="#888780" />
      <WireBox x={46} y={274} w={198} h={26} label="$100.00" fill="#f1efe8" />
      <WireText x={46} y={314} t="Window" size={9} color="#888780" />
      <WireBox x={46} y={322} w={198} h={26} label="24 hours ▾" fill="#f1efe8" />
      <WireBox x={276} y={84} w={234} h={270} fill="#fff" stroke="#d3d1c7" />
      <WireText x={292} y={106} t="Notify via" size={9} color="#888780" />
      <WireBox x={292} y={114} w={100} h={26} label="Email" fill="#e1f5ee" stroke="#1D9E75" />
      <WireBox x={400} y={114} w={94} h={26} label="Slack" fill="#f1efe8" />
      <WireBox x={292} y={148} w={100} h={26} label="Webhook" fill="#f1efe8" />
      <WireBox x={400} y={148} w={94} h={26} label="PagerDuty" fill="#f1efe8" />
      <WireText x={292} y={190} t="Destination" size={9} color="#888780" />
      <WireBox x={292} y={198} w={202} h={26} label="you@company.com" fill="#f1efe8" />
      <WireText x={292} y={240} t="Cooldown (mins between alerts)" size={9} color="#888780" />
      <WireBox x={292} y={248} w={202} h={26} label="60 minutes" fill="#f1efe8" />
      <WireBox x={292} y={306} w={202} h={32} label="Create alert rule →" fill="#1D9E75" stroke="#1D9E75" bold />
    </svg>
  );

  const CustomerWire = () => (
    <svg viewBox="0 0 540 380" style={{ width: "100%", background: "#f8f7f4", borderRadius: 8 }}>
      <WireBox x={0} y={0} w={540} h={380} fill="#f8f7f4" stroke="transparent" />
      <WireBox x={30} y={20} w={480} h={46} fill="#fff" stroke="#d3d1c7" />
      <WireBox x={44} y={30} w={32} h={28} fill="#e1f5ee" stroke="#1D9E75" label="AC" bold />
      <WireText x={86} y={38} t="Acme Corp" size={11} weight={500} color="#1a1a18" />
      <WireText x={86} y={52} t="cus_acme · active · scale tier" size={9} color="#888780" />
      <WireText x={420} y={42} t="View in Stripe ↗" size={9} color="#1D9E75" anchor="start" />
      <WireBox x={30} y={78} w={152} h={58} fill="#fff" stroke="#d3d1c7" label="$841" sub="AI cost · June" />
      <WireBox x={190} y={78} w={152} h={58} fill="#fff" stroke="#d3d1c7" label="$1,102" sub="Billed · June" />
      <WireBox x={350} y={78} w={160} h={58} fill="#fff" stroke="#1D9E75" label="+31%" sub="Margin" />
      <WireBox x={30} y={148} w={230} h={210} fill="#fff" stroke="#d3d1c7" />
      <WireText x={46} y={168} t="Budget status" size={9} weight={500} color="#1a1a18" />
      <WireText x={46} y={184} t="Daily" size={9} color="#888780" />
      <rect x={46} y={192} width={196} height={6} rx={3} fill="#f1efe8" />
      <rect x={46} y={192} width={134} height={6} rx={3} fill="#1D9E75" />
      <WireText x={46} y={212} t="$33.60 / $50.00 used" size={9} color="#888780" />
      <WireText x={46} y={234} t="Monthly" size={9} color="#888780" />
      <rect x={46} y={242} width={196} height={6} rx={3} fill="#f1efe8" />
      <rect x={46} y={242} width={84} height={6} rx={3} fill="#1D9E75" />
      <WireText x={46} y={262} t="$841 / $1,500 used" size={9} color="#888780" />
      <WireText x={46} y={284} t="On breach: route to gpt-4o-mini" size={9} color="#888780" />
      <WireBox x={46} y={298} w={196} h={26} label="Edit budget config" fill="#f1efe8" />
      <WireBox x={46} y={330} w={196} h={20} label="Budget healthy · 14 days left" fill="#e1f5ee" stroke="#1D9E75" />
      <WireBox x={276} y={148} w={234} h={210} fill="#fff" stroke="#d3d1c7" />
      <WireText x={292} y={168} t="Top features by cost" size={9} weight={500} color="#1a1a18" />
      {[["summarize", "62%", 124], ["chat", "21%", 42], ["search", "11%", 22], ["embeddings", "6%", 12]].map(([f, p, px], i) => (
        <g key={f}>
          <WireText x={292} y={186 + i * 34} t={f} size={9} color="#5f5e5a" />
          <rect x={292} y={192 + i * 34} width={180} height={5} rx={2} fill="#f1efe8" />
          <rect x={292} y={192 + i * 34} width={px} height={5} rx={2} fill="#1D9E75" />
          <WireText x={480} y={196 + i * 34} t={p} size={9} color="#888780" anchor="end" />
        </g>
      ))}
      <WireText x={292} y={318} t="Stripe invoices" size={9} weight={500} color="#1a1a18" />
      <WireBox x={292} y={326} w={202} h={22} label="May 2026 · $921.10 · Paid" fill="#f1efe8" />
    </svg>
  );

  const screens_map = { onboarding: <OnboardingWire />, budget: <BudgetWire />, alert: <AlertWire />, customer: <CustomerWire /> };

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {screens.map(s => (
          <button key={s.id} onClick={() => setView(s.id)} style={{ fontSize: 12, padding: "5px 14px", borderRadius: 20, border: `0.5px solid ${view === s.id ? C.teal : C.border}`, background: view === s.id ? C.teal50 : "transparent", color: view === s.id ? C.teal800 : C.textSec, cursor: "pointer" }}>{s.label}</button>
        ))}
      </div>
      {screens_map[view]}
      <div style={{ marginTop: 10, fontSize: 12, color: C.textMute, lineHeight: 1.6 }}>
        {view === "onboarding" && "3-step flow: create workspace → connect provider → copy SDK key. No credit card required to start."}
        {view === "budget" && "Budget config is per-customer. Breach action is chosen per customer: block, route to cheaper model, or alert only."}
        {view === "alert" && "Alert rules are independent of budgets. A budget blocks silently; an alert rule fires a notification."}
        {view === "customer" && "Customer detail page combines enforcement status, billing history, and feature cost breakdown in one view."}
      </div>
    </div>
  );
}

// ─── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard() {
  const customers = [
    { name: "Acme Corp", cost: 841, billed: 1102, margin: 31, status: "healthy", tokens: "1.24M" },
    { name: "Beta LLC", cost: 512, billed: 640, margin: 25, status: "healthy", tokens: "802K" },
    { name: "Gamma Co", cost: 604, billed: 551, margin: -9, status: "loss", tokens: "948K" },
    { name: "Delta Inc", cost: 214, billed: 321, margin: 50, status: "healthy", tokens: "336K" },
    { name: "Echo SaaS", cost: 170, billed: 195, margin: 15, status: "healthy", tokens: "268K" },
  ];
  const events = [
    { type: "block", title: "Budget cap hit — Gamma Co", meta: "summarize · $50/day · 402 returned", time: "2h ago", color: C.red, bg: C.red50 },
    { type: "route", title: "Model routed — Beta LLC", meta: "gpt-4o → gpt-4o-mini · 78% budget", time: "3h ago", color: C.amber, bg: C.amber50 },
    { type: "stripe", title: "Stripe meter confirmed", meta: "Acme Corp · $214.40 emitted", time: "4h ago", color: C.blue, bg: C.blue50 },
    { type: "block", title: "Budget cap hit — Gamma Co", meta: "chat · $50/day · 402 returned", time: "6h ago", color: C.red, bg: C.red50 },
  ];
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 12 }}>
        {[["$2,341", "LLM cost · June", "↑ $618 vs May", C.red],["$3,109", "Billed to customers", "↑ $768 margin", C.teal],["14", "Budget blocks fired", "3 customers affected", C.amber],["$768", "Margin captured", "+33% avg markup", C.teal]].map(([v, l, d, dc]) => (
          <div key={l} style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 8, padding: "10px 12px" }}>
            <div style={{ fontSize: 22, fontWeight: 500, color: C.text }}>{v}</div>
            <div style={{ fontSize: 11, color: C.textMute, marginTop: 2 }}>{l}</div>
            <div style={{ fontSize: 11, color: dc, marginTop: 2 }}>{d}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        {card(<>
          {panelHead("Customer margin", "cost vs. billed · June")}
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead><tr style={{ background: C.bg }}>{["Customer","AI cost","Billed","Margin"].map(h => <th key={h} style={{ padding: "6px 12px", textAlign: "left", fontSize: 11, fontWeight: 500, color: C.textMute }}>{h}</th>)}</tr></thead>
            <tbody>{customers.map(c => (
              <tr key={c.name} style={{ borderTop: `0.5px solid ${C.border}` }}>
                <td style={{ padding: "8px 12px", fontWeight: 500, color: C.text }}>{c.name}</td>
                <td style={{ padding: "8px 12px", color: C.textSec }}>${c.cost}</td>
                <td style={{ padding: "8px 12px", color: C.textSec }}>${c.billed}</td>
                <td style={{ padding: "8px 12px" }}>
                  <span style={{ color: c.margin < 0 ? C.red : C.teal, fontWeight: 500 }}>{c.margin > 0 ? "+" : ""}{c.margin}%</span>
                  <div style={{ height: 4, borderRadius: 2, background: C.bg, marginTop: 4, overflow: "hidden" }}>
                    <div style={{ height: 4, borderRadius: 2, width: `${Math.abs(c.margin) * 2}%`, background: c.margin < 0 ? C.red : C.teal }} />
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
          {card(<div style={{ padding: "8px 12px", fontSize: 11, color: C.red800, background: C.red50, display: "flex", gap: 6 }}><span>⚠</span><span>Gamma Co is loss-making — raise their AI tier price or increase markup</span></div>)}
        </>)}
        {card(<>
          {panelHead("Enforcement activity", "last 24 hours")}
          {events.map((e, i) => (
            <div key={i} style={{ padding: "10px 12px", borderBottom: i < events.length - 1 ? `0.5px solid ${C.border}` : "none", display: "flex", gap: 10 }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: e.bg, color: e.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0, marginTop: 1 }}>
                {e.type === "block" ? "⊘" : e.type === "route" ? "⇢" : "✓"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{e.title}</div>
                <div style={{ fontSize: 11, color: C.textMute }}>{e.meta} · {e.time}</div>
              </div>
            </div>
          ))}
        </>)}
      </div>
      {card(<>
        {panelHead("Stripe billing passthrough", "pending invoices · June 2026")}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead><tr style={{ background: C.bg }}>{["Customer","Tokens","Models","Markup","Amount","Status"].map(h => <th key={h} style={{ padding: "6px 12px", textAlign: "left", fontSize: 11, fontWeight: 500, color: C.textMute }}>{h}</th>)}</tr></thead>
          <tbody>{customers.map(c => (
            <tr key={c.name} style={{ borderTop: `0.5px solid ${C.border}` }}>
              <td style={{ padding: "8px 12px", fontWeight: 500, color: C.text }}>{c.name}</td>
              <td style={{ padding: "8px 12px", color: C.textSec }}>{c.tokens}</td>
              <td style={{ padding: "8px 12px", color: C.textSec }}>mixed</td>
              <td style={{ padding: "8px 12px", color: C.textSec }}>{c.margin > 0 ? `+${c.margin}%` : `${c.margin}%`}</td>
              <td style={{ padding: "8px 12px", fontWeight: 500, color: C.text }}>${c.billed.toLocaleString()}.00</td>
              <td style={{ padding: "8px 12px" }}>{tag(c.status === "loss" ? "Pending review" : "Confirmed", c.status === "loss" ? C.amber800 : C.teal800, c.status === "loss" ? C.amber50 : C.teal50)}</td>
            </tr>
          ))}</tbody>
        </table>
      </>)}
    </div>
  );
}

// ─── LANDING PAGE ──────────────────────────────────────────────────────────────
function Landing() {
  return (
    <div style={{ fontFamily: "var(--font-sans, system-ui)", background: "#0d0f0c", color: "#e8e6e0", borderRadius: 12, overflow: "hidden" }}>
      <nav style={{ padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "0.5px solid rgba(255,255,255,0.08)" }}>
        <div style={{ fontWeight: 600, fontSize: 15, letterSpacing: "-0.3px" }}>meridian</div>
        <div style={{ display: "flex", gap: 24, fontSize: 13, color: "#9a9890" }}>
          {["Pricing","Docs","Blog"].map(l => <span key={l} style={{ cursor: "pointer" }}>{l}</span>)}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ padding: "7px 16px", borderRadius: 6, border: "0.5px solid rgba(255,255,255,0.15)", background: "transparent", color: "#e8e6e0", fontSize: 13, cursor: "pointer" }}>Sign in</button>
          <button style={{ padding: "7px 16px", borderRadius: 6, border: "none", background: "#1D9E75", color: "#fff", fontSize: 13, cursor: "pointer", fontWeight: 500 }}>Get started free</button>
        </div>
      </nav>

      <div style={{ padding: "60px 32px 48px", textAlign: "center", maxWidth: 580, margin: "0 auto" }}>
        <div style={{ display: "inline-block", padding: "4px 12px", borderRadius: 20, background: "rgba(29,158,117,0.15)", border: "0.5px solid rgba(29,158,117,0.3)", fontSize: 12, color: "#1D9E75", marginBottom: 24 }}>enforcement-first · not another dashboard</div>
        <h1 style={{ fontSize: 38, fontWeight: 600, lineHeight: 1.15, letterSpacing: "-1px", marginBottom: 18, color: "#f4f2ec" }}>
          Stop paying for AI<br />your customers used
        </h1>
        <p style={{ fontSize: 15, color: "#9a9890", lineHeight: 1.7, marginBottom: 32 }}>
          Meridian sits in your LLM call path. It blocks runaway spend before it happens, routes calls to cheaper models when budgets run low, and bills your customers for exactly what they used — automatically.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 48 }}>
          <button style={{ padding: "11px 24px", borderRadius: 8, border: "none", background: "#1D9E75", color: "#fff", fontSize: 14, cursor: "pointer", fontWeight: 500 }}>Start free — no credit card</button>
          <button style={{ padding: "11px 24px", borderRadius: 8, border: "0.5px solid rgba(255,255,255,0.15)", background: "transparent", color: "#e8e6e0", fontSize: 14, cursor: "pointer" }}>View docs</button>
        </div>
        <div style={{ background: "#16191a", borderRadius: 10, padding: "14px 18px", textAlign: "left", fontFamily: "monospace", fontSize: 12, color: "#8bb8a8", lineHeight: 1.9, border: "0.5px solid rgba(255,255,255,0.08)" }}>
          <span style={{ color: "#555" }}>// 3 lines. That's it.</span>{"\n"}
          <span style={{ color: "#7ADFB5" }}>const</span> ai = <span style={{ color: "#7ADFB5" }}>Meridian</span>.wrap(<span style={{ color: "#7ADFB5" }}>new</span> OpenAI(), {"{"} apiKey <span style={{ color: "#555" }}>{"}"}</span>);{"\n"}
          <span style={{ color: "#7ADFB5" }}>await</span> ai.budgets.set({"{"} customerId, daily: <span style={{ color: "#EF9F27" }}>5.00</span> {"}"});{"\n"}
          <span style={{ color: "#555" }}>// Every call now: checks budget → enforces → bills Stripe</span>
        </div>
      </div>

      <div style={{ borderTop: "0.5px solid rgba(255,255,255,0.07)", padding: "40px 32px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        {[
          ["⊘", "Hard budget caps", "Rejects calls before they reach the LLM. The only way to stop a runaway agent loop before it hits your card."],
          ["⇢", "Automatic model routing", "Routes calls to cheaper models when a customer approaches their budget. Users see no degradation."],
          ["◈", "Stripe billing passthrough", "Every token is billed to the right customer automatically. No spreadsheets. No manual reconciliation."],
        ].map(([icon, title, body]) => (
          <div key={title} style={{ padding: "20px", background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "0.5px solid rgba(255,255,255,0.07)" }}>
            <div style={{ fontSize: 20, marginBottom: 10, color: "#1D9E75" }}>{icon}</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: "#f4f2ec", marginBottom: 8 }}>{title}</div>
            <div style={{ fontSize: 13, color: "#9a9890", lineHeight: 1.65 }}>{body}</div>
          </div>
        ))}
      </div>

      <div style={{ borderTop: "0.5px solid rgba(255,255,255,0.07)", padding: "32px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0, textAlign: "center" }}>
        {[["$0", "Builder plan · up to $1K billed/mo"],["0.5%","of billing volume on Scale"],["< 2ms","enforcement overhead per call"]].map(([v, l]) => (
          <div key={l} style={{ padding: "20px", borderRight: "0.5px solid rgba(255,255,255,0.07)" }}>
            <div style={{ fontSize: 28, fontWeight: 600, color: "#1D9E75", letterSpacing: "-0.5px" }}>{v}</div>
            <div style={{ fontSize: 12, color: "#9a9890", marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── DATABASE ──────────────────────────────────────────────────────────────────
function Database() {
  const [active, setActive] = useState("llm_events");
  const tables = {
    organizations: {
      desc: "Top-level tenant. Every piece of data is org-scoped.",
      cols: [
        ["id", "uuid", "PK", "gen_random_uuid()"],
        ["slug", "text", "UNIQUE", "URL-safe identifier"],
        ["name", "text", "", "Display name"],
        ["plan", "text", "", "builder | scale | enterprise"],
        ["stripe_customer_id", "text", "NULLABLE", "Set on first payment"],
        ["event_limit_monthly", "bigint", "", "Included events by plan"],
        ["created_at", "timestamptz", "DEFAULT now()", ""],
      ]
    },
    api_keys: {
      desc: "Long-lived machine credentials. Raw key shown once at creation, only hash stored.",
      cols: [
        ["id", "uuid", "PK", ""],
        ["org_id", "uuid", "FK → organizations", ""],
        ["key_hash", "text", "UNIQUE", "SHA-256 of raw key"],
        ["key_prefix", "text", "", "First 8 chars for display"],
        ["name", "text", "", "Human label"],
        ["last_used_at", "timestamptz", "NULLABLE", "Updated async on use"],
        ["revoked_at", "timestamptz", "NULLABLE", "Null = active"],
      ]
    },
    customers: {
      desc: "Your end-customers. First-class entity — not just a tag. Required for per-customer enforcement and billing.",
      cols: [
        ["id", "uuid", "PK", ""],
        ["org_id", "uuid", "FK → organizations", ""],
        ["external_id", "text", "UNIQUE per org", "Your internal customer ID"],
        ["stripe_customer_id", "text", "", "Their Stripe customer"],
        ["display_name", "text", "", ""],
        ["plan_tier", "text", "", "Maps to markup %"],
        ["active", "boolean", "DEFAULT true", ""],
        ["created_at", "timestamptz", "", ""],
      ]
    },
    budget_configs: {
      desc: "Per-customer spend caps. Checked on every call via Redis. DB is source of truth; Redis is the hot path.",
      cols: [
        ["id", "uuid", "PK", ""],
        ["org_id", "uuid", "FK → organizations", ""],
        ["customer_id", "uuid", "FK → customers", ""],
        ["scope", "text", "", "customer | feature | model"],
        ["daily_limit_usd", "numeric(12,4)", "NULLABLE", ""],
        ["monthly_limit_usd", "numeric(12,4)", "NULLABLE", ""],
        ["on_breach", "text", "", "block | route | alert"],
        ["fallback_model", "text", "NULLABLE", "Used when on_breach=route"],
        ["updated_at", "timestamptz", "", ""],
      ]
    },
    llm_events: {
      desc: "HYPERTABLE — partitioned by ts (1 week chunks). Compressed after 7 days. The core time-series store.",
      cols: [
        ["ts", "timestamptz", "PARTITION KEY", "Event timestamp"],
        ["org_id", "uuid", "NOT NULL", "Always filter first"],
        ["customer_id", "uuid", "FK → customers", ""],
        ["event_id", "uuid", "UNIQUE", "Idempotency key from SDK"],
        ["provider", "text", "", "openai | anthropic | google"],
        ["model", "text", "", "gpt-4o, claude-sonnet-4-6…"],
        ["feature", "text", "", "Caller-supplied tag"],
        ["environment", "text", "", "production | staging | dev"],
        ["input_tokens", "integer", "", ""],
        ["input_tokens_cached", "integer", "", "Priced at ~10% of standard"],
        ["output_tokens", "integer", "", ""],
        ["cost_usd", "numeric(12,8)", "", "Computed at ingest"],
        ["markup_usd", "numeric(12,8)", "", "cost × customer markup"],
        ["budget_checked", "boolean", "", "Was cap checked?"],
        ["billing_emitted", "boolean", "", "Stripe event sent?"],
        ["latency_ms", "integer", "", ""],
        ["metadata", "jsonb", "GIN indexed", "Arbitrary caller tags"],
      ]
    },
    stripe_meter_events: {
      desc: "Audit trail of every Stripe meter event emitted. Tracks confirmation to prevent double-billing.",
      cols: [
        ["id", "uuid", "PK", ""],
        ["org_id", "uuid", "FK", ""],
        ["customer_id", "uuid", "FK", ""],
        ["llm_event_id", "uuid", "FK → llm_events", "1:1"],
        ["stripe_event_id", "text", "UNIQUE", "From Stripe API response"],
        ["amount_usd", "numeric(12,4)", "", "cost_usd × markup"],
        ["status", "text", "", "pending | confirmed | failed"],
        ["emitted_at", "timestamptz", "", ""],
        ["confirmed_at", "timestamptz", "NULLABLE", ""],
      ]
    },
    alert_rules: {
      desc: "Alert rules are separate from budgets. Budgets enforce silently; alert rules fire notifications.",
      cols: [
        ["id", "uuid", "PK", ""],
        ["org_id", "uuid", "FK", ""],
        ["dimension", "text", "", "total | customer | feature | model"],
        ["dimension_value", "text", "NULLABLE", "Null = any value"],
        ["threshold_usd", "numeric(12,4)", "", "Dollar trigger"],
        ["window", "text", "", "1h | 24h | 7d | month"],
        ["channel", "text", "", "email | slack | webhook | pagerduty"],
        ["destination", "text", "", "Email or webhook URL"],
        ["last_fired_at", "timestamptz", "NULLABLE", "Cooldown enforcement"],
      ]
    },
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {Object.keys(tables).map(t => (
          <button key={t} onClick={() => setActive(t)} style={{ fontSize: 11, padding: "4px 12px", borderRadius: 20, border: `0.5px solid ${active === t ? C.teal : C.border}`, background: active === t ? C.teal50 : "transparent", color: active === t ? C.teal800 : C.textSec, cursor: "pointer", fontFamily: "monospace" }}>{t}</button>
        ))}
      </div>
      {card(<>
        {panelHead(active, tables[active].desc)}
        {active === "llm_events" && <div style={{ padding: "6px 14px", background: "#EEEDFE", borderBottom: `0.5px solid ${C.border}`, fontSize: 11, color: C.purple800 }}>TimescaleDB HYPERTABLE · partitioned by ts · compressed &gt;7 days · continuous aggregates for dashboard queries</div>}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead><tr style={{ background: C.bg }}>{["Column","Type","Constraint","Notes"].map(h => <th key={h} style={{ padding: "6px 12px", textAlign: "left", fontSize: 11, fontWeight: 500, color: C.textMute }}>{h}</th>)}</tr></thead>
          <tbody>{tables[active].cols.map(([col, type, con, note]) => (
            <tr key={col} style={{ borderTop: `0.5px solid ${C.border}` }}>
              <td style={{ padding: "7px 12px", fontFamily: "monospace", color: C.text, fontWeight: 500 }}>{col}</td>
              <td style={{ padding: "7px 12px", fontFamily: "monospace", color: C.blue }}>{type}</td>
              <td style={{ padding: "7px 12px" }}>{con && tag(con, con.startsWith("FK") ? C.purple800 : con === "PK" ? C.teal800 : C.textMute, con.startsWith("FK") ? C.purple50 : con === "PK" ? C.teal50 : C.gray50)}</td>
              <td style={{ padding: "7px 12px", color: C.textMute, fontSize: 11 }}>{note}</td>
            </tr>
          ))}</tbody>
        </table>
      </>)}
      {active === "llm_events" && (
        <div style={{ marginTop: 10 }}>
          {codeBlock(`-- Continuous aggregate: hourly rollup (pre-computed, instant dashboard queries)
CREATE MATERIALIZED VIEW cost_by_hour
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 hour', ts)  AS bucket,
  org_id, customer_id, feature, model,
  SUM(cost_usd)              AS total_cost,
  SUM(markup_usd)            AS total_billed,
  SUM(input_tokens)          AS total_input,
  SUM(output_tokens)         AS total_output,
  COUNT(*)                   AS request_count
FROM llm_events
GROUP BY bucket, org_id, customer_id, feature, model;

-- Retention policy: auto-drop raw events past plan limit
SELECT add_retention_policy('llm_events', INTERVAL '90 days');`, "SQL")}
        </div>
      )}
    </div>
  );
}

// ─── API ───────────────────────────────────────────────────────────────────────
function API() {
  const method = (m) => {
    const colors = { GET: [C.blue50, C.blue800], POST: ["#EAF3DE", "#27500A"], DELETE: [C.red50, C.red800], PATCH: [C.purple50, C.purple800] };
    const [bg, color] = colors[m] || [C.gray50, C.textMute];
    return <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: bg, color, fontFamily: "monospace", fontWeight: 600, flexShrink: 0 }}>{m}</span>;
  };
  const ep = (m, path, desc, auth = "API key") => (
    <div style={{ padding: "10px 14px", borderBottom: `0.5px solid ${C.border}`, display: "flex", gap: 12, alignItems: "flex-start" }}>
      {method(m)}
      <div style={{ flex: 1 }}>
        <code style={{ fontSize: 12, color: C.text, fontFamily: "monospace" }}>{path}</code>
        <div style={{ fontSize: 11, color: C.textMute, marginTop: 2 }}>{desc}</div>
      </div>
      {tag(auth, C.textMute, C.gray50)}
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 10, padding: "10px 14px", background: C.teal50, border: `0.5px solid ${C.border}`, borderRadius: 8, fontSize: 12, color: C.teal800 }}>
        Base URL: <code style={{ fontFamily: "monospace" }}>https://api.meridian.dev/v1</code> · Auth: <code style={{ fontFamily: "monospace" }}>Authorization: Bearer mr_live_...</code>
      </div>

      {sectionTitle("Ingest")}
      {card(<>
        {ep("POST", "/ingest", "Batch ingest up to 1,000 LLM events. Returns 202 immediately — never blocks your hot path.")}
        {ep("POST", "/ingest/batch", "NDJSON bulk import for historical backfill. Rate-limited separately.")}
      </>)}

      {sectionTitle("Enforcement")}
      {card(<>
        {ep("GET", "/budgets/:customer_id", "Get current budget status and spend counters for a customer.")}
        {ep("POST", "/budgets", "Create or update a budget config for a customer.")}
        {ep("DELETE", "/budgets/:id", "Remove a budget rule. Calls will proceed uncapped.")}
        {ep("GET", "/budgets/:customer_id/check", "Pre-flight check — will the next call be allowed? Returns allow | block | route.", "API key")}
      </>)}

      {sectionTitle("Analytics")}
      {card(<>
        {ep("GET", "/analytics/summary", "Total cost, billed, margin for a time range. Params: from, to, granularity, environment.", "JWT")}
        {ep("GET", "/analytics/breakdown", "Cost by dimension. Params: dimension (feature|customer|model), from, to, limit.", "JWT")}
        {ep("GET", "/analytics/timeseries", "Time-bucketed series. Params: bucket_size (5m|1h|1d), filters.", "JWT")}
        {ep("GET", "/analytics/anomalies", "Detected spend anomalies. Includes baseline, actual, z-score, affected dimension.", "JWT")}
        {ep("GET", "/analytics/margin", "Per-customer cost vs. billed breakdown. Returns profitability ranking.", "JWT")}
      </>)}

      {sectionTitle("Customers")}
      {card(<>
        {ep("GET", "/customers", "List all customers for the org. Supports search, sort, filter.", "JWT")}
        {ep("POST", "/customers", "Create a customer. Body: external_id, stripe_customer_id, display_name, plan_tier.", "JWT")}
        {ep("PATCH", "/customers/:id", "Update customer markup, tier, or Stripe link.", "JWT")}
        {ep("DELETE", "/customers/:id", "Deactivate. Historical data is retained.", "JWT")}
      </>)}

      {sectionTitle("Alert rules")}
      {card(<>
        {ep("GET", "/alert-rules", "List all alert rules.", "JWT")}
        {ep("POST", "/alert-rules", "Create: dimension, threshold_usd, window, channel, destination.", "JWT")}
        {ep("DELETE", "/alert-rules/:id", "Delete an alert rule.", "JWT")}
      </>)}

      {sectionTitle("Stripe passthrough")}
      {card(<>
        {ep("GET", "/billing/meters", "List pending and confirmed Stripe meter events for current period.", "JWT")}
        {ep("POST", "/billing/retry/:event_id", "Retry a failed Stripe meter emission.", "JWT")}
        {ep("GET", "/billing/reconcile", "Compare Meridian totals against Stripe invoice — flags discrepancies.", "JWT")}
      </>)}

      {sectionTitle("Example: POST /ingest")}
      {codeBlock(`{
  "events": [
    {
      "event_id": "evt_01j8k2...",          // idempotency key — SDK generates this
      "customer_id": "cus_acme",
      "provider": "openai",
      "model": "gpt-4o",
      "feature": "summarize",
      "environment": "production",
      "input_tokens": 1240,
      "input_tokens_cached": 800,
      "output_tokens": 312,
      "latency_ms": 1840,
      "metadata": { "session_id": "sess_abc" }
    }
  ]
}

// Response: 202 Accepted
{ "queued": 1, "duplicate_skipped": 0 }`, "JSON")}
    </div>
  );
}

// ─── AI FEATURES ──────────────────────────────────────────────────────────────
function AIFeatures() {
  const features = [
    {
      title: "Spend anomaly detection",
      tag: "MVP+3mo", tagColor: C.teal800, tagBg: C.teal50,
      how: "Rolling 7-day baseline per (org, customer, feature) triple. Z-score >2.5σ fires alert. Uses TimescaleDB continuous aggregate for baseline, computed every 15 minutes.",
      prompt: `You are a spend anomaly classifier for an LLM cost management platform.

Given this context:
- Feature: {feature}
- 7-day baseline spend: ${'{'}baseline_usd{'}'}
- Current 24h spend: ${'{'}current_usd{'}'}
- Z-score: {z_score}
- Recent events: {event_summary}

Determine:
1. Is this anomaly real or noise? (confidence 0-100)
2. What is the most likely cause? (prompt regression / traffic spike / new feature / bug)
3. What should the engineer check first?

Respond in JSON: { "real": bool, "confidence": int, "cause": str, "action": str }`,
      arch: "Cron every 15min → query TimescaleDB → compute z-score → if >2.5σ, call Claude claude-haiku-4-5 for triage → store result → conditionally fire alert"
    },
    {
      title: "Customer margin health score",
      tag: "Month 5", tagColor: C.purple800, tagBg: C.purple50,
      how: "Weekly AI analysis of each customer's cost trajectory, feature mix, and markup. Outputs a 1-10 health score and a recommendation.",
      prompt: `You are a margin health analyst for a B2B SaaS company.

Customer: {customer_name}
Plan tier: {plan_tier}
Current markup: {markup_pct}%

Last 30 days:
- AI cost: ${'{'}cost_usd{'}'}
- Billed: ${'{'}billed_usd{'}'}
- Margin: {margin_pct}%
- Top feature by cost: {top_feature}
- Budget blocks fired: {blocks}
- Model mix: {model_mix}

Return JSON: {
  "health_score": 1-10,
  "status": "healthy|at_risk|loss_making",
  "primary_risk": str,
  "recommendation": str,   // actionable, max 2 sentences
  "suggested_markup": number | null
}`,
      arch: "Weekly cron → aggregate per customer → Claude claude-haiku-4-5 analysis → store score → surface in dashboard → optionally email account owner"
    },
    {
      title: "Model routing recommendation",
      tag: "Month 6", tagColor: C.amber800, tagBg: C.amber50,
      how: "Analyses a customer's call patterns (token lengths, output quality requirements inferred from feature name) and suggests which calls could safely move to a cheaper model.",
      prompt: `You are a model routing advisor.

Customer: {customer_name}
Feature: {feature}
Current model: {model}
Avg input tokens: {avg_input}
Avg output tokens: {avg_output}
Avg latency: {avg_latency_ms}ms
Monthly cost at current model: ${'{'}monthly_cost{'}'}

Available cheaper models: {model_options}

Based on the token profile and feature name, assess whether a cheaper model would be appropriate.
Return JSON: {
  "recommend_routing": bool,
  "suggested_model": str | null,
  "estimated_saving_pct": number,
  "risk": "low|medium|high",
  "reasoning": str   // 1 sentence
}`,
      arch: "Triggered on demand or weekly batch → pull 30d aggregate from TimescaleDB → Claude analysis per (customer, feature) pair → store recommendation → surface in dashboard"
    },
    {
      title: "Natural language spend queries",
      tag: "Month 4", tagColor: C.blue800, tagBg: C.blue50,
      how: "Dashboard search bar accepts plain English. Converts to TimescaleDB SQL and returns results inline.",
      prompt: `You are a SQL generator for a time-series LLM cost database.

Schema: llm_events(ts, org_id, customer_id, feature, model, cost_usd, markup_usd, input_tokens, output_tokens, environment)
Current org_id: {org_id}
Current date: {date}

User query: "{user_query}"

Generate a safe, read-only SQL SELECT for TimescaleDB. Always include WHERE org_id = '{org_id}'.
Return JSON: { "sql": str, "explanation": str }`,
      arch: "User types query → Claude claude-haiku-4-5 converts to SQL → validate SQL is SELECT-only → execute against TimescaleDB → return results as table"
    },
  ];

  const [active, setActive] = useState(0);
  const f = features[active];

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {features.map((f, i) => (
          <button key={f.title} onClick={() => setActive(i)} style={{ fontSize: 12, padding: "5px 14px", borderRadius: 20, border: `0.5px solid ${active === i ? C.teal : C.border}`, background: active === i ? C.teal50 : "transparent", color: active === i ? C.teal800 : C.textSec, cursor: "pointer" }}>{f.title}</button>
        ))}
      </div>
      {card(<>
        <div style={{ padding: "14px 16px", borderBottom: `0.5px solid ${C.border}`, display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 15, fontWeight: 500, color: C.text }}>{f.title}</span>
          {tag(f.tag, f.tagColor, f.tagBg)}
        </div>
        <div style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 13, color: C.textSec, marginBottom: 12, lineHeight: 1.65 }}>{f.how}</div>
          {sectionTitle("System prompt template")}
          {codeBlock(f.prompt, "PROMPT")}
          {sectionTitle("Architecture")}
          <div style={{ fontSize: 12, color: C.textSec, background: C.bg, padding: "10px 12px", borderRadius: 6, lineHeight: 1.7, fontFamily: "monospace" }}>{f.arch}</div>
          <div style={{ marginTop: 10, padding: "8px 12px", background: C.purple50, borderRadius: 6, fontSize: 12, color: C.purple800 }}>
            Model: <code>claude-haiku-4-5</code> · Always use the cheapest capable model for automated tasks. Never use Sonnet/Opus for internal AI jobs.
          </div>
        </div>
      </>)}
    </div>
  );
}

// ─── NOTIFICATIONS ─────────────────────────────────────────────────────────────
function Notifications() {
  const notifs = [
    { event: "Budget cap hit", trigger: "Customer exceeds daily or monthly limit", channels: ["email", "slack", "webhook"], urgency: "immediate", template: "Customer {name} hit their ${limit} {period} budget cap on feature {feature}. {blocks} calls blocked so far today." },
    { event: "Spend anomaly", trigger: "Z-score >2.5σ on any dimension", channels: ["email", "slack", "pagerduty"], urgency: "immediate", template: "Anomaly: {feature} is spending {current}× above baseline for customer {name}. Estimated overage: ${overage} if unchecked." },
    { event: "Negative margin alert", trigger: "Customer cost exceeds billed amount", channels: ["email"], urgency: "daily digest", template: "{name} is loss-making this period: cost ${cost}, billed ${billed}. Recommend raising markup from {current}% to {suggested}%." },
    { event: "Model routed", trigger: "Call automatically downgraded", channels: ["webhook"], urgency: "async log", template: "Routing event: {model_from} → {model_to} for {customer} on {feature}. Budget at {pct}% of limit." },
    { event: "Stripe emission failed", trigger: "Meter event rejected by Stripe", channels: ["email", "pagerduty"], urgency: "immediate", template: "Failed to emit meter event for {customer} (${amount}). Error: {error}. Auto-retry in 5 minutes." },
    { event: "Usage summary", trigger: "Weekly digest", channels: ["email"], urgency: "weekly", template: "This week: ${cost} LLM cost, ${billed} billed, {margin}% avg margin. {at_risk} customers at risk." },
  ];
  const urgColor = { immediate: [C.red50, C.red800], "daily digest": [C.amber50, C.amber800], "async log": [C.gray50, C.textMute], weekly: [C.blue50, C.blue800] };
  const chColor = { email: [C.blue50, C.blue800], slack: [C.purple50, C.purple800], webhook: [C.gray50, C.textMute], pagerduty: [C.red50, C.red800] };

  return (
    <div>
      <div style={{ marginBottom: 10, fontSize: 13, color: C.textSec, lineHeight: 1.65 }}>
        All notifications are sent via Resend (email) and native webhooks (Slack, PagerDuty). Cooldown: configurable per rule, default 60 minutes for immediate alerts to prevent spam.
      </div>
      {notifs.map(n => (
        <div key={n.event} style={{ marginBottom: 10 }}>
          {card(<>
            <div style={{ padding: "10px 14px", borderBottom: `0.5px solid ${C.border}`, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{n.event}</span>
              {tag(n.urgency, urgColor[n.urgency][1], urgColor[n.urgency][0])}
              {n.channels.map(ch => tag(ch, chColor[ch][1], chColor[ch][0]))}
            </div>
            <div style={{ padding: "10px 14px" }}>
              <div style={{ fontSize: 12, color: C.textMute, marginBottom: 6 }}>Trigger: {n.trigger}</div>
              <div style={{ background: C.bg, borderRadius: 6, padding: "8px 10px", fontSize: 12, color: C.textSec, fontFamily: "monospace", lineHeight: 1.7 }}>{n.template}</div>
            </div>
          </>)}
        </div>
      ))}
      {sectionTitle("Webhook payload format")}
      {codeBlock(`POST https://your-endpoint.com/meridian-webhook
Content-Type: application/json
X-Meridian-Signature: sha256=...

{
  "event": "budget.cap_hit",
  "org_id": "org_xxx",
  "customer_id": "cus_acme",
  "customer_name": "Acme Corp",
  "feature": "summarize",
  "limit_usd": 50.00,
  "period": "daily",
  "current_spend_usd": 51.24,
  "blocks_today": 7,
  "timestamp": "2026-06-27T14:32:00Z"
}`, "JSON")}
    </div>
  );
}

// ─── ADMIN PANEL ───────────────────────────────────────────────────────────────
function Admin() {
  const orgs = [
    { name: "Acme Corp", plan: "scale", mrr: 149, events: "4.2M", customers: 5, health: "healthy", created: "Jan 2026" },
    { name: "Beta Startup", plan: "builder", mrr: 0, events: "380K", customers: 2, health: "healthy", created: "Mar 2026" },
    { name: "Gamma LLC", plan: "enterprise", mrr: 799, events: "41M", customers: 28, health: "at_risk", created: "Dec 2025" },
    { name: "Delta AI", plan: "scale", mrr: 210, events: "8.1M", customers: 11, health: "healthy", created: "Feb 2026" },
  ];
  const planColor = { scale: [C.blue50, C.blue800], builder: [C.gray50, C.textMute], enterprise: [C.purple50, C.purple800] };
  const healthColor = { healthy: [C.teal50, C.teal800], at_risk: [C.red50, C.red800] };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 14 }}>
        {[["12","Active orgs"],["$2,847","MRR"],["94.2M","Events this month"],["98.7%","Uptime 30d"]].map(([v,l])=>(
          <div key={l} style={{ background: C.surface, border:`0.5px solid ${C.border}`, borderRadius:8, padding:"10px 12px" }}>
            <div style={{ fontSize:22, fontWeight:500, color:C.text }}>{v}</div>
            <div style={{ fontSize:11, color:C.textMute, marginTop:2 }}>{l}</div>
          </div>
        ))}
      </div>
      {sectionTitle("All organisations")}
      {card(<>
        {panelHead("Organisations", "system-wide view — admin only")}
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
          <thead><tr style={{ background:C.bg }}>{["Org","Plan","MRR","Events","Customers","Health","Created","Actions"].map(h=><th key={h} style={{ padding:"6px 12px", textAlign:"left", fontSize:11, fontWeight:500, color:C.textMute }}>{h}</th>)}</tr></thead>
          <tbody>{orgs.map(o=>(
            <tr key={o.name} style={{ borderTop:`0.5px solid ${C.border}` }}>
              <td style={{ padding:"8px 12px", fontWeight:500, color:C.text }}>{o.name}</td>
              <td style={{ padding:"8px 12px" }}>{tag(o.plan, planColor[o.plan][1], planColor[o.plan][0])}</td>
              <td style={{ padding:"8px 12px", color:C.textSec }}>${o.mrr}/mo</td>
              <td style={{ padding:"8px 12px", color:C.textSec }}>{o.events}</td>
              <td style={{ padding:"8px 12px", color:C.textSec }}>{o.customers}</td>
              <td style={{ padding:"8px 12px" }}>{tag(o.health, healthColor[o.health][1], healthColor[o.health][0])}</td>
              <td style={{ padding:"8px 12px", color:C.textMute, fontSize:11 }}>{o.created}</td>
              <td style={{ padding:"8px 12px" }}>
                <span style={{ fontSize:11, color:C.blue, cursor:"pointer" }}>View</span>
                <span style={{ fontSize:11, color:C.textMute, margin:"0 6px" }}>·</span>
                <span style={{ fontSize:11, color:C.red, cursor:"pointer" }}>Suspend</span>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </>)}
      {sectionTitle("Admin capabilities")}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:8 }}>
        {[
          ["Org management","View all orgs, impersonate for support, manually change plans, set custom event limits"],
          ["Pricing table","Edit per-model pricing (input/output/cached). Updates propagate to all cost calculations within 1 minute."],
          ["Feature flags","Enable/disable features per org (e.g. anomaly detection only for Scale+)"],
          ["Stripe sync","Manually trigger Stripe customer sync, retry failed meter events, view billing discrepancies"],
          ["System health","Queue depth, worker lag, p99 ingest latency, TimescaleDB chunk stats"],
          ["Audit log","Every admin action is logged with actor, timestamp, and before/after values"],
        ].map(([t,b])=>(
          <div key={t} style={{ background:C.surface, border:`0.5px solid ${C.border}`, borderRadius:8, padding:"12px 14px" }}>
            <div style={{ fontSize:13, fontWeight:500, color:C.text, marginBottom:4 }}>{t}</div>
            <div style={{ fontSize:12, color:C.textSec, lineHeight:1.6 }}>{b}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PAYMENTS ──────────────────────────────────────────────────────────────────
function Payments() {
  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
        {card(<>
          {panelHead("What Meridian charges you (platform fee)")}
          <div style={{ padding:"14px 16px" }}>
            {[
              ["Builder","$0/mo","Up to $1K AI billed/month · 10 customers"],
              ["Scale","$99/mo + 0.5% volume","Up to $50K AI billed/month · unlimited customers"],
              ["Enterprise","$499/mo + 0.3% volume","Unlimited · SLA · on-prem option"],
            ].map(([plan, price, desc]) => (
              <div key={plan} style={{ padding:"10px 0", borderBottom:`0.5px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:500, color:C.text }}>{plan}</div>
                  <div style={{ fontSize:11, color:C.textMute }}>{desc}</div>
                </div>
                <div style={{ fontSize:13, fontWeight:500, color:C.teal }}>{price}</div>
              </div>
            ))}
          </div>
        </>)}
        {card(<>
          {panelHead("What you charge your customers (passthrough)")}
          <div style={{ padding:"14px 16px", fontSize:13, color:C.textSec, lineHeight:1.7 }}>
            <p style={{ marginBottom:10 }}>Meridian automatically emits a Stripe meter event for every LLM call, attributing cost × your markup to the customer's Stripe subscription.</p>
            <p style={{ marginBottom:10 }}>You configure the markup per customer tier. Meridian maintains the live pricing table so you never touch it.</p>
            <div style={{ background:C.teal50, borderRadius:6, padding:"8px 12px", fontSize:12, color:C.teal800 }}>Example: customer uses $841 of tokens at 33% markup → Stripe bills them $1,118.53 automatically at month-end.</div>
          </div>
        </>)}
      </div>
      {sectionTitle("Stripe integration architecture")}
      {codeBlock(`// 1. Customer setup (once, when customer signs up)
await stripe.customers.create({ email, name, metadata: { meridian_customer_id } });

// 2. Meter definition (once, per org, at setup)
await stripe.billing.meters.create({
  display_name: 'AI token usage',
  event_name: 'meridian_ai_usage',
  default_aggregation: { formula: 'sum' },
  customer_mapping: { event_payload_key: 'stripe_customer_id', type: 'by_id' },
  value_settings: { event_payload_key: 'value' },
});

// 3. Meter event (per LLM call, emitted by Meridian worker)
await stripe.billing.meterEvents.create({
  event_name: 'meridian_ai_usage',
  payload: {
    stripe_customer_id: customer.stripe_customer_id,
    value: String(Math.round((cost_usd * markup_multiplier) * 10000)),
    // value is in units of $0.0001 — multiply by 10000, pass as integer string
  },
  timestamp: Math.floor(Date.now() / 1000),
});

// 4. Reconciliation (nightly cron)
// Compare SUM(stripe_meter_events.amount_usd) per customer
// against Stripe's own meter summary API — flag any discrepancy > $0.01`, "TypeScript")}
      {sectionTitle("Failure handling")}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
        {[
          ["Emission failure","Worker retries 3× with exponential backoff. After 3 failures, inserts into dead-letter table and fires PagerDuty alert."],
          ["Double-billing prevention","stripe_event_id is stored and UNIQUE-constrained. Duplicate emission attempts are silently ignored."],
          ["Reconciliation","Nightly cron compares Meridian totals vs Stripe meter summary API. Discrepancies >$0.01 create an admin alert."],
        ].map(([t,b])=>(
          <div key={t} style={{ background:C.surface, border:`0.5px solid ${C.border}`, borderRadius:8, padding:"12px" }}>
            <div style={{ fontSize:12, fontWeight:500, color:C.text, marginBottom:4 }}>{t}</div>
            <div style={{ fontSize:11, color:C.textSec, lineHeight:1.6 }}>{b}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── EMAILS ────────────────────────────────────────────────────────────────────
function Emails() {
  const [active, setActive] = useState("welcome");
  const emails = {
    welcome: {
      subject: "Your Meridian workspace is ready",
      preview: "Copy your SDK key and make your first call",
      body: `Hi Sarah,

Your Meridian workspace is ready. Here's your SDK key:

  mr_live_a8f2k9x...  (copy this)

Add it to your project in 3 lines:

  import { Meridian } from 'meridian-ai';
  const ai = Meridian.wrap(new OpenAI(), { apiKey: 'mr_live_a8f2k9x...' });
  await ai.budgets.set({ customerId: 'your-customer-id', daily: 5.00 });

Every call now checks budgets and bills your customers automatically.

Your first 10 customers are free forever on the Builder plan.

— The Meridian team`
    },
    budget_cap: {
      subject: "Budget cap hit — Acme Corp (summarize feature)",
      preview: "7 calls blocked today · $51.24 of $50.00 daily limit",
      body: `Hi Sarah,

Acme Corp hit their daily budget cap on the summarize feature.

  Customer:     Acme Corp
  Feature:      summarize
  Limit:        $50.00/day
  Spent today:  $51.24
  Calls blocked: 7

What happened: calls are returning a 402 BudgetExceededError until midnight UTC when the counter resets.

What you can do:
  → Raise the daily limit for Acme Corp in the dashboard
  → Or switch their breach action to "route" so calls downgrade to gpt-4o-mini instead of blocking

View Acme Corp's budget  →  https://app.meridian.dev/customers/cus_acme

— Meridian`
    },
    anomaly: {
      subject: "Spend anomaly detected — summarize feature",
      preview: "3.1× above 7-day baseline · estimated $214 overage",
      body: `Hi Sarah,

We detected an unusual spend pattern on the summarize feature.

  Baseline (7-day avg):  $69/day
  Today's spend:         $214
  Z-score:               3.1σ
  Estimated overage:     $145 if pattern continues

Our AI triage says: likely a prompt length regression — recent deployments may have increased average context size.

Things to check:
  1. Did you deploy a change to the summarize prompt in the last 24h?
  2. Are input token counts higher than normal? (check the timeseries view)
  3. Is one specific customer driving the spike?

View anomaly detail  →  https://app.meridian.dev/anomalies/anm_xxx

— Meridian`
    },
    weekly: {
      subject: "Your Meridian weekly summary",
      preview: "$2,341 cost · $3,109 billed · +33% avg margin",
      body: `Hi Sarah,

Here's your week ending Jun 27:

  LLM cost:          $2,341
  Billed to customers:  $3,109
  Avg margin:           +33%
  Budget blocks:        14 (3 customers)
  Model routings:       28 (saved ~$18)

Margin breakdown:
  ✓ Acme Corp    +31%  ($1,102 billed)
  ✓ Beta LLC     +25%  ($640 billed)
  ✗ Gamma Co     -9%   ($551 billed)  ← needs attention
  ✓ Delta Inc    +50%  ($321 billed)
  ✓ Echo SaaS    +15%  ($195 billed)

Gamma Co is loss-making. Recommended action: raise their markup from 0% to 25%.
Edit markup  →  https://app.meridian.dev/customers/cus_gamma

— Meridian`
    },
  };
  const e = emails[active];

  return (
    <div>
      <div style={{ display:"flex", gap:6, marginBottom:14, flexWrap:"wrap" }}>
        {[["welcome","Welcome"], ["budget_cap","Budget cap"], ["anomaly","Anomaly alert"], ["weekly","Weekly digest"]].map(([id, label]) => (
          <button key={id} onClick={() => setActive(id)} style={{ fontSize:12, padding:"5px 14px", borderRadius:20, border:`0.5px solid ${active===id ? C.teal : C.border}`, background:active===id ? C.teal50 : "transparent", color:active===id ? C.teal800 : C.textSec, cursor:"pointer" }}>{label}</button>
        ))}
      </div>
      {card(<>
        <div style={{ padding:"14px 16px", borderBottom:`0.5px solid ${C.border}`, background:C.bg }}>
          <div style={{ fontSize:11, color:C.textMute, marginBottom:2 }}>Subject</div>
          <div style={{ fontSize:14, fontWeight:500, color:C.text }}>{e.subject}</div>
          <div style={{ fontSize:11, color:C.textMute, marginTop:4 }}>Preview: {e.preview}</div>
        </div>
        <div style={{ padding:"20px 24px", fontFamily:"monospace", fontSize:13, color:C.textSec, lineHeight:1.9, whiteSpace:"pre-wrap" }}>{e.body}</div>
        <div style={{ padding:"10px 16px", borderTop:`0.5px solid ${C.border}`, fontSize:11, color:C.textMute }}>
          Sent via Resend · <code>noreply@meridian.dev</code> · Unsubscribe · View in browser
        </div>
      </>)}
    </div>
  );
}

// ─── DOCS ──────────────────────────────────────────────────────────────────────
function Docs() {
  const [active, setActive] = useState("quickstart");
  const pages = {
    quickstart: {
      title: "Quickstart",
      content: [
        { type: "h2", text: "Install the SDK" },
        { type: "code", lang: "bash", text: "npm install meridian-ai\n# or\npip install meridian-ai" },
        { type: "h2", text: "Wrap your LLM client" },
        { type: "p", text: "Replace your existing OpenAI (or Anthropic) client with a Meridian-wrapped version. Everything else in your code stays the same." },
        { type: "code", lang: "TypeScript", text: `import { Meridian } from 'meridian-ai';\nimport OpenAI from 'openai';\n\nconst ai = Meridian.wrap(new OpenAI(), {\n  apiKey: process.env.MERIDIAN_API_KEY,\n});\n\n// Your existing code — unchanged\nconst res = await ai.chat.completions.create({\n  model: 'gpt-4o',\n  messages: [{ role: 'user', content: prompt }],\n  user: customerId,           // your end-user's ID\n  metadata: { feature: 'summarize' }, // optional tag\n});` },
        { type: "h2", text: "Set a budget" },
        { type: "code", lang: "TypeScript", text: `// Call once when a customer signs up\nawait ai.budgets.set({\n  customerId: 'cus_acme',\n  daily: 50.00,   // $50/day hard cap\n  monthly: 500.00,\n  onBreach: 'route',           // 'block' | 'route' | 'alert'\n  fallbackModel: 'gpt-4o-mini',\n});` },
        { type: "p", text: "That's it. From this point, every LLM call is automatically: budget-checked before it fires, cost-attributed after it completes, and billed to your customer's Stripe invoice at month-end." },
      ]
    },
    enforcement: {
      title: "Enforcement",
      content: [
        { type: "h2", text: "How enforcement works" },
        { type: "p", text: "On every wrapped LLM call, Meridian checks a Redis counter against the configured budget before the request leaves your server. If the budget is exceeded, the call is rejected and a BudgetExceededError is thrown — no token is ever sent to the LLM provider." },
        { type: "h2", text: "Breach actions" },
        { type: "p", text: "block: Throws BudgetExceededError immediately. Your code must catch this and handle it gracefully.\n\nroute: Automatically substitutes the fallback model you configured. The call succeeds; your user sees no error.\n\nalert: Allows the call but fires a notification to your configured channels." },
        { type: "h2", text: "Handling BudgetExceededError" },
        { type: "code", lang: "TypeScript", text: `import { BudgetExceededError } from 'meridian-ai';\n\ntry {\n  const res = await ai.chat.completions.create({ ... });\n} catch (e) {\n  if (e instanceof BudgetExceededError) {\n    // Show a user-friendly message\n    return { error: 'AI usage limit reached for today.' };\n  }\n  throw e; // re-throw anything else\n}` },
      ]
    },
    billing: {
      title: "Billing passthrough",
      content: [
        { type: "h2", text: "How billing passthrough works" },
        { type: "p", text: "After every successful LLM call, Meridian computes the exact cost (including cached token discounts) and emits a Stripe meter event attributed to your customer's Stripe subscription. At month-end, Stripe generates an invoice line item automatically." },
        { type: "h2", text: "Setup" },
        { type: "code", lang: "TypeScript", text: `// Link a Meridian customer to their Stripe customer\nawait ai.customers.update({\n  customerId: 'cus_acme',\n  stripeCustomerId: 'cus_stripe_xxx',\n  markup: 0.33,  // 33% markup on raw token cost\n});` },
        { type: "h2", text: "Pricing table" },
        { type: "p", text: "Meridian maintains a live pricing table for all major models (OpenAI, Anthropic, Google Gemini). You never update a YAML file. When OpenAI changes gpt-4o pricing, Meridian updates within 24 hours." },
      ]
    },
  };
  const p = pages[active];

  return (
    <div style={{ display:"grid", gridTemplateColumns:"160px 1fr", gap:12 }}>
      <div>
        {[["quickstart","Quickstart"],["enforcement","Enforcement"],["billing","Billing passthrough"]].map(([id,label]) => (
          <div key={id} onClick={() => setActive(id)} style={{ padding:"6px 10px", borderRadius:6, fontSize:13, color: active===id ? C.teal800 : C.textSec, background: active===id ? C.teal50 : "transparent", cursor:"pointer", marginBottom:2, fontWeight: active===id ? 500 : 400 }}>{label}</div>
        ))}
      </div>
      <div>
        <div style={{ fontSize:20, fontWeight:500, color:C.text, marginBottom:16 }}>{p.title}</div>
        {p.content.map((block, i) => {
          if (block.type === "h2") return <div key={i} style={{ fontSize:14, fontWeight:500, color:C.text, margin:"16px 0 8px" }}>{block.text}</div>;
          if (block.type === "p") return <div key={i} style={{ fontSize:13, color:C.textSec, lineHeight:1.7, marginBottom:8, whiteSpace:"pre-wrap" }}>{block.text}</div>;
          if (block.type === "code") return codeBlock(block.text, block.lang);
          return null;
        })}
      </div>
    </div>
  );
}

// ─── SPRINTS ───────────────────────────────────────────────────────────────────
function Sprints() {
  const sprints = [
    {
      sprint: "Sprint 1", weeks: "Weeks 1–2", goal: "SDK core + ingest API",
      tickets: [
        { id: "MER-001", title: "Node.js SDK wrapper (OpenAI client)", points: 5, type: "feature", priority: "P0" },
        { id: "MER-002", title: "POST /v1/ingest endpoint (Fastify)", points: 3, type: "feature", priority: "P0" },
        { id: "MER-003", title: "API key hashing + Redis lookup cache", points: 3, type: "feature", priority: "P0" },
        { id: "MER-004", title: "TimescaleDB schema + hypertable setup", points: 3, type: "infra", priority: "P0" },
        { id: "MER-005", title: "BullMQ worker: cost compute + DB write", points: 5, type: "feature", priority: "P0" },
        { id: "MER-006", title: "Pricing table: OpenAI + Anthropic models", points: 2, type: "data", priority: "P0" },
        { id: "MER-007", title: "Idempotency: UNIQUE constraint on event_id", points: 2, type: "feature", priority: "P0" },
        { id: "MER-008", title: "Railway + Neon + Upstash infra setup", points: 3, type: "infra", priority: "P0" },
      ]
    },
    {
      sprint: "Sprint 2", weeks: "Weeks 3–4", goal: "Budget enforcement + Stripe passthrough",
      tickets: [
        { id: "MER-009", title: "Redis budget counter: HINCRBYFLOAT per customer", points: 5, type: "feature", priority: "P0" },
        { id: "MER-010", title: "SDK: pre-call budget check → BudgetExceededError", points: 3, type: "feature", priority: "P0" },
        { id: "MER-011", title: "Breach action: block (402) + route (model swap)", points: 5, type: "feature", priority: "P0" },
        { id: "MER-012", title: "Stripe meter event emission in worker", points: 5, type: "feature", priority: "P0" },
        { id: "MER-013", title: "stripe_meter_events table + dedup constraint", points: 3, type: "feature", priority: "P0" },
        { id: "MER-014", title: "Budget config CRUD API endpoints", points: 3, type: "feature", priority: "P1" },
        { id: "MER-015", title: "Customer entity: create/update/link Stripe", points: 3, type: "feature", priority: "P0" },
      ]
    },
    {
      sprint: "Sprint 3", weeks: "Weeks 5–6", goal: "Dashboard v1 + Python SDK",
      tickets: [
        { id: "MER-016", title: "Next.js app scaffold + Clerk auth", points: 3, type: "feature", priority: "P0" },
        { id: "MER-017", title: "Dashboard: cost summary + 4 stat cards", points: 3, type: "feature", priority: "P0" },
        { id: "MER-018", title: "Customer margin table (cost vs. billed)", points: 3, type: "feature", priority: "P0" },
        { id: "MER-019", title: "Enforcement activity feed (last 24h)", points: 2, type: "feature", priority: "P1" },
        { id: "MER-020", title: "Analytics API: summary + breakdown endpoints", points: 5, type: "feature", priority: "P0" },
        { id: "MER-021", title: "Python SDK (wraps Anthropic + OpenAI clients)", points: 5, type: "feature", priority: "P0" },
        { id: "MER-022", title: "Email alerts via Resend (budget cap + anomaly)", points: 3, type: "feature", priority: "P1" },
        { id: "MER-023", title: "Alert rules CRUD API", points: 2, type: "feature", priority: "P1" },
      ]
    },
    {
      sprint: "Sprint 4", weeks: "Weeks 7–8", goal: "Billing, launch, and first 5 users",
      tickets: [
        { id: "MER-024", title: "Stripe billing for Meridian itself (scale plan)", points: 5, type: "feature", priority: "P0" },
        { id: "MER-025", title: "Onboarding flow: workspace → API key → SDK copy", points: 3, type: "feature", priority: "P0" },
        { id: "MER-026", title: "Landing page (dark, enforcement-first messaging)", points: 3, type: "design", priority: "P0" },
        { id: "MER-027", title: "Docs site: quickstart, enforcement, billing", points: 3, type: "docs", priority: "P0" },
        { id: "MER-028", title: "Welcome + budget-cap email templates (Resend)", points: 2, type: "feature", priority: "P1" },
        { id: "MER-029", title: "Admin panel: org list + pricing table editor", points: 5, type: "feature", priority: "P1" },
        { id: "MER-030", title: "Nightly reconciliation: Meridian vs Stripe totals", points: 3, type: "feature", priority: "P1" },
        { id: "MER-031", title: "Outreach: Helicone Reddit threads + HN comments", points: 1, type: "growth", priority: "P0" },
      ]
    },
  ];

  const typeColors = { feature:[C.blue50,C.blue800], infra:[C.purple50,C.purple800], data:[C.amber50,C.amber800], design:[C.teal50,C.teal800], docs:[C.gray50,C.textMute], growth:["#EAF3DE","#27500A"] };
  const prioColors = { P0:[C.red50,C.red800], P1:[C.amber50,C.amber800] };

  return (
    <div>
      <div style={{ marginBottom:12, padding:"10px 14px", background:C.teal50, border:`0.5px solid ${C.teal}`, borderRadius:8, fontSize:12, color:C.teal800 }}>
        8 weeks · 4 × 2-week sprints · 1 developer · ship to paying users by end of Sprint 4
      </div>
      {sprints.map(s => (
        <div key={s.sprint} style={{ marginBottom:14 }}>
          <div style={{ display:"flex", gap:10, alignItems:"baseline", marginBottom:8 }}>
            <span style={{ fontSize:14, fontWeight:500, color:C.text }}>{s.sprint}</span>
            <span style={{ fontSize:12, color:C.textMute }}>{s.weeks}</span>
            <span style={{ fontSize:12, color:C.textSec }}>— {s.goal}</span>
            <span style={{ marginLeft:"auto", fontSize:12, color:C.textMute }}>{s.tickets.reduce((a,t)=>a+t.points,0)} pts</span>
          </div>
          {card(
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
              <thead><tr style={{ background:C.bg }}>{["ID","Ticket","Pts","Type","Priority"].map(h=><th key={h} style={{ padding:"6px 12px", textAlign:"left", fontSize:11, fontWeight:500, color:C.textMute }}>{h}</th>)}</tr></thead>
              <tbody>{s.tickets.map(t=>(
                <tr key={t.id} style={{ borderTop:`0.5px solid ${C.border}` }}>
                  <td style={{ padding:"7px 12px", fontFamily:"monospace", fontSize:11, color:C.textMute }}>{t.id}</td>
                  <td style={{ padding:"7px 12px", color:C.text }}>{t.title}</td>
                  <td style={{ padding:"7px 12px", color:C.textSec, fontWeight:500 }}>{t.points}</td>
                  <td style={{ padding:"7px 12px" }}>{tag(t.type, typeColors[t.type][1], typeColors[t.type][0])}</td>
                  <td style={{ padding:"7px 12px" }}>{tag(t.priority, prioColors[t.priority][1], prioColors[t.priority][0])}</td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────────
const SECTIONS = { wireframes: Wireframes, dashboard: Dashboard, landing: Landing, database: Database, api: API, ai: AIFeatures, notifications: Notifications, admin: Admin, payments: Payments, emails: Emails, docs: Docs, sprints: Sprints };

export default function App() {
  const [active, setActive] = useState("wireframes");
  const Section = SECTIONS[active];

  return (
    <div style={{ display:"flex", height:"100vh", fontFamily:"system-ui, -apple-system, sans-serif", background:C.bg, color:C.text, overflow:"hidden" }}>
      <div style={{ width:180, flexShrink:0, background:C.surface, borderRight:`0.5px solid ${C.border}`, display:"flex", flexDirection:"column", overflowY:"auto" }}>
        <div style={{ padding:"16px 14px 12px", borderBottom:`0.5px solid ${C.border}` }}>
          <div style={{ fontSize:15, fontWeight:600, letterSpacing:"-0.3px" }}>meridian</div>
          <div style={{ fontSize:11, color:C.textMute, marginTop:2 }}>product bible</div>
        </div>
        <div style={{ padding:"8px 6px", flex:1 }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setActive(n.id)} style={{ width:"100%", textAlign:"left", padding:"7px 10px", borderRadius:6, border:"none", background: active===n.id ? C.teal50 : "transparent", color: active===n.id ? C.teal800 : C.textSec, cursor:"pointer", fontSize:13, display:"flex", alignItems:"center", gap:8, fontWeight: active===n.id ? 500 : 400, marginBottom:1 }}>
              <span style={{ fontSize:14, opacity:0.7 }}>{n.icon}</span>
              {n.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"20px 24px" }}>
        <div style={{ maxWidth:820, margin:"0 auto" }}>
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:18, fontWeight:500, color:C.text }}>{NAV.find(n=>n.id===active)?.label}</div>
          </div>
          <Section />
        </div>
      </div>
    </div>
  );
}
