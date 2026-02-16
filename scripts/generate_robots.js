#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const HUB_HOST = "civilizationcaching.com";
const EXCLUDED_DIRS = new Set(["networklayer"]);
const SUPPORTED_TLDS = [".com", ".ai", ".systems"];

function getSiteFolders(rootDir) {
  return fs
    .readdirSync(rootDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => !EXCLUDED_DIRS.has(name))
    .filter((name) => fs.existsSync(path.join(rootDir, name, "index.html")))
    .sort((a, b) => a.localeCompare(b));
}

function folderToHost(folderName) {
  const normalized = folderName.toLowerCase();
  if (SUPPORTED_TLDS.some((tld) => normalized.endsWith(tld))) {
    return normalized;
  }
  return `${normalized}.com`;
}

function buildRobotsTxt(host) {
  const lines = ["User-agent: *", "Allow: /", "", `Sitemap: https://${host}/sitemap.xml`];
  if (host === HUB_HOST) {
    lines.push(`Sitemap: https://${host}/sitemap-index.xml`);
  }
  lines.push("");
  return lines.join("\n");
}

function main() {
  const siteFolders = getSiteFolders(ROOT);

  if (siteFolders.length === 0) {
    console.error("No site folders with index.html were found.");
    process.exitCode = 1;
    return;
  }

  for (const folderName of siteFolders) {
    const host = folderToHost(folderName);
    const robotsPath = path.join(ROOT, folderName, "robots.txt");
    fs.writeFileSync(robotsPath, buildRobotsTxt(host), "utf8");
  }

  console.log(`Generated robots.txt for ${siteFolders.length} site folders. (Hub=${HUB_HOST})`);
}

try {
  main();
} catch (error) {
  console.error("Robots generation failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
