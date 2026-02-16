#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = process.cwd();
const HUB_FOLDER = "civilizationcaching";
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

function buildSitemapIndex(entries) {
  const body = entries
    .map((entry) => {
      return [
        "  <sitemap>",
        `    <loc>${entry.loc}</loc>`,
        `    <lastmod>${entry.lastmod}</lastmod>`,
        "  </sitemap>",
      ].join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    body,
    "</sitemapindex>",
    "",
  ].join("\n");
}

function main() {
  const hubPath = path.join(ROOT, HUB_FOLDER);
  if (!fs.existsSync(hubPath) || !fs.existsSync(path.join(hubPath, "index.html"))) {
    console.error(`Hub folder not found or missing index.html: ${HUB_FOLDER}`);
    process.exitCode = 2;
    return;
  }

  const siteFolders = getSiteFolders(ROOT);
  const entries = siteFolders.map((folderName) => {
    const host = folderToHost(folderName);
    const indexPath = path.join(ROOT, folderName, "index.html");
    return {
      loc: `https://${host}/sitemap.xml`,
      lastmod: gitLastMod(indexPath),
    };
  });

  const xml = buildSitemapIndex(entries);
  fs.writeFileSync(path.join(hubPath, "sitemap-index.xml"), xml, "utf8");

  console.log(`Wrote ${HUB_FOLDER}/sitemap-index.xml with ${entries.length} sitemap entries.`);
  console.log("lastmod source: git commit date per site's index.html (fallback: today UTC).");
}

try {
  main();
} catch (error) {
  console.error("Sitemap index generation failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
