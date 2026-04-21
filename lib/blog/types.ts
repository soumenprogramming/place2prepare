export type BlogFrontMatter = {
  title: string;
  description: string;
  author: string;
  role?: string;
  date: string;
  tags: string[];
  cover?: string;
  readingMinutes?: number;
};

export type BlogPostSummary = BlogFrontMatter & {
  slug: string;
};

export type BlogPost = BlogPostSummary & {
  content: string;
};
