import { useState, useEffect, useCallback } from "react";

// ─── CSS ────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');

  :root {
    --bg: #060708;
    --s1: #0f1012;
    --s2: #15161a;
    --s3: #1c1d22;
    --border: rgba(255,255,255,0.065);
    --border-h: rgba(255,30,30,0.38);
    --red: #FF1F1F;
    --red-bg: rgba(255,30,30,0.10);
    --red-glow: rgba(255,30,30,0.20);
    --white: #ffffff;
    --muted: rgba(255,255,255,0.75);
    --dim: rgba(255,255,255,0.2);
    --r: 13px;
    --rs: 9px;
  }

  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }

  .zygn-root {
    font-family: 'Sora', sans-serif;
    background: var(--bg);
    color: var(--white);
    min-height: 100dvh;
    display: grid;
    place-items: center;
    padding: 20px 16px;
    overflow-x: hidden;
    position: relative;
  }

  .zygn-root::before {
    content: ''; position: fixed;
    width: 700px; height: 700px; border-radius: 50%;
    background: radial-gradient(circle, rgba(255,30,30,0.055) 0%, transparent 60%);
    top: -200px; right: -180px; pointer-events: none; z-index: 0;
  }
  .zygn-root::after {
    content: ''; position: fixed;
    width: 500px; height: 500px; border-radius: 50%;
    background: radial-gradient(circle, rgba(255,30,30,0.032) 0%, transparent 60%);
    bottom: -150px; left: -100px; pointer-events: none; z-index: 0;
  }

  .grid-bg {
    position: fixed; inset: 0;
    background-image: radial-gradient(rgba(255,255,255,0.022) 1px, transparent 1px);
    background-size: 26px 26px;
    pointer-events: none; z-index: 0;
  }

  .shell {
    position: relative; z-index: 1;
    width: 100%; max-width: 584px;
  }

  /* HEADER */
  .hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; }
  .logo { display: flex; align-items: center; gap: 8px; font-size: 18px; font-weight: 700; letter-spacing: -0.04em; color: var(--white); user-select: none; }
  .logo img { height: 30px; width: auto; display: block; }
  .logo-text em { font-style: normal; color: var(--red); }
  .qcount { font-size: 12px; font-weight: 500; color: var(--muted); letter-spacing: 0.03em; opacity: 0; transition: opacity 0.3s; }
  .qcount.show { opacity: 1; }

  /* PROGRESS */
  .prog-rail { height: 2px; background: var(--border); border-radius: 99px; margin-bottom: 40px; position: relative; overflow: visible; }
  .prog-bar {
    height: 100%; border-radius: 99px;
    background: var(--red);
    box-shadow: 0 0 8px rgba(255,30,30,0.65);
    transition: width 0.42s cubic-bezier(0.4,0,0.2,1);
    position: relative;
  }
  .prog-bar::after {
    content: ''; position: absolute; right: -1px; top: 50%; transform: translateY(-50%);
    width: 5px; height: 5px; background: var(--red); border-radius: 50%;
    box-shadow: 0 0 6px rgba(255,30,30,1);
  }

  /* STEP TRANSITIONS */
  .step-enter { animation: stepIn 0.28s cubic-bezier(0.22,1,0.36,1) both; }
  .step-exit  { animation: stepOut 0.2s cubic-bezier(0.4,0,1,1) both; }
  @keyframes stepIn  { from { opacity:0; transform: translateY(20px) scale(.99) } to { opacity:1; transform: translateY(0) scale(1) } }
  @keyframes stepOut { from { opacity:1; transform: translateY(0) } to { opacity:0; transform: translateY(-12px) } }

  /* BACK */
  .back {
    display: inline-flex; align-items: center; gap: 5px;
    font-family: 'Sora', sans-serif; font-size: 12.5px; font-weight: 400;
    color: var(--muted); background: none; border: none; cursor: pointer;
    padding: 4px 0; margin-bottom: 26px; transition: color .15s;
    -webkit-tap-highlight-color: transparent;
  }
  .back:hover { color: rgba(255,255,255,.7); }
  .back svg { width: 14px; height: 14px; }

  /* QUESTION COPY */
  .eyebrow {
    display: block; font-size: 12px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase;
    color: #ff2b2b; margin-bottom: 16px;
  }
  .q {
    font-size: clamp(20px, 3.8vw, 27px); font-weight: 700;
    letter-spacing: -0.03em; line-height: 1.23;
    color: var(--white); margin-bottom: 9px;
  }
  .sub {
    font-size: 13.5px; font-weight: 300;
    color: rgba(255,255,255,0.72); line-height: 1.68;
    margin-bottom: 28px; max-width: 440px;
  }
  .sub strong { color: #ffffff; font-weight: 600; }

  /* TEXT INPUTS */
  .inp-row { display: flex; flex-direction: column; gap: 10px; }
  .inp-group { display: flex; flex-direction: column; gap: 6px; }
  .inp-label { font-size: 11px; font-weight: 500; color: var(--muted); letter-spacing: 0.06em; text-transform: uppercase; }
  .inp-field {
    width: 100%; padding: 14px 18px;
    font-family: 'Sora', sans-serif; font-size: 15px; font-weight: 400;
    color: var(--white); background: var(--s1);
    border: 1px solid var(--border); border-radius: var(--r);
    outline: none; caret-color: var(--red);
    transition: border-color .18s, box-shadow .18s; -webkit-appearance: none;
  }
  .inp-field::placeholder { color: var(--dim); }
  .inp-field:focus {
    border-color: rgba(255,30,30,.45);
    box-shadow: 0 0 0 3px var(--red-bg);
  }
  .phone-wrap { display: flex; gap: 10px; align-items: stretch; }
  .country-pre {
    display: flex; align-items: center; padding: 14px 16px;
    background: var(--s1); border: 1px solid var(--border);
    border-radius: var(--r); font-size: 14px; font-weight: 500;
    color: var(--muted); white-space: nowrap; flex-shrink: 0; user-select: none;
  }
  .phone-wrap .inp-field { flex: 1; }

  /* SINGLE-SELECT OPTIONS */
  .opts { display: flex; flex-direction: column; gap: 8px; }
  .opts.g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .opt {
    display: flex; align-items: center; gap: 13px;
    padding: 13px 15px;
    background: var(--s1); border: 1px solid var(--border); border-radius: var(--r);
    cursor: pointer; text-align: left; color: var(--white);
    font-family: 'Sora', sans-serif; width: 100%;
    transition: background .11s, border-color .11s, transform .11s;
    -webkit-tap-highlight-color: transparent;
  }
  .opt:hover { background: var(--s2); border-color: var(--border-h); transform: translateY(-1px); }
  .opt:active { transform: translateY(0); }
  .opt.on { background: var(--red-bg); border-color: var(--red); box-shadow: 0 0 0 1px rgba(255,30,30,.28); }
  .opt .tl { font-size: 13.5px; font-weight: 500; line-height: 1.3; }
  .opt .ds { font-size: 11.5px; font-weight: 300; color: var(--muted); margin-top: 2px; line-height: 1.45; }
  .opts.g2 .opt { padding: 15px 16px; flex-direction: column; align-items: flex-start; gap: 4px; }
  .opts.g2 .opt .tl { font-size: 14px; font-weight: 600; }
  .full-col { grid-column: 1 / -1; }

  /* MULTI-SELECT MODULES */
  .mod-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .mod {
    display: flex; align-items: center; gap: 10px;
    padding: 12px 14px;
    background: var(--s1); border: 1px solid var(--border); border-radius: var(--r);
    cursor: pointer; text-align: left; color: var(--white);
    font-family: 'Sora', sans-serif; width: 100%;
    transition: background .11s, border-color .11s;
    -webkit-tap-highlight-color: transparent;
  }
  .mod:hover { background: var(--s2); border-color: rgba(255,30,30,.2); }
  .mod.on { background: var(--red-bg); border-color: var(--red); }
  .mod .tl { font-size: 12.5px; font-weight: 500; line-height: 1.3; }
  .mod-hint { font-size: 13.5px; color: var(--muted); margin-bottom: 16px; font-weight: 300; line-height: 1.68; }

  /* OTHER INPUT REVEAL */
  .reveal {
    overflow: hidden; max-height: 0; opacity: 0;
    transition: max-height .25s ease, opacity .2s ease, margin-top .25s ease;
    margin-top: 0;
  }
  .reveal.open { max-height: 120px; opacity: 1; margin-top: 10px; }

  /* BUDGET CARDS */
  .budget-opts { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .budget-card {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 22px 16px; gap: 8px;
    background: var(--s1); border: 1px solid var(--border); border-radius: var(--r);
    cursor: pointer; font-family: 'Sora', sans-serif;
    transition: background .11s, border-color .11s, transform .11s;
    -webkit-tap-highlight-color: transparent;
  }
  .budget-card:hover { background: var(--s2); border-color: var(--border-h); transform: translateY(-1px); }
  .budget-card.on { background: var(--red-bg); border-color: var(--red); }
  .budget-card:disabled { opacity: .5; cursor: not-allowed; }
  .budget-card .emo { font-size: 26px; }
  .budget-card .bl { font-size: 14px; font-weight: 600; color: var(--white); }
  .budget-card .bd { font-size: 11.5px; font-weight: 300; color: var(--muted); margin-top: 2px; text-align: center; line-height: 1.4; }

  .flow-msg { font-size: 12px; color: var(--red); margin-top: 14px; text-align: center; font-weight: 400; }

  /* BUTTONS */
  .btn {
    width: 100%; padding: 15px 22px;
    font-family: 'Sora', sans-serif; font-size: 14px; font-weight: 600;
    letter-spacing: 0.01em; color: var(--white); background: var(--red);
    border: none; border-radius: var(--r); cursor: pointer;
    box-shadow: 0 4px 20px rgba(255,30,30,.26);
    transition: background .14s, transform .11s, box-shadow .14s, opacity .14s;
    margin-top: 16px; -webkit-tap-highlight-color: transparent;
  }
  .btn:hover:not(:disabled) { background: #ff3535; transform: translateY(-1px); box-shadow: 0 6px 28px rgba(255,30,30,.38); }
  .btn:active:not(:disabled) { transform: translateY(0); }
  .btn:disabled { opacity: .3; cursor: not-allowed; box-shadow: none; transform: none; }
  .btn.ghost {
    background: transparent; border: 1px solid rgba(255,255,255,.12);
    box-shadow: none; color: var(--muted); font-weight: 400;
  }
  .btn.ghost:hover:not(:disabled) { color: rgba(255,255,255,.7); border-color: rgba(255,255,255,.22); background: transparent; box-shadow: none; }

  /* RESULT */
  .result { text-align: center; padding: 12px 0 8px; }
  .emblem { width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto 26px; }
  .emblem.go { background: var(--red-bg); border: 1px solid rgba(255,30,30,.3); box-shadow: 0 0 40px rgba(255,30,30,.13); }
  .emblem.read { background: rgba(255,255,255,.04); border: 1px solid var(--border); }
  .res-h { font-size: clamp(21px, 3.8vw, 27px); font-weight: 700; letter-spacing: -0.04em; margin-bottom: 13px; line-height: 1.2; }
  .res-b { font-size: 14px; font-weight: 300; color: var(--muted); line-height: 1.72; margin-bottom: 32px; max-width: 380px; margin-left: auto; margin-right: auto; }
  .res-b strong { color: var(--white); font-weight: 500; }
  .links { display: flex; flex-direction: column; gap: 8px; margin-bottom: 18px; }
  .link-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 13px 17px;
    background: var(--s1); border: 1px solid var(--border); border-radius: var(--r);
    text-decoration: none; color: var(--white); font-size: 13.5px; font-weight: 500;
    transition: background .11s, border-color .11s;
  }
  .link-row:hover { background: var(--s2); border-color: rgba(255,30,30,.2); }
  .link-row svg { width: 14px; height: 14px; color: var(--muted); flex-shrink: 0; }
  .note { font-size: 11.5px; color: var(--dim); font-weight: 300; margin-top: 11px; }
  .divider { display: flex; align-items: center; gap: 12px; color: var(--dim); font-size: 11px; margin: 18px 0; }
  .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }

  /* DISQUALIFY EARLY */
  .dis-notice {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 14px 16px; background: rgba(255,255,255,.03);
    border: 1px solid var(--border); border-radius: var(--r); margin-bottom: 20px;
  }
  .dis-notice svg { width: 16px; height: 16px; color: var(--muted); flex-shrink: 0; margin-top: 1px; }
  .dis-notice p { font-size: 13px; font-weight: 300; color: var(--muted); line-height: 1.6; }

  @media (max-width: 460px) {
    .opts.g2 { grid-template-columns: 1fr 1fr; }
    .mod-grid { grid-template-columns: 1fr 1fr; }
    .budget-opts { grid-template-columns: 1fr 1fr; }
    .q { font-size: 19px; }
  }
`;

// ─── ICONS ───────────────────────────────────────────────────────────────────
const BackArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const ChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const TOTAL_Q = 9;
const SCREENS = ["s2","s1","s3","s4","s5","s6","s7","s8","s9","s10"];

// TODO: replace with the real TidyCal booking URL for this funnel
const TIDYCAL_URL = "https://tidycal.com/REPLACE_ME";

// ─── STEP WRAPPER ─────────────────────────────────────────────────────────────
function Step({ children, animating }) {
  return (
    <div className={animating ? "step-exit" : "step-enter"}>
      {children}
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function ZygnQuestionnaire() {

  const [cur, setCur] = useState("s2");
  const [animating, setAnimating] = useState(false);
  const [answers, setAnswers] = useState({});
  const [mods, setMods] = useState(new Set());

  // Contact + studio form
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [studioName, setStudioName] = useState("");
  const [studioCity, setStudioCity] = useState("");

  // Tools
  const [toolOther, setToolOther] = useState("");
  const [showToolOther, setShowToolOther] = useState(false);

  // Mobile (carried forward from the popup form) + submission state
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [flowMsg, setFlowMsg] = useState("");

  // Self-serve reason
  const [ssBody, setSsBody] = useState("A live demo may not be the most useful next move right now. Start with these and come back when the timing is right.");

  // ── carry the mobile number forward from Pop.jsx ───────────────────────────
  useEffect(() => {
    const fromState = location.state?.mobile;
    const fromStorage = localStorage.getItem("mobile");
    const carried = fromState || fromStorage || "";
    if (carried) setPhone(carried);
  }, [location.state]);

  // Inject styles once
  useEffect(() => {
    const id = "zygn-styles";
    if (!document.getElementById(id)) {
      const el = document.createElement("style");
      el.id = id;
      el.textContent = css;
      document.head.appendChild(el);
    }
  }, []);

  // ── progress ─────────────────────────────────────────────────────────────
  const stepIndex = SCREENS.indexOf(cur);
  const progressStep = stepIndex >= 0 ? stepIndex + 1 : TOTAL_Q + 2;
  const progressPct = progressStep <= 0 ? 0 : Math.min((progressStep / (TOTAL_Q + 1)) * 100, 100);

  const qcountText = (() => {
    if (progressStep >= 1 && progressStep <= TOTAL_Q) return `Step ${progressStep} of ${TOTAL_Q}`;
    if (progressStep === TOTAL_Q + 1) return "Final step";
    return "";
  })();

  // ── step 2 validity (name, email, phone, studio name, city) ───────────────
  const isStep2Valid =
    fullName.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    phone.length === 10 &&
    studioName.trim().length >= 2 &&
    studioCity.trim().length >= 2;

  // ── navigation ────────────────────────────────────────────────────────────
  const navigate = useCallback((to) => {
    setAnimating(true);
    setTimeout(() => {
      setAnimating(false);
      setCur(to);
    }, 200);
  }, []);

  const go = useCallback((fromIndex) => {
    const toScreen = SCREENS[fromIndex + 1];
    if (toScreen) navigate(toScreen);
  }, [navigate]);

  const goBack = useCallback((fromIndex) => {
    const toScreen = SCREENS[fromIndex - 1];
    if (toScreen) {
      setCur(toScreen); // instant back (no fade)
    }
  }, []);

  // ── single-select pick ────────────────────────────────────────────────────
  const pick = useCallback((key, val) => {
    setAnswers(prev => ({ ...prev, [key]: val }));
    if (key === "role" && val === "other") {
      setTimeout(() => { navigate("s-other"); }, 260);
      return;
    }
    const curIndex = SCREENS.indexOf(cur);
    setTimeout(() => go(curIndex), 270);
  }, [cur, go, navigate]);

  // ── tools pick ───────────────────────────────────────────────────────────
  const pickTools = useCallback((val) => {
    setAnswers(prev => ({ ...prev, tools: val }));
    if (val === "software") {
      setShowToolOther(true);
    } else {
      setShowToolOther(false);
      setToolOther("");
      const curIndex = SCREENS.indexOf(cur);
      setTimeout(() => go(curIndex), 270);
    }
  }, [cur, go]);

  const advanceToolOther = useCallback(() => {
    setAnswers(prev => ({ ...prev, toolOther }));
    const curIndex = SCREENS.indexOf(cur);
    go(curIndex);
  }, [toolOther, cur, go]);

  // ── studio details ────────────────────────────────────────────────────────
  const advanceStudio = useCallback(() => {
    setAnswers(prev => ({ ...prev, fullName, email, studioName, studioCity }));
    go(SCREENS.indexOf("s2"));
  }, [fullName, email, studioName, studioCity, go]);

  // ── modules ───────────────────────────────────────────────────────────────
  const toggleMod = useCallback((key) => {
    setMods(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }, []);

  const advanceMods = useCallback(() => {
    setAnswers(prev => ({ ...prev, modules: Array.from(mods) }));
    go(SCREENS.indexOf("s6"));
  }, [mods, go]);

  // ── submit flow form ──────────────────────────────────────────────────────
  const submitFlowForm = useCallback(async (finalAnswers = answers) => {
    setIsSubmitting(true);
    setFlowMsg("");

    const submissionData = {
      form_type: "flow",
      country_code: "+91",
      mobile: phone,
      full_name: fullName,
      email: email,
      studio_name: studioName,
      studio_city: studioCity,
      role: finalAnswers.role || "",
      team: finalAnswers.team || "",
      projects: finalAnswers.projects || "",
      business_type: finalAnswers.biz || "",
      modules: Array.from(mods),
      tools: finalAnswers.tools || "",
      tool_other: toolOther,
      timeline: finalAnswers.timeline || "",
      budget: finalAnswers.budget || "",
    };

    try {
      const response = await fetch("https://auditflow.zygn.app/zygn/php/main.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      const data = await response.json();

      if (response.ok && data.status) {
        return true;
      }

      setFlowMsg(data.message || "Submission failed. Please try again.");
      return false;
    } catch (submitError) {
      console.error("Error submitting flow form:", submitError);
      setFlowMsg("Network error. Please try again.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, mods, phone, fullName, email, studioCity, studioName, toolOther]);

  // ── finish: submit + go to success screen (no OTP) ──────────────────────
  const finishFlow = useCallback(async () => {
    const submitted = await submitFlowForm(answers);
    if (!submitted) return;
    navigate("s-demo");
  }, [submitFlowForm, answers, navigate]);

  // ── render screens ────────────────────────────────────────────────────────
  const renderScreen = () => {
    switch (cur) {

      // ── Q2: ROLE
      case "s1": return (
        <>
          <button className="back" onClick={() => goBack(1)}><BackArrow />Back</button>
          <div className="q">What is your role at the studio?</div>
          <div className="sub">Let us know your role so we can tailor this conversation to the right decision-makers.</div>
          <div className="opts">
            {[
              { val: "owner",     tl: "Studio Owner or Managing Partner",     ds: "You run the business and make the final call on tools" },
              { val: "principal", tl: "Principal Designer",                    ds: "You lead design decisions and manage the wider team" },
              { val: "ops",       tl: "Operations Head or Office Manager",     ds: "You oversee how the studio runs day to day" },
              { val: "other",     tl: "Something else",                        ds: "Student, junior designer, intern, or just exploring personally" },
            ].map(o => (
              <button key={o.val} className={`opt${answers.role === o.val ? " on" : ""}`} onClick={() => pick("role", o.val)}>
                <div><div className="tl">{o.tl}</div><div className="ds">{o.ds}</div></div>
              </button>
            ))}
          </div>
        </>
      );

      // ── Q1: CONTACT + STUDIO DETAILS (first screen)
      case "s2": return (
        <>
          <div className="q">Tell us a bit about your studio.</div>
          <div className="sub">This helps us prepare the right context and reach you about your demo slot.</div>
          <div className="inp-row">
            <div className="inp-group">
              <div className="inp-label">Name</div>
              <input className="inp-field" type="text" placeholder="e.g. Rohan Mehta" maxLength={80}
                value={fullName} onChange={e => setFullName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") document.getElementById("email-input")?.focus(); }}
              />
            </div>
            <div className="inp-group">
              <div className="inp-label">Email</div>
              <input id="email-input" className="inp-field" type="email" placeholder="you@studio.com" maxLength={120}
                value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") document.getElementById("phone-input")?.focus(); }}
              />
            </div>
            <div className="inp-group">
              <div className="inp-label">Phone number</div>
              <div className="phone-wrap">
                <div className="country-pre">+91</div>
                <input id="phone-input" className="inp-field" type="tel" placeholder="98765 43210" maxLength={10} inputMode="numeric"
                  value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
                  onKeyDown={e => { if (e.key === "Enter") document.getElementById("studio-name-input")?.focus(); }}
                />
              </div>
            </div>
            <div className="inp-group">
              <div className="inp-label">Studio name</div>
              <input id="studio-name-input" className="inp-field" type="text" placeholder="e.g. Forma Design Studio" maxLength={80}
                value={studioName} onChange={e => setStudioName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") document.getElementById("city-input")?.focus(); }}
              />
            </div>
            <div className="inp-group">
              <div className="inp-label">City of operation</div>
              <input id="city-input" className="inp-field" type="text" placeholder="e.g. Bangalore" maxLength={60}
                value={studioCity} onChange={e => setStudioCity(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && isStep2Valid) advanceStudio(); }}
              />
            </div>
            <button className="btn" disabled={!isStep2Valid} onClick={advanceStudio}>Continue</button>
          </div>
        </>
      );

      // ── Q3: TEAM SIZE
      case "s3": return (
        <>
          <button className="back" onClick={() => goBack(2)}><BackArrow />Back</button>
          <div className="q">How many people are on your team?</div>
          <div className="sub">Count designers, project managers, site supervisors, and back-office staff.</div>
          <div className="opts g2">
            {[
              { val: "s5",     tl: "1 to 5",       ds: "Early stage" },
              { val: "s14",    tl: "6 to 14",      ds: "Growing studio" },
              { val: "s30",    tl: "15 to 30",     ds: "Established firm" },
              { val: "s60",    tl: "31 to 60",     ds: "Large practice" },
            ].map(o => (
              <button key={o.val} className={`opt${answers.team === o.val ? " on" : ""}`} onClick={() => pick("team", o.val)}>
                <div className="tl">{o.tl}</div><div className="ds">{o.ds}</div>
              </button>
            ))}
            <button className={`opt full-col${answers.team === "s60plus" ? " on" : ""}`} onClick={() => pick("team", "s60plus")}>
              <div className="tl">More than 60</div><div className="ds">Enterprise scale</div>
            </button>
          </div>
        </>
      );

      // ── Q4: ACTIVE PROJECTS
      case "s4": return (
        <>
          <button className="back" onClick={() => goBack(3)}><BackArrow />Back</button>
          <div className="q">How many live projects is your studio running right now?</div>
          <div className="sub">Active projects in execution or active design, not past work or pipeline leads.</div>
          <div className="opts g2">
            {[
              { val: "p2",     tl: "1 to 2",       ds: "Selective load" },
              { val: "p5",     tl: "3 to 5",       ds: "Steady pipeline" },
              { val: "p10",    tl: "6 to 10",      ds: "High volume" },
              { val: "p10plus",tl: "More than 10", ds: "Enterprise scale" },
            ].map(o => (
              <button key={o.val} className={`opt${answers.projects === o.val ? " on" : ""}`} onClick={() => pick("projects", o.val)}>
                <div className="tl">{o.tl}</div><div className="ds">{o.ds}</div>
              </button>
            ))}
          </div>
        </>
      );

      // ── Q5: BUSINESS TYPE
      case "s5": return (
        <>
          <button className="back" onClick={() => goBack(4)}><BackArrow />Back</button>
          <div className="q">What kind of projects does your studio primarily work on?</div>
          <div className="sub">Pick the one that best describes where most of your revenue comes from.</div>
          <div className="opts">
            {[
              { val: "resi",    tl: "Residential interior design",                        ds: "Apartments, villas, and private homes" },
              { val: "comm",    tl: "Commercial interior design",                         ds: "Offices, retail, hospitality, and commercial spaces" },
              { val: "turnkey", tl: "Turnkey projects",                                   ds: "Design, procurement, and site delivery end to end" },
              { val: "arch",    tl: "Architecture practice with an interiors arm",        ds: "Architecture-led but interiors is a meaningful part of the business" },
              { val: "other",   tl: "Landscape, civil, or construction without an interiors arm", ds: "Interiors is not the primary or a significant part of the work" },
            ].map(o => (
              <button key={o.val} className={`opt${answers.biz === o.val ? " on" : ""}`} onClick={() => pick("biz", o.val)}>
                <div><div className="tl">{o.tl}</div><div className="ds">{o.ds}</div></div>
              </button>
            ))}
          </div>
        </>
      );

      // ── Q6: MODULES
      case "s6": return (
        <>
          <button className="back" onClick={() => goBack(5)}><BackArrow />Back</button>
          <div className="q">Which areas are you looking to get control of?</div>
          <p className="mod-hint">Select all that apply. Your call will focus on exactly these.</p>
          <div className="mod-grid">
            {[
              { key: "crm",    label: "Sales CRM" },
              { key: "design", label: "Design Workflow" },
              { key: "proc",   label: "Procurement and BOQ" },
              { key: "inv",    label: "Inventory" },
              { key: "site",   label: "Site Execution" },
              { key: "acc",    label: "Accounts" },
              { key: "hr",     label: "HR and Payroll" },
              { key: "tasks",  label: "Task Management" },
            ].map(m => (
              <button key={m.key} className={`mod${mods.has(m.key) ? " on" : ""}`} onClick={() => toggleMod(m.key)}>
                <span className="tl">{m.label}</span>
              </button>
            ))}
          </div>
          <button className="btn" disabled={mods.size === 0} onClick={advanceMods}>Continue</button>
        </>
      );

      // ── Q7: CURRENT TOOLS
      case "s7": return (
        <>
          <button className="back" onClick={() => { setShowToolOther(false); goBack(6); }}><BackArrow />Back</button>
          <div className="q">What are you currently using to manage projects and leads?</div>
          <div className="sub">No judgment here. This just helps us show you a realistic migration path.</div>
          <div className="opts">
            {[
              { val: "sheets",   tl: "Spreadsheets",           ds: "Excel, Google Sheets, or similar" },
              { val: "chat",     tl: "WhatsApp and Email only", ds: "Conversations are how projects are tracked right now" },
              { val: "software", tl: "Another software",        ds: "We are already on a platform but looking to switch" },
              { val: "nothing",  tl: "Nothing formal",          ds: "Each project is managed however the team sees fit" },
            ].map(o => (
              <button key={o.val} className={`opt${answers.tools === o.val ? " on" : ""}`} onClick={() => pickTools(o.val)}>
                <div><div className="tl">{o.tl}</div><div className="ds">{o.ds}</div></div>
              </button>
            ))}
          </div>
          <div className={`reveal${showToolOther ? " open" : ""}`}>
            <input className="inp-field" type="text" placeholder="Which software? e.g. Houzz Pro, Studio Designer"
              maxLength={80} value={toolOther} onChange={e => setToolOther(e.target.value)} />
            <button className="btn" disabled={toolOther.trim().length < 2} style={{ marginTop: 10 }} onClick={advanceToolOther}>Continue</button>
          </div>
        </>
      );

      // ── Q8: TIMELINE
      case "s8": return (
        <>
          <button className="back" onClick={() => goBack(7)}><BackArrow />Back</button>
          <div className="q">When are you looking to bring a new system in?</div>
          <div className="sub">Be honest. It genuinely shapes how we spend the call.</div>
          <div className="opts">
            {[
              { val: "now",       tl: "This month",               ds: "We are actively evaluating and ready to move" },
              { val: "q90",       tl: "Within the next 90 days",  ds: "A decision is on the horizon for the studio" },
              { val: "exploring", tl: "Just exploring for now",    ds: "Mapping what is out there before committing to anything" },
            ].map(o => (
              <button key={o.val} className={`opt${answers.timeline === o.val ? " on" : ""}`} onClick={() => pick("timeline", o.val)}>
                <div><div className="tl">{o.tl}</div><div className="ds">{o.ds}</div></div>
              </button>
            ))}
          </div>
        </>
      );

      // ── Q9: BUDGET
      case "s9": return (
        <>
          <button className="back" onClick={() => goBack(8)}><BackArrow />Back</button>
          <div className="q">Is this investment aligned with your budget?</div>
          <div className="sub">Would your studio invest <strong>₹4–6K per team member annually</strong> for <strong>better project control and visibility</strong>?</div>
          <div className="budget-opts">
            <button className={`budget-card${answers.budget === "yes" ? " on" : ""}`} onClick={() => pick("budget", "yes")}>
              <div className="emo">✅</div>
              <div className="bl">Yes, that fits</div>
              <div className="bd">We are willing to invest in the right system</div>
            </button>
            <button className={`budget-card${answers.budget === "no" ? " on" : ""}`} onClick={() => pick("budget", "no")}>
              <div className="emo">🤔</div>
              <div className="bl">Not at this stage</div>
              <div className="bd">Let me check and come back</div>
            </button>
          </div>
        </>
      );

      // ── Q10: PHONE (carried forward from the popup, editable) ────────────
      case "s10": return (
        <>
          <button className="back" onClick={() => goBack(9)}><BackArrow />Back</button>
          <div className="eyebrow">Almost done</div>
          <div className="q">Confirm your mobile number.</div>
          <div className="sub">We will use this to get in touch and book your demo slot.</div>
          <div className="inp-row">
            <div className="inp-group">
              <div className="inp-label">Mobile number</div>
              <div className="phone-wrap">
                <div className="country-pre">+91</div>
                <input className="inp-field" type="tel" placeholder="98765 43210" maxLength={10} inputMode="numeric"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
                />
              </div>
            </div>
            {flowMsg && <p className="flow-msg">{flowMsg}</p>}
            <button className="btn" disabled={phone.length < 10 || isSubmitting} onClick={finishFlow}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </>
      );

      // ── EARLY EXIT: non-professional
      case "s-other": return (
        <div className="result">
          <div className="emblem read">📖</div>
          <div className="res-h">Here is the right place to start.</div>
          <div className="res-b">A one-on-one demo is best reserved for studios actively evaluating tools. But there is a lot you can explore on your own before that conversation makes sense.</div>
          <div className="links">
            {["Watch a 5-minute product walkthrough", "Start a free trial", "Browse the help docs"].map(label => (
              <a key={label} href="https://zygn.app" target="_blank" rel="noreferrer" className="link-row">
                {label}<ChevronRight />
              </a>
            ))}
          </div>
        </div>
      );

      // ── RESULT: SUCCESS
      case "s-demo": return (
        <div className="result">
          <div className="emblem go">✅</div>
          <div className="res-h">You're all set.</div>
<div className="res-b">Thank you! Your details have been successfully submitted.</div>                </div>
      );

      // ── RESULT: SELF-SERVE
      case "s-ss": return (
        <div className="result">
          <div className="emblem read">📖</div>
          <div className="res-h">Here is the best next step for you.</div>
          <div className="res-b">{ssBody}</div>
          <div className="links">
            {[
              "Watch a 5-minute product walkthrough",
              "Start the free trial",
              "See how other studios use zygn",
            ].map(label => (
              <a key={label} href="https://zygn.app" target="_blank" rel="noreferrer" className="link-row">
                {label}<ChevronRight />
              </a>
            ))}
          </div>
          <div className="divider">or</div>
          <button className="btn ghost" onClick={() => navigate("s-demo")}>I still want to talk to someone</button>
        </div>
      );

      default: return null;
    }
  };

  return (
    <div className="zygn-root">
      <div className="grid-bg" />
      <div className="shell">
        {/* HEADER */}
        <div className="hdr">
          <div className="logo">
            <img src="https://zygn.app/new_zygn_logo.png" alt="Zygn" onError={e => e.target.style.display = "none"} />
            <span className="logo-text">zygn</span>
          </div>
          <div className={`qcount${qcountText ? " show" : ""}`}>{qcountText}</div>
        </div>

        {/* PROGRESS BAR */}
        <div className="prog-rail">
          <div className="prog-bar" style={{ width: `${progressPct}%` }} />
        </div>

        {/* STEP CONTENT */}
        <Step animating={animating}>
          {renderScreen()}
        </Step>
      </div>
    </div>
  );
}