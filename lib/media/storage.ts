import { mkdir, writeFile } from "fs/promises";
import path from "path";

const PROFILE_UPLOAD_DIRECTORY = path.join(process.cwd(), "public", "uploads", "profile-photos");
const STORY_UPLOAD_DIRECTORY = path.join(process.cwd(), "public", "uploads", "story-media");
const CERTIFICATION_UPLOAD_DIRECTORY = path.join(process.cwd(), "public", "uploads", "certifications");
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_STORY_MEDIA_BYTES = 15 * 1024 * 1024;
const MAX_CERTIFICATION_BYTES = 10 * 1024 * 1024;

function getFileExtension(file: File) {
  const originalExtension = path.extname(file.name).toLowerCase();

  if (originalExtension) {
    return originalExtension;
  }

  if (file.type === "image/png") return ".png";
  if (file.type === "application/pdf") return ".pdf";
  if (file.type === "image/webp") return ".webp";
  if (file.type === "image/gif") return ".gif";
  if (file.type === "video/mp4") return ".mp4";
  if (file.type === "video/webm") return ".webm";
  if (file.type === "video/quicktime") return ".mov";
  return ".jpg";
}

export async function saveProfileImage(file: File, teacherId: string) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Profile photo must be an image file.");
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Profile photo must be smaller than 5MB.");
  }

  await mkdir(PROFILE_UPLOAD_DIRECTORY, { recursive: true });

  const extension = getFileExtension(file);
  const fileName = `${teacherId}-${Date.now()}${extension}`;
  const filePath = path.join(PROFILE_UPLOAD_DIRECTORY, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(filePath, buffer);

  return `/uploads/profile-photos/${fileName}`;
}

export async function saveStoryMedia(file: File, teacherId: string) {
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");

  if (!isImage && !isVideo) {
    throw new Error("Story media must be an image or video file.");
  }

  if (file.size > MAX_STORY_MEDIA_BYTES) {
    throw new Error("Story media must be smaller than 15MB.");
  }

  await mkdir(STORY_UPLOAD_DIRECTORY, { recursive: true });

  const extension = getFileExtension(file);
  const fileName = `${teacherId}-story-${Date.now()}${extension}`;
  const filePath = path.join(STORY_UPLOAD_DIRECTORY, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(filePath, buffer);

  return {
    url: `/uploads/story-media/${fileName}`,
    type: isVideo ? ("video" as const) : ("image" as const)
  };
}

export async function saveCertificationDocument(file: File, teacherId: string) {
  const allowedTypes = new Set(["application/pdf", "image/png", "image/jpeg", "image/webp"]);

  if (!allowedTypes.has(file.type)) {
    throw new Error("Certification files must be a PDF, JPG, PNG, or WebP.");
  }

  if (file.size > MAX_CERTIFICATION_BYTES) {
    throw new Error("Certification files must be smaller than 10MB.");
  }

  await mkdir(CERTIFICATION_UPLOAD_DIRECTORY, { recursive: true });

  const extension = getFileExtension(file);
  const fileName = `${teacherId}-certification-${Date.now()}${extension}`;
  const filePath = path.join(CERTIFICATION_UPLOAD_DIRECTORY, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(filePath, buffer);

  return {
    url: `/uploads/certifications/${fileName}`,
    fileName: file.name || fileName,
    mimeType: file.type
  };
}
