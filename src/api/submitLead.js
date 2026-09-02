let submitting = false;

// API lead endpoint (Node.js server only)
const LEAD_ENDPOINT = "/api/submit-lead";

/**
 * @param {Record<string, unknown>} fields
 * @returns {Promise<{ status?: string, leadId?: string, duplicate?: boolean, skipped?: boolean, message?: string }>}
 */
export async function submitFlowLead(fields) {
  if (submitting) {
    console.warn("[api] Submit already in progress");
    return { duplicate: true, skipped: true };
  }
  submitting = true;

  try {
    const payload = {
      honeypot: fields.honeypot || "",
      page: typeof window !== "undefined" ? window.location.href : "",
      ...fields,
    };

    console.log("[api] ========== REQUEST START ==========");
    console.log("[api] Sending to", LEAD_ENDPOINT);
    console.log("[api] Payload:", {
      full_name: payload.full_name,
      email: payload.email,
      mobile: payload.mobile,
      form_type: payload.form_type,
      fields_count: Object.keys(payload).length,
    });

    const res = await fetch(LEAD_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });

    console.log("[api] Response status:", res.status);

    let data = {};
    try {
      data = await res.json();
      console.log("[api] Response data:", data);
    } catch (parseErr) {
      console.error("[api] Failed to parse response:", parseErr);
      data = {};
    }

    if (data.duplicate) {
      console.log("[api] Duplicate lead detected");
      console.log("[api] ========== REQUEST END (DUPLICATE) ==========");
      return data;
    }

    if (!res.ok) {
      const errorMsg = data.message || data.detail || `Lead submit failed (${res.status})`;
      console.error("[api] HTTP error:", res.status, errorMsg, data);
      console.log("[api] ========== REQUEST END (ERROR) ==========");
      throw new Error(errorMsg);
    }

    console.log("[api] ========== REQUEST END (SUCCESS) ==========");
    return data;
  } catch (err) {
    console.error("[api] Fetch error:", err.message);
    throw err;
  } finally {
    submitting = false;
  }
}