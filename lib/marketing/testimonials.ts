export type Testimonial = {
  name: string;
  role: string;
  company: string;
  avatarInitials: string;
  quote: string;
  track: "DSA" | "System Design" | "Aptitude" | "HR" | "Full Stack";
};

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Aarav Mehta",
    role: "SDE-1",
    company: "Flipkart",
    avatarInitials: "AM",
    track: "DSA",
    quote:
      "The DSA track felt like real interviews, not textbook questions. Two mock rounds in and I stopped panicking when arrays got nested.",
  },
  {
    name: "Priya Nair",
    role: "Backend Engineer",
    company: "Razorpay",
    avatarInitials: "PN",
    track: "System Design",
    quote:
      "I didn't think system design could be taught in small, digestible sprints. The weekly live mocks changed the game for my final rounds.",
  },
  {
    name: "Rohit Sinha",
    role: "SDE Intern → Full-time",
    company: "Atlassian",
    avatarInitials: "RS",
    track: "Full Stack",
    quote:
      "The mentors point out weaknesses you didn't know you had. My feedback after every mock was specific enough to fix the next day.",
  },
  {
    name: "Sneha Iyer",
    role: "Analyst",
    company: "Deloitte",
    avatarInitials: "SI",
    track: "Aptitude",
    quote:
      "Aptitude used to be my lowest scoring section. Three weeks of timed drills later, I was finishing with 4 minutes to spare.",
  },
  {
    name: "Kabir Desai",
    role: "SDE-2",
    company: "PhonePe",
    avatarInitials: "KD",
    track: "System Design",
    quote:
      "Place2Prepare is the only platform where someone actually asks you why your design decisions are what they are. That's the real skill.",
  },
  {
    name: "Ananya Rao",
    role: "ML Engineer",
    company: "Myntra",
    avatarInitials: "AR",
    track: "HR",
    quote:
      "HR prep is usually treated as an afterthought. Their behavioural track gave me scripts I could actually personalise.",
  },
];
