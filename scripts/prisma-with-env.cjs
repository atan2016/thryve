/**
 * Prisma CLI only loads `.env` by default, not `.env.local`.
 * Next.js loads both; this keeps `DATABASE_URL` available for local Prisma commands.
 * CI passes secrets via the environment — no file needed.
 */
const { config } = require("dotenv");
const { spawnSync } = require("child_process");
const { existsSync } = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

if (existsSync(path.join(root, ".env"))) {
  config({ path: path.join(root, ".env") });
}
if (existsSync(path.join(root, ".env.local"))) {
  config({ path: path.join(root, ".env.local"), override: true });
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node scripts/prisma-with-env.cjs <prisma args...>");
  process.exit(1);
}

const result = spawnSync("npx", ["prisma", ...args], {
  stdio: "inherit",
  cwd: root,
  env: process.env,
  shell: true
});

process.exit(result.status ?? 1);
