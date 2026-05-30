import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  ArrowLeftRight, Grid3x3, BookOpen, Clock, Search, Copy, Share2,
  Check, Sun, Moon, ChevronDown, X, Sprout, Repeat, Star
} from "lucide-react";

/* ============================================================
   AGAMANA AREA CONVERTER
   Karnataka land-area conversion PWA (single-file build)
   Brand: #01473A / #51BA7C / #E9FFF7
   ============================================================ */

/* ---------- Conversion engine (everything in Sq Ft) ---------- */
const SQFT = {
  acre: 43560,
  gunta: 1089,
  sqft: 1,
  sqyard: 9,        // 43560 / 4840
  sqmeter: 10.7639104, // 43560 / 4046.856
  hectare: 107639.104, // 43560 * 2.47105
  cent: 435.6,      // 43560 / 100
};

const UNITS = [
  { id: "acre", en: "Acre", kn: "ಎಕರೆ", short: "Acre" },
  { id: "gunta", en: "Gunta", kn: "ಗುಂಟೆ", short: "Gunta" },
  { id: "sqft", en: "Square Feet", kn: "ಚದರ ಅಡಿ", short: "Sq Ft" },
  { id: "sqyard", en: "Square Yard", kn: "ಚದರ ಗಜ", short: "Sq Yard" },
  { id: "sqmeter", en: "Square Meter", kn: "ಚದರ ಮೀಟರ್", short: "Sq Meter" },
  { id: "hectare", en: "Hectare", kn: "ಹೆಕ್ಟೇರ್", short: "Hectare" },
  { id: "cent", en: "Cent", kn: "ಸೆಂಟ್", short: "Cent" },
];
const unitById = (id) => UNITS.find((u) => u.id === id);

const PLOT_UNITS = [
  { id: "feet", en: "Feet", kn: "ಅಡಿ", sqft: 1 },
  { id: "yard", en: "Yard", kn: "ಗಜ", sqft: 9 },
  { id: "meter", en: "Meter", kn: "ಮೀಟರ್", sqft: 10.7639104 },
];

function convertAll(value, fromUnit) {
  const baseSqft = value * SQFT[fromUnit];
  const out = {};
  UNITS.forEach((u) => { out[u.id] = baseSqft / SQFT[u.id]; });
  return out;
}

/* ---------- Indian number formatting, max 2 decimals ---------- */
function fmt(n) {
  if (!isFinite(n)) return "0";
  const rounded = Math.round(n * 100) / 100;
  const [intPart, decPart] = Math.abs(rounded).toString().split(".");
  // Indian grouping: last 3, then groups of 2
  let s = intPart;
  if (intPart.length > 3) {
    const last3 = intPart.slice(-3);
    const rest = intPart.slice(0, -3);
    s = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + last3;
  }
  const sign = rounded < 0 ? "-" : "";
  return sign + s + (decPart ? "." + decPart : "");
}

/* ---------- Translations ---------- */
const T = {
  en: {
    title: "Agamana Area Converter",
    convert: "Convert", plot: "Plot", reference: "Reference", recent: "Recent",
    areaValue: "Area Value", selectUnit: "Select Unit", enterValue: "Enter a value",
    results: "Results", popular: "Popular Conversions", length: "Length",
    width: "Width", measureUnit: "Measurement Unit", plotResult: "Plot Result",
    quickRef: "Quick Reference", recentCalc: "Recent Calculations",
    noRecent: "No calculations yet. Start converting!", copy: "Copy",
    share: "Share", copied: "Copied Successfully", searchUnit: "Search unit...",
    tapToConvert: "Tap any result to convert from it",
    acreToGunta: "Acre to Gunta", guntaToSqft: "Gunta to Sq Ft",
    siteSizes: "Common Site Sizes", farmLand: "Farm Land Reference",
    install: "Install Agamana Area Converter", installSub: "Use offline anytime.",
    dismiss: "Dismiss", clear: "Clear",
  },
  kn: {
    title: "ಆಗಮನ ವಿಸ್ತೀರ್ಣ ಪರಿವರ್ತಕ",
    convert: "ಪರಿವರ್ತನೆ", plot: "ನಿವೇಶನ", reference: "ಉಲ್ಲೇಖ", recent: "ಇತ್ತೀಚಿನ",
    areaValue: "ವಿಸ್ತೀರ್ಣ ಮೌಲ್ಯ", selectUnit: "ಘಟಕ ಆಯ್ಕೆಮಾಡಿ", enterValue: "ಮೌಲ್ಯ ನಮೂದಿಸಿ",
    results: "ಫಲಿತಾಂಶಗಳು", popular: "ಜನಪ್ರಿಯ ಪರಿವರ್ತನೆಗಳು", length: "ಉದ್ದ",
    width: "ಅಗಲ", measureUnit: "ಅಳತೆ ಘಟಕ", plotResult: "ನಿವೇಶನ ಫಲಿತಾಂಶ",
    quickRef: "ತ್ವರಿತ ಉಲ್ಲೇಖ", recentCalc: "ಇತ್ತೀಚಿನ ಲೆಕ್ಕಾಚಾರಗಳು",
    noRecent: "ಇನ್ನೂ ಲೆಕ್ಕಾಚಾರಗಳಿಲ್ಲ. ಪ್ರಾರಂಭಿಸಿ!", copy: "ನಕಲಿಸಿ",
    share: "ಹಂಚಿಕೊಳ್ಳಿ", copied: "ಯಶಸ್ವಿಯಾಗಿ ನಕಲಿಸಲಾಗಿದೆ", searchUnit: "ಘಟಕ ಹುಡುಕಿ...",
    tapToConvert: "ಯಾವುದೇ ಫಲಿತಾಂಶವನ್ನು ಟ್ಯಾಪ್ ಮಾಡಿ ಪರಿವರ್ತಿಸಿ",
    acreToGunta: "ಎಕರೆ ಯಿಂದ ಗುಂಟೆ", guntaToSqft: "ಗುಂಟೆ ಯಿಂದ ಚದರ ಅಡಿ",
    siteSizes: "ಸಾಮಾನ್ಯ ನಿವೇಶನ ಗಾತ್ರಗಳು", farmLand: "ಕೃಷಿ ಭೂಮಿ ಉಲ್ಲೇಖ",
    install: "ಆಗಮನ ಪರಿವರ್ತಕ ಸ್ಥಾಪಿಸಿ", installSub: "ಯಾವಾಗ ಬೇಕಾದರೂ ಆಫ್‌ಲೈನ್ ಬಳಸಿ.",
    dismiss: "ತಿರಸ್ಕರಿಸಿ", clear: "ತೆರವುಗೊಳಿಸಿ",
  },
};

/* ---------- localStorage persistence ---------- */
const LS_KEY = "agamana_v1";
function loadStore() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  return {};
}
function saveStore(patch) {
  try {
    const cur = loadStore();
    localStorage.setItem(LS_KEY, JSON.stringify({ ...cur, ...patch }));
  } catch (e) { /* ignore */ }
}
const saved = loadStore();
const prefersDark = typeof window !== "undefined" && window.matchMedia
  ? window.matchMedia("(prefers-color-scheme: dark)").matches : false;
const store = {
  lang: saved.lang || "en",
  theme: saved.theme || (prefersDark ? "dark" : "light"),
  recent: Array.isArray(saved.recent) ? saved.recent : [],
  installDismissed: !!saved.installDismissed,
};

/* ============================================================ */
const LOGO = "data:image/png;base64,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";

export default function App() {
  const [lang, setLang] = useState(store.lang);
  const [dark, setDark] = useState(store.theme === "dark");
  const [tab, setTab] = useState("convert");
  const [toast, setToast] = useState("");
  const [recent, setRecent] = useState(store.recent);
  const [showInstall, setShowInstall] = useState(!store.installDismissed);

  // shared converter state (so popular/chips can drive it)
  const [value, setValue] = useState("1");
  const [fromUnit, setFromUnit] = useState("acre");

  const t = T[lang];

  useEffect(() => { saveStore({ lang }); }, [lang]);
  useEffect(() => { saveStore({ theme: dark ? "dark" : "light" }); }, [dark]);
  useEffect(() => { saveStore({ recent }); }, [recent]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 1800);
  };

  const addRecent = (entry) => {
    setRecent((prev) => {
      const next = [entry, ...prev.filter((e) => e.label !== entry.label)];
      return next.slice(0, 10);
    });
  };

  const goConvert = (val, unit) => {
    setValue(String(val));
    setFromUnit(unit);
    setTab("convert");
  };

  const theme = dark ? darkVars : lightVars;

  return (
    <div style={{ ...theme, fontFamily: bodyFont, minHeight: "100vh", background: "var(--bg)", color: "var(--ink)", paddingBottom: 78, transition: "background .3s,color .3s" }}>
      <style>{globalCSS}</style>

      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 30, background: "var(--header)", color: "#fff", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 12px rgba(1,71,58,.18)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: "#fff", display: "grid", placeItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,.18)", overflow: "hidden" }}><img src={LOGO} alt="Agamana logo" style={{ width: 30, height: 30, objectFit: "contain" }} /></div>
          <div style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 17, letterSpacing: ".2px" }}>{t.title}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="iconbtn" onClick={() => setLang(lang === "en" ? "kn" : "en")} aria-label="Toggle language" style={pillBtn}>
            {lang === "en" ? "ಕನ್ನಡ" : "EN"}
          </button>
          <button className="iconbtn" onClick={() => setDark(!dark)} aria-label="Toggle dark mode" style={{ ...pillBtn, width: 40, padding: 0 }}>
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 560, margin: "0 auto", padding: "18px 16px 8px" }}>
        {tab === "convert" && (
          <ConvertTab t={t} lang={lang} value={value} setValue={setValue}
            fromUnit={fromUnit} setFromUnit={setFromUnit}
            showToast={showToast} addRecent={addRecent} goConvert={goConvert} />
        )}
        {tab === "plot" && <PlotTab t={t} lang={lang} showToast={showToast} addRecent={addRecent} />}
        {tab === "reference" && <ReferenceTab t={t} goConvert={goConvert} />}
        {tab === "recent" && <RecentTab t={t} recent={recent} goConvert={goConvert} clear={() => setRecent([])} />}

        {/* Footer */}
        <footer style={{ marginTop: 36, paddingTop: 22, borderTop: "1px solid var(--line)", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 14 }}>
          <div>
            <div style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 15, color: "var(--brand)" }}>Agamana Area Converter</div>
            <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 3 }}>Built for Karnataka Land Area Conversions</div>
            <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 8 }}>© 2026 Agamana Developers. All Rights Reserved.</div>
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", textAlign: "right" }}>
            Designed &amp; Developed by{" "}
            <a href="https://navodita.com/" target="_blank" rel="noopener noreferrer"
              style={{ color: "var(--brand)", fontWeight: 700, textDecoration: "none" }}>
              Navodita
            </a>
          </div>
        </footer>
      </main>

      {/* Install banner */}
      {showInstall && (
        <div className="rise" style={{ position: "fixed", bottom: 86, left: 12, right: 12, maxWidth: 540, margin: "0 auto", background: "var(--card)", border: "1px solid var(--line)", borderRadius: 16, padding: "14px 16px", boxShadow: "0 8px 30px rgba(0,0,0,.18)", zIndex: 40, display: "flex", alignItems: "center", gap: 12 }}>
          <Star size={22} style={{ color: "var(--brand)", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{t.install}</div>
            <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{t.installSub}</div>
          </div>
          <button onClick={() => { saveStore({ installDismissed: true }); setShowInstall(false); showToast(t.install); }} style={{ ...solidBtn, padding: "8px 14px", fontSize: 13 }}>Install</button>
          <button onClick={() => { saveStore({ installDismissed: true }); setShowInstall(false); }} aria-label="Dismiss" style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}><X size={18} /></button>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="toast" style={{ position: "fixed", bottom: 96, left: "50%", transform: "translateX(-50%)", background: "var(--success)", color: "#fff", padding: "11px 20px", borderRadius: 30, fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 8, zIndex: 60, boxShadow: "0 6px 20px rgba(0,0,0,.25)" }}>
          <Check size={17} /> {toast}
        </div>
      )}

      {/* Bottom nav */}
      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "var(--card)", borderTop: "1px solid var(--line)", display: "flex", zIndex: 50, paddingBottom: "env(safe-area-inset-bottom)" }}>
        {[
          { id: "convert", icon: ArrowLeftRight, label: t.convert },
          { id: "plot", icon: Grid3x3, label: t.plot },
          { id: "reference", icon: BookOpen, label: t.reference },
          { id: "recent", icon: Clock, label: t.recent },
        ].map((n) => {
          const active = tab === n.id;
          const Icon = n.icon;
          return (
            <button key={n.id} onClick={() => setTab(n.id)} aria-label={n.label}
              style={{ flex: 1, minHeight: 60, background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "8px 0", color: active ? "var(--brand)" : "var(--muted)", transition: "color .2s" }}>
              <div style={{ position: "relative", transform: active ? "translateY(-2px)" : "none", transition: "transform .2s" }}>
                <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              </div>
              <span style={{ fontSize: 11, fontWeight: active ? 700 : 500 }}>{n.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

/* ---------- Convert Tab ---------- */
function ConvertTab({ t, lang, value, setValue, fromUnit, setFromUnit, showToast, addRecent, goConvert }) {
  const num = parseFloat(value) || 0;
  const results = useMemo(() => convertAll(num, fromUnit), [num, fromUnit]);
  const fu = unitById(fromUnit);

  const POPULAR = [
    { val: 1, unit: "acre", label: "1 Acre" },
    { val: 40, unit: "gunta", label: "40 Gunta" },
    { val: 1200, unit: "sqft", label: "1200 Sq Ft" },
    { val: 2400, unit: "sqft", label: "2400 Sq Ft" },
    { val: 1, unit: "cent", label: "1 Cent" },
  ];

  const buildShareText = () => {
    let s = `${t.title}\n\n${lang === "en" ? "Input" : "ಇನ್‌ಪುಟ್"}:\n${fmt(num)} ${fu[lang]}\n\n${t.results}:\n`;
    UNITS.filter((u) => u.id !== fromUnit).forEach((u) => { s += `${fmt(results[u.id])} ${u.short}\n`; });
    s += `\nGenerated using ${t.title}`;
    return s;
  };

  const onShare = () => {
    const text = buildShareText();
    // WhatsApp deep link works reliably across mobile + desktop.
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    const win = window.open(url, "_blank", "noopener,noreferrer");
    // Fallback to native share sheet if the popup was blocked.
    if (!win && navigator.share) {
      navigator.share({ text }).catch(() => {});
    }
    addRecent({ label: `${fmt(num)} ${fu.short}`, val: num, unit: fromUnit });
  };

  const onCopy = () => {
    navigator.clipboard?.writeText(buildShareText());
    showToast(t.copied);
    addRecent({ label: `${fmt(num)} ${fu.short}`, val: num, unit: fromUnit });
  };

  return (
    <div>
      <Card>
        <Label>{t.areaValue}</Label>
        <input
          type="number" inputMode="decimal" value={value}
          onChange={(e) => setValue(e.target.value)} placeholder={t.enterValue}
          style={{ width: "100%", fontSize: 30, fontWeight: 700, fontFamily: displayFont, padding: "10px 4px", border: "none", borderBottom: "2px solid var(--line)", background: "transparent", color: "var(--ink)", outline: "none" }}
        />
        <div style={{ marginTop: 18 }}>
          <Label>{t.selectUnit}</Label>
          <UnitDropdown lang={lang} value={fromUnit} onChange={setFromUnit} t={t} />
        </div>
      </Card>

      <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "20px 4px 12px", color: "var(--muted)", fontSize: 12.5, fontWeight: 600 }}>
        <Repeat size={14} /> {t.tapToConvert}
      </div>

      <div style={{ display: "grid", gap: 10, position: "relative", zIndex: 1 }}>
        {UNITS.filter((u) => u.id !== fromUnit).map((u, i) => (
          <button key={u.id} className="reveal chip" style={{ animationDelay: `${i * 45}ms` }}
            onClick={() => goConvert(Math.round(results[u.id] * 100) / 100, u.id)}>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600 }}>{u[lang]}</div>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: displayFont, color: "var(--brand)" }}>{fmt(results[u.id])}</div>
            </div>
            <ArrowLeftRight size={18} style={{ color: "var(--muted)", opacity: .6 }} />
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        <button onClick={onCopy} style={{ ...outlineBtn, flex: 1 }}><Copy size={17} /> {t.copy}</button>
        <button onClick={onShare} style={{ ...solidBtn, flex: 1 }}><Share2 size={17} /> {t.share}</button>
      </div>

      <SectionTitle><Star size={15} style={{ color: "var(--accent)" }} /> {t.popular}</SectionTitle>
      <div style={{ display: "flex", gap: 9, overflowX: "auto", paddingBottom: 6, margin: "0 -4px", paddingLeft: 4 }}>
        {POPULAR.map((p) => (
          <button key={p.label} onClick={() => goConvert(p.val, p.unit)} className="pop"
            style={{ flexShrink: 0, padding: "12px 16px", borderRadius: 14, border: "1px solid var(--line)", background: "var(--card)", color: "var(--ink)", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: displayFont }}>
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- Plot Tab ---------- */
function PlotTab({ t, lang, showToast, addRecent }) {
  const [length, setLength] = useState("30");
  const [width, setWidth] = useState("40");
  const [unit, setUnit] = useState("feet");

  const pu = PLOT_UNITS.find((u) => u.id === unit);
  const sqft = (parseFloat(length) || 0) * (parseFloat(width) || 0) * pu.sqft;
  const r = convertAll(sqft, "sqft");

  const rows = [
    { label: "Sq Ft", v: r.sqft }, { label: "Sq Yard", v: r.sqyard },
    { label: "Gunta", v: r.gunta }, { label: "Acre", v: r.acre },
    { label: "Sq Meter", v: r.sqmeter },
  ];

  const onCopy = () => {
    let s = `${t.title}\n\n${length} × ${width} ${pu[lang]}\n\n`;
    rows.forEach((x) => { s += `${fmt(x.v)} ${x.label}\n`; });
    navigator.clipboard?.writeText(s);
    showToast(t.copied);
    addRecent({ label: `${length} × ${width} ${pu.en === "Feet" ? "Site" : pu.en}`, plot: true });
  };

  return (
    <div>
      <Card>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <Label>{t.length}</Label>
            <input type="number" inputMode="decimal" value={length} onChange={(e) => setLength(e.target.value)} style={plotInput} />
          </div>
          <div style={{ alignSelf: "flex-end", paddingBottom: 14, fontSize: 22, color: "var(--muted)", fontWeight: 700 }}>×</div>
          <div style={{ flex: 1 }}>
            <Label>{t.width}</Label>
            <input type="number" inputMode="decimal" value={width} onChange={(e) => setWidth(e.target.value)} style={plotInput} />
          </div>
        </div>
        <div style={{ marginTop: 18 }}>
          <Label>{t.measureUnit}</Label>
          <div style={{ display: "flex", gap: 8 }}>
            {PLOT_UNITS.map((u) => (
              <button key={u.id} onClick={() => setUnit(u.id)}
                style={{ flex: 1, padding: "11px 0", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: "pointer", border: unit === u.id ? "2px solid var(--brand)" : "1px solid var(--line)", background: unit === u.id ? "var(--brandSoft)" : "var(--card)", color: unit === u.id ? "var(--brand)" : "var(--ink)", transition: "all .2s" }}>
                {u[lang]}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <SectionTitle><Grid3x3 size={15} style={{ color: "var(--accent)" }} /> {t.plotResult}</SectionTitle>
      <Card>
        {rows.map((x, i) => (
          <div key={x.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < rows.length - 1 ? "1px solid var(--line)" : "none" }}>
            <span style={{ color: "var(--muted)", fontWeight: 600, fontSize: 14 }}>{x.label}</span>
            <span style={{ fontWeight: 700, fontFamily: displayFont, fontSize: 19, color: "var(--brand)" }}>{fmt(x.v)}</span>
          </div>
        ))}
      </Card>
      <button onClick={onCopy} style={{ ...outlineBtn, width: "100%", marginTop: 14 }}><Copy size={17} /> {t.copy}</button>
    </div>
  );
}

/* ---------- Reference Tab ---------- */
function ReferenceTab({ t, goConvert }) {
  const acreGunta = [[1, 40], [2, 80], [5, 200], [10, 400]];
  const guntaSqft = [[1, 1089], [5, 5445], [10, 10890], [20, 21780]];
  const sites = [[20, 30, 600], [30, 40, 1200], [30, 50, 1500], [40, 60, 2400], [50, 80, 4000], [60, 90, 5400]];
  const farm = [[10, 0.25], [20, 0.5], [30, 0.75], [40, 1], [80, 2]];

  return (
    <div>
      <RefBlock title={t.acreToGunta} icon={<Repeat size={15} style={{ color: "var(--accent)" }} />}>
        {acreGunta.map(([a, g]) => (
          <RefRow key={a} left={`${a} Acre`} right={`${g} Guntas`} onClick={() => goConvert(a, "acre")} />
        ))}
      </RefBlock>
      <RefBlock title={t.guntaToSqft} icon={<Repeat size={15} style={{ color: "var(--accent)" }} />}>
        {guntaSqft.map(([g, s]) => (
          <RefRow key={g} left={`${g} Gunta`} right={`${fmt(s)} Sq Ft`} onClick={() => goConvert(g, "gunta")} />
        ))}
      </RefBlock>
      <RefBlock title={t.siteSizes} icon={<Grid3x3 size={15} style={{ color: "var(--accent)" }} />}>
        {sites.map(([w, h, a]) => (
          <RefRow key={`${w}x${h}`} left={`${w} × ${h}`} right={`${fmt(a)} Sq Ft`} onClick={() => goConvert(a, "sqft")} />
        ))}
      </RefBlock>
      <RefBlock title={t.farmLand} icon={<Sprout size={15} style={{ color: "var(--accent)" }} />}>
        {farm.map(([g, a]) => (
          <RefRow key={g} left={`${g} Gunta`} right={`${a} Acre`} onClick={() => goConvert(g, "gunta")} />
        ))}
      </RefBlock>
    </div>
  );
}

/* ---------- Recent Tab ---------- */
function RecentTab({ t, recent, goConvert, clear }) {
  if (!recent.length) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--muted)" }}>
        <Clock size={44} style={{ opacity: .4, marginBottom: 14 }} />
        <div style={{ fontSize: 15 }}>{t.noRecent}</div>
      </div>
    );
  }
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <SectionTitle style={{ margin: 0 }}><Clock size={15} style={{ color: "var(--accent)" }} /> {t.recentCalc}</SectionTitle>
        <button onClick={clear} style={{ background: "none", border: "none", color: "var(--error)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>{t.clear}</button>
      </div>
      <div style={{ display: "grid", gap: 9 }}>
        {recent.map((e, i) => (
          <button key={i} className="reveal" style={{ animationDelay: `${i * 40}ms`, ...recentCard }}
            disabled={e.plot}
            onClick={() => !e.plot && goConvert(e.val, e.unit)}>
            <span style={{ fontWeight: 700, fontFamily: displayFont, fontSize: 16 }}>{e.label}</span>
            {!e.plot && <ArrowLeftRight size={16} style={{ color: "var(--muted)" }} />}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- Searchable unit dropdown ---------- */
function UnitDropdown({ lang, value, onChange, t }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef(null);
  const sel = unitById(value);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = UNITS.filter((u) =>
    u.en.toLowerCase().includes(q.toLowerCase()) ||
    u.short.toLowerCase().includes(q.toLowerCase()) ||
    u.kn.includes(q) || u.id.includes(q.toLowerCase())
  );

  return (
    <div ref={ref} style={{ position: "relative", zIndex: open ? 100 : "auto" }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 15px", borderRadius: 12, border: "1px solid var(--line)", background: "var(--card)", color: "var(--ink)", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: displayFont }}>
        {sel[lang]}
        <ChevronDown size={18} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s", color: "var(--muted)" }} />
      </button>
      {open && (
        <div className="rise" style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, background: "var(--card)", border: "1px solid var(--line)", borderRadius: 14, boxShadow: "0 12px 36px rgba(0,0,0,.28)", zIndex: 100, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderBottom: "1px solid var(--line)" }}>
            <Search size={16} style={{ color: "var(--muted)" }} />
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.searchUnit}
              style={{ flex: 1, border: "none", outline: "none", background: "transparent", color: "var(--ink)", fontSize: 14 }} />
          </div>
          <div style={{ maxHeight: 240, overflowY: "auto" }}>
            {filtered.map((u) => (
              <button key={u.id} onClick={() => { onChange(u.id); setOpen(false); setQ(""); }}
                style={{ width: "100%", textAlign: "left", padding: "12px 15px", border: "none", background: u.id === value ? "var(--brandSoft)" : "transparent", color: u.id === value ? "var(--brand)" : "var(--ink)", fontWeight: u.id === value ? 700 : 500, fontSize: 14.5, cursor: "pointer", display: "flex", justifyContent: "space-between" }}>
                {u[lang]} <span style={{ color: "var(--muted)", fontSize: 12 }}>{u.short}</span>
              </button>
            ))}
            {!filtered.length && <div style={{ padding: 16, color: "var(--muted)", fontSize: 14 }}>—</div>}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Small UI primitives ---------- */
const Card = ({ children }) => (
  <div className="reveal" style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 18, padding: 18, boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>{children}</div>
);
const Label = ({ children }) => (
  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 8 }}>{children}</div>
);
const SectionTitle = ({ children, style }) => (
  <h2 style={{ fontFamily: displayFont, fontSize: 16, fontWeight: 700, margin: "26px 4px 12px", display: "flex", alignItems: "center", gap: 7, ...style }}>{children}</h2>
);
const RefBlock = ({ title, icon, children }) => (
  <div style={{ marginBottom: 8 }}>
    <SectionTitle>{icon} {title}</SectionTitle>
    <Card>{children}</Card>
  </div>
);
const RefRow = ({ left, right, onClick }) => (
  <button onClick={onClick} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: "1px solid var(--line)", background: "none", border: "none", borderBottomWidth: 1, cursor: "pointer", color: "var(--ink)" }} className="refrow">
    <span style={{ fontWeight: 600, fontSize: 14.5 }}>{left}</span>
    <span style={{ fontWeight: 700, fontFamily: displayFont, fontSize: 15, color: "var(--brand)" }}>{right}</span>
  </button>
);

/* ---------- Style tokens ---------- */
const displayFont = "'Plus Jakarta Sans', 'Segoe UI', sans-serif";
const bodyFont = "'Plus Jakarta Sans', 'Segoe UI', sans-serif";

const lightVars = {
  "--bg": "#E9FFF7", "--card": "#ffffff", "--ink": "#0a2a22", "--muted": "#5b7d72",
  "--brand": "#01473A", "--brandSoft": "#dff5ec", "--accent": "#51BA7C",
  "--header": "#01473A", "--line": "#d3ede2", "--success": "#22C55E",
  "--warning": "#F59E0B", "--error": "#EF4444",
};
const darkVars = {
  "--bg": "#06201a", "--card": "#0c2e26", "--ink": "#e6fff5", "--muted": "#7fa99b",
  "--brand": "#51BA7C", "--brandSoft": "#0f3b30", "--accent": "#51BA7C",
  "--header": "#02382e", "--line": "#16463a", "--success": "#22C55E",
  "--warning": "#F59E0B", "--error": "#EF4444",
};

const pillBtn = { minWidth: 40, height: 36, padding: "0 12px", borderRadius: 20, border: "1px solid rgba(255,255,255,.25)", background: "rgba(255,255,255,.12)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "grid", placeItems: "center" };
const solidBtn = { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px 18px", borderRadius: 13, border: "none", background: "var(--brand)", color: "#fff", fontWeight: 700, fontSize: 14.5, cursor: "pointer" };
const outlineBtn = { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px 18px", borderRadius: 13, border: "1px solid var(--brand)", background: "transparent", color: "var(--brand)", fontWeight: 700, fontSize: 14.5, cursor: "pointer" };
const plotInput = { width: "100%", fontSize: 26, fontWeight: 700, fontFamily: displayFont, padding: "8px 4px", border: "none", borderBottom: "2px solid var(--line)", background: "transparent", color: "var(--ink)", outline: "none" };
const recentCard = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 17px", borderRadius: 14, border: "1px solid var(--line)", background: "var(--card)", color: "var(--ink)", cursor: "pointer", textAlign: "left" };

const globalCSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
.chip { display:flex; justify-content:space-between; align-items:center; padding:14px 17px; border-radius:15px; border:1px solid var(--line); background:var(--card); cursor:pointer; transition:transform .12s, box-shadow .2s, border-color .2s; }
.chip:active { transform:scale(.97); }
.chip:hover { border-color:var(--accent); box-shadow:0 4px 16px rgba(81,186,124,.18); }
.pop:active { transform:scale(.95); } .pop { transition:transform .12s; }
.refrow:active { opacity:.6; }
.iconbtn:active { transform:scale(.92); } .iconbtn { transition:transform .12s; }
.reveal { animation: reveal .45s cubic-bezier(.2,.7,.3,1) both; }
@keyframes reveal { from { opacity:0; transform:translateY(10px);} to {opacity:1; transform:none;} }
.rise { animation: rise .25s ease both; }
@keyframes rise { from { opacity:0; transform:translateY(8px);} to {opacity:1; transform:none;} }
.toast { animation: pop .3s cubic-bezier(.2,1.3,.4,1) both; }
@keyframes pop { from { opacity:0; transform:translateX(-50%) scale(.8);} to {opacity:1; transform:translateX(-50%) scale(1);} }
::-webkit-scrollbar { height:5px; width:5px; } ::-webkit-scrollbar-thumb { background:var(--line); border-radius:3px; }
button:focus-visible, input:focus-visible { outline:2px solid var(--accent); outline-offset:2px; }
`;
