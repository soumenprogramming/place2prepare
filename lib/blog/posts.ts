import fs from "node:fs";
import path from "node:path";
import { parseMarkdown } from "./parse";
import type { BlogPost, BlogPostSummary } from "./types";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

function listMarkdownFiles(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith(".md"))
    .map((file) => path.join(BLOG_DIR, file));
}

function slugFromFile(file: string): string {
  return path.basename(file, ".md");
}

function sortByDateDesc<T extends { date: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getAllPostSlugs(): string[] {
  return listMarkdownFiles().map(slugFromFile);
}

export function getAllPosts(): BlogPostSummary[] {
  const summaries: BlogPostSummary[] = listMarkdownFiles().map((file) => {
    const raw = fs.readFileSync(file, "utf8");
    const { frontMatter } = parseMarkdown(raw);
    return { slug: slugFromFile(file), ...frontMatter };
  });
  return sortByDateDesc(summaries);
}

export function getPostBySlug(slug: string): BlogPost | null {
  const safeSlug = slug.replace(/[^a-z0-9-]/gi, "");
  if (!safeSlug) return null;
  const file = path.join(BLOG_DIR, `${safeSlug}.md`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  const { frontMatter, content } = parseMarkdown(raw);
  return { slug: safeSlug, ...frontMatter, content };
}

export function getRelatedPosts(
  currentSlug: string,
  limit = 3,
): BlogPostSummary[] {
  const posts = getAllPosts().filter((p) => p.slug !== currentSlug);
  return posts.slice(0, limit);
}
