import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineAgent } from "@grok/agent-sdk";

/** Parent repo root: static site files (index.html, resources/, …). */
const websiteRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

export default defineAgent({
  model: {
    id: "grok-4.7",
    params: [
      { id: "reasoning_effort", value: "high" },
      { id: "fast", value: "true" },
    ],
  },
  local: {
    cwd: websiteRoot,
  },
});
