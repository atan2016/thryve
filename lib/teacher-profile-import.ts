import { PDFParse } from "pdf-parse";

import type { Teacher, TeacherProfileImportStatus } from "@/lib/types";

const IMPORT_HEADERS = {
  "user-agent": "Mozilla/5.0 (compatible; ThryveProfileImport/1.0; +https://thryve.app)"
};

const SCHEDULE_KEYWORDS = /(book|schedule|calendar|class|session|appointment|reserve|availability|calendly)/i;
const TRAINING_KEYWORDS = /(training|certif|ryt|e-ryt|yacep|pilates|reiki|somatic|trauma-informed|teacher)/i;
const BIO_KEYWORDS = /(yoga|pilates|meditation|movement|wellness|teacher|instructor|healer|coach)/i;

type ImportSourceKind = "website" | "linkedin" | "instagram" | "facebook";

type ImportSource = {
  kind: ImportSourceKind;
  label: string;
  url: string;
};

type ResumeUpload = {
  url: string;
  fileName: string;
  mimeType: string;
  text?: string;
};

export type TeacherImportSourceInput = {
  websiteUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  profileImportConsent: boolean;
  resume?: ResumeUpload;
};

type ImportSignals = {
  title?: string;
  siteName?: string;
  description?: string;
  bio?: string;
  training?: string;
  city?: string;
  studioName?: string;
  studioWebsiteUrl?: string;
  studioScheduleUrl?: string;
  avatarUrl?: string;
  experienceYears?: number;
};

type TeacherImportDraftFields = Partial<
  Pick<
    Teacher,
    | "avatarUrl"
    | "bio"
    | "city"
    | "experienceYears"
    | "facebookUrl"
    | "instagramUrl"
    | "linkedinUrl"
    | "resumeFileName"
    | "resumeMimeType"
    | "resumeUrl"
    | "studioName"
    | "studioScheduleUrl"
    | "studioWebsiteUrl"
    | "training"
    | "websiteUrl"
  >
>;

export type TeacherImportDraft = {
  fields: TeacherImportDraftFields;
  status: TeacherProfileImportStatus;
  notes: string;
};

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function stripHtmlTags(value: string) {
  return decodeHtmlEntities(value.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " "));
}

function cleanText(value?: string | null) {
  if (!value) return undefined;
  const cleaned = normalizeWhitespace(stripHtmlTags(value));
  return cleaned.length > 0 ? cleaned : undefined;
}

function cleanUrl(value?: string | null) {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed.replace(/^\/+/, "")}`;
}

function getMetaContent(html: string, key: string) {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${key}["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+name=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${key}["'][^>]*>`, "i")
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return cleanText(match[1]);
    }
  }

  return undefined;
}

function getTagContents(html: string, tagName: string, limit = 6) {
  const matches = [...html.matchAll(new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "gi"))];
  return matches
    .map((match) => cleanText(match[1]))
    .filter((value): value is string => Boolean(value))
    .slice(0, limit);
}

function getAbsoluteUrl(value: string, baseUrl: string) {
  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return undefined;
  }
}

function getLinkUrls(html: string, baseUrl: string) {
  const matches = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)];
  return matches
    .map((match) => getAbsoluteUrl(match[1], baseUrl))
    .filter((value): value is string => Boolean(value));
}

function getImageUrls(html: string, baseUrl: string) {
  const matches = [...html.matchAll(/<img\b[^>]*src=["']([^"']+)["'][^>]*>/gi)];
  return matches
    .map((match) => getAbsoluteUrl(match[1], baseUrl))
    .filter((value): value is string => Boolean(value));
}

function getTitle(html: string) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return cleanText(match?.[1]);
}

function pickFirst(values: Array<string | undefined>) {
  return values.find((value): value is string => Boolean(value && value.trim()));
}

function unique(values: Array<string | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value && value.trim()))));
}

function extractExperienceYears(text: string) {
  const plusPattern = /(\d{1,2})\+?\s+years?(?:\s+of)?\s+(?:teaching|experience|working)/i;
  const simplePattern = /for\s+(\d{1,2})\+?\s+years/i;
  const match = text.match(plusPattern) ?? text.match(simplePattern);
  if (!match?.[1]) return undefined;
  const years = Number(match[1]);
  return Number.isFinite(years) && years > 0 ? years : undefined;
}

function extractCity(text: string) {
  const cityStateMatch = text.match(/\b([A-Z][a-z]+(?: [A-Z][a-z]+){0,2}),\s*(CA|NY|TX|WA|OR|CO|FL|MA|IL|AZ|NV)\b/);
  if (cityStateMatch?.[1]) {
    return cityStateMatch[1];
  }

  const basedInMatch = text.match(/\b(?:based in|located in|serving)\s+([A-Z][a-z]+(?: [A-Z][a-z]+){0,2})\b/i);
  if (basedInMatch?.[1]) {
    return basedInMatch[1];
  }

  return undefined;
}

function chooseBio(paragraphs: string[], description?: string) {
  const paragraph = paragraphs.find((entry) => entry.length >= 110 && BIO_KEYWORDS.test(entry));
  return paragraph ?? description;
}

function chooseTraining(paragraphs: string[], text: string) {
  const paragraph = paragraphs.find((entry) => entry.length >= 40 && TRAINING_KEYWORDS.test(entry));
  if (paragraph) {
    return paragraph;
  }

  const sentence = text
    .split(/(?<=[.!?])\s+/)
    .find((entry) => entry.length >= 40 && TRAINING_KEYWORDS.test(entry));

  return sentence ? normalizeWhitespace(sentence) : undefined;
}

function cleanSiteName(value?: string) {
  if (!value) return undefined;
  const cleaned = normalizeWhitespace(value.replace(/\s+[|:-]\s+.*$/, ""));
  return cleaned.length >= 3 ? cleaned : undefined;
}

function mergeSignals(signals: ImportSignals[]) {
  return {
    title: pickFirst(signals.map((signal) => signal.title)),
    siteName: pickFirst(signals.map((signal) => signal.siteName)),
    description: pickFirst(signals.map((signal) => signal.description)),
    bio: pickFirst(signals.map((signal) => signal.bio)),
    training: pickFirst(signals.map((signal) => signal.training)),
    city: pickFirst(signals.map((signal) => signal.city)),
    studioName: pickFirst(signals.map((signal) => signal.studioName)),
    studioWebsiteUrl: pickFirst(signals.map((signal) => signal.studioWebsiteUrl)),
    studioScheduleUrl: pickFirst(signals.map((signal) => signal.studioScheduleUrl)),
    avatarUrl: pickFirst(signals.map((signal) => signal.avatarUrl)),
    experienceYears: signals.map((signal) => signal.experienceYears).find((value): value is number => Boolean(value))
  };
}

async function fetchImportSignals(source: ImportSource): Promise<{ notes: string[]; signals: ImportSignals }> {
  const notes: string[] = [];

  try {
    const response = await fetch(source.url, {
      headers: IMPORT_HEADERS,
      redirect: "follow",
      cache: "no-store"
    });

    if (!response.ok) {
      return {
        notes: [`${source.label}: could not fetch (${response.status}).`],
        signals: {}
      };
    }

    const html = await response.text();
    const title = pickFirst([getMetaContent(html, "og:title"), getTitle(html)]);
    const siteName = pickFirst([getMetaContent(html, "og:site_name"), cleanSiteName(title)]);
    const description = pickFirst([getMetaContent(html, "description"), getMetaContent(html, "og:description")]);
    const headings = getTagContents(html, "h1", 3);
    const paragraphs = getTagContents(html, "p", 12).filter((entry) => entry.length >= 40);
    const bodyText = normalizeWhitespace(stripHtmlTags(html)).slice(0, 14000);
    const links = getLinkUrls(html, source.url);
    const images = unique([
      getMetaContent(html, "og:image"),
      ...getImageUrls(html, source.url).filter((entry) => /headshot|profile|avatar|teacher|instructor/i.test(entry))
    ]).map((entry) => getAbsoluteUrl(entry, source.url) ?? entry);

    const scheduleLink = links.find((entry) => SCHEDULE_KEYWORDS.test(entry));

    const signals: ImportSignals = {
      title: pickFirst([headings[0], title]),
      siteName,
      description,
      bio: chooseBio(paragraphs, description),
      training: chooseTraining(paragraphs, bodyText),
      city: extractCity(`${bodyText} ${paragraphs.join(" ")}`),
      studioName: cleanSiteName(siteName) ?? cleanSiteName(headings[0]),
      studioWebsiteUrl: source.kind === "website" ? source.url : undefined,
      studioScheduleUrl: scheduleLink,
      avatarUrl: pickFirst(images),
      experienceYears: extractExperienceYears(`${bodyText} ${paragraphs.join(" ")}`)
    };

    notes.push(`${source.label}: imported signals from ${new URL(source.url).hostname}.`);
    return { notes, signals };
  } catch {
    return {
      notes: [`${source.label}: fetch failed.`],
      signals: {}
    };
  }
}

function buildResumeSignals(text: string): ImportSignals {
  const normalized = normalizeWhitespace(text).slice(0, 12000);
  const paragraphs = text
    .split(/\n{2,}/)
    .map((entry) => normalizeWhitespace(entry))
    .filter((entry) => entry.length >= 40);

  return {
    bio: chooseBio(paragraphs, undefined),
    training: chooseTraining(paragraphs, normalized),
    city: extractCity(normalized),
    experienceYears: extractExperienceYears(normalized)
  };
}

export async function extractResumeText(file: File) {
  if (file.type === "application/pdf") {
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const parser = new PDFParse({ data: buffer });
      const parsed = await parser.getText();
      return normalizeWhitespace(parsed.text);
    } catch {
      return undefined;
    }
  }

  if (
    file.type.startsWith("text/") ||
    file.type === "application/json" ||
    file.type === "application/rtf" ||
    file.type === "text/markdown"
  ) {
    return normalizeWhitespace(await file.text());
  }

  return undefined;
}

function shouldReplaceText(currentValue?: string, candidateValue?: string) {
  return Boolean(candidateValue && (!currentValue || !currentValue.trim()));
}

function shouldReplaceNumber(currentValue?: number, candidateValue?: number) {
  return Boolean(candidateValue && (!currentValue || currentValue <= 0));
}

export async function buildTeacherImportDraft(teacher: Teacher, input: TeacherImportSourceInput): Promise<TeacherImportDraft> {
  const websiteUrl = cleanUrl(input.websiteUrl) ?? teacher.websiteUrl;
  const linkedinUrl = cleanUrl(input.linkedinUrl) ?? teacher.linkedinUrl;
  const instagramUrl = cleanUrl(input.instagramUrl) ?? teacher.instagramUrl;
  const facebookUrl = cleanUrl(input.facebookUrl) ?? teacher.facebookUrl;

  const sources: ImportSource[] = [];
  const seenSourceUrls = new Set<string>();

  for (const source of [
    websiteUrl ? { kind: "website" as const, label: "Website", url: websiteUrl } : null,
    linkedinUrl ? { kind: "linkedin" as const, label: "LinkedIn", url: linkedinUrl } : null,
    instagramUrl ? { kind: "instagram" as const, label: "Instagram", url: instagramUrl } : null,
    facebookUrl ? { kind: "facebook" as const, label: "Facebook", url: facebookUrl } : null
  ]) {
    if (!source || seenSourceUrls.has(source.url)) {
      continue;
    }

    seenSourceUrls.add(source.url);
    sources.push(source);
  }

  const notes: string[] = [];
  const fields: TeacherImportDraftFields = {
    websiteUrl,
    linkedinUrl,
    instagramUrl,
    facebookUrl,
    resumeUrl: input.resume?.url ?? teacher.resumeUrl,
    resumeFileName: input.resume?.fileName ?? teacher.resumeFileName,
    resumeMimeType: input.resume?.mimeType ?? teacher.resumeMimeType
  };

  const importSignals: ImportSignals[] = [];

  if (input.resume?.text) {
    importSignals.push(buildResumeSignals(input.resume.text));
    notes.push("Resume: extracted text and used it to suggest profile details.");
  } else if (input.resume) {
    notes.push("Resume: file stored, but this format could not be parsed automatically.");
  }

  if (input.profileImportConsent && sources.length > 0) {
    const results = await Promise.all(sources.map(fetchImportSignals));
    for (const result of results) {
      importSignals.push(result.signals);
      notes.push(...result.notes);
    }
  } else if (sources.length > 0) {
    notes.push("Source links were saved. Enable web import consent to fetch them automatically.");
  }

  const mergedSignals = mergeSignals(importSignals);

  if (shouldReplaceText(teacher.bio, mergedSignals.bio)) {
    fields.bio = mergedSignals.bio;
  }
  if (shouldReplaceText(teacher.training, mergedSignals.training)) {
    fields.training = mergedSignals.training;
  }
  if (shouldReplaceText(teacher.city, mergedSignals.city)) {
    fields.city = mergedSignals.city;
  }
  if (shouldReplaceText(teacher.studioName, mergedSignals.studioName)) {
    fields.studioName = mergedSignals.studioName;
  }
  if (shouldReplaceText(teacher.studioWebsiteUrl, mergedSignals.studioWebsiteUrl ?? websiteUrl)) {
    fields.studioWebsiteUrl = mergedSignals.studioWebsiteUrl ?? websiteUrl;
  }
  if (shouldReplaceText(teacher.studioScheduleUrl, mergedSignals.studioScheduleUrl)) {
    fields.studioScheduleUrl = mergedSignals.studioScheduleUrl;
  }
  if (!teacher.avatarUrl && mergedSignals.avatarUrl) {
    fields.avatarUrl = mergedSignals.avatarUrl;
  }
  if (shouldReplaceNumber(teacher.experienceYears, mergedSignals.experienceYears)) {
    fields.experienceYears = mergedSignals.experienceYears;
  }

  const importedProfileFieldLabels = Object.entries(fields)
    .filter(([key, value]) => !["websiteUrl", "linkedinUrl", "instagramUrl", "facebookUrl", "resumeUrl", "resumeFileName", "resumeMimeType"].includes(key) && value !== undefined)
    .map(([key]) => key);

  if (importedProfileFieldLabels.length > 0) {
    notes.push(`Prefilled: ${importedProfileFieldLabels.join(", ")}.`);
  }

  const status: TeacherProfileImportStatus =
    importedProfileFieldLabels.length > 0
      ? "completed"
      : input.profileImportConsent || Boolean(input.resume?.text)
        ? "failed"
        : sources.length > 0 || input.resume
          ? "sources_saved"
          : "skipped";

  if (notes.length === 0) {
    notes.push("No import sources were provided.");
  }

  return {
    fields,
    status,
    notes: notes.join("\n")
  };
}
