import { handleLeadSubmission, checkDeskKey } from "./submitLead.js";
import { describeConfig } from "./config.js";

const LEAD_PATHS = new Set(["/api/submit-lead"]);
const HEALTH_PATHS = new Set(["/api/health", "/healthz"]);
const MAX_BODY_BYTES = 64 * 1024;

export function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error("Body too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

export function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.end(JSON.stringify(payload));
}

// Desk probe is cached so /api/health can be polled without hammering Desk.
// Pass ?check=1 to force a fresh probe (rate limited to 1 per 15s).
let lastCheck = null;
let lastCheckAt = 0;
const CACHE_MS = 60_000;
const FORCE_MIN_MS = 15_000;

export async function getDeskStatus({ force = false } = {}) {
  const now = Date.now();
  const age = now - lastCheckAt;
  const stale = !lastCheck || age > CACHE_MS;
  const canForce = force && age > FORCE_MIN_MS;
  if (stale || canForce) {
    lastCheck = await checkDeskKey();
    lastCheckAt = Date.now();
  }
  return lastCheck;
}

/** Routes API requests. Returns true when the request was handled. */
export async function handleApi(req, res) {
  const url = new URL(req.url || "/", "http://local");
  const path = url.pathname;

  if (LEAD_PATHS.has(path)) {
    if (req.method !== "POST") {
      sendJson(res, 405, { status: "error", message: "Method not allowed" });
      return true;
    }
    try {
      const body = await readJsonBody(req);
      const { httpStatus, body: payload } = await handleLeadSubmission(body);
      sendJson(res, httpStatus, payload);
    } catch (err) {
      console.error("[lead] bad request:", err.message);
      sendJson(res, 400, { status: "error", message: "Invalid request body", detail: err.message });
    }
    return true;
  }

  if (HEALTH_PATHS.has(path)) {
    if (req.method !== "GET" && req.method !== "HEAD") {
      sendJson(res, 405, { status: "error", message: "Method not allowed" });
      return true;
    }
    const desk = await getDeskStatus({ force: url.searchParams.get("check") === "1" });
    const cfg = describeConfig();
    const ok = desk.valid === true;
    sendJson(res, ok ? 200 : 503, {
      ok,
      service: "zygn-audit-flow",
      uptimeSec: Math.round(process.uptime()),
      config: cfg,
      deskKeyCheck: desk,
      hint: ok
        ? "Lead pipeline is ready."
        : "Fix DESK_API_KEY on the host (the .env file is NOT shipped in Docker), redeploy, then reload with ?check=1.",
    });
    return true;
  }

  return false;
}

export async function logStartupStatus() {
  const cfg = describeConfig();
  console.log(`[boot] NODE_ENV=${cfg.nodeEnv} port=${cfg.port}`);
  console.log(`[boot] Desk URL: ${cfg.desk.url}`);
  console.log(`[boot] Desk key: ${cfg.desk.keyMasked}${cfg.desk.keyLooksLikePlaceholder ? "  <-- PLACEHOLDER VALUE" : ""}`);
  const desk = await getDeskStatus({ force: true });
  if (desk.valid === true) {
    console.log(`[boot] Desk key check: OK. ${desk.message}`);
  } else {
    console.error(`[boot] Desk key check: FAILED. ${desk.message}`);
    console.error("[boot] Leads WILL fail until DESK_API_KEY is corrected on this host.");
  }
}
