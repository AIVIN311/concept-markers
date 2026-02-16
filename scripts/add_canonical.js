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
  const siteFolders = getSiteFolders(ROOT);

  if (siteFolders.length === 0) {
    console.error("No site folders with index.html were found.");
    process.exitCode = 1;
    return;
  }

  let changedCount = 0;
  const skipped = [];

  for (const folderName of siteFolders) {
    const host = folderToHost(folderName);
    const indexPath = path.join(ROOT, folderName, "index.html");
    const html = fs.readFileSync(indexPath, "utf8");

    const canonicalUrl = `https://${host}/`;
    const result = ensureCanonical(html, canonicalUrl);

    if (result.changed) {
      fs.writeFileSync(indexPath, result.html, "utf8");
      changedCount += 1;
    } else if (!/<link\b[^>]*\brel=["']canonical["'][^>]*>/i.test(html)) {
      skipped.push(folderName);
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