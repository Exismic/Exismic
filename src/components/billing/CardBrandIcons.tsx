import React from "react";
import type { CardBrand } from "@/lib/payments/cardDetection";

interface CardBrandIconsProps {
  activeBrand: CardBrand;
  className?: string;
}

export function VisaIcon({ active = true, className = "h-4 w-6" }: { active?: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 36 24"
      className={`${className} transition-opacity duration-200 ${active ? "opacity-100 drop-shadow-[0_0_8px_rgba(37,99,235,0.4)]" : "opacity-30 grayscale"}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="36" height="24" rx="4" fill="#0E4595" />
      <path
        d="M14.65 16.5H12.43L13.82 7.82H16.04L14.65 16.5ZM21.91 8.01C21.48 7.84 20.81 7.66 19.98 7.66C17.65 7.66 16.02 8.89 16 10.63C15.98 11.93 17.15 12.65 18.04 13.08C18.96 13.52 19.27 13.81 19.27 14.21C19.26 14.82 18.52 15.1 17.84 15.1C16.92 15.1 16.39 14.94 15.75 14.64L15.43 14.49L15.09 16.63C15.67 16.89 16.74 17.12 17.85 17.13C20.31 17.13 21.92 15.93 21.94 14.07C21.95 13.01 21.28 12.21 19.89 11.55C19.05 11.12 18.54 10.87 18.55 10.37C18.56 9.93 19.04 9.47 20.02 9.47C20.73 9.46 21.26 9.61 21.65 9.78L21.91 8.01ZM28.44 7.82H26.72C26.19 7.82 25.79 7.97 25.56 8.52L21.82 17.16L24.16 17.16L24.63 15.86H27.5L27.77 17.16H29.83L28.44 7.82ZM25.26 14.15C25.45 13.62 26.23 11.51 26.23 11.51C26.21 11.54 26.4 11.02 26.51 10.71L26.66 11.45C26.66 11.45 27.09 13.52 27.22 14.15H25.26ZM11.41 7.82L9.28 13.73L9.04 12.56C8.64 11.18 7.42 9.69 6.06 8.97L8.03 16.5H10.4L13.78 7.82H11.41Z"
        fill="#FFFFFF"
      />
      <path
        d="M7.78 7.82H4.16L4.1 8.11C6.91 8.83 8.76 10.55 9.53 12.56L8.8 8.87C8.67 8.35 8.28 7.84 7.78 7.82Z"
        fill="#F7B600"
      />
    </svg>
  );
}

export function MastercardIcon({ active = true, className = "h-4 w-6" }: { active?: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 36 24"
      className={`${className} transition-opacity duration-200 ${active ? "opacity-100 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]" : "opacity-30 grayscale"}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="36" height="24" rx="4" fill="#141414" stroke="#2B2B2B" strokeWidth="0.5" />
      <circle cx="14" cy="12" r="7" fill="#EB001B" />
      <circle cx="22" cy="12" r="7" fill="#F79E1B" fillOpacity="0.85" />
    </svg>
  );
}

export function AmexIcon({ active = true, className = "h-4 w-6" }: { active?: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 36 24"
      className={`${className} transition-opacity duration-200 ${active ? "opacity-100 drop-shadow-[0_0_8px_rgba(2,132,199,0.4)]" : "opacity-30 grayscale"}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="36" height="24" rx="4" fill="#006FCF" />
      <path
        d="M7 15.5L8.2 12.5L7 9.5H8.7L9.5 11.5L10.3 9.5H12L10.8 12.5L12 15.5H10.3L9.5 13.5L8.7 15.5H7ZM12.7 15.5V9.5H16.7V11H14.4V11.8H16.4V13.3H14.4V14H16.7V15.5H12.7ZM17.4 15.5L19.5 9.5H21.3L23.4 15.5H21.6L21.2 14.2H19.6L19.2 15.5H17.4ZM20 12.8H20.8L20.4 11.3L20 12.8ZM24.1 15.5V9.5H27.5C28.5 9.5 29.3 10.2 29.3 11.2V13.8C29.3 14.8 28.5 15.5 27.5 15.5H24.1ZM25.8 14H27.3C27.5 14 27.6 13.8 27.6 13.6V11.4C27.6 11.2 27.5 11 27.3 11H25.8V14Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export function DiscoverIcon({ active = true, className = "h-4 w-6" }: { active?: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 36 24"
      className={`${className} transition-opacity duration-200 ${active ? "opacity-100 drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]" : "opacity-30 grayscale"}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="36" height="24" rx="4" fill="#FFFFFF" />
      <rect x="0.5" y="0.5" width="35" height="23" rx="3.5" stroke="#E5E7EB" />
      <path
        d="M6 14.5V9.5H9.5C11 9.5 12 10.5 12 12C12 13.5 11 14.5 9.5 14.5H6ZM7.5 13H9.2C10 13 10.5 12.6 10.5 12C10.5 11.4 10 11 9.2 11H7.5V13ZM13.5 14.5V9.5H15V14.5H13.5ZM16.5 14.5V13.2C17 14.1 18.2 14.6 19.2 14.6C21 14.6 22 13.5 22 12C22 10.5 21 9.4 19.2 9.4C18.2 9.4 17 9.9 16.5 10.8V9.5H15V14.5H16.5Z"
        fill="#111827"
      />
      <circle cx="25.5" cy="12" r="4.5" fill="#FF6000" />
    </svg>
  );
}

export function CardBrandBadgesRow({ activeBrand, className = "flex items-center gap-1.5" }: CardBrandIconsProps) {
  const isNeutral = activeBrand === "unknown";

  return (
    <div className={className}>
      <VisaIcon active={isNeutral || activeBrand === "visa"} />
      <MastercardIcon active={isNeutral || activeBrand === "mastercard"} />
      <AmexIcon active={isNeutral || activeBrand === "amex"} />
      <DiscoverIcon active={isNeutral || activeBrand === "discover"} />
    </div>
  );
}

export function ApplePayIcon({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center justify-center gap-1 text-black ${className}`}>
      <svg className="h-[18px] w-[18px] shrink-0 fill-current" viewBox="0 0 170 170">
        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.79-11.64-14.24-5.69-9.08-10.22-19.38-13.6-30.89-3.37-11.51-5.06-22.38-5.06-32.61 0-15.01 3.86-27.32 11.58-36.92 7.72-9.6 17.51-14.53 29.37-14.78 4.89 0 10.23 1.25 16.03 3.75 5.8 2.5 9.77 3.81 11.91 3.93 1.74-.12 5.92-1.52 12.54-4.2 6.62-2.68 12.19-3.9 16.71-3.66 12.63.63 22.84 5.37 30.64 14.22-10.99 6.64-16.37 15.68-16.14 27.12.23 9.4 3.78 17.15 10.65 23.25 6.87 6.1 14.93 9.43 24.18 10-2.39 7.42-5.49 14.95-9.3 22.59zM119.22 33.15c0-7.39 2.66-14.17 7.98-20.35 5.32-6.18 11.75-9.98 19.3-11.41.22 1.09.33 2.12.33 3.09 0 7.39-2.78 14.2-8.34 20.44-5.56 6.24-12.08 10.02-19.57 11.34-.1-.76-.15-1.53-.15-2.31z" />
      </svg>
      <span className="font-semibold text-base tracking-tight leading-none">Pay</span>
    </div>
  );
}

export function GooglePayIcon({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center justify-center gap-1.5 ${className}`}>
      <svg className="h-[19px] w-[19px] shrink-0" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.43 7.33 24 12 24z" />
        <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.57 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
      </svg>
      <span className="font-semibold text-base tracking-tight text-current leading-none">Pay</span>
    </div>
  );
}

export function UpiIcon({ className = "h-4 w-auto" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-1 font-bold text-xs ${className}`}>
      <span className="text-[#097939]">U</span>
      <span className="text-[#ed7524]">P</span>
      <span className="text-white">I</span>
    </div>
  );
}

export function RupayIcon({ className = "h-5 w-10" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 28"
      role="img"
      aria-label="RuPay"
      className={`shrink-0 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0.5" y="0.5" width="63" height="27" rx="4" fill="#102d4f" stroke="#ffffff26" />
      <text x="5" y="19" fill="#ffffff" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="800" fontStyle="italic" letterSpacing="-0.6">RuPay</text>
      <path d="M51 8L57 14L49 20Z" fill="#ed7524" />
      <path d="M56 8L62 14L54 20Z" fill="#097939" />
    </svg>
  );
}
