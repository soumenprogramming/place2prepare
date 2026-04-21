import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/page-shell";
import { getAllPosts } from "@/lib/blog/posts";
import { SITE_NAME, SITE_URL } from "@/lib/marketing/site";

export const metadata: Metadata = {
  title: "Blog — placement prep, DSA, and interview craft",
  description:
    "Hands-on articles from Place2Prepare mentors on how to prepare, interview, and land engineering offers.",
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: `Blog · ${SITE_NAME}`,
    description:
      "Hands-on articles from mentors on DSA, system design, and interview craft.",
    url: `${SITE_URL}/blog`,
    type: "website",
  },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${SITE_NAME} Blog`,
    url: `${SITE_URL}/blog`,
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      author: { "@type": "Person", name: post.author },
      url: `${SITE_URL}/blog/${post.slug}`,
    })),
  };

  return (
    <MarketingShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="bg-brand-gradient px-4 py-16 text-white md:px-6">
        <div className="mx-auto max-w-[1100px]">
          <p className="text-sm font-semibold uppercase tracking-wider text-white/80">
            Place2Prepare Blog
          </p>
          <h1 className="mt-2 max-w-3xl text-4xl font-extrabold md:text-5xl">
            Practical writing from people who hire and get hired.
          </h1>
          <p className="mt-4 max-w-2xl text-white/85">
            No generic advice, no recycled Reddit threads. Just the patterns,
            checklists, and hard-earned frameworks our mentors use with real
            candidates.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1100px] px-4 py-12 md:px-6">
        {posts.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            New articles are on the way. Check back soon.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-indigo-50 px-2 py-0.5 font-semibold uppercase tracking-wide text-indigo-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="mt-4 text-xl font-bold text-slate-900 group-hover:text-primary">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                <p className="mt-2 flex-1 text-sm text-slate-600">
                  {post.description}
                </p>
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
                  <span className="font-medium text-slate-700">
                    {post.author}
                  </span>
                  <span>
                    {new Date(post.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                    {post.readingMinutes
                      ? ` · ${post.readingMinutes} min read`
                      : ""}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </MarketingShell>
  );
}
