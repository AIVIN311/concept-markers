#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { loadDomains } = require("./lib/domains");

const ROOT = process.cwd();
const HUB_HOST = "civilizationcaching.com";

function buildRobotsTxt(host) {
  const lines = ["User-agent: *", "Allow: /", "", `Sitemap: https://${host}/sitemap.xml`];
  if (host === HUB_HOST) {
    lines.push(`Sitemap: https://${host}/sitemap-index.xml`);
  }
  lines.push("");
  return lines.join("\n");
}

function main() {
  const domains = loadDomains(ROOT);

  for (const domain of domains) {
    const robotsPath = path.join(ROOT, domain.folder, "robots.txt");
    const host = domain.host;
    fs.writeFileSync(robotsPath, buildRobotsTxt(host), "utf8");
  }

  console.log(`Generated robots.txt for ${domains.length} sites. (Hub=${HUB_HOST})`);
}

try {
  main();
} catch (error) {
  console.error("Robots generation failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
