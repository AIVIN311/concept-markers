const fs = require("fs");
const path = require("path");

const DOMAIN_INVENTORY_FILE = "domains.json";
const HOST_RE = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function normalizeHost(raw) {
  return String(raw || "")
    .trim()
    .toLowerCase();
}

function validateDomainInventoryShape(payload, sourcePath) {
  assert(payload && typeof payload === "object", `${sourcePath}: expected JSON object.`);
  assert(
    Number.isInteger(payload.schema_version),
    `${sourcePath}: schema_version must be integer.`,
  );
  assert(payload.schema_version >= 1, `${sourcePath}: schema_version must be >= 1.`);
  assert(Array.isArray(payload.domains), `${sourcePath}: domains must be an array.`);
  assert(payload.domains.length > 0, `${sourcePath}: domains must not be empty.`);
}

function loadDomains(rootDir = process.cwd()) {
  const inventoryPath = path.join(rootDir, DOMAIN_INVENTORY_FILE);
  assert(fs.existsSync(inventoryPath), `Missing ${DOMAIN_INVENTORY_FILE} in project root.`);

  const raw = fs.readFileSync(inventoryPath, "utf8");
  const payload = JSON.parse(raw);
  validateDomainInventoryShape(payload, inventoryPath);

  const seenFolders = new Set();
  const seenHosts = new Set();
  const domains = [];

  for (const [index, item] of payload.domains.entries()) {
    const row = index + 1;
    assert(item && typeof item === "object", `${inventoryPath}: domains[${row}] must be object.`);

    const folder = String(item.folder || "").trim();
    assert(folder.length > 0, `${inventoryPath}: domains[${row}].folder is required.`);
    assert(
      !folder.includes("/") && !folder.includes("\\"),
      `${inventoryPath}: domains[${row}].folder must be a single path segment.`,
    );
    assert(!seenFolders.has(folder), `${inventoryPath}: duplicate folder "${folder}".`);
    seenFolders.add(folder);

    const host = normalizeHost(item.host);
    assert(host.length > 0, `${inventoryPath}: domains[${row}].host is required.`);
    assert(
      item.host === host,
      `${inventoryPath}: domains[${row}].host must be lowercase canonical form.`,
    );
    assert(HOST_RE.test(host), `${inventoryPath}: domains[${row}].host is invalid (${host}).`);
    assert(!seenHosts.has(host), `${inventoryPath}: duplicate host "${host}".`);
    seenHosts.add(host);

    const indexPath = path.join(rootDir, folder, "index.html");
    assert(fs.existsSync(indexPath), `${inventoryPath}: missing ${folder}/index.html`);

    domains.push({
      folder,
      host,
      indexPath,
    });
  }

  return domains;
}

module.exports = {
  DOMAIN_INVENTORY_FILE,
  loadDomains,
};
