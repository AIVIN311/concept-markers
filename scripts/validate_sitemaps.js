#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
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

function extractLoc(xmlContent) {
  const match = xmlContent.match(/<loc>\s*([^<]+)\s*<\/loc>/i);
  return match ? match[1].trim() : "";
}

function main() {
  const siteFolders = getSiteFolders(ROOT);

  if (siteFolders.length === 0) {
    console.error("No site folders with index.html were found.");
    process.exitCode = 1;
    return;
  }

  const errors = [];

  for (const folderName of siteFolders) {
    const expectedLoc = `https://${folderToHost(folderName)}/`;
    const sitemapPath = path.join(ROOT, folderName, "sitemap.xml");
    const txtPath = path.join(ROOT, folderName, "sitemap.xml.txt");

    if (!fs.existsSync(sitemapPath)) {
      errors.push(`${folderName}: missing sitemap.xml`);
    } else {
      const xmlContent = fs.readFileSync(sitemapPath, "utf8");
      const actualLoc = extractLoc(xmlContent);

      if (!actualLoc) {
        errors.push(`${folderName}: <loc> not found in sitemap.xml`);
      } else if (actualLoc !== expectedLoc) {
        errors.push(`${folderName}: <loc> mismatch (expected ${expectedLoc}, got ${actualLoc})`);
      }
    }

    if (fs.existsSync(txtPath)) {
      errors.push(`${folderName}: unexpected sitemap.xml.txt found`);
    }
  }

  if (errors.length > 0) {
    console.error(`Sitemap validation failed with ${errors.length} error(s):`);
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`Sitemap validation passed for ${siteFolders.length} site folders.`);
}

try {
  main();
} catch (error) {
  console.error("Sitemap validation failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}