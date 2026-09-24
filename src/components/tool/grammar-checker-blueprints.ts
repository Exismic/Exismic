export interface GrammarCorrection {
  original: string;
  suggestion: string;
  type: "spelling" | "grammar" | "style" | "clarity" | "academic";
  reason: string;
}

export interface GrammarCheckerBlueprint {
  id: string;
  name: string;
  badge: string;
  tagline: string;
  mode: "standard" | "professional" | "casual" | "academic";
  originalText: string;
  correctedText: string;
  corrections: GrammarCorrection[];
}

export const GRAMMAR_CHECKER_BLUEPRINTS: GrammarCheckerBlueprint[] = [
  {
    id: "client-email",
    name: "Messy Client Email",
    badge: "5 Fixes Applied",
    tagline: "Fixes typos, missing commas, run-on phrasing, and informal capitalization",
    mode: "professional",
    originalText: "hey sarah i hope your doing good we was wondering if you had time to look at teh project proposal yet. let us know if any questions come up and we can setup a quick call tomorrow thanks!",
    correctedText: "Hi Sarah,\n\nI hope you're doing well. We were wondering if you've had time to review the project proposal yet. Please let us know if you have any questions, and we can set up a quick call tomorrow.\n\nThank you!",
    corrections: [
      {
        original: "hey sarah",
        suggestion: "Hi Sarah,",
        type: "style",
        reason: "Professional capitalization and standard business email greeting.",
      },
      {
        original: "your doing good",
        suggestion: "you're doing well",
        type: "grammar",
        reason: "Replaced possessive 'your' with contraction 'you're' and adjective 'good' with adverb 'well'.",
      },
      {
        original: "we was",
        suggestion: "We were",
        type: "grammar",
        reason: "Corrected subject-verb agreement for plural pronoun 'we'.",
      },
      {
        original: "teh",
        suggestion: "the",
        type: "spelling",
        reason: "Corrected common typing mistake.",
      },
      {
        original: "setup",
        suggestion: "set up",
        type: "grammar",
        reason: "'Set up' is a two-word verb phrase; 'setup' is a noun.",
      },
    ],
  },
  {
    id: "resume-intro",
    name: "Weak Resume Summary",
    badge: "4 Fixes Applied",
    tagline: "Replaces passive voice, weak action verbs, and inconsistent tenses",
    mode: "professional",
    originalText: "I was responsible for doing marketing tasks and making sales grow by 30%. Also managed social media accounts which was hard work and helped team members on daily tasks.",
    correctedText: "Spearheaded digital marketing campaigns that grew quarterly revenue by 30%. Managed multi-channel social media accounts and mentored cross-functional team members on daily strategic operations.",
    corrections: [
      {
        original: "was responsible for doing",
        suggestion: "Spearheaded",
        type: "clarity",
        reason: "Replaced passive phrasing with an executive action verb.",
      },
      {
        original: "making sales grow",
        suggestion: "grew quarterly revenue",
        type: "clarity",
        reason: "More concise, measurable business terminology.",
      },
      {
        original: "which was hard work",
        suggestion: "[removed redundant filler]",
        type: "style",
        reason: "Removed informal conversational filler to keep the resume crisp.",
      },
      {
        original: "helped team members on daily tasks",
        suggestion: "mentored cross-functional team members on daily strategic operations",
        type: "clarity",
        reason: "Elevated leadership tone and impact.",
      },
    ],
  },
  {
    id: "tech-pitch",
    name: "Rambling Product Pitch",
    badge: "4 Fixes Applied",
    tagline: "Eliminates empty buzzwords and streamlines long, run-on sentences",
    mode: "casual",
    originalText: "Our software basically leverages synergistic algorithms in order to make it way easier for remote teams to collaborate without having to constantly send hundreds of emails back and forth everyday.",
    correctedText: "Our software makes it effortless for remote teams to collaborate seamlessly—without drowning in hundreds of back-and-forth emails every day.",
    corrections: [
      {
        original: "basically leverages synergistic algorithms in order to make",
        suggestion: "makes it effortless",
        type: "clarity",
        reason: "Eliminated empty tech buzzwords for clear, direct benefits.",
      },
      {
        original: "way easier",
        suggestion: "seamlessly",
        type: "style",
        reason: "Clean conversational phrasing with strong impact.",
      },
      {
        original: "without having to constantly send",
        suggestion: "without drowning in",
        type: "clarity",
        reason: "More vivid, memorable storytelling phrasing.",
      },
      {
        original: "everyday",
        suggestion: "every day",
        type: "grammar",
        reason: "'Every day' (two words) is an adverbial time phrase; 'everyday' is an adjective.",
      },
    ],
  },
  {
    id: "academic-draft",
    name: "Academic Literature Draft",
    badge: "3 Fixes Applied",
    tagline: "Corrects comma splices, subject-verb disagreements, and informal tone",
    mode: "academic",
    originalText: "The experimental results shows significant variation among participants, however they wasn't able to completely replicate the findings from prior studies.",
    correctedText: "The experimental results show significant variation among participants; however, the authors were unable to replicate the findings of prior studies.",
    corrections: [
      {
        original: "results shows",
        suggestion: "results show",
        type: "grammar",
        reason: "Subject 'results' is plural, requiring plural verb 'show'.",
      },
      {
        original: ", however",
        suggestion: "; however,",
        type: "grammar",
        reason: "Fixed comma splice by introducing a semicolon and comma around the conjunctive adverb.",
      },
      {
        original: "they wasn't able to completely replicate",
        suggestion: "the authors were unable to replicate",
        type: "academic",
        reason: "Corrected 'wasn't' contraction and plural agreement for scholarly writing.",
      },
    ],
  },
];
