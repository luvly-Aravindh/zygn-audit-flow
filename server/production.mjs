import "dotenv/config";
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { handleLeadSubmission } from "./submitLead.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const distDir = join(__dirname, "..", "dist");
const port = Number(process.env.PORT) || 4173;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

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
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function serveStatic(req, res) {
  let pathname = req.url.split("?")[0];
  if (pathname === "/") pathname = "/index.html";

  const filePath = join(distDir, pathname);
  const safePath = join(distDir, pathname.replace(/^(\.\.[/\\])+/, ""));
  if (!safePath.startsWith(distDir)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  const candidates = existsSync(safePath) && !safePath.endsWith("/")
    ? [safePath]
    : [join(distDir, "index.html")];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      const ext = extname(candidate);
      res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
      res.end(readFileSync(candidate));
      return;
    }
  }

  res.writeHead(404);
  res.end("Not found");
}

createServer(async (req, res) => {
  if (req.url === "/api/submit-lead" && req.method === "POST") {
    try {
      const body = await readJsonBody(req);
      const result = await handleLeadSubmission(body);
      const status = result.status === "success" ? 200 : result.status || 500;
      sendJson(res, status, result);
    } catch (err) {
      console.error("Lead submit error:", err);
      sendJson(res, 500, { status: "error", message: err.message || "Submission failed" });
    }
    return;
  }

  if (req.method === "GET" || req.method === "HEAD") {
    serveStatic(req, res);
    return;
  }

  res.writeHead(405);
  res.end("Method not allowed");
}).listen(port, () => {
  console.log(`Zygn audit flow running on http://localhost:${port}`);
});
