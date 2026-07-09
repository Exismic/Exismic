"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Download, 
  FileText, 
  CreditCard, 
  Calendar, 
  ShieldCheck,
  Check,
  Receipt
} from 'lucide-react';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice?: {
    id: string;
    date: string;
    amount: string;
    plan: string;
    method: string;
    status: string;
  };
}

export function InvoiceModal({ isOpen, onClose, invoice }: InvoiceModalProps) {
  // Default dummy data if none provided
  const data = invoice || {
    id: "INV-2026-0507-8821",
    date: "May 7, 2026",
    amount: "$6.99",
    plan: "Exismic Elite Pro - Monthly",
    method: "Secure card payment",
    status: "Paid"
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center p-3 sm:items-center sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
          />

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            role="dialog"
            aria-modal="true"
            aria-label="Invoice details"
            className="relative max-h-[calc(100dvh-1.5rem)] w-full max-w-xl overflow-y-auto rounded-2xl border border-white/10 bg-zinc-950 shadow-[0_50px_100px_rgba(0,0,0,0.9)] sm:rounded-[3rem]"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-white/5 bg-zinc-950/95 p-4 backdrop-blur-xl sm:p-8">
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/5 bg-zinc-900 text-accent-purple shadow-xl sm:h-12 sm:w-12 sm:rounded-2xl">
                  <Receipt size={24} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-black italic uppercase tracking-tighter text-white sm:text-xl">Invoice Details</h3>
                  <p className="truncate text-[9px] font-black uppercase tracking-wider text-zinc-600 sm:tracking-widest">{data.id}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                aria-label="Close invoice"
                className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl text-zinc-500 transition-all hover:bg-white/5 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 p-4 sm:space-y-10 sm:p-10">
              {/* Status Banner */}
              <div className="flex flex-col gap-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6 sm:rounded-3xl">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <Check size={20} strokeWidth={3} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-white uppercase tracking-tight">Payment Successful</p>
                    <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-tight">Transaction securely processed</p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-2xl font-black italic text-white tracking-tighter">{data.amount}</p>
                  <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Amount Paid</p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-zinc-600">
                    <Calendar size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Billing Date</span>
                  </div>
                  <p className="text-sm font-bold text-white italic tracking-tight px-1">{data.date}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-zinc-600">
                    <CreditCard size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Payment Method</span>
                  </div>
                  <p className="text-sm font-bold text-white italic tracking-tight px-1">{data.method}</p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center gap-2 text-zinc-600">
                    <FileText size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Plan Description</span>
                  </div>
                  <p className="text-sm font-bold text-white italic tracking-tight px-1">{data.plan}</p>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-6 space-y-4">
                <button 
                  onClick={() => window.print()}
                  className="w-full py-5 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[10px] hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98]">
                  <Download size={16} />
                  Download PDF Invoice
                </button>
                <div className="flex items-center justify-center gap-2 text-[9px] font-black text-zinc-700 uppercase tracking-widest">
                  <ShieldCheck size={12} />
                  Secure Transaction • Exismic Studios
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
