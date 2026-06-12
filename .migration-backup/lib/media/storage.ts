import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { getEventImageMaxBytes } from "@/lib/teacher-upcoming-event-image";

const PROFILE_UPLOAD_DIRECTORY = path.join(process.cwd(), "public", "uploads", "profile-photos");
const EVENT_IMAGE_UPLOAD_DIRECTORY = path.join(process.cwd(), "public", "uploads", "event-images");
const STORY_UPLOAD_DIRECTORY = path.join(process.cwd(), "public", "uploads", "story-media");
const CERTIFICATION_UPLOAD_DIRECTORY = path.join(process.cwd(), "public", "uploads", "certifications");
const RESUME_UPLOAD_DIRECTORY = path.join(process.cwd(), "public", "uploads", "resumes");
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_STORY_MEDIA_BYTES = 15 * 1024 * 1024;
const MAX_CERTIFICATION_BYTES = 10 * 1024 * 1024;
const MAX_RESUME_BYTES = 10 * 1024 * 1024;

function getFileExtension(file: File) {
  const originalExtension = path.extname(file.name).toLowerCase();

  if (originalExtension) {
    return originalExtension;
  }

  if (file.type === "image/png") return ".png";
  if (file.type === "application/pdf") return ".pdf";
  if (file.type === "text/plain") return ".txt";
  if (file.type === "text/markdown") return ".md";
  if (file.type === "application/rtf") return ".rtf";
  if (file.type === "application/msword") return ".doc";
  if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return ".docx";
  if (file.type === "image/webp") return ".webp";
  if (file.type === "image/gif") return ".gif";
  if (file.type === "video/mp4") return ".mp4";
  if (file.type === "video/webm") return ".webm";
  if (file.type === "video/quicktime") return ".mov";
  return ".jpg";
}

export async function readProfileImageForDatabase(file: File): Promise<{ buffer: Buffer; mimeType: string }> {
  const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp"]);

  if (!allowedTypes.has(file.type)) {
    throw new Error("Profile photo must be a JPG, PNG, or WebP image.");
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Profile photo must be smaller than 5MB.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type?.trim() || "application/octet-stream";

  return { buffer, mimeType };
}

/** @deprecated Disk writes do not persist on serverless — use `readProfileImageForDatabase` and DB `Teacher.avatarImage`. */
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

export type EventImagePayload = {
  bytes: Buffer;
  mimeType: string;
};

/**
 * Reads and validates an uploaded event image for persistence in the database
 * (`TeacherUpcomingEvent.eventImage`). Max size is `EVENT_IMAGE_MAX_BYTES` or 5MB default.
 */
export async function readEventImageForDatabase(file: File): Promise<EventImagePayload> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Event image must be an image file.");
  }

  const maxBytes = getEventImageMaxBytes();
  if (file.size > maxBytes) {
    const mb = (maxBytes / (1024 * 1024)).toFixed(1);
    throw new Error(`Event image must be smaller than ${mb}MB (limit from EVENT_IMAGE_MAX_BYTES).`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type?.trim() || "application/octet-stream";

  return { bytes: buffer, mimeType };
}

/** @deprecated Prefer `readEventImageForDatabase` — disk uploads do not persist on serverless hosts. */
export async function saveEventImage(file: File, teacherId: string) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Event image must be an image file.");
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Event image must be smaller than 5MB.");
  }

  await mkdir(EVENT_IMAGE_UPLOAD_DIRECTORY, { recursive: true });

  const extension = getFileExtension(file);
  const fileName = `${teacherId}-event-${Date.now()}${extension}`;
  const filePath = path.join(EVENT_IMAGE_UPLOAD_DIRECTORY, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(filePath, buffer);

  return `/uploads/event-images/${fileName}`;
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

/** @deprecated Disk path not available on serverless — use `readCertificationFileForDatabase` and DB-backed `fileData` instead. */
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

/**
 * Reads and validates a certification upload for persistence in Postgres (`TeacherCertificationSubmission.fileData`).
 * Use this on serverless hosts; disk uploads in `saveCertificationDocument` are not writable on Vercel.
 */
export async function readCertificationFileForDatabase(file: File): Promise<{ buffer: Buffer; fileName: string; mimeType: string }> {
  const allowedTypes = new Set(["application/pdf", "image/png", "image/jpeg", "image/webp"]);

  if (!allowedTypes.has(file.type)) {
    throw new Error("Certification files must be a PDF, JPG, PNG, or WebP.");
  }

  if (file.size > MAX_CERTIFICATION_BYTES) {
    throw new Error("Certification files must be smaller than 10MB.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const extension = getFileExtension(file);
  const fileName = (file.name?.trim() || `certification${extension}`).slice(0, 240);

  return {
    buffer,
    fileName,
    mimeType: file.type
  };
}

export async function saveTeacherResume(file: File, teacherId: string) {
  const allowedTypes = new Set([
    "application/pdf",
    "text/plain",
    "text/markdown",
    "application/rtf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ]);

  if (!allowedTypes.has(file.type)) {
    throw new Error("Resume files must be a PDF, TXT, Markdown, RTF, DOC, or DOCX file.");
  }

  if (file.size > MAX_RESUME_BYTES) {
    throw new Error("Resume files must be smaller than 10MB.");
  }

  await mkdir(RESUME_UPLOAD_DIRECTORY, { recursive: true });

  const extension = getFileExtension(file);
  const fileName = `${teacherId}-resume-${Date.now()}${extension}`;
  const filePath = path.join(RESUME_UPLOAD_DIRECTORY, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(filePath, buffer);

  return {
    url: `/uploads/resumes/${fileName}`,
    fileName: file.name || fileName,
    mimeType: file.type
  };
}

export async function savePendingSignupResume(file: File, pendingSignupId: string) {
  const allowedTypes = new Set([
    "application/pdf",
    "text/plain",
    "text/markdown",
    "application/rtf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ]);

  if (!allowedTypes.has(file.type)) {
    throw new Error("Resume files must be a PDF, TXT, Markdown, RTF, DOC, or DOCX file.");
  }

  if (file.size > MAX_RESUME_BYTES) {
    throw new Error("Resume files must be smaller than 10MB.");
  }

  await mkdir(RESUME_UPLOAD_DIRECTORY, { recursive: true });

  const extension = getFileExtension(file);
  const fileName = `${pendingSignupId}-resume-${Date.now()}${extension}`;
  const filePath = path.join(RESUME_UPLOAD_DIRECTORY, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(filePath, buffer);

  return {
    url: `/uploads/resumes/${fileName}`,
    fileName: file.name || fileName,
    mimeType: file.type
  };
}
