export interface AiDetectorBlueprint {
  id: string;
  name: string;
  badge: string;
  tagline: string;
  score: number; // 0 to 100 (% AI)
  text: string;
}

export const AI_DETECTOR_BLUEPRINTS: AiDetectorBlueprint[] = [
  {
    id: "ai-essay",
    name: "Robotic Tech Essay",
    badge: "96% AI Detected",
    tagline: "Heavy overuse of formal AI transition words and uniform sentences",
    score: 96,
    text: "In today's fast-paced digital era, it is crucial to delve into the transformative tapestry of artificial intelligence. Furthermore, modern enterprises must navigate the evolving landscape to foster sustainable innovation. In conclusion, the integration of automated workflows serves as a testament to organizational resilience and operational excellence.",
  },
  {
    id: "human-story",
    name: "Personal Story & Anecdote",
    badge: "98% Human Score",
    tagline: "Natural conversational rhythm, varied sentence lengths, and lived experience",
    score: 4,
    text: "Last Tuesday my car broke down on I-95 right outside Philadelphia. I had twelve minutes before my client demo, no coffee, and a phone battery sitting at four percent. Honestly, I thought about just walking into the woods. Instead, I tethered my laptop to my dying hotspot and pitched the deck from the shoulder of the highway with semis roaring past.",
  },
  {
    id: "hybrid-memo",
    name: "Edited Marketing Memo",
    badge: "48% Mixed / Hybrid",
    tagline: "Some AI phrasing blended with specific human KPIs and team context",
    score: 48,
    text: "We wrapped up our Q3 growth review yesterday. While organic website traffic expanded by 24%, conversion rates remained stubbornly flat across our European landing pages. The team tested three new headline variations last week. Moving forward, we should prioritize simplifying our checkout flow before spending another dollar on paid acquisition.",
  },
  {
    id: "academic-abstract",
    name: "Academic Review Paper",
    badge: "89% AI Detected",
    tagline: "Dense academic jargon with low burstiness and repetitive syntax",
    score: 89,
    text: "Furthermore, empirical literature consistently underscores the paramount significance of cognitive load mitigation in human-computer interaction. It is widely acknowledged that interface ergonomics dictate long-term engagement metrics. Moreover, subsequent studies reaffirm that cognitive friction impedes user decision-making across enterprise software environments.",
  },
];
