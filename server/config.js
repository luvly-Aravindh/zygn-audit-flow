import "dotenv/config";

// Strip common paste artifacts from host env vars: surrounding quotes,
// Windows CR, stray whitespace. A trailing space or "\r" on DESK_API_KEY is
// enough for Desk to answer "Invalid API key".
function clean(value) {
  if (value === undefined || value === null) return "";
  return String(value)
    .replace(/\r/g, "")
    .trim()
    .replace(/^["']+|["']+$/g, "")
    .trim();
}

export const DEFAULT_DESK_URL = "https://deskbackend.getnos.io/v1/lead";

export const config = {
  deskUrl: clean(process.env.DESK_URL) || DEFAULT_DESK_URL,
  deskApiKey: clean(process.env.DESK_API_KEY),
  port: Number(clean(process.env.PORT)) || 4173,
  nodeEnv: clean(process.env.NODE_ENV) || "development",
};

// Never log the full key. Prefix + suffix is enough to identify which key loaded.
export function maskKey(key) {
  if (!key) return "(empty)";
  if (key.length <= 10) return `${key[0]}***${key[key.length - 1]} (${key.length} chars)`;
  return `${key.slice(0, 6)}...${key.slice(-4)} (${key.length} chars)`;
}

export function describeConfig() {
  return {
    nodeEnv: config.nodeEnv,
    port: config.port,
    desk: {
      url: config.deskUrl,
      keyConfigured: Boolean(config.deskApiKey),
      keyMasked: maskKey(config.deskApiKey),
      keyLooksLikePlaceholder: /your_desk|placeholder|paste_/i.test(config.deskApiKey),
    },
  };
}
