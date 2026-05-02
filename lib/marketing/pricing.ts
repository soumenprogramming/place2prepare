export type PricingPlan = {
  id: "basic" | "premium" | "enterprise";
  name: string;
  tagline: string;
  priceInr: number | null;
  priceSuffix: string;
  ctaLabel: string;
  ctaHref: string;
  highlight?: boolean;
  features: string[];
  note?: string;
};

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "basic",
    name: "Basic",
    tagline: "Start with the fundamentals, free forever.",
    priceInr: 0,
    priceSuffix: "forever",
    ctaLabel: "Create free account",
    ctaHref: "/register",
    features: [
      "Access to free courses in DSA, Aptitude, DBMS",
      "Progress tracking + activity log",
      "Community practice problems",
      "Weekly email with hiring insights",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "Mock interviews and full track access.",
    priceInr: 1499,
    priceSuffix: "per course",
    ctaLabel: "Upgrade a course",
    ctaHref: "/checkout/premium",
    highlight: true,
    features: [
      "All Basic features",
      "Unlimited live mock interviews",
      "Company-wise placement tracks",
      "Premium lessons, quizzes, and explanations",
      "Priority doubt-solving from mentors",
      "Downloadable invoices and receipts",
    ],
    note: "One-time upgrade per course. No recurring charges.",
  },
  {
    id: "enterprise",
    name: "Campus",
    tagline: "For placement cells and training partners.",
    priceInr: null,
    priceSuffix: "custom",
    ctaLabel: "Talk to us",
    ctaHref: "mailto:hello@place2prepare.com?subject=Campus%20partnership",
    features: [
      "Bulk seats for your entire batch",
      "Campus-branded dashboard + leaderboard",
      "Analytics for placement officers",
      "Curriculum tailored to your hiring drives",
      "Dedicated mentor pool",
    ],
  },
];
