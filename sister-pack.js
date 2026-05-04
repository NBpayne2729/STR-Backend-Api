const express = require("express");

const router = express.Router();

const nowIso = () => new Date().toISOString();

const sisterProfiles = [
  { id: "sis_001", name: "Nova", avatar: "🛡️", distanceMiles: 0.6, verified: true, safetyMode: "guardian" },
  { id: "sis_002", name: "Rae", avatar: "💜", distanceMiles: 1.2, verified: true, safetyMode: "commute" },
  { id: "sis_003", name: "Skye", avatar: "✨", distanceMiles: 2.7, verified: false, safetyMode: "night-out" },
];

const safetyModes = [
  { id: "guardian", label: "Guardian Mode", description: "Live location sharing + pulse check every 5 min." },
  { id: "night-out", label: "Night Out Mode", description: "Venue timeline, fallback ride alert, and rapid SOS." },
  { id: "commute", label: "Commute Mode", description: "Arrival timer with escalation to trusted contacts." },
  { id: "stealth", label: "Stealth Mode", description: "Low-visibility tracking and one-tap discreet trigger." },
];

const betaAnalytics = {
  activeUsers7d: 182,
  sosTriggered7d: 14,
  averageResponseSeconds: 41,
  successfulCheckInsRate: 0.94,
  affiliateClicks7d: 227,
  safetyModeUsage: {
    guardian: 61,
    "night-out": 74,
    commute: 36,
    stealth: 11,
  },
};

const responderQueue = [];

router.get("/api/config", (req, res) => {
  res.json({
    data: {
      brand: {
        name: "Sister Pack",
        motif: "shield",
        palette: {
          background: "#05040A",
          glowPrimary: "#F24DFF",
          glowSecondary: "#7A5CFF",
          accent: "#22F0FF",
        },
      },
      privacy: {
        emergencyContactsMaskedByDefault: true,
        safeWordEnabled: true,
      },
    },
  });
});

router.get("/api/network/nearby", (req, res) => {
  const maxDistance = Number(req.query.maxDistance || 5);
  res.json({ data: sisterProfiles.filter((p) => p.distanceMiles <= maxDistance) });
});

router.get("/api/safety-modes", (req, res) => res.json({ data: safetyModes }));

router.post("/api/sos", (req, res) => {
  const { userId, location, mode = "manual", safeWordTriggered = false } = req.body;
  if (!userId || !location) {
    return res.status(400).json({ error: "userId and location are required" });
  }

  const alert = {
    id: `sos_${Date.now()}`,
    userId,
    location,
    mode,
    safeWordTriggered,
    status: "broadcasted",
    createdAt: nowIso(),
  };

  responderQueue.unshift(alert);

  return res.status(201).json({ data: alert });
});

router.get("/api/responders/queue", (req, res) => {
  res.json({ data: responderQueue.slice(0, 25) });
});

router.get("/api/admin/beta-analytics", (req, res) => {
  res.json({ data: { ...betaAnalytics, asOf: nowIso() } });
});

router.get("/api/marketing/preview-assets", (req, res) => {
  res.json({
    data: [
      { id: "asset_hero", type: "hero", title: "Dark Shield Hero", ratio: "16:9" },
      { id: "asset_sos", type: "feature", title: "SOS Flow Screen", ratio: "9:19.5" },
      { id: "asset_network", type: "feature", title: "Nearby Sisters Map", ratio: "9:19.5" },
      { id: "asset_profile", type: "feature", title: "Avatar + Sticker Creator", ratio: "9:19.5" },
      { id: "asset_store", type: "appstore", title: "App Store Preview Set", ratio: "6.5:3" },
    ],
  });
});

router.get("/", (req, res) => {
  res.type("html").send(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Sister Pack Beta Preview</title>
<style>
:root{--bg:#05040A;--card:#111022;--pink:#F24DFF;--purple:#7A5CFF;--cyan:#22F0FF;--text:#EDE9FF}
*{box-sizing:border-box} body{margin:0;font-family:Inter,system-ui;background:radial-gradient(circle at 20% 0%, #1A1435 0, var(--bg) 45%);color:var(--text)}
.wrap{max-width:1100px;margin:0 auto;padding:2rem 1rem 4rem}
.badge{display:inline-block;border:1px solid var(--pink);padding:.25rem .65rem;border-radius:999px;box-shadow:0 0 18px #f24dff80}
.hero{display:grid;grid-template-columns:1.2fr .8fr;gap:1rem;align-items:center;margin-top:1rem}
.card{background:linear-gradient(140deg,#111022,#0b0a18);border:1px solid #ffffff22;border-radius:18px;padding:1rem;box-shadow:0 0 24px #7a5cff40}
h1{font-size:clamp(2rem,4vw,3.25rem);margin:.5rem 0} h2{margin:.2rem 0 .8rem}
.glow{color:var(--pink);text-shadow:0 0 18px #f24dffaa}.shield{font-size:5rem;text-align:center}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:1rem;margin-top:1rem}
button{border:none;background:linear-gradient(90deg,var(--pink),var(--purple));color:white;padding:.65rem 1rem;border-radius:10px;cursor:pointer;font-weight:700}
.small{font-size:.9rem;color:#c9c2ff}
pre{background:black;border-radius:12px;padding:1rem;overflow:auto;color:#88ffd8;min-height:120px}
</style>
</head>
<body><div class="wrap">
<span class="badge">Sister Pack • Beta Build</span>
<section class="hero">
<div>
<h1><span class="glow">Shield-first</span> safety tech for every Sister.</h1>
<p>Dark feminine interface, one-tap SOS, safe word, privacy-first contacts, responder queue, and beta analytics.</p>
<button onclick="demoSOS()">Trigger Demo SOS</button>
<p class="small">This is a separate preview route and does not alter existing production endpoints.</p>
</div>
<div class="card"><div class="shield">🛡️</div><p class="small">Core flows: SOS • Nearby Sisters • Safety Modes • Profile Creator • Admin Beta Dashboard • Marketing Assets • Affiliate Trackers</p></div>
</section>
<section class="grid">
<div class="card"><h2>SOS Flow</h2><p>Manual + safe word triggers with responder queue dispatch.</p></div>
<div class="card"><h2>Nearby Sisters Network</h2><p>Distance-aware list with verification state.</p></div>
<div class="card"><h2>Safety Modes</h2><p>Guardian, Night Out, Commute, Stealth.</p></div>
<div class="card"><h2>Privacy Controls</h2><p>Emergency contacts masked by default.</p></div>
</section>
<div class="card" style="margin-top:1rem"><h2>Live API Response</h2><pre id="out">Press “Trigger Demo SOS” to simulate alert flow.</pre></div>
</div>
<script>
async function demoSOS(){
  const res = await fetch('/sister-pack/api/sos',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({userId:'beta_user_1',location:{lat:40.71,lng:-74.0},mode:'button',safeWordTriggered:false})});
  const data = await res.json();
  document.getElementById('out').textContent = JSON.stringify(data,null,2);
}
</script></body></html>`);
});

module.exports = router;
