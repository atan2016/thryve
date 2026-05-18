/**
 * Write `avatarImage` bytes + API `avatarUrl` for a teacher slug.
 * Needed when DB bytes are stale (avatar API prefers `avatarImage` over `avatarUrl`).
 *
 * Usage: node scripts/sync-teacher-db-avatar-from-file.cjs <slug> <path-to-image>
 * Example: node scripts/sync-teacher-db-avatar-from-file.cjs ashley-tan public/assets/images/ashley-tan.png
 */
const { config } = require("dotenv");
const { existsSync, readFileSync } = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const { PrismaClient } = require("@prisma/client");

const root = path.join(__dirname, "..");
if (existsSync(path.join(root, ".env"))) {
  config({ path: path.join(root, ".env") });
}
if (existsSync(path.join(root, ".env.local"))) {
  config({ path: path.join(root, ".env.local"), override: true });
}

const prisma = new PrismaClient();

function guessMime(absPath) {
  const ext = path.extname(absPath).toLowerCase();
  if (ext === ".png") {
    return "image/png";
  }
  if (ext === ".webp") {
    return "image/webp";
  }
  if (ext === ".jpg" || ext === ".jpeg") {
    return "image/jpeg";
  }
  return "image/jpeg";
}

async function main() {
  const slug = process.argv[2]?.trim();
  const relOrAbs = process.argv[3]?.trim();
  if (!slug || !relOrAbs) {
    console.error(
      "Usage: node scripts/sync-teacher-db-avatar-from-file.cjs <slug> <image-path>\nExample: node scripts/sync-teacher-db-avatar-from-file.cjs ashley-tan public/assets/images/ashley-tan.png"
    );
    process.exit(1);
  }

  const imagePath = path.isAbsolute(relOrAbs) ? relOrAbs : path.join(root, relOrAbs);
  if (!existsSync(imagePath)) {
    console.error("Image not found:", imagePath);
    process.exit(1);
  }

  const buf = readFileSync(imagePath);
  if (buf.length === 0) {
    console.error("Image file is empty.");
    process.exit(1);
  }

  const mimeType = guessMime(imagePath);
  const teacher = await prisma.teacher.findUnique({
    where: { slug },
    select: { id: true, fullName: true }
  });

  if (!teacher) {
    console.error(`No teacher with slug "${slug}".`);
    process.exit(1);
  }

  await prisma.teacher.update({
    where: { id: teacher.id },
    data: {
      avatarImage: buf,
      avatarImageMimeType: mimeType,
      avatarUrl: `/api/teachers/${teacher.id}/avatar`
    }
  });

  console.log(`Avatar synced for ${teacher.fullName} (${slug}, id=${teacher.id}) from ${pathToFileURL(imagePath).href}`);
  console.log(`Mime: ${mimeType}, ${buf.length} bytes`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
