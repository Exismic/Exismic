export const RESULT_EMAIL_LIMITS = { guest: 2, free: 10, pro: 50 } as const;
export type ResultEmailTier = keyof typeof RESULT_EMAIL_LIMITS;
