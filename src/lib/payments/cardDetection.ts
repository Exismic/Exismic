export type CardBrand = "visa" | "mastercard" | "amex" | "discover" | "diners" | "jcb" | "unknown";

export interface CardBrandInfo {
  brand: CardBrand;
  displayName: string;
  lengths: number[];
  cvvLength: number;
  formatPattern: number[]; // e.g. [4, 4, 4, 4] or [4, 6, 5]
}

export const CARD_BRANDS: Record<CardBrand, CardBrandInfo> = {
  visa: {
    brand: "visa",
    displayName: "Visa",
    lengths: [16, 19],
    cvvLength: 3,
    formatPattern: [4, 4, 4, 4],
  },
  mastercard: {
    brand: "mastercard",
    displayName: "Mastercard",
    lengths: [16],
    cvvLength: 3,
    formatPattern: [4, 4, 4, 4],
  },
  amex: {
    brand: "amex",
    displayName: "American Express",
    lengths: [15],
    cvvLength: 4,
    formatPattern: [4, 6, 5],
  },
  discover: {
    brand: "discover",
    displayName: "Discover",
    lengths: [16],
    cvvLength: 3,
    formatPattern: [4, 4, 4, 4],
  },
  diners: {
    brand: "diners",
    displayName: "Diners Club",
    lengths: [14],
    cvvLength: 3,
    formatPattern: [4, 6, 4],
  },
  jcb: {
    brand: "jcb",
    displayName: "JCB",
    lengths: [16],
    cvvLength: 3,
    formatPattern: [4, 4, 4, 4],
  },
  unknown: {
    brand: "unknown",
    displayName: "Card",
    lengths: [16],
    cvvLength: 3,
    formatPattern: [4, 4, 4, 4],
  },
};

/**
 * Detects the card brand based on leading digits
 */
export function detectCardBrand(cardNumber: string): CardBrand {
  const digits = cardNumber.replace(/\D/g, "");
  if (!digits) return "unknown";

  // Visa: starts with 4
  if (/^4/.test(digits)) {
    return "visa";
  }

  // Amex: starts with 34 or 37
  if (/^3[47]/.test(digits)) {
    return "amex";
  }

  // Mastercard: 51-55 or 2221-2720
  if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)/.test(digits)) {
    return "mastercard";
  }

  // Discover: 6011, 622126-622925, 644-649, 65
  if (/^(6011|65|64[4-9]|622)/.test(digits)) {
    return "discover";
  }

  // Diners Club: 300-305, 36, 38
  if (/^(30[0-5]|36|38)/.test(digits)) {
    return "diners";
  }

  // JCB: 3528-3589
  if (/^(?:2131|1800|35\d{3})/.test(digits)) {
    return "jcb";
  }

  return "unknown";
}

/**
 * Formats a card number with spaces according to its detected brand pattern
 */
export function formatCardNumber(value: string): { formatted: string; raw: string; brand: CardBrand } {
  const raw = value.replace(/\D/g, "");
  const brand = detectCardBrand(raw);
  const brandInfo = CARD_BRANDS[brand];
  const maxLength = brand === "amex" ? 15 : 19;
  const trimmed = raw.slice(0, maxLength);

  const parts: string[] = [];
  let currentIndex = 0;

  for (const groupSize of brandInfo.formatPattern) {
    if (currentIndex >= trimmed.length) break;
    parts.push(trimmed.slice(currentIndex, currentIndex + groupSize));
    currentIndex += groupSize;
  }

  // Handle any remaining digits for 19-digit cards
  if (currentIndex < trimmed.length) {
    parts.push(trimmed.slice(currentIndex));
  }

  return {
    formatted: parts.join(" "),
    raw: trimmed,
    brand,
  };
}

/**
 * Formats expiration date string as MM / YY
 */
export function formatExpirationDate(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (!digits) return "";

  if (digits.length === 1) {
    // If user enters 2-9 as first digit, auto-prepend 0
    if (Number(digits[0]) > 1) {
      return `0${digits[0]} / `;
    }
    return digits;
  }

  let month = digits.slice(0, 2);
  const monthNum = parseInt(month, 10);
  if (monthNum > 12) month = "12";
  if (monthNum === 0) month = "01";

  if (digits.length <= 2) {
    return `${month} / `;
  }

  const year = digits.slice(2, 4);
  return `${month} / ${year}`;
}

/**
 * Validates expiration date
 */
export function isExpirationValid(expiryString: string): boolean {
  const digits = expiryString.replace(/\D/g, "");
  if (digits.length < 4) return false;

  const month = parseInt(digits.slice(0, 2), 10);
  const year = 2000 + parseInt(digits.slice(2, 4), 10);

  if (month < 1 || month > 12) return false;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-indexed

  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;
  if (year > currentYear + 20) return false; // Sanity check

  return true;
}

/**
 * Validates card number using the Luhn checksum algorithm
 */
export function validateLuhn(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, "");
  if (digits.length < 13) return false;

  let sum = 0;
  let alternate = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n = (n % 10) + 1;
    }
    sum += n;
    alternate = !alternate;
  }

  return sum % 10 === 0;
}
