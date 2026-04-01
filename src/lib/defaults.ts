import type { AppSettings, BlogPost } from "./types";

export const DEFAULT_SETTINGS: AppSettings = {
  id: "default",
  brandName: "GenieHub",
  tagline: "Smarter travel applications, client tracking, and admin operations in one place.",
  supportEmail: "hello@geniehub.co",
  phone: "+233 24 000 0000",
  officeAddress: "East Legon, Accra, Ghana",
  workingHours: "Mon - Fri: 8:00 AM - 5:00 PM | Sat: 9:00 AM - 2:00 PM",
  whatsappNumber: "+233240000000",
  instagramUrl: "",
  facebookUrl: "",
  twitterUrl: "",
  snapchatUrl: "",
  linkedinUrl: "",
  tiktokUrl: "",
  defaultCurrency: "GHS",
  autoAssignChat: true,
  tawkPropertyId: "",
  tawkWidgetId: "",
  heroTitle: "Travel planning, visa applications, and client care from one intelligent hub.",
  heroSubtitle:
    "GenieHub helps travellers and students book consultations, track application progress, upload documents, and stay aligned with your team.",
};

export const DEFAULT_BLOG_POSTS: BlogPost[] = [
  {
    id: "blog-1",
    title: "5 Things to Prepare Before a Student Visa Interview",
    slug: "prepare-before-student-visa-interview",
    category: "Visa Tips",
    excerpt:
      "A practical checklist for students who want to walk into their interview with confidence and complete documentation.",
    content:
      "Strong preparation starts with your admission documents, financial proof, travel intent, and a clear story about your study plans. Organise your paperwork, rehearse answers honestly, and make sure your records are consistent across all submitted forms.",
    author: "GenieHub Editorial",
    imageUrl: "",
    published: true,
    publishedAt: "2026-03-18",
  },
  {
    id: "blog-2",
    title: "How to Choose Between Study Abroad Destinations",
    slug: "choose-between-study-abroad-destinations",
    category: "Study Abroad",
    excerpt:
      "Compare cost, post-study work pathways, entry requirements, and lifestyle before committing to a destination.",
    content:
      "Choosing a destination is usually less about prestige and more about fit. Balance tuition, living costs, visa policy, employability, and support systems. A good shortlist should reflect both your career goals and your financial reality.",
    author: "GenieHub Editorial",
    imageUrl: "",
    published: true,
    publishedAt: "2026-03-11",
  },
  {
    id: "blog-3",
    title: "What Makes a Strong Tour Enquiry",
    slug: "what-makes-a-strong-tour-enquiry",
    category: "Travel Guide",
    excerpt:
      "The best travel proposals come from clear dates, budgets, group size, and trip expectations right from the start.",
    content:
      "When clients share destination, budget, travel windows, number of passengers, and preferences early, your travel team can respond faster with better options. Structured enquiries reduce back-and-forth and improve conversion.",
    author: "GenieHub Editorial",
    imageUrl: "",
    published: true,
    publishedAt: "2026-03-03",
  },
];
