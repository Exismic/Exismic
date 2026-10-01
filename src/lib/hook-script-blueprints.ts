export interface HookObj {
  hook: string;
  trigger?: string;
  explanation?: string;
}

export interface ScriptBeat {
  time: string;
  voiceover: string;
  visual: string;
  sfx?: string;
  onScreenText?: string;
  retentionTip?: string;
}

export interface BRollItem {
  scene: string;
  suggestion: string;
}

export interface CtaItem {
  type: string;
  text: string;
}

export interface ScriptOutput {
  viralScore?: number;
  viralAnalysis?: string;
  hooks: (string | HookObj)[];
  script: ScriptBeat[];
  bRollList?: BRollItem[];
  ctaOptions?: CtaItem[];
  cta?: string;
  hashtags?: string[];
}

export interface ScriptBlueprint {
  id: string;
  label: string;
  topic: string;
  platform: "tiktok" | "shorts" | "reels";
  duration: string;
  niche: string;
  tone: string;
  script: ScriptOutput;
}

export const HOOK_SCRIPT_BLUEPRINTS: Record<string, ScriptBlueprint> = {
  "ai-hacks": {
    id: "ai-hacks",
    label: "5 Hidden AI Hacks",
    topic: "5 hidden AI productivity hacks that save 10 hours a week",
    platform: "tiktok",
    duration: "30-40s",
    niche: "Tech & AI",
    tone: "controversial",
    script: {
      viralScore: 98,
      viralAnalysis: "Immediate pattern interrupt in seconds 0-2 paired with curiosity gap. 3 fast visual scene cuts ensure 88%+ 3-second viewer retention rate.",
      hooks: [
        {
          hook: "Stop wasting 10 hours a week doing busywork manually.",
          trigger: "Pain Point & Urgency",
          explanation: "Directly calls out creator fatigue and daily time waste."
        },
        {
          hook: "Nobody is talking about these 3 secret AI shortcuts yet.",
          trigger: "Information Gap",
          explanation: "Creates urgency by framing tools as exclusive insider knowledge."
        },
        {
          hook: "If you're still typing emails by hand in 2026, watch this.",
          trigger: "Social Proof Challenge",
          explanation: "Challenges identity and pushes viewers to see what they are missing."
        },
        {
          hook: "Delete ChatGPT: here's what top creators actually use now.",
          trigger: "Contrarian Disruption",
          explanation: "Subverting industry standards commands instant pause behavior."
        }
      ],
      script: [
        {
          time: "0:00 - 0:03",
          voiceover: "Stop wasting 10 hours a week doing busywork manually.",
          visual: "Fast punch zoom into stressed creator staring at 40 browser tabs",
          sfx: "Sub-bass riser + digital click",
          onScreenText: "STOP DOING THIS ❌",
          retentionTip: "Reset visual framing before second 2"
        },
        {
          time: "0:03 - 0:10",
          voiceover: "First: auto-summarize your 2-hour video calls into 3 actionable bullets using Exismic.",
          visual: "Screen recording showing 1-click meeting transcript condensation",
          sfx: "Digital chime",
          onScreenText: "MEETING SHORTCUT ⏱️",
          retentionTip: "Overlay bold text under 4 words"
        },
        {
          time: "0:10 - 0:18",
          voiceover: "Second: convert any messy voice memo into a publication-ready viral script in 5 seconds.",
          visual: "B-roll of phone microphone waveform pulsing into formatted teleprompter text",
          sfx: "Paper rustle + quick whoosh",
          onScreenText: "VOICE → SCRIPT 🎙️",
          retentionTip: "Show real software interface"
        },
        {
          time: "0:18 - 0:25",
          voiceover: "Third: auto-extract key quotes and generate 5 swipeable carousels with zero design work.",
          visual: "Side-scrolling motion graphic of carousel slides with smooth drop shadows",
          sfx: "Sub-bass pop",
          onScreenText: "AUTO CAROUSELS 📱",
          retentionTip: "Continuous lateral motion maintains focus"
        },
        {
          time: "0:25 - 0:30",
          voiceover: "Save this video before it disappears, and drop 'AI' in the comments for the complete tool list.",
          visual: "Creator points down directly toward bookmark & comment button with glowing indicator",
          sfx: "High chime ding",
          onScreenText: "SAVE FOR LATER ⬇️",
          retentionTip: "Direct physical gestures increase CTA click rates by 34%"
        }
      ],
      bRollList: [
        { scene: "Hook Punch Zoom", suggestion: "0.5x speed punch zoom on expressive facial reaction" },
        { scene: "Interface Screencast", suggestion: "60fps recording of cursor triggering 1-click script export" },
        { scene: "Phone Voice Memo", suggestion: "Over-the-shoulder handheld shot of voice recording wave" },
        { scene: "Carousel Grid", suggestion: "Isometric sliding cards with modern dark glass aesthetic" }
      ],
      ctaOptions: [
        { type: "Save & Bookmark", text: "Bookmark this clip so you can set these 3 workflows up this weekend." },
        { type: "Comment Keyword", text: "Comment 'SHORTCUT' and I'll send you the exact AI prompt cheat sheet." },
        { type: "Follow Loop", text: "Follow for daily AI workflows that give you your free time back." }
      ],
      cta: "Bookmark this clip so you can set these 3 workflows up this weekend.",
      hashtags: ["#aihack", "#productivitytips", "#contentcreator", "#solopreneur", "#exismic", "#techhacks"]
    }
  },

  "cyber-security": {
    id: "cyber-security",
    label: "Dark Cyber Security Story",
    topic: "Scariest cyber security horror story that actually happened",
    platform: "shorts",
    duration: "30-40s",
    niche: "Storytelling & True Crime",
    tone: "storytelling",
    script: {
      viralScore: 96,
      viralAnalysis: "High suspense curve with micro-reveals every 4 seconds. Uses classic cold open storytelling mechanics optimized for YouTube Shorts re-watches.",
      hooks: [
        {
          hook: "In 2024, a company paid 25 million dollars to an employee who didn't exist.",
          trigger: "High Financial Mystery",
          explanation: "Specific dollar amount and paradoxical statement hooks curiosity instantly."
        },
        {
          hook: "This single email almost brought down an entire city's power grid.",
          trigger: "Catastrophic Stakes",
          explanation: "Extreme contrast between tiny trigger and massive consequence."
        },
        {
          hook: "If your webcam light turns on for even half a second, unplug your router.",
          trigger: "Personal Threat",
          explanation: "Evokes primal privacy concern that forces immediate attention."
        }
      ],
      script: [
        {
          time: "0:00 - 0:04",
          voiceover: "In 2024, a corporate finance director got on a video call with his entire executive board.",
          visual: "Dark moody lighting, webcam perspective showing simulated multi-window meeting",
          sfx: "Eerie low synth drone",
          onScreenText: "FEBRUARY 2024 ⚠️",
          retentionTip: "Establish narrative setting in first 2 seconds"
        },
        {
          time: "0:04 - 0:11",
          voiceover: "They instructed him to wire 25 million dollars immediately for a confidential acquisition.",
          visual: "Hands nervously typing on backlit keyboard in pitch black room",
          sfx: "Keyboard clicks + heartbeat thud",
          onScreenText: "$25,000,000 WIRE 💸",
          retentionTip: "Inject sudden stakes before second 5"
        },
        {
          time: "0:11 - 0:20",
          voiceover: "The CEO was talking. The CFO was nodding. The voices and faces were 100% identical. But none of them were real.",
          visual: "Glitch transition revealing the video feed breaking down into deepfake neural meshes",
          sfx: "Digital distortion glitch + heavy hit",
          onScreenText: "ALL DEEPFAKES 🤖",
          retentionTip: "The plot twist anchor point prevents swipe-away"
        },
        {
          time: "0:20 - 0:30",
          voiceover: "It was an orchestrated multi-person AI deepfake heist. Follow for part two on how the FBI tracked the wallet.",
          visual: "Map visual zooming into encrypted server clusters with red laser tracking",
          sfx: "Radar pulse + riser",
          onScreenText: "FOLLOW FOR PART 2 🔍",
          retentionTip: "Curiosity loop triggers subscription click"
        }
      ],
      bRollList: [
        { scene: "Zoom Meeting Bezel", suggestion: "Simulated boardroom call with flickering screen reflection" },
        { scene: "Deepfake Distortion", suggestion: "Subtle facial warping glitch on high-res portrait" },
        { scene: "Terminal Transaction", suggestion: "Green command line terminal confirming outgoing wire transfer" }
      ],
      ctaOptions: [
        { type: "Part 2 Curiosity", text: "Subscribe for Part 2 to see the exact footage the FBI recovered." },
        { type: "Discussion Question", text: "Would you have fallen for this? Tell me in the comments below." }
      ],
      cta: "Subscribe for Part 2 to see the exact footage the FBI recovered.",
      hashtags: ["#cybersecurity", "#truecrime", "#deepfake", "#techhistory", "#exismic"]
    }
  },

  "solopreneur": {
    id: "solopreneur",
    label: "0 to $10k Solopreneur Secret",
    topic: "How to reach $10k/mo as a solo creator using AI tools",
    platform: "reels",
    duration: "30-40s",
    niche: "Business & Finance",
    tone: "educational",
    script: {
      viralScore: 97,
      viralAnalysis: "Clear value-first blueprint with zero fluff. High aspirational appeal structured as a step-by-step math breakdown.",
      hooks: [
        {
          hook: "You don't need a team or funding to build a 10k a month digital business anymore.",
          trigger: "Limiting Belief Demolition",
          explanation: "Immediately invalidates common excuses and opens room for actionable steps."
        },
        {
          hook: "Here is the exact 3-step creator stack I'd use if I started over from zero tomorrow.",
          trigger: "Clean Slate Blueprint",
          explanation: "Promises a simple step-by-step roadmap from a trusted perspective."
        }
      ],
      script: [
        {
          time: "0:00 - 0:03",
          voiceover: "You don't need a team or funding to reach 10k a month as a solo creator anymore.",
          visual: "Clean desk setup with sleek laptop showing analytics dashboard",
          sfx: "Cash register ding + smooth whoosh",
          onScreenText: "SOLO CREATOR BLUEPRINT 📈",
          retentionTip: "Display real clean aesthetic"
        },
        {
          time: "0:03 - 0:12",
          voiceover: "Step 1: Pick one hyper-specific problem and create 3 short-form videos daily using automated script engines.",
          visual: "Split screen showing fast script outline generating on left, camera recording on right",
          sfx: "Pop sound effect",
          onScreenText: "1. 3 CLIPS DAILY 📹",
          retentionTip: "Numbered steps keep viewer anticipation high"
        },
        {
          time: "0:12 - 0:20",
          voiceover: "Step 2: Turn your highest-viewed video into a free 5-page downloadable PDF guide with Exismic.",
          visual: "Motion graphic of document compiling into clean PDF download",
          sfx: "Chime + swoosh",
          onScreenText: "2. FREE LEAD MAGNET 📄",
          retentionTip: "Clear tangible asset demonstration"
        },
        {
          time: "0:20 - 0:30",
          voiceover: "Step 3: Offer a 47-dollar masterclass on the backend. 7 sales a day is 10k a month. Comment 'ROADMAP' for the guide.",
          visual: "Simple math breakdown appearing on screen: 7 x $47 = $329/day ($10,000/mo)",
          sfx: "Upbeat sub-bass hit",
          onScreenText: "3. 7 SALES/DAY = $10K 🚀",
          retentionTip: "Simple math creates tangible believability"
        }
      ],
      bRollList: [
        { scene: "Dashboard Analytics", suggestion: "Clean modern revenue chart trending upward" },
        { scene: "Document Compiler", suggestion: "PDF generating with branded cover art in 1 click" },
        { scene: "Math Breakdown", suggestion: "Bold kinetic typography numbers floating over creator desk" }
      ],
      ctaOptions: [
        { type: "Comment Keyword", text: "Comment 'ROADMAP' and I'll send you the complete step-by-step Notion system." },
        { type: "Save for Implementation", text: "Save this post to plan your 30-day product launch." }
      ],
      cta: "Comment 'ROADMAP' and I'll send you the complete step-by-step Notion system.",
      hashtags: ["#solopreneur", "#onlinebusiness", "#creatorgrowth", "#financialfreedom", "#exismic"]
    }
  },

  "fitness": {
    id: "fitness",
    label: "3 Fitness Mistakes Ruining Gains",
    topic: "3 workout mistakes that are secretly destroying your progress",
    platform: "shorts",
    duration: "30-40s",
    niche: "Fitness & Health",
    tone: "controversial",
    script: {
      viralScore: 95,
      viralAnalysis: "High negative bias hook that challenges workout habits. Prevents viewer ego defense by offering rapid actionable corrective cues.",
      hooks: [
        {
          hook: "If your bench press has been stuck for months, you're probably making this mistake.",
          trigger: "Specific Plateau Identification",
          explanation: "Speaks directly to gym-goers currently frustrated with stagnation."
        },
        {
          hook: "Stop lifting weights every single day if you actually want to grow muscle.",
          trigger: "Counter-Intuitive Advice",
          explanation: "Sounds wrong at first glance, forcing viewers to wait for explanation."
        }
      ],
      script: [
        {
          time: "0:00 - 0:03",
          voiceover: "If your workout progress has been stuck for months, you're making this mistake.",
          visual: "Gym setting, lifter failing on bench press with slow motion zoom",
          sfx: "Heavy iron clang + dramatic hit",
          onScreenText: "WHY YOU'RE STUCK 🚫",
          retentionTip: "High-contrast visual struggle hooks empathy"
        },
        {
          time: "0:03 - 0:11",
          voiceover: "Mistake 1: Changing your exercises every week. Muscle hypertrophy requires progressive overload on the same movement.",
          visual: "Side-by-side graphic showing logbook weight tracking vs random exercise jumping",
          sfx: "Warning buzz",
          onScreenText: "1. STOP RANDOM WORKOUTS 📝",
          retentionTip: "Visual comparison diagram clarifies science"
        },
        {
          time: "0:11 - 0:20",
          voiceover: "Mistake 2: Leaving 4 reps in reserve. If your last rep doesn't look like you're fighting for your life, it doesn't count.",
          visual: "High-effort set with facial grit and controlled slow eccentric tempo",
          sfx: "Heartbeat pulse + riser",
          onScreenText: "2. TRAIN CLOSER TO FAILURE 🔥",
          retentionTip: "High energy rep footage raises dopamine"
        },
        {
          time: "0:20 - 0:30",
          voiceover: "Fix these two this week and watch your strength skyrocket. Share this with your workout partner who needs to hear it.",
          visual: "Lifter celebrating clean PR lift with fist pump",
          sfx: "Victory chime + sub-bass",
          onScreenText: "SHARE WITH A GYM BRO 🤝",
          retentionTip: "Relational share CTA drives viral link sends"
        }
      ],
      bRollList: [
        { scene: "Gym Failure Shot", suggestion: "Slow motion shot of barbell stopping mid-rep with high tension" },
        { scene: "Exercise Logbook", suggestion: "Close up of tracking weights and reps week over week" },
        { scene: "PR Celebration", suggestion: "High-energy celebration after hitting new personal record" }
      ],
      ctaOptions: [
        { type: "Tag/Share CTA", text: "Send this to your gym partner before your next workout session." },
        { type: "Save Workout", text: "Save this clip to review before your chest day tomorrow." }
      ],
      cta: "Send this to your gym partner before your next workout session.",
      hashtags: ["#gymtips", "#workoutmistakes", "#fitnessgrowth", "#musclegain", "#exismic"]
    }
  }
};
