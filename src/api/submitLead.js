let submitting = false;

/**
 * @param {Record<string, unknown>} fields
 * @returns {Promise<{ status?: string, leadId?: string, duplicate?: boolean, skipped?: boolean, message?: string }>}
 */
export async function submitFlowLead(fields) {
  if (submitting) return { duplicate: true, skipped: true };
  submitting = true;

  try {
    const res = await fetch("/api/submit-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        honeypot: fields.honeypot || "",
        page: typeof window !== "undefined" ? window.location.href : "",
        ...fields,
      }),
      keepalive: true,
    });

    let data = {};
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    if (data.duplicate) return data;

    if (!res.ok) {
      throw new Error(data.message || `Lead submit failed (${res.status})`);
    }

    return data;
  } finally {
    submitting = false;
  }
}
