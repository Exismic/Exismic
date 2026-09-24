export interface EmailReplyBlueprint {
  id: string;
  name: string;
  badge: string;
  tagline: string;
  intent: "accept" | "decline" | "followup" | "negotiate" | "info";
  tone: "professional" | "friendly" | "formal" | "assertive" | "direct";
  receivedEmail: string;
  subject: string;
  replyBody: string;
  extraNotes?: string;
}

export const EMAIL_REPLY_BLUEPRINTS: EmailReplyBlueprint[] = [
  {
    id: "decline-meeting",
    name: "Polite Meeting Decline",
    badge: "Respectful Refusal",
    tagline: "Declines a 45-minute sync politely while protecting your focus calendar",
    intent: "decline",
    tone: "professional",
    receivedEmail: "Hey team, would love to jump on a 45-minute sync this Friday afternoon around 3 PM to discuss potential marketing synergies and brainstorm ideas. Let me know if that works for you!",
    subject: "Re: Marketing sync this Friday",
    replyBody: `Hi there,\n\nThank you for reaching out and thinking of us for this collaboration.\n\nUnfortunately, my schedule is completely locked for deep-work focus this Friday, and I won't be able to jump on a live sync.\n\nIf you have a 1-page overview or deck sharing the core ideas, please feel free to send it over. I'd be happy to review it asynchronously and get back to you with my thoughts.\n\nThanks again for your understanding!\n\nBest regards,\n[Your Name]`,
    extraNotes: "Suggest reviewing asynchronously instead",
  },
  {
    id: "salary-negotiation",
    name: "Salary & Rate Negotiation",
    badge: "Counter-Offer",
    tagline: "Counter-offers a job or contract proposal with confidence and gratitude",
    intent: "negotiate",
    tone: "formal",
    receivedEmail: "Hi Alex, we were so impressed by your interviews and are excited to extend an offer for the Senior Product Designer role! The compensation package includes an annual base salary of $120,000 plus standard health benefits.",
    subject: "Re: Senior Product Designer Offer - [Your Name]",
    replyBody: `Dear Team,\n\nThank you so much for extending this offer. I am genuinely thrilled about the opportunity to join the team and contribute to the upcoming product vision.\n\nGiven the scope of the leadership responsibilities and my 6+ years of specialized experience scaling design systems, I was hoping to see a base salary closer to $135,000.\n\nIf we can align on that number, I am ready to sign the agreement and begin onboarding right away. Please let me know your thoughts.\n\nWarm regards,\n[Your Name]`,
    extraNotes: "Counter at $135k based on 6 years experience",
  },
  {
    id: "gentle-followup",
    name: "Gentle Client Follow-Up",
    badge: "Low-Pressure Nudge",
    tagline: "Follows up on an unanswered proposal without sounding pushy or needy",
    intent: "followup",
    tone: "friendly",
    receivedEmail: "[No reply received for 8 business days after submitting the project proposal and scope of work deck]",
    subject: "Quick check-in on the Q4 project proposal",
    replyBody: `Hi Sarah,\n\nI hope you're having a productive week!\n\nI wanted to gently follow up on the proposal and scope document I shared last week regarding the website redesign.\n\nNo rush at all—I just wanted to make sure it landed in your inbox and see if any questions came up that I could help clarify for your team.\n\nLooking forward to hearing your thoughts whenever you have a moment.\n\nBest,\n[Your Name]`,
    extraNotes: "Gentle nudge after 8 days of silence",
  },
  {
    id: "accept-client-project",
    name: "New Client Project Acceptance",
    badge: "Kickoff Confirmation",
    tagline: "Accepts a high-value freelance project with clear onboarding steps",
    intent: "accept",
    tone: "direct",
    receivedEmail: "Hi! We loved your recent portfolio case study and would love to hire you to build the full branding package and design system for our launch in December. Can you take this on?",
    subject: "Re: Branding Project Kickoff - Confirmed!",
    replyBody: `Hi team,\n\nThank you for the kind words—I'd love to partner with you on the December branding package!\n\nI have availability to begin next Monday. To get everything officially moving, here are the next two quick steps:\n\n1. I'll send over our standard statement of work and 50% deposit invoice.\n2. Once signed, we will schedule our 30-minute discovery kickoff call.\n\nExcited to build something memorable together!\n\nBest,\n[Your Name]`,
    extraNotes: "Confirm availability for next Monday",
  },
];
