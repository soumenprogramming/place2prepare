import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, Clock, User } from "lucide-react";
import { MarketingShell } from "@/components/marketing/page-shell";
import {
  getAllPostSlugs,
  getPostBySlug,
  getRelatedPosts,
} from "@/lib/blog/posts";
import {
  SITE_NAME,
  SITE_OG_IMAGE,
  SITE_URL,
  absoluteUrl,
} from "@/lib/marketing/site";

type Params = { params: { slug: string } };

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: Params): Metadata {
  const post = getPostBySlug(params.slug);
  if (!post) {
    return { title: "Article not found" };
  }
  const url = `${SITE_URL}/blog/${post.slug}`;
  const imageUrl = absoluteUrl(post.cover ?? SITE_OG_IMAGE);
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url,
      siteName: SITE_NAME,
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
      images: [{ url: imageUrl, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [imageUrl],
    },
  };
}

export default function BlogPostPage({ params }: Params) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const related = getRelatedPosts(post.slug, 3);
  const url = `${SITE_URL}/blog/${post.slug}`;
  const heroImage = absoluteUrl(post.cover ?? SITE_OG_IMAGE);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    image: heroImage,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
    },
    mainEntityOfPage: url,
    url,
    keywords: post.tags.join(", "),
  };

  return (
    <MarketingShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="mx-auto max-w-3xl px-4 py-12 md:px-6">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to all articles
        </Link>

        <header className="mt-6">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-indigo-50 px-2 py-0.5 font-semibold uppercase tracking-wide text-indigo-700"
              >
                {tag}
              </span>
            ))}
          </div>
          <h1 className="mt-3 text-4xl font-extrabold text-slate-900 md:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 text-lg text-slate-600">{post.description}</p>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <User className="h-4 w-4" /> {post.author}
              {post.role ? (
                <span className="text-slate-400">· {post.role}</span>
              ) : null}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {new Date(post.date).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              {post.readingMinutes
                ? ` · ${post.readingMinutes} min read`
                : null}
            </span>
          </div>
        </header>

        <div className="prose prose-slate mt-10 max-w-none prose-headings:font-bold prose-a:text-primary">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </div>

        <div className="mt-12 rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50 to-white p-6">
          <p className="text-sm font-semibold text-indigo-700">
            Ready to turn this article into practice?
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Create a free Place2Prepare account and enrol in a matching course
            today.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110"
            >
              Create free account
            </Link>
            <Link
              href="/courses"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Browse courses
            </Link>
          </div>
        </div>
      </article>

      {related.length > 0 ? (
        <section className="border-t border-slate-100 bg-white py-12">
          <div className="mx-auto max-w-[1100px] px-4 md:px-6">
            <h2 className="text-xl font-bold text-slate-900">
              Keep reading
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/blog/${r.slug}`}
                  className="rounded-2xl border border-slate-200 p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
                    {r.tags[0] ?? "Article"}
                  </p>
                  <p className="mt-2 font-semibold text-slate-900">{r.title}</p>
                  <p className="mt-2 text-sm text-slate-500">
                    {r.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </MarketingShell>
  );
}
