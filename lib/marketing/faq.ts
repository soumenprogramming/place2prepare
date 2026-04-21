export type FaqEntry = {
  question: string;
  answer: string;
  category: "Getting started" | "Billing" | "Courses" | "Live sessions" | "Account";
};

export const FAQS: FaqEntry[] = [
  {
    category: "Getting started",
    question: "Who is Place2Prepare built for?",
    answer:
      "Engineering students in their 3rd or 4th year, recent graduates, and early career engineers preparing for campus or off-campus placements at product and service companies.",
  },
  {
    category: "Getting started",
    question: "Do I need to pay to try it out?",
    answer:
      "No. Registration is free, and the Basic plan unlocks several core courses permanently. You only pay when you want to upgrade a specific course to Premium.",
  },
  {
    category: "Courses",
    question: "Can I switch between courses once I enroll?",
    answer:
      "Yes. You can browse the full catalog, self-enroll in free courses, and switch between enrolled courses from your dashboard at any time.",
  },
  {
    category: "Courses",
    question: "Are the lessons self-paced or scheduled?",
    answer:
      "Most lessons are self-paced. Live sessions (mock interviews and doubt-solving) are scheduled and shown on your student calendar with reminders.",
  },
  {
    category: "Live sessions",
    question: "How do live mock interviews work?",
    answer:
      "Premium learners get a calendar of upcoming mocks. You pick a slot, the mentor joins with a realistic interview brief, and you receive written feedback after.",
  },
  {
    category: "Billing",
    question: "Is Premium a subscription?",
    answer:
      "No. Premium is a per-course upgrade. You pay once for a course and keep access to its premium content, quizzes, and live sessions. You can downgrade any course from the billing page at any time.",
  },
  {
    category: "Billing",
    question: "Do I get an invoice after payment?",
    answer:
      "Yes. Every successful payment generates an invoice you can download as a printable PDF from the billing page.",
  },
  {
    category: "Account",
    question: "I forgot my password. How do I reset it?",
    answer:
      "Use the ‘Forgot password’ link on the login page. We'll send a time-limited reset link to your registered email. For privacy reasons we don't confirm whether the email exists in our system.",
  },
  {
    category: "Account",
    question: "How do I delete my account?",
    answer:
      "Email us at hello@place2prepare.com from your registered email address and we'll remove your account and associated enrollments within 7 working days.",
  },
];
