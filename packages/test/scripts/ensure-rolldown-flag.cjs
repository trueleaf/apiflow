#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const projectRoot = process.cwd();
const cliPath = path.join(projectRoot, "node_modules", "vite", "dist", "node", "cli.js");

if (!fs.existsSync(cliPath)) {
  console.warn("[ensure-rolldown-flag] vite CLI not found, skipping patch");
  process.exit(0);
}

let source = fs.readFileSync(cliPath, "utf8");

if (source.includes("--experimental-rolldown")) {
  process.exit(0);
}

const replacements = [
  {
    pattern:
      '.option("-f, --filter <filter>", `[string] filter debug logs`).option("-m, --mode <mode>", `[string] set env mode`);',
    replacement:
      '.option("-f, --filter <filter>", `[string] filter debug logs`).option("--experimental-rolldown", `[boolean] enable Rolldown preview bundler`).option("-m, --mode <mode>", `[string] set env mode`);',
  },
  {
    pattern: 'delete ret.w;\n\tif ("sourcemap" in ret)',
    replacement:
      'delete ret.w;\n\tdelete ret.experimentalRolldown;\n\tif ("sourcemap" in ret)',
  },
  {
    pattern: 'filterDuplicateOptions(options);\n\tconst { createServer }',
    replacement:
      'filterDuplicateOptions(options);\n\tconst experimentalRolldown = options.experimentalRolldown;\n\tif (experimentalRolldown) process.env.VITE_EXPERIMENTAL_ROLLDOWN = "1";\n\tdelete options.experimentalRolldown;\n\tconst { createServer }',
  },
  {
    pattern: 'filterDuplicateOptions(options);\n\tconst { createBuilder }',
    replacement:
      'filterDuplicateOptions(options);\n\tconst experimentalRolldown = options.experimentalRolldown;\n\tif (experimentalRolldown) process.env.VITE_EXPERIMENTAL_ROLLDOWN = "1";\n\tdelete options.experimentalRolldown;\n\tconst { createBuilder }',
  },
];

for (const { pattern, replacement } of replacements) {
  const next = source.replace(pattern, replacement);
  if (next === source) {
    console.error(
      `[ensure-rolldown-flag] Failed to apply patch for pattern: ${pattern.slice(0, 60)}...`,
    );
    process.exit(1);
  }
  source = next;
}

fs.writeFileSync(cliPath, source, "utf8");
console.log("[ensure-rolldown-flag] Patched vite CLI to accept --experimental-rolldown");