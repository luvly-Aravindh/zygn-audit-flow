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

const DESK_URL = process.env.DESK_URL || "https://deskbackend.getnos.io/v1/lead";
const DESK_API_KEY = process.env.DESK_API_KEY || "";

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

  if (!fullName || fullName.length < 2) {
    return { error: { status: 400, message: "Enter your full name" } };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: { status: 400, message: "Invalid email" } };
  }
  if (!mobile || mobile.length < 10) {
    return { error: { status: 400, message: "Enter valid phone number" } };
  }

  const roleLabel = getLabel(role, ROLE_MAP);
  const teamLabel = getLabel(team, TEAM_MAP);
  const projectsLabel = getLabel(projects, PROJECTS_MAP);
  const businessLabel = getLabel(businessType, BUSINESS_MAP);
  const modulesLabel = getModulesLabel(modules);
  const toolsLabel = getLabel(tools, TOOLS_MAP);
  const timelineLabel = getLabel(timeline, TIMELINE_MAP);
  const budgetLabel = getLabel(budget, BUDGET_MAP);
  const submittedAt = formatSubmittedAt();

  const deskFields = {
    form: "contact",
    honeypot: field(body, ["honeypot"]),
    name: fullName.replace(/[\r\n]/g, ""),
    email,
    phone: `${countryCode}${mobile}`,
    country_code: countryCode,
    studio_name: studioName || "Not provided",
    studio_city: studioCity || "Not provided",
    current_role: roleLabel,
    team_size: teamLabel,
    projects: projectsLabel,
    business_type: businessLabel,
    modules: modulesLabel,
    tools: toolsLabel,
    timeline: timelineLabel,
    budget: budgetLabel,
    form_type: formType,
    landing_page: page || "Not provided",
    submitted_at: submittedAt,
    subject: `Zygn Flow Form Submission - ${fullName}`,
  };

  if (tools === "software" && toolOther) {
    deskFields.tool_other = toolOther;
  }

  return { deskFields };
}

async function submitToDesk(deskFields) {
  if (!DESK_API_KEY) {
    throw new Error("Desk API key is not configured");
  }

  const res = await fetch(DESK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DESK_API_KEY}`,
    },
    body: JSON.stringify(deskFields),
  });

  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (data.duplicate) {
    return { desk: data, duplicate: true };
  }

  if (!res.ok) {
    throw new Error(data.message || `Lead submit failed (${res.status})`);
  }

  return { desk: data, duplicate: false };
}

export async function handleLeadSubmission(body) {
  const parsed = parseLeadBody(body);
  if (parsed.error) return parsed.error;

  const deskResult = await submitToDesk(parsed.deskFields);

  return {
    status: "success",
    message: deskResult.duplicate ? "Lead accepted (duplicate)" : "Submitted",
    leadId: deskResult.desk.leadId,
    duplicate: deskResult.duplicate || false,
  };
}
