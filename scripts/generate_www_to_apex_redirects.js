#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { loadDomains } = require("./lib/domains");

const ROOT = process.cwd();
const OUT_PATH = path.join(ROOT, "infra", "www-to-apex-redirects-v1.csv");

function buildRows(domains) {
  return domains.map((domain) => {
    return `https://www.${domain.host}/*,https://${domain.host}/$1,301`;
  });
}

function main() {
  const domains = loadDomains(ROOT);
  const header = "Source URL,Target URL,Status Code";
  const content = [header, ...buildRows(domains), ""].join("\n");

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, content, "utf8");

  console.log(`Generated ${OUT_PATH} from domains.json (${domains.length} rows).`);
}

try {
  main();
} catch (error) {
  console.error("WWW redirect CSV generation failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
