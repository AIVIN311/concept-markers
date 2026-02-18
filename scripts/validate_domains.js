#!/usr/bin/env node

const path = require("path");
const { DOMAIN_INVENTORY_FILE, loadDomains } = require("./lib/domains");

function main() {
  const root = process.cwd();
  const domains = loadDomains(root);
  const inventoryPath = path.join(root, DOMAIN_INVENTORY_FILE);

  console.log(`Domain inventory validated: ${domains.length} domains.`);
  console.log(`Source: ${inventoryPath}`);
}

try {
  main();
} catch (error) {
  console.error("Domain inventory validation failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
