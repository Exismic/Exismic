// Client-safe cosmetic permissions & allowed lists (No Prisma, No server-only dependencies)

export const ALLOWED_AVATAR_FRAMES = new Set([
  'neon-glow',
  'luxury-gold',
  'cosmic-nebula',
  'purple-energy',
  'cyberpunk-vibe',
  'cyan-beast',
  'royal-purple',
  'futuristic-hex',
  'emerald-viper',
  'diamond-ice',
  'solar-flare',
  'hyper-violet',
  'aurora-borealis',
  'obsidian-onyx',
  'hologram-prism',
  'crimson-inferno',
  'quantum-flux',
  'celestial-platinum',
  'plasma-storm',
  'sakura-blossom',
  'golden-pharaoh',
  'dark-matter',
  // 15 Brand New Unique Frames
  'astral-void',
  'molten-dragon',
  'cyber-glitch',
  'frostfire-eclipse',
  'chrono-warp',
  'void-walker',
  'synthwave-80s',
  'jade-dynasty',
  'blood-moon',
  'quantum-maglev',
  'starlight-valkyrie',
  'toxic-biohazard',
  'phantom-wraith',
  'solaris-apex',
  'abyssal-kraken',
]);

export const ALLOWED_NAME_GRADIENTS = new Set([
  'cyber-purple',
  'luxury-gold',
  'cosmic-rainbow',
  'neon-emerald',
  'royal-crimson',
  'void-blue',
  'sunset-flame',
  'diamond-glacier',
  'emerald-matrix',
  'solar-supernova',
  'hyper-fuchsia',
  'electric-amber',
  'stealth-silver',
  'hologram-prism',
  'crimson-inferno',
  'quantum-mint',
  'aurora-borealis',
  'plasma-neon',
  'sakura-bloom',
  'mythic-pharaoh',
  'abyssal-violet',
  // 15 Brand New Unique Name Styles
  'astral-void',
  'molten-dragon',
  'cyber-glitch',
  'frostfire-eclipse',
  'chrono-warp',
  'void-walker',
  'synthwave-80s',
  'jade-dynasty',
  'blood-moon',
  'quantum-maglev',
  'starlight-valkyrie',
  'toxic-biohazard',
  'phantom-wraith',
  'solaris-apex',
  'abyssal-kraken',
]);

export const ALLOWED_INSIGNIAS = new Set([
  'bolt-spark',
  'matrix-cube',
  'emerald-prism',
  'ice-shard',
  'void-singularity',
  'synth-prime',
  'solar-flare',
  'master-architect',
  'sovereign-crown',
  'paragon-hypercube',
  'cyber-dragon',
]);

// Curated Cosmetics Included with Pro (Curated starter perks, not all cosmetics!)
export const PRO_INCLUDED_AVATAR_FRAMES = new Set([
  'neon-glow',       // Rare
  'cyan-beast',      // Rare
  'cosmic-nebula',   // Epic
  'purple-energy',   // Epic
  'luxury-gold',     // Legendary
]);

export const PRO_INCLUDED_NAME_STYLES = new Set([
  'cyber-purple',    // Rare
  'sunset-flame',    // Rare
  'cosmic-rainbow',  // Epic
  'void-blue',       // Epic
  'luxury-gold',     // Legendary
]);

export const PRO_INCLUDED_INSIGNIAS = new Set([
  'bolt-spark',
  'matrix-cube',
  'emerald-prism',
  'ice-shard',
  'synth-prime',
]);

export function hasActiveProAccess(user: {
  email?: string | null;
  plan?: string | null;
  subscriptionStatus?: string | null;
  planExpiresAt?: Date | string | null;
  role?: string | null;
  dailyCredits?: number | null;
} | null | undefined): boolean {
  if (!user) return false;

  const plan = (user.plan || 'free').toLowerCase();
  const subscriptionStatus = (user.subscriptionStatus || 'none').toLowerCase();

  const isProPlan = plan.includes('pro') || (plan !== 'free' && plan !== 'none');
  const isSubActive = subscriptionStatus === 'active' || subscriptionStatus === 'pro';
  const hasProCredits = (user.dailyCredits ?? 0) >= 500;

  const hasEntitlement = isProPlan || isSubActive || hasProCredits;

  if (!hasEntitlement) return false;

  if (!user.planExpiresAt) return true;
  const expiresAt = new Date(user.planExpiresAt);
  return Number.isNaN(expiresAt.getTime()) || expiresAt > new Date();
}

export function canUserUseAvatarFrame(user: any, frameId: string | null | undefined): boolean {
  if (!frameId) return true;
  if (!ALLOWED_AVATAR_FRAMES.has(frameId)) return false;
  const unlocked = Array.isArray(user?.unlockedAvatarFrames)
    ? (user.unlockedAvatarFrames as string[])
    : Array.isArray(user?.unlocked_avatar_frames)
    ? (user.unlocked_avatar_frames as string[])
    : [];
  if (unlocked.includes(frameId)) return true;
  if (hasActiveProAccess(user) && PRO_INCLUDED_AVATAR_FRAMES.has(frameId)) return true;
  return false;
}

export function canUserUseNameGradient(user: any, gradientId: string | null | undefined): boolean {
  if (!gradientId) return true;
  if (!ALLOWED_NAME_GRADIENTS.has(gradientId)) return false;
  const unlocked = Array.isArray(user?.unlockedNameGradients)
    ? (user.unlockedNameGradients as string[])
    : Array.isArray(user?.unlocked_name_gradients)
    ? (user.unlocked_name_gradients as string[])
    : [];
  if (unlocked.includes(gradientId)) return true;
  if (hasActiveProAccess(user) && PRO_INCLUDED_NAME_STYLES.has(gradientId)) return true;
  return false;
}

export function canUserUseInsignia(user: any, insigniaId: string | null | undefined): boolean {
  if (!insigniaId) return true;
  if (!ALLOWED_INSIGNIAS.has(insigniaId)) return false;
  const unlocked = Array.isArray(user?.unlockedInsignias)
    ? (user.unlockedInsignias as string[])
    : Array.isArray(user?.unlocked_insignias)
    ? (user.unlocked_insignias as string[])
    : [];
  if (unlocked.includes(insigniaId)) return true;
  if (hasActiveProAccess(user) && PRO_INCLUDED_INSIGNIAS.has(insigniaId)) return true;
  return false;
}

export const ALLOWED_CANOPIES = new Set<string>([]);
export const PRO_INCLUDED_CANOPIES = new Set<string>([]);

export function canUserUseCanopy(_user: any, _canopyId: string | null | undefined): boolean {
  return false;
}
