import { handleApi, logStartupStatus } from "./http.js";

// Dev-only mirror of the production API so `npm run dev` behaves like live:
// POST /api/submit-lead, GET /api/health.
export function apiPlugin() {
  return {
    name: "zygn-api-plugin",
    configureServer(server) {
      server.httpServer?.once("listening", () => {
        logStartupStatus().catch((err) => console.error("[boot] status check failed:", err));
      });

      server.middlewares.use(async (req, res, next) => {
        try {
          if (await handleApi(req, res)) return;
        } catch (err) {
          console.error("[api] unhandled:", err);
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify({ status: "error", message: "Internal error" }));
          return;
        }
        next();
      });
    },
  };
}