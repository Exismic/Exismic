export interface SocialCaptionBlueprint {
  id: string;
  name: string;
  platform: "instagram" | "twitter" | "linkedin" | "tiktok" | "youtube" | "facebook";
  mood: string;
  tagline: string;
  topic: string;
  badge: string;
  previewImageUrl?: string;
  captions: Array<{
    caption: string;
    hashtags: string[];
    hookType?: string;
  }>;
}

export const SOCIAL_CAPTION_BLUEPRINTS: SocialCaptionBlueprint[] = [
  {
    id: "instagram-aesthetic-coffee",
    name: "Sunday Aesthetic Ritual",
    platform: "instagram",
    mood: "casual",
    tagline: "Aesthetic lifestyle story with high-retention hook & curated tags",
    badge: "Instagram Carousel",
    topic: "Sunday morning pour-over coffee ritual, slow morning sunlight, quiet studio space",
    previewImageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
    captions: [
      {
        hookType: "Storytelling Hook",
        caption: "Sundays hit different when you don't rush the first cup ☕✨\n\nThere's something therapeutic about letting the steam rise, turning your phone on silent, and letting the morning breathe.\n\nWhat's one ritual you refuse to compromise on this weekend? Drop it below 👇",
        hashtags: ["#coffeeritual", "#slowmorning", "#coffeetime", "#minimalistliving", "#sundayvibes", "#weekendmood"],
      },
      {
        hookType: "Aesthetic One-Liner",
        caption: "Proof that good things take about 4 minutes to brew and a lifetime to master ☕💛\n\nSave this for your next quiet morning.",
        hashtags: ["#baristadaily", "#coffeelover", "#morningcoffee", "#aestheticvibes", "#homestudio"],
      },
    ],
  },
  {
    id: "tiktok-viral-founder-hook",
    name: "Relatable Founder POV",
    platform: "tiktok",
    mood: "funny",
    tagline: "High-retention 3-second hook designed for watch time & comments",
    badge: "TikTok Short",
    topic: "POV: You thought starting an online side business in 2026 was going to be peaceful",
    previewImageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
    captions: [
      {
        hookType: "Curiosity Gap Hook",
        caption: "Wait till the end because nobody warned me about step 3 💀\n\nDay 1: 'I'll just work 2 hours a day from my laptop!'\nDay 45: Having a 2 AM board meeting with my cat about inventory.\n\nTell me I'm not the only one doing this? 🙋‍♂️",
        hashtags: ["#sidehustle", "#founderlife", "#relatable", "#workfromhome", "#entrepreneur", "#fyp"],
      },
      {
        hookType: "Contrarian Hook",
        caption: "Unpopular opinion: You don't need a 4 AM routine. You just need to stop redesigning your logo for the 18th time 😭\n\nDrop your current obsession in the comments!",
        hashtags: ["#creatorproblems", "#smallbusiness", "#relatablememes", "#startup", "#buildinpublic"],
      },
    ],
  },
  {
    id: "twitter-productivity-thread",
    name: "Viral Productivity Thread",
    platform: "twitter",
    mood: "inspiring",
    tagline: "High-CTR thread opener with structured bulleted insights",
    badge: "X Thread Opener",
    topic: "5 micro-habits that 10x your creative output without burnout",
    captions: [
      {
        hookType: "Thread Opener",
        caption: "Most productivity advice is just disguised procrastination.\n\nHere are 5 micro-habits that actually doubled my output this year (without working 14-hour days) 🧵👇\n\n1. The 90-minute morning focus lock\n2. Zero-inbox triage before noon\n3. Ruthless task batching",
        hashtags: ["#productivity", "#buildinpublic", "#creatorgrowth", "#habits"],
      },
      {
        hookType: "Punchy Hot Take",
        caption: "Your biggest competitor isn't someone else in your niche.\n\nIt's the algorithm distracting you from finishing what you started.\n\nOne deep-work block beats 8 hours of multitasking every single time.",
        hashtags: ["#focus", "#deepwork", "#creators"],
      },
    ],
  },
  {
    id: "linkedin-executive-insight",
    name: "Executive Thought Leadership",
    platform: "linkedin",
    mood: "professional",
    tagline: "Whitespace-optimized leadership reflection with engagement question",
    badge: "LinkedIn Article Hook",
    topic: "Why the best software teams prioritize writing clear documentation before writing a single line of code",
    previewImageUrl: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80",
    captions: [
      {
        hookType: "Executive Reflection",
        caption: "The most expensive code in your company isn't the complex algorithm.\n\nIt's the code nobody understands six months after it ships.\n\nEarly in my career, I measured productivity in lines of code written per day.\n\nToday, I measure it by how quickly another team member can read the documentation, understand the architecture, and ship a feature with zero meetings.\n\nClear writing is clear thinking.\n\nDoes your engineering team document before building, or as an afterthought? I'd love to hear your approach below.",
        hashtags: ["#softwareengineering", "#leadership", "#productmanagement", "#techculture", "#cleancode"],
      },
      {
        hookType: "Actionable Framework",
        caption: "3 questions we ask before writing any new system architecture:\n\n1. What happens if this fails at 3 AM?\n2. Can an intern troubleshoot this in 10 minutes from the README?\n3. Will this scale gracefully with zero manual interventions?\n\nIf the answer to any of these is 'maybe', we go back to the drawing board.\n\nSimplicity is the ultimate sophistication in tech.",
        hashtags: ["#engineering", "#systemsarchitecture", "#techleaders", "#scalability"],
      },
    ],
  },
];
