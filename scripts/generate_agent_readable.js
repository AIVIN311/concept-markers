#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { loadDomains } = require("./lib/domains");

const ROOT = process.cwd();
const CHECK_ONLY = process.argv.includes("--check");
const MARKDOWN_LINK_RE =
  /[ \t]*<link\s+rel="alternate"\s+type="text\/markdown"\s+href="[^"]+"(?:\s*\/)?>\r?\n?/i;

function fail(message) {
  throw new Error(message);
}

function decodeHtml(value) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

function normalizeWhitespace(value) {
  return decodeHtml(value)
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function htmlInlineToMarkdown(value) {
  return normalizeWhitespace(
    value
      .replace(/<\s*br\s*\/?>/gi, "\n")
      .replace(/<\s*strong\s*>/gi, "**")
      .replace(/<\s*\/\s*strong\s*>/gi, "**")
      .replace(/<\s*em\s*>/gi, "_")
      .replace(/<\s*\/\s*em\s*>/gi, "_")
      .replace(/<[^>]+>/g, ""),
  );
}

function extractFirst(pattern, html, label, folder) {
  const match = html.match(pattern);
  if (!match) {
    fail(`${folder}: missing ${label}.`);
  }
  return match[1];
}

function extractTitle(html, folder) {
  const h1 = extractFirst(/<h1[^>]*>([\s\S]*?)<\/h1>/i, html, "h1", folder);
  return htmlInlineToMarkdown(h1);
}

function extractSeries(html, folder) {
  return extractFirst(/<html[^>]*\bdata-series="([^"]+)"/i, html, "html data-series", folder);
}

function extractRelated(html) {
  const match = html.match(/<meta\s+name="related"\s+content="([^"]*)"\s*\/?>/i);
  if (!match) {
    return [];
  }
  return match[1]
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function extractSection(html, lang, folder) {
  const pattern = new RegExp(
    `<section\\b[^>]*data-lang="${lang}"[^>]*>([\\s\\S]*?)<\\/section>`,
    "i",
  );
  const body = extractFirst(pattern, html, `section data-lang="${lang}"`, folder);
  const paragraphs = [];
  const paragraphPattern = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match;
  while ((match = paragraphPattern.exec(body))) {
    const text = htmlInlineToMarkdown(match[1]);
    if (text) {
      paragraphs.push(text);
    }
  }
  if (paragraphs.length === 0) {
    fail(`${folder}: section data-lang="${lang}" has no paragraphs.`);
  }
  return paragraphs;
}

function buildMarkdown({ host, title, series, related, english, chinese }) {
  const lines = [
    `# ${title}`,
    "",
    `Canonical URL: https://${host}/`,
    "",
    `Series: ${series}`,
    "",
    "Related concepts:",
    "",
  ];

  if (related.length > 0) {
    for (const item of related) {
      lines.push(`- ${item}`);
    }
  } else {
    lines.push("- none");
  }

  lines.push("", "## English", "", ...english.flatMap((paragraph) => [paragraph, ""]));
  lines.push("## 中文", "", ...chinese.flatMap((paragraph) => [paragraph, ""]));

  return `${lines.join("\n").trim()}\n`;
}

function buildHeaders(host) {
  return [
    "# Agent-readable Markdown header.",
    "# This advertises a real static Markdown artifact only; no API/MCP capability is implied.",
    "",
    `https://${host}/`,
    `  Link: <https://${host}/index.md>; rel="alternate"; type="text/markdown"`,
    "",
  ].join("\n");
}

function markdownLink(host) {
  const singleLine = `    <link rel="alternate" type="text/markdown" href="https://${host}/index.md" />`;
  if (singleLine.length <= 100) {
    return `${singleLine}\n`;
  }

  return [
    "    <link",
    '      rel="alternate"',
    '      type="text/markdown"',
    `      href="https://${host}/index.md"`,
    "    />",
    "",
  ].join("\n");
}

function ensureMarkdownAlternate(html, host, folder) {
  const nextLink = markdownLink(host);
  if (MARKDOWN_LINK_RE.test(html)) {
    return html.replace(MARKDOWN_LINK_RE, nextLink);
  }

  const anchor = /([ \t]*<link\s+rel="alternate"\s+hreflang="x-default"[^>]*\/>\r?\n)/i;
  if (!anchor.test(html)) {
    fail(`${folder}: missing x-default alternate link anchor.`);
  }
  return html.replace(anchor, `$1${nextLink}`);
}

function writeIfChanged(filePath, content, changed) {
  const current = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : null;
  if (current === content) {
    return false;
  }

  changed.push(path.relative(ROOT, filePath).replace(/\\/g, "/"));
  if (!CHECK_ONLY) {
    fs.writeFileSync(filePath, content, "utf8");
  }
  return true;
}

function main() {
  const domains = loadDomains(ROOT);
  const changed = [];

  for (const domain of domains) {
    const html = fs.readFileSync(domain.indexPath, "utf8");
    const title = extractTitle(html, domain.folder);
    const series = extractSeries(html, domain.folder);
    const related = extractRelated(html);
    const english = extractSection(html, "en", domain.folder);
    const chinese = extractSection(html, "zh", domain.folder);
    const folderPath = path.join(ROOT, domain.folder);

    const nextHtml = ensureMarkdownAlternate(html, domain.host, domain.folder);
    const markdown = buildMarkdown({
      host: domain.host,
      title,
      series,
      related,
      english,
      chinese,
    });
    const headers = buildHeaders(domain.host);

    writeIfChanged(domain.indexPath, nextHtml, changed);
    writeIfChanged(path.join(folderPath, "index.md"), markdown, changed);
    writeIfChanged(path.join(folderPath, "_headers"), headers, changed);
  }

  if (changed.length > 0) {
    console.log(`${CHECK_ONLY ? "Out of sync" : "Updated"} ${changed.length} file(s):`);
    for (const file of changed) {
      console.log(`- ${file}`);
    }
    if (CHECK_ONLY) {
      process.exitCode = 1;
    }
    return;
  }

  console.log(`Agent-readable artifacts are in sync for ${domains.length} sites.`);
}

try {
  main();
} catch (error) {
  console.error("Agent-readable generation failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
