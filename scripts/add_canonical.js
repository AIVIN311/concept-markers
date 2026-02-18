#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { loadDomains } = require("./lib/domains");

const ROOT = process.cwd();

function detectEol(text) {
  return text.includes("\r\n") ? "\r\n" : "\n";
}

function ensureCanonical(html, canonicalUrl) {
  const canonicalRe = /<link\b[^>]*\brel=["']canonical["'][^>]*>/i;
  if (canonicalRe.test(html)) {
    return { html, changed: false };
  }

  const eol = detectEol(html);
  const linkTag = `    <link rel="canonical" href="${canonicalUrl}" />`;

  if (/<\/title>/i.test(html)) {
    return {
      html: html.replace(/<\/title>/i, (match) => `${match}${eol}${linkTag}`),
      changed: true,
    };
  }

  if (/<head[^>]*>/i.test(html)) {
    return {
      html: html.replace(/<head[^>]*>/i, (match) => `${match}${eol}${linkTag}`),
      changed: true,
    };
  }

  return { html, changed: false };
}

function main() {
  const domains = loadDomains(ROOT);

  let changedCount = 0;
  const skipped = [];

  for (const domain of domains) {
    const indexPath = path.join(ROOT, domain.folder, "index.html");
    const html = fs.readFileSync(indexPath, "utf8");

    const canonicalUrl = `https://${domain.host}/`;
    const result = ensureCanonical(html, canonicalUrl);

    if (result.changed) {
      fs.writeFileSync(indexPath, result.html, "utf8");
      changedCount += 1;
    } else if (!/<link\b[^>]*\brel=["']canonical["'][^>]*>/i.test(html)) {
      skipped.push(domain.folder);
    }
  }

  console.log(`Canonical ensured. Updated ${changedCount} index.html files.`);

  if (skipped.length > 0) {
    console.warn(`Skipped ${skipped.length} files without a detectable <head> or </title> anchor.`);
    for (const folderName of skipped) {
      console.warn(`- ${folderName}/index.html`);
    }
  }
}

try {
  main();
} catch (error) {
  console.error("Canonical ensure failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
