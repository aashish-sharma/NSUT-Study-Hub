export const SITE = {
  name: "Study Hub",
  tagline: "First-year resources for NSUT students",
  logoPath: "", // Left empty for now, will use text wordmark
  landing: {
    hero: {
      headline: "Stop hunting for notes. Start studying.",
      subline: "Notes, playlists, PYQs and practical files for all 37 first-year subjects, organised unit by unit and collected by seniors who've already been through it.",
      cta: "Start studying",
      ctaStored: "Continue studying",
    },
    howItWorks: [
      { title: "Pick your subject.", desc: "All 37 subjects, searchable in seconds." },
      { title: "Find your unit.", desc: "Notes, playlists and PYQs are grouped so you don't have to hunt." },
      { title: "Beat your exam.", desc: "Add a date and the site counts down and puts PYQs first." }
    ],
    cta: "Your next exam won't wait. Start now."
  },
  footer: {
    credit: "Built by Aashish Sharma. Resources compiled by Nakshatra, NSUT."
  },
  links: {
    feedback: "", // FEEDBACK_FORM_URL placeholder
  },
} as const;
