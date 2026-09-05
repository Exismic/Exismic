"use client";

import React from "react";
import { BuyCreditsModal } from "@/components/credits/BuyCreditsModal";

export interface CreditModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: "free" | "pro";
  credits: number;
}

export function CreditModal({ isOpen, onClose, plan }: CreditModalProps) {
  return (
    <BuyCreditsModal
      isOpen={isOpen}
      onClose={onClose}
      initialCategory={plan === "pro" ? "pro" : "credits"}
    />
  );
}
