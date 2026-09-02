export const ROLE_MAP = {
  owner: "Studio Owner or Managing Partner",
  principal: "Principal Designer",
  ops: "Operations Head or Office Manager",
  other: "Something else",
};

export const TEAM_MAP = {
  s5: "1 to 5",
  s14: "6 to 14",
  s30: "15 to 30",
  s60: "31 to 60",
  s60plus: "More than 60",
};

export const PROJECTS_MAP = {
  p2: "1 to 2",
  p5: "3 to 5",
  p10: "6 to 10",
  p10plus: "More than 10",
};

export const BUSINESS_MAP = {
  resi: "Residential interior design",
  comm: "Commercial interior design",
  turnkey: "Turnkey projects",
  arch: "Architecture practice with an interiors arm",
  other: "Landscape, civil, or construction",
};

export const TOOLS_MAP = {
  sheets: "Spreadsheets (Excel, Google Sheets)",
  chat: "WhatsApp and Email only",
  software: "Another software",
  nothing: "Nothing formal",
};

export const TIMELINE_MAP = {
  now: "This month",
  q90: "Within the next 90 days",
  exploring: "Just exploring for now",
};

export const BUDGET_MAP = {
  yes: "Yes, that fits",
  no: "Not at this stage",
};

export const MODULE_MAP = {
  crm: "Sales CRM",
  design: "Design Workflow",
  proc: "Procurement and BOQ",
  inv: "Inventory",
  site: "Site Execution",
  acc: "Accounts",
  hr: "HR and Payroll",
  tasks: "Task Management",
};

export function getLabel(value, map, fallback = "Not provided") {
  if (!value) return fallback;
  return map[value] ?? value;
}

export function getModulesLabel(modules) {
  if (!modules?.length) return "None selected";
  return modules.map((m) => MODULE_MAP[m] ?? m).join(", ");
}
