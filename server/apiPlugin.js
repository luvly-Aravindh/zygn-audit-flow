import { handleLeadSubmission } from "./submitLead.js";

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
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

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

export function apiPlugin() {
  return {
    name: "zygn-api-plugin",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url !== "/api/submit-lead" || req.method !== "POST") {
          next();
          return;
        }

        try {
          const body = await readJsonBody(req);
          const result = await handleLeadSubmission(body);
          const status = result.status === "success" ? 200 : result.status || 500;
          sendJson(res, status, result);
        } catch (err) {
          console.error("Lead submit error:", err);
          sendJson(res, 500, {
            status: "error",
            message: err.message || "Submission failed",
          });
        }
      });
    },
  };
}
