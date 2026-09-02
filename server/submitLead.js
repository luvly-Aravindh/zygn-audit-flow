import { config, maskKey } from "./config.js";
import {
  ROLE_MAP,
  TEAM_MAP,
  PROJECTS_MAP,
  BUSINESS_MAP,
  TOOLS_MAP,
  TIMELINE_MAP,
  BUDGET_MAP,
  getLabel,
  getModulesLabel,
} from "./leadMaps.js";

const USER_SAFE_FAIL =
  "We could not save your details right now. Please try again in a moment.";

function field(obj, keys) {
  for (const key of keys) {
    const value = obj[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value).trim();
    }
  }
  return "";
}

function normalizeModules(raw) {
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch {
      return raw.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
}

function formatSubmittedAt() {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date());
}

export function parseLeadBody(body) {
  const fullName = field(body, ["full_name", "fullname", "name"]);
  const email = field(body, ["email"]).replace(/[\r\n]/g, "");
  const mobile = field(body, ["mobile", "phone"]);
  const countryCode = field(body, ["country_code"]) || "+91";
  const studioName = field(body, ["studio_name"]);
  const studioCity = field(body, ["studio_city", "city"]);
  const role = field(body, ["role"]);
  const team = field(body, ["team"]);
  const projects = field(body, ["projects"]);
  const businessType = field(body, ["business_type", "biz"]);
  const modules = normalizeModules(body.modules);
  const tools = field(body, ["tools"]);
  const toolOther = field(body, ["tool_other"]);
  const timeline = field(body, ["timeline"]);
  const budget = field(body, ["budget"]);
  const formType = field(body, ["form_type"]) || "flow";
  const page = field(body, ["page", "landing_page"]) || "";
  const honeypot = field(body, ["honeypot"]);

  if (honeypot) {
    return { honeypot: true };
  }
  if (!fullName || fullName.length < 2) {
    return { error: { status: 400, message: "Enter your full name" } };
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: { status: 400, message: "Invalid email" } };
  }
  if (!mobile || String(mobile).replace(/\D/g, "").length < 10) {
    return { error: { status: 400, message: "Enter valid phone number" } };
  }

  const deskFields = {
    form: "contact",
    honeypot: "",
    name: fullName.replace(/[\r\n]/g, ""),
    email,
    phone: `${countryCode}${mobile}`,
    country_code: countryCode,
    studio_name: studioName || "Not provided",
    studio_city: studioCity || "Not provided",
    current_role: getLabel(role, ROLE_MAP),
    team_size: getLabel(team, TEAM_MAP),
    projects: getLabel(projects, PROJECTS_MAP),
    business_type: getLabel(businessType, BUSINESS_MAP),
    modules: getModulesLabel(modules),
    tools: getLabel(tools, TOOLS_MAP),
    timeline: getLabel(timeline, TIMELINE_MAP),
    budget: getLabel(budget, BUDGET_MAP),
    form_type: formType,
    landing_page: page || "Not provided",
    submitted_at: formatSubmittedAt(),
    subject: `Zygn Flow Form Submission - ${fullName}`,
  };

  if (tools === "software" && toolOther) {
    deskFields.tool_other = toolOther;
  }

  return { deskFields };
}

class DeskError extends Error {
  constructor(message, { code, httpStatus, detail } = {}) {
    super(message);
    this.name = "DeskError";
    this.code = code || "DESK_ERROR";
    this.httpStatus = httpStatus || 502;
    this.detail = detail || message;
  }
}

async function readJson(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

async function submitToDesk(deskFields) {
  if (!config.deskApiKey) {
    console.error("[desk] API key is missing");
    throw new DeskError(USER_SAFE_FAIL, {
      code: "DESK_KEY_MISSING",
      httpStatus: 500,
      detail:
        "DESK_API_KEY is empty on this host. Set it in the host environment and redeploy.",
    });
  }

  console.log("[desk] Submitting lead to Desk...");
  console.log("[desk] URL:", config.deskUrl);
  console.log("[desk] Key:", maskKey(config.deskApiKey));

  let res;
  try {
    res = await fetch(config.deskUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.deskApiKey}`,
      },
      body: JSON.stringify(deskFields),
      signal: AbortSignal.timeout(20_000),
    });
  } catch (err) {
    console.error("[desk] Fetch failed:", err.message);
    throw new DeskError(USER_SAFE_FAIL, {
      code: "DESK_UNREACHABLE",
      httpStatus: 502,
      detail: `Could not reach Desk at ${config.deskUrl}: ${err.message}`,
    });
  }

  const data = await readJson(res);
  console.log("[desk] Response status:", res.status);

  if (data.duplicate) {
    console.log("[desk] Lead is duplicate");
    return { desk: data, duplicate: true };
  }

  if (res.status === 401 || res.status === 403) {
    console.error("[desk] API key rejected");
    throw new DeskError(USER_SAFE_FAIL, {
      code: "DESK_KEY_REJECTED",
      httpStatus: 500,
      detail: `Desk rejected the API key ${maskKey(config.deskApiKey)}: ${
        data.message || res.status
      }. Fix DESK_API_KEY on the host and redeploy.`,
    });
  }

  if (!res.ok) {
    console.error("[desk] Submission failed:", res.status, data);
    throw new DeskError(data.message || USER_SAFE_FAIL, {
      code: "DESK_REJECTED",
      httpStatus: res.status >= 400 && res.status < 500 ? res.status : 502,
      detail: `Desk answered ${res.status}: ${data.message || "(no message)"}`,
    });
  }

  console.log("[desk] Success! LeadID:", data.leadId);
  return { desk: data, duplicate: false };
}

/**
 * Handle one lead submission.
 * @returns {Promise<{ httpStatus: number, body: Record<string, unknown> }>}
 */
export async function handleLeadSubmission(body) {
  const parsed = parseLeadBody(body || {});

  if (parsed.honeypot) {
    return {
      httpStatus: 200,
      body: { status: "success", message: "Submitted", duplicate: false, skipped: true },
    };
  }
  if (parsed.error) {
    return {
      httpStatus: parsed.error.status,
      body: { status: "error", message: parsed.error.message },
    };
  }

  const { deskFields } = parsed;

  try {
    const deskResult = await submitToDesk(deskFields);
    return {
      httpStatus: 200,
      body: {
        status: "success",
        message: deskResult.duplicate ? "Lead accepted (duplicate)" : "Submitted",
        leadId: deskResult.desk.leadId,
        duplicate: deskResult.duplicate || false,
      },
    };
  } catch (err) {
    if (err instanceof DeskError) {
      console.error(`[lead] ${err.code}: ${err.detail}`);
      return {
        httpStatus: err.httpStatus,
        body: { status: "error", code: err.code, message: err.message, detail: err.detail },
      };
    }
    console.error("[lead] unexpected error:", err);
    return {
      httpStatus: 500,
      body: { status: "error", code: "UNEXPECTED", message: USER_SAFE_FAIL, detail: err.message },
    };
  }
}

/**
 * Probe Desk with an empty body. Desk answers 400 when the key is valid,
 * and 401/403 when it is not. No lead is created.
 */
export async function checkDeskKey() {
  const checkedAt = new Date().toISOString();
  if (!config.deskApiKey) {
    return { configured: false, valid: false, message: "DESK_API_KEY is empty on this host", checkedAt };
  }
  try {
    const res = await fetch(config.deskUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.deskApiKey}`,
      },
      body: "{}",
      signal: AbortSignal.timeout(8_000),
    });
    const data = await readJson(res);
    if (res.status === 401 || res.status === 403) {
      return { configured: true, valid: false, message: `Desk rejected key ${maskKey(config.deskApiKey)}: ${data.message || res.status}`, checkedAt };
    }
    if (res.status === 400 || res.ok) {
      return { configured: true, valid: true, message: `Desk accepted key ${maskKey(config.deskApiKey)}`, checkedAt };
    }
    return { configured: true, valid: null, message: `Desk answered ${res.status}: ${data.message || "(no message)"}`, checkedAt };
  } catch (err) {
    return { configured: true, valid: null, message: `Could not reach Desk at ${config.deskUrl}: ${err.message}`, checkedAt };
  }
}
