#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { loadDomains } = require("./lib/domains");

const ROOT = process.cwd();

function extractLoc(xmlContent) {
  const match = xmlContent.match(/<loc>\s*([^<]+)\s*<\/loc>/i);
  return match ? match[1].trim() : "";
}

function main() {
  const domains = loadDomains(ROOT);

  const errors = [];

  for (const domain of domains) {
    const expectedLoc = `https://${domain.host}/`;
    const sitemapPath = path.join(ROOT, domain.folder, "sitemap.xml");
    const txtPath = path.join(ROOT, domain.folder, "sitemap.xml.txt");

    if (!fs.existsSync(sitemapPath)) {
      errors.push(`${domain.folder}: missing sitemap.xml`);
    } else {
      const xmlContent = fs.readFileSync(sitemapPath, "utf8");
      const actualLoc = extractLoc(xmlContent);

      if (!actualLoc) {
        errors.push(`${domain.folder}: <loc> not found in sitemap.xml`);
      } else if (actualLoc !== expectedLoc) {
        errors.push(`${domain.folder}: <loc> mismatch (expected ${expectedLoc}, got ${actualLoc})`);
      }
    }

    if (fs.existsSync(txtPath)) {
      errors.push(`${domain.folder}: unexpected sitemap.xml.txt found`);
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

  console.log(`Sitemap validation passed for ${domains.length} sites.`);
}

try {
  main();
} catch (error) {
  console.error("Sitemap validation failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
