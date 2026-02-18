#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { loadDomains } = require("./lib/domains");

const ROOT = process.cwd();

function gitLastMod(filePath) {
  try {
    const relativePath = path.relative(ROOT, filePath).replace(/\\/g, "/");
    const output = execSync(`git log -1 --format=%cs -- "${relativePath}"`, {
      cwd: ROOT,
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(output)) {
      return output;
    }
  } catch {
    // Fall through to UTC date fallback below.
  }

  return new Date().toISOString().slice(0, 10);
}

function buildSitemapXml(host, lastmod) {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    "  <url>",
    `    <loc>https://${host}/</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    "    <changefreq>daily</changefreq>",
    "    <priority>1.0</priority>",
    "  </url>",
    "</urlset>",
    "",
  ].join("\n");
}

function main() {
  const domains = loadDomains(ROOT);

  for (const domain of domains) {
    const lastmod = gitLastMod(domain.indexPath);
    const sitemapPath = path.join(ROOT, domain.folder, "sitemap.xml");
    const xml = buildSitemapXml(domain.host, lastmod);
    fs.writeFileSync(sitemapPath, xml, "utf8");
  }

  console.log(`Generated sitemap.xml for ${domains.length} sites.`);
  console.log("lastmod source: git commit date per site's index.html (fallback: today UTC).");
}

try {
  main();
} catch (error) {
  console.error("Sitemap generation failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
