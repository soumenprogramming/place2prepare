import type { BlogFrontMatter } from "./types";

const FRONT_MATTER_REGEX = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?([\s\S]*)$/;

function stripQuotes(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseScalar(raw: string): string | string[] {
  const trimmed = raw.trim();
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return trimmed
      .slice(1, -1)
      .split(",")
      .map((part) => stripQuotes(part))
      .filter((part) => part.length > 0);
  }
  return stripQuotes(trimmed);
}

function parseFrontMatter(block: string): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {};
  const lines = block.split(/\r?\n/);
  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1);
    if (!key) continue;
    out[key] = parseScalar(value);
  }
  return out;
}

export type ParsedMarkdown = {
  frontMatter: BlogFrontMatter;
  content: string;
};

export function parseMarkdown(raw: string): ParsedMarkdown {
  const match = raw.match(FRONT_MATTER_REGEX);
  if (!match) {
    throw new Error("Markdown file is missing a front-matter block");
  }
  const [, fmBlock, body] = match;
  const data = parseFrontMatter(fmBlock);

  const title = typeof data.title === "string" ? data.title : "";
  const description =
    typeof data.description === "string" ? data.description : "";
  const author = typeof data.author === "string" ? data.author : "Place2Prepare";
  const role = typeof data.role === "string" ? data.role : undefined;
  const date = typeof data.date === "string" ? data.date : "";
  const tags = Array.isArray(data.tags)
    ? data.tags
    : typeof data.tags === "string" && data.tags.length > 0
      ? [data.tags]
      : [];
  const cover = typeof data.cover === "string" ? data.cover : undefined;
  const readingMinutes =
    typeof data.readingMinutes === "string" && data.readingMinutes.length > 0
      ? Number(data.readingMinutes) || undefined
      : undefined;

  if (!title) throw new Error("Blog post front-matter missing `title`");
  if (!description)
    throw new Error("Blog post front-matter missing `description`");
  if (!date) throw new Error("Blog post front-matter missing `date`");

  return {
    frontMatter: {
      title,
      description,
      author,
      role,
      date,
      tags,
      cover,
      readingMinutes: readingMinutes ?? estimateReadingMinutes(body),
    },
    content: body.trim(),
  };
}

function estimateReadingMinutes(body: string): number {
  const words = body.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
