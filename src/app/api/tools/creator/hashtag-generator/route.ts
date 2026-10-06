import { publicJson } from "@/lib/public-json";
import { NextRequest } from "next/server";
import axios from "axios";
import { DEFAULT_GROQ_TEXT_MODEL } from "@/lib/ai-models";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

interface HashtagRequest {
  keywords: string;
  platform?: "all" | "instagram" | "tiktok" | "youtube" | "twitter";
  mixTrending?: boolean;
  count?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body: HashtagRequest = await req.json();
    const { keywords, platform = "all", mixTrending = true, count = 25 } = body;

    if (!keywords || typeof keywords !== "string" || !keywords.trim()) {
      return publicJson({ error: "Please provide a topic or keywords." }, { status: 400 });
    }

    const trimmedKeywords = keywords.trim();
    const rawKeys = process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || "";
    const apiKey = rawKeys.split(",").map((k) => k.trim()).filter(Boolean)[0];

    // If Groq API key is available, generate real AI hashtags with LLM
    if (apiKey) {
      try {
        const systemPrompt = `You are an elite Social Media Growth Strategist and Algorithm Specialist.
Your task is to generate realistic, trending, authentic, and diverse hashtags for content creators on ${platform.toUpperCase()}.

CRITICAL QUALITY RULES:
1. NEVER use repetitive, robotic formulas like adding "-community", "-daily", "-tips", "-strategy", "-routine" to the keyword over and over.
2. Generate real tags that creators, enthusiasts, and communities actually use in this niche. Include relevant subculture terms, slang, equipment, aesthetics, popular challenges, and creator identifiers.
3. Categorize into 3 distinct tiers:
   - "broadReach": High-volume discovery tags (500k+ to millions of posts) related to the broad niche and platform.
   - "nicheCommunity": Medium-volume community tags (50k–500k posts) representing the active community, lifestyle, or creators in this space.
   - "specificLongTail": High-conversion search/intent tags (specific problems, aesthetics, sub-genres, or specific techniques).
4. Provide a creative, natural post caption (1-2 sentences) with 1-2 authentic emojis and a natural call to action.
5. Provide a 1-sentence platform-specific strategy tip on how to use these hashtags effectively.

Output STRICTLY valid JSON with no markdown formatting or commentary:
{
  "broadReach": ["tag1", "tag2", ...],
  "nicheCommunity": ["tag1", "tag2", ...],
  "specificLongTail": ["tag1", "tag2", ...],
  "caption": "Engaging caption text here...",
  "strategyTip": "Actionable tip on placing these tags on ${platform}."
}`;

        const userPrompt = `Generate a high-performing hashtag stack and caption for:
Topic/Keywords: "${trimmedKeywords}"
Target Platform: ${platform}
Total Hashtags Target: ~${count}
Include Broad Trending: ${mixTrending}

Remember: Return pure JSON with tags without the '#' symbol. Do not duplicate words. Every tag must feel organic and authentic to the topic.`;

        const groqResponse = await axios.post(
          GROQ_API_URL,
          {
            model: DEFAULT_GROQ_TEXT_MODEL,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.7,
            max_tokens: 1500,
            response_format: { type: "json_object" },
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            timeout: 10000,
          }
        );

        const content = groqResponse.data.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          const sanitize = (list: any[]) =>
            Array.isArray(list)
              ? list
                  .map((t) =>
                    String(t)
                      .replace(/^#+/, "")
                      .replace(/[^a-zA-Z0-9_]/g, "")
                      .toLowerCase()
                  )
                  .filter((t) => t.length > 1)
              : [];

          const broadReach = sanitize(parsed.broadReach || []);
          const nicheCommunity = sanitize(parsed.nicheCommunity || []);
          const specificLongTail = sanitize(parsed.specificLongTail || []);

          if (broadReach.length > 0 || nicheCommunity.length > 0 || specificLongTail.length > 0) {
            return publicJson({
              success: true,
              source: "ai",
              broadReach,
              nicheCommunity,
              specificLongTail,
              caption: parsed.caption || `Can't get over this! 🔥 Drop your thoughts below and save this for later.`,
              strategyTip: parsed.strategyTip || `Mix high-volume tags with long-tail tags for sustained reach.`,
            });
          }
        }
      } catch (aiErr: any) {
        console.warn("Groq AI hashtag generation failed, using semantic dictionary fallback:", aiErr.message);
      }
    }

    // High quality offline fallback with rich semantic mappings
    const fallback = generateSemanticFallback(trimmedKeywords, platform, mixTrending);
    return publicJson({
      success: true,
      source: "semantic_engine",
      ...fallback,
    });
  } catch (error: any) {
    console.error("Hashtag generator API error:", error);
    return publicJson({ error: "Failed to generate hashtags." }, { status: 500 });
  }
}

// Rich semantic dictionary for popular topics to ensure zero mechanical repetitions
function generateSemanticFallback(
  input: string,
  platform: string,
  mixTrending: boolean
) {
  const lower = input.toLowerCase();

  // Curated real-world niche hashtag databases
  const NICHE_DB: Record<string, { broad: string[]; niche: string[]; longTail: string[]; caption: string }> = {
    cat: {
      broad: ["catsofinstagram", "petstagram", "cuteanimals", "instacat", "cats"],
      niche: ["purrfection", "meowlife", "felinefriends", "catoftheday", "indoorcatlife", "catloversclub"],
      longTail: ["blackcatsofinstagram", "tabbycatlove", "calicocattitude", "rescuecatsofinstagram", "kittenwhiskers"],
      caption: "Living rent-free in my camera roll 🐾✨ Tell me I'm not the only one obsessed with their cat! Drop your pet's name below 👇",
    },
    dog: {
      broad: ["dogsofinstagram", "puppylove", "doggo", "instadog", "petsoftiktok"],
      niche: ["goodboyvibes", "caninecompanion", "dogloversfeed", "pawsome", "puppygram"],
      longTail: ["goldenretrieverlife", "rescuedogsofig", "dogtrainingjourney", "adoptdontshop", "dailybarker"],
      caption: "Proof that happiness has four paws and a wagging tail 🐶 Drop a ❤️ if your dog is your best friend!",
    },
    fitness: {
      broad: ["fitnessmotivation", "gymlife", "fitfam", "workoutroutine", "shredded"],
      niche: ["progressiveoverload", "hypertrophytraining", "strengthandconditioning", "liftingweights", "mindsetiseverything"],
      longTail: ["pushdayworkout", "gymformtips", "highproteinrecipes", "calisthenicsbasics", "consistencyoverperfection"],
      caption: "Show up even on the days you don't feel like it. The results follow the discipline. Save this for your next session! 💪🔥",
    },
    travel: {
      broad: ["travelgram", "wanderlust", "exploretheworld", "passportready", "beautifuldestinations"],
      niche: ["slowtravel", "hiddenescapes", "roamtheplanet", "travelcommunity", "culturetrip"],
      longTail: ["budgettraveleurope", "solofemaletraveler", "offthebeatenpath", "bucketlistadventures", "mountainviews"],
      caption: "Adding this view to the permanent core memory bank 🌍✈️ Where is your dream destination this year? Let me know below!",
    },
    food: {
      broad: ["foodporn", "foodiegram", "instafood", "delicious", "yummy"],
      niche: ["homecookedgoodness", "chefspecial", "flavorpalette", "fromscratch", "comfortfoodie"],
      longTail: ["sourdoughbaking", "castironskilletcooking", "quickdinnerideas", "fermentedfoods", "streetfoodculture"],
      caption: "Made this from scratch and honestly didn't expect it to turn out this incredible 🤤 Recipe details below, save for dinner tonight!",
    },
    tech: {
      broad: ["techtrends", "softwareengineering", "developerlife", "technology", "artificialintelligence"],
      niche: ["buildinpublic", "indiehacker", "systemdesign", "cleanarchitecture", "frontendvibes"],
      longTail: ["nextjsapprouter", "reactdeveloper", "tailwindcssmagic", "typescriptwizard", "devproductivity"],
      caption: "Building in public day by day. Every small refactor compounds into something legendary 💻 What are you building right now?",
    },
    fashion: {
      broad: ["ootd", "streetwear", "fashioninspo", "fitcheck", "styleinspo"],
      niche: ["capsulewardrobe", "thriftedfinds", "layeringtechniques", "monochromeoutfit", "aestheticclothing"],
      longTail: ["vintageclothingcommunity", "japaneseamericana", "minimaliststyling", "sneakerheadinspo", "gorpcorestyle"],
      caption: "Keep the silhouette simple, let the textures do the talking 🖤 Which piece would you wear? Rate the fit 1-10 👇",
    },
    coffee: {
      broad: ["coffeelover", "specialtycoffee", "latteart", "caffeineaddict", "baristadaily"],
      niche: ["aeropressrecipes", "pourovercoffee", "coffeeroasting", "espressoshot", "thirdwavecoffee"],
      longTail: ["flatwhitelove", "coffeebrewingmethod", "morningritualcoffee", "ethiopianbeans", "homebaristalife"],
      caption: "The morning ritual that makes everything else possible ☕ Nothing beats that first sip. What is your go-to brew?",
    },
  };

  // Find matching niche in database
  for (const [key, data] of Object.entries(NICHE_DB)) {
    if (lower.includes(key)) {
      return {
        broadReach: mixTrending ? data.broad : [],
        nicheCommunity: data.niche,
        specificLongTail: data.longTail,
        caption: data.caption,
        strategyTip: `Use 3 broad discovery tags alongside the targeted community tags for optimal algorithm ranking.`,
      };
    }
  }

  // Generic natural vocabulary builder
  const words = input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const main = words[0] || "content";
  const sec = words[1] || "";

  const broadReach = mixTrending
    ? [
        `${main}`,
        `${main}gram`,
        `explore${main}`,
        platform === "tiktok" ? `${main}tok` : `${main}creator`,
        "viralcontent",
      ]
    : [];

  const nicheCommunity = [
    `${main}vibes`,
    sec ? `${main}and${sec}` : `${main}culture`,
    `${main}addict`,
    `allthings${main}`,
    `${main}universe`,
    `${main}enthusiast`,
  ];

  const specificLongTail = [
    sec ? `best${main}for${sec}` : `my${main}journey`,
    `${main}aesthetic`,
    `howiuse${main}`,
    `${main}essentials`,
  ];

  return {
    broadReach,
    nicheCommunity,
    specificLongTail,
    caption: `Can't get over this! 🔥 Everything you need to know about ${main}. Drop your thoughts below and save for later! 👇`,
    strategyTip: `Post during peak creator hours (11am-2pm or 7pm-9pm) for maximum initial reach.`,
  };
}
