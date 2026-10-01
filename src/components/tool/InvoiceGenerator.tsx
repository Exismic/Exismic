"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  BadgeCheck,
  Bot,
  Building2,
  Calculator,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Crown,
  Download,
  FileCheck,
  FileSpreadsheet,
  FileText,
  ImagePlus,
  Layout,
  LayoutGrid,
  LayoutTemplate,
  Loader2,
  Mail,
  MapPin,
  Maximize2,
  Minimize2,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Printer,
  Receipt,
  ReceiptText,
  RefreshCw,
  RotateCcw,
  Save,
  Send,
  Settings,
  Settings2,
  ShieldCheck,
  Tag,
  Trash2,
  User,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage, type RGB } from "pdf-lib";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePro } from "@/hooks/usePro";
import { useCredits } from "@/hooks/useCredits";
import { useSidebarStore } from "@/hooks/useSidebarStore";
import { ResultRetentionBar } from "@/components/tool/ResultRetentionBar";
import { getFunctionalStorageItem, removeFunctionalStorageItem, setFunctionalStorageItem } from "@/lib/cookie-consent";

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  price: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  status: "Draft" | "Sent" | "Paid" | "Overdue";
  issueDate: string;
  dueDate: string;
  paymentTerms: string;
  poNumber: string;
  clientName: string;
  clientEmail: string;
  clientTaxId: string;
  clientAddress: string;
  senderName: string;
  senderEmail: string;
  senderTaxId: string;
  senderAddress: string;
  items: InvoiceItem[];
  taxRate: number;
  discountType: "percent" | "fixed";
  discountValue: number;
  shippingFee: number;
  currency: string;
  notes: string;
  paymentInstructions: string;
  themeColor: string;
  template: "modern" | "minimal" | "executive" | "compact";
  logoDataUrl: string | null;
}

export interface InvoiceBlueprint {
  id: string;
  title: string;
  badge: string;
  role: string;
  summary: string;
  data: InvoiceData;
}

interface AIInvoiceResult {
  invoiceNumber?: string;
  status?: InvoiceData["status"];
  issueDate?: string;
  dueDate?: string;
  paymentTerms?: string;
  poNumber?: string;
  clientName?: string;
  clientEmail?: string;
  clientTaxId?: string;
  clientAddress?: string;
  senderName?: string;
  senderEmail?: string;
  senderTaxId?: string;
  senderAddress?: string;
  items?: Array<Partial<InvoiceItem>>;
  taxRate?: number;
  discountType?: InvoiceData["discountType"];
  discountValue?: number;
  shippingFee?: number;
  currency?: string;
  notes?: string;
  paymentInstructions?: string;
}

interface InvoiceGeneratorProps {
  tool?: { name?: string } | null;
  category?: { name?: string } | null;
}

const STORAGE_KEY = "exismic_invoice_draft_v2";
const A4_SIZE: [number, number] = [595.28, 841.89];

const CURRENCIES = [
  { code: "USD", symbol: "$", label: "USD ($) — US Dollar" },
  { code: "EUR", symbol: "\u20ac", label: "EUR (€) — Euro" },
  { code: "GBP", symbol: "\u00a3", label: "GBP (£) — British Pound" },
  { code: "INR", symbol: "\u20b9", label: "INR (₹) — Indian Rupee" },
  { code: "JPY", symbol: "\u00a5", label: "JPY (¥) — Japanese Yen" },
  { code: "AUD", symbol: "A$", label: "AUD (A$) — Australian Dollar" },
  { code: "CAD", symbol: "C$", label: "CAD (C$) — Canadian Dollar" },
];

const THEME_COLORS = [
  { name: "Emerald", hex: "#10b981" },
  { name: "Indigo", hex: "#6366f1" },
  { name: "Cyan", hex: "#06b6d4" },
  { name: "Rose", hex: "#f43f5e" },
  { name: "Amber", hex: "#f59e0b" },
  { name: "Slate", hex: "#475569" },
  { name: "Obsidian", hex: "#18181b" },
];

const TEMPLATE_OPTIONS = [
  { id: "modern", label: "Modern Studio", description: "Bold header band with clean tech styling" },
  { id: "executive", label: "Executive Rail", description: "Formal side accent stripe & corporate metadata" },
  { id: "minimal", label: "Minimalist Swiss", description: "Airy monochrome layout with delicate accent line" },
  { id: "compact", label: "Clean Compact", description: "High-density single-page view for quick orders" },
] as const;

const STATUS_STYLES: Record<InvoiceData["status"], string> = {
  Draft: "bg-zinc-500/10 text-zinc-300 border-zinc-400/20",
  Sent: "bg-cyan-400/10 text-cyan-200 border-cyan-300/20",
  Paid: "bg-emerald-400/10 text-emerald-200 border-emerald-300/20",
  Overdue: "bg-rose-400/10 text-rose-200 border-rose-300/20",
};

interface StudioDropdownOption<T extends string> {
  value: T;
  label: string;
  badge?: string;
  dotColor?: string;
  description?: string;
}

const STATUS_OPTIONS: Array<StudioDropdownOption<InvoiceData["status"]>> = [
  { value: "Draft", label: "Draft", dotColor: "bg-zinc-400", description: "Editing invoice, not yet billed" },
  { value: "Sent", label: "Sent", dotColor: "bg-cyan-400", description: "Sent to client, awaiting payment" },
  { value: "Paid", label: "Paid", dotColor: "bg-emerald-400", description: "Funds received and confirmed" },
  { value: "Overdue", label: "Overdue", dotColor: "bg-rose-400", description: "Past payment deadline" },
];

const CURRENCY_OPTIONS: Array<StudioDropdownOption<string>> = [
  { value: "USD", label: "USD ($) — US Dollar" },
  { value: "EUR", label: "EUR (€) — Euro" },
  { value: "GBP", label: "GBP (£) — British Pound" },
  { value: "INR", label: "INR (₹) — Indian Rupee" },
  { value: "JPY", label: "JPY (¥) — Japanese Yen" },
  { value: "AUD", label: "AUD (A$) — Australian Dollar" },
  { value: "CAD", label: "CAD (C$) — Canadian Dollar" },
];

const DISCOUNT_OPTIONS: Array<StudioDropdownOption<InvoiceData["discountType"]>> = [
  { value: "percent", label: "Percentage (%)", description: "Deduct a percentage from subtotal" },
  { value: "fixed", label: "Fixed Cash Amount", description: "Flat deduction from total amount" },
];

export const INVOICE_BLUEPRINTS: InvoiceBlueprint[] = [
  {
    id: "design",
    title: "Brand & Creative Design",
    badge: "Creative",
    role: "Apex Design Studio",
    summary: "Brand identity, Figma design system & custom vector iconography",
    data: {
      invoiceNumber: "INV-2026-104",
      status: "Sent",
      issueDate: "2026-09-28",
      dueDate: "2026-10-12",
      paymentTerms: "Net 14",
      poNumber: "PO-DSGN-884",
      clientName: "Northstar Technologies Inc.",
      clientEmail: "accounts@northstar.example",
      clientTaxId: "US-9428172",
      clientAddress: "88 Harbor Boulevard, Suite 400\nAustin, TX 78701",
      senderName: "Apex Design Studio",
      senderEmail: "billing@apexdesign.studio",
      senderTaxId: "CA-940162",
      senderAddress: "220 Studio Avenue, 4th Floor\nSan Francisco, CA 94103",
      items: [
        { id: "bp-d-1", description: "Comprehensive Brand Identity System & Style Guide", quantity: 1, unit: "project", price: 2800 },
        { id: "bp-d-2", description: "Interactive Web & Mobile UI Kit in Figma", quantity: 1, unit: "project", price: 1950 },
        { id: "bp-d-3", description: "Custom Vector Iconography Suite (48 Icons)", quantity: 1, unit: "set", price: 650 },
      ],
      taxRate: 8.25,
      discountType: "percent",
      discountValue: 5,
      shippingFee: 0,
      currency: "USD",
      notes: "Thank you for partnering with Apex Studio! We look forward to seeing the new identity launch.",
      paymentInstructions: "Please send payment via ACH wire transfer or corporate card. Reference invoice INV-2026-104 on payment receipt.",
      themeColor: "#10b981",
      template: "modern",
      logoDataUrl: null,
    },
  },
  {
    id: "engineering",
    title: "Full-Stack Web App",
    badge: "Engineering",
    role: "CloudScale Systems",
    summary: "Next.js frontend, REST API architecture & cloud deployment",
    data: {
      invoiceNumber: "INV-2026-218",
      status: "Draft",
      issueDate: "2026-09-29",
      dueDate: "2026-10-14",
      paymentTerms: "Net 15",
      poNumber: "PO-ENG-491",
      clientName: "Fintech Horizon Ltd.",
      clientEmail: "finance@fintechhorizon.com",
      clientTaxId: "GB-9021849",
      clientAddress: "142 Bishopsgate, Level 18\nLondon, EC2M 4NR, United Kingdom",
      senderName: "CloudScale Systems",
      senderEmail: "invoices@cloudscale.dev",
      senderTaxId: "WA-882019",
      senderAddress: "500 Cloud Parkway\nSeattle, WA 98101",
      items: [
        { id: "bp-e-1", description: "Next.js 16 Production Frontend Architecture & Optimization", quantity: 1, unit: "milestone", price: 3600 },
        { id: "bp-e-2", description: "High-Throughput REST & GraphQL API Integration", quantity: 1, unit: "milestone", price: 2400 },
        { id: "bp-e-3", description: "Cloud Infrastructure Setup & Automated CI/CD Pipeline", quantity: 1, unit: "setup", price: 1200 },
      ],
      taxRate: 0,
      discountType: "fixed",
      discountValue: 400,
      shippingFee: 0,
      currency: "USD",
      notes: "All code milestones delivered and peer-reviewed with 95%+ test coverage. Includes 30-day post-launch warranty.",
      paymentInstructions: "Please remit funds via direct bank transfer to CloudScale Systems. Include INV-2026-218 in payment wire reference.",
      themeColor: "#6366f1",
      template: "executive",
      logoDataUrl: null,
    },
  },
  {
    id: "marketing",
    title: "Growth & SEO Retainer",
    badge: "Marketing",
    role: "Velocity Growth Agency",
    summary: "Monthly SEO growth retainer, paid ads management & conversion sprint",
    data: {
      invoiceNumber: "INV-2026-340",
      status: "Sent",
      issueDate: "2026-09-30",
      dueDate: "2026-10-30",
      paymentTerms: "Net 30",
      poNumber: "PO-MKT-112",
      clientName: "Beacon Health Direct",
      clientEmail: "accounting@beaconhealth.example",
      clientTaxId: "MA-773912",
      clientAddress: "75 Arlington Street\nBoston, MA 02116",
      senderName: "Velocity Growth Agency",
      senderEmail: "billing@velocitygrowth.co",
      senderTaxId: "IL-650291",
      senderAddress: "180 Michigan Avenue\nChicago, IL 60601",
      items: [
        { id: "bp-m-1", description: "Monthly SEO Content Strategy & Programmatic Optimization", quantity: 1, unit: "month", price: 2200 },
        { id: "bp-m-2", description: "Multi-Channel Paid Ads Campaign Management (Search & Social)", quantity: 1, unit: "month", price: 1800 },
        { id: "bp-m-3", description: "High-Converting Landing Page A/B Testing & Implementation", quantity: 1, unit: "sprint", price: 950 },
      ],
      taxRate: 6.0,
      discountType: "percent",
      discountValue: 0,
      shippingFee: 0,
      currency: "USD",
      notes: "Monthly marketing retainer covers services rendered from October 1 through October 31, 2026.",
      paymentInstructions: "Payment due within 30 days. Checks or electronic ACH payments accepted. Contact billing@velocitygrowth.co for questions.",
      themeColor: "#06b6d4",
      template: "minimal",
      logoDataUrl: null,
    },
  },
  {
    id: "advisory",
    title: "Executive Strategic Advisory",
    badge: "Executive",
    role: "Vanguard Advisory Partners",
    summary: "Strategic executive session, org scaling audit & board workshop",
    data: {
      invoiceNumber: "INV-2026-405",
      status: "Paid",
      issueDate: "2026-09-25",
      dueDate: "2026-09-25",
      paymentTerms: "Due on Receipt",
      poNumber: "PO-EXEC-901",
      clientName: "Meridian Capital Group",
      clientEmail: "ops@meridiancap.example",
      clientTaxId: "DE-381029",
      clientAddress: "400 South Hope Street, 22nd Floor\nLos Angeles, CA 90071",
      senderName: "Vanguard Advisory Partners",
      senderEmail: "partner@vanguardadvisory.com",
      senderTaxId: "CO-449102",
      senderAddress: "1200 17th Street, Suite 950\nDenver, CO 80202",
      items: [
        { id: "bp-a-1", description: "Executive Leadership Strategy & Quarterly Planning Session", quantity: 1, unit: "session", price: 3500 },
        { id: "bp-a-2", description: "Corporate Operations & Tech Stack Scalability Audit", quantity: 1, unit: "audit", price: 2800 },
        { id: "bp-a-3", description: "Board of Directors Presentation Review & Alignment Workshop", quantity: 1, unit: "workshop", price: 1500 },
      ],
      taxRate: 0,
      discountType: "percent",
      discountValue: 0,
      shippingFee: 0,
      currency: "USD",
      notes: "Paid in full via wire confirmation WT-89214. Thank you for your leadership partnership.",
      paymentInstructions: "Receipt of payment recorded. No further balance is outstanding on this invoice account.",
      themeColor: "#18181b",
      template: "executive",
      logoDataUrl: null,
    },
  },
  {
    id: "video",
    title: "Commercial Video Production",
    badge: "Media",
    role: "Hyperframe Visuals",
    summary: "4K commercial shoot, 3D motion graphics & master sound mix",
    data: {
      invoiceNumber: "INV-2026-512",
      status: "Sent",
      issueDate: "2026-09-27",
      dueDate: "2026-10-11",
      paymentTerms: "50% Upfront",
      poNumber: "PO-VID-330",
      clientName: "Volt Mobility Co.",
      clientEmail: "media@voltmobility.example",
      clientTaxId: "FL-551029",
      clientAddress: "1001 Brickell Bay Drive\nMiami, FL 33131",
      senderName: "Hyperframe Visuals",
      senderEmail: "studio@hyperframe.media",
      senderTaxId: "OR-921840",
      senderAddress: "840 SE Hawthorne Blvd\nPortland, OR 97214",
      items: [
        { id: "bp-v-1", description: "4K Commercial Brand Video Production & Multi-Camera Shoot", quantity: 1, unit: "video", price: 4200 },
        { id: "bp-v-2", description: "3D Motion Graphics & Product Feature Animations", quantity: 1, unit: "package", price: 2100 },
        { id: "bp-v-3", description: "Custom Sound Design & Master Audio Mixing", quantity: 1, unit: "mix", price: 900 },
      ],
      taxRate: 7.5,
      discountType: "percent",
      discountValue: 0,
      shippingFee: 0,
      currency: "USD",
      notes: "Includes all 4K ProRes master deliveries, 9:16 vertical cuts for social, and full commercial music licensing rights.",
      paymentInstructions: "Payment due via wire transfer or credit card. Please note project reference 'Volt Mobility Commercial' in transaction memo.",
      themeColor: "#f43f5e",
      template: "modern",
      logoDataUrl: null,
    },
  },
  {
    id: "merchandise",
    title: "Custom Merchandise Order",
    badge: "Retail",
    role: "ThreadCraft Apparel Labs",
    summary: "Embroidered heavyweight hoodies, custom mailers & freight logistics",
    data: {
      invoiceNumber: "INV-2026-630",
      status: "Draft",
      issueDate: "2026-09-30",
      dueDate: "2026-10-30",
      paymentTerms: "Net 30",
      poNumber: "PO-RET-712",
      clientName: "Summit Outdoor Gear",
      clientEmail: "supply@summitoutdoors.example",
      clientTaxId: "UT-883910",
      clientAddress: "220 Main Street\nSalt Lake City, UT 84101",
      senderName: "ThreadCraft Apparel Labs",
      senderEmail: "orders@threadcraft.co",
      senderTaxId: "TN-772910",
      senderAddress: "410 4th Avenue South\nNashville, TN 37201",
      items: [
        { id: "bp-r-1", description: "Custom Embroidered Heavyweight Hoodies (Black & Pine Green)", quantity: 200, unit: "units", price: 24.5 },
        { id: "bp-r-2", description: "Eco-Friendly Branded Poly Mailers (10x13 inch)", quantity: 1000, unit: "units", price: 0.85 },
        { id: "bp-r-3", description: "Freight Logistics & Pallet Delivery to Warehouse", quantity: 1, unit: "shipment", price: 450 },
      ],
      taxRate: 8.0,
      discountType: "fixed",
      discountValue: 250,
      shippingFee: 0,
      currency: "USD",
      notes: "Production scheduled upon purchase order sign-off. Bulk order delivered with certified packing slips.",
      paymentInstructions: "Net 30 terms. Remit payment to ThreadCraft Apparel Labs via ACH or corporate check.",
      themeColor: "#f59e0b",
      template: "compact",
      logoDataUrl: null,
    },
  },
];

type StudioTab = "details" | "items" | "branding" | "ai";

const STUDIO_TABS: Array<{ id: StudioTab; label: string; icon: typeof FileText }> = [
  { id: "details", label: "Details", icon: Building2 },
  { id: "items", label: "Line Items", icon: Calculator },
  { id: "branding", label: "Branding", icon: Palette },
  { id: "ai", label: "AI Draft", icon: Bot },
];

function createBlankInvoice(invoiceNumber?: string): InvoiceData {
  const now = new Date();
  const due = new Date();
  due.setDate(now.getDate() + 14);

  return {
    invoiceNumber: invoiceNumber ?? `INV-${Math.floor(1000 + Math.random() * 9000)}`,
    status: "Draft",
    issueDate: now.toISOString().split("T")[0],
    dueDate: due.toISOString().split("T")[0],
    paymentTerms: "Net 14",
    poNumber: "",
    clientName: "",
    clientEmail: "",
    clientTaxId: "",
    clientAddress: "",
    senderName: "",
    senderEmail: "",
    senderTaxId: "",
    senderAddress: "",
    items: [
      { id: crypto.randomUUID(), description: "Professional Deliverable", quantity: 1, unit: "service", price: 0 },
    ],
    taxRate: 0,
    discountType: "percent",
    discountValue: 0,
    shippingFee: 0,
    currency: "USD",
    notes: "Thank you for your business.",
    paymentInstructions: "Please pay within the agreed terms. Include the invoice number in the payment reference.",
    themeColor: "#10b981",
    template: "modern",
    logoDataUrl: null,
  };
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
      }
    : { r: 0.06, g: 0.72, b: 0.5 };
}

function getCurrency(currency: string) {
  return CURRENCIES.find((item) => item.code === currency) || CURRENCIES[0];
}

function formatMoney(value: number, currency: string, useCode = false) {
  const amount = Number.isFinite(value) ? value : 0;
  const formatted = amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const selected = getCurrency(currency);
  return useCode ? `${selected.code} ${formatted}` : `${selected.symbol}${formatted}`;
}

function sanitizePdfText(value: string) {
  return value
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const clean = sanitizePdfText(text || "");
  const words = clean.split(" ").filter(Boolean);
  const lines: string[] = [];
  let line = "";

  words.forEach((word) => {
    const testLine = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(testLine, size) <= maxWidth) {
      line = testLine;
      return;
    }

    if (line) lines.push(line);
    line = word;
  });

  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function drawWrappedText(params: {
  page: PDFPage;
  text: string;
  x: number;
  y: number;
  maxWidth: number;
  size: number;
  font: PDFFont;
  color: RGB;
  lineHeight?: number;
}) {
  const lineHeight = params.lineHeight ?? params.size + 4;
  const lines = wrapText(params.text, params.font, params.size, params.maxWidth);
  lines.forEach((line, index) => {
    params.page.drawText(line, {
      x: params.x,
      y: params.y - index * lineHeight,
      size: params.size,
      font: params.font,
      color: params.color,
    });
  });
  return params.y - lines.length * lineHeight;
}

function dataUrlToBytes(dataUrl: string) {
  const base64 = dataUrl.split(",")[1];
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
}

// Custom Obsidian Cyber Dropdown Component
function StudioDropdown<T extends string>({
  value,
  options,
  onChange,
  className,
}: {
  value: T;
  options: StudioDropdownOption<T>[];
  onChange: (val: T) => void;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value) || options[0];

  return (
    <div className={cn("relative w-full", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full min-h-11 rounded-xl border bg-black/50 px-3.5 text-xs font-bold text-white flex items-center justify-between transition-all duration-200 cursor-pointer shadow-inner",
          isOpen
            ? "border-emerald-400/60 ring-2 ring-emerald-500/20 bg-emerald-500/[0.04]"
            : "border-white/10 hover:border-emerald-400/40 hover:bg-white/[0.04]"
        )}
      >
        <div className="flex items-center gap-2 truncate pr-2">
          {selected.dotColor && (
            <span className={cn("size-2 rounded-full shrink-0", selected.dotColor)} />
          )}
          <span className="truncate text-white">{selected.label}</span>
          {selected.badge && (
            <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-white/10 text-zinc-300">
              {selected.badge}
            </span>
          )}
        </div>
        <ChevronDown
          size={14}
          className={cn(
            "text-zinc-400 transition-transform duration-200 shrink-0",
            isOpen && "rotate-180 text-emerald-400"
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1.5 z-50 p-1.5 rounded-2xl bg-zinc-950/95 border border-emerald-500/30 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] space-y-1 max-h-60 overflow-y-auto"
          >
            {options.map((opt) => {
              const isOptionActive = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer group",
                    isOptionActive
                      ? "bg-emerald-500/20 text-emerald-200 font-bold border border-emerald-400/30"
                      : "text-zinc-300 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-2.5 truncate pr-2">
                    {opt.dotColor && (
                      <span className={cn("size-2 rounded-full shrink-0", opt.dotColor)} />
                    )}
                    <div className="truncate">
                      <div className="font-bold truncate">{opt.label}</div>
                      {opt.description && (
                        <div className="text-[10px] text-zinc-400 font-normal leading-tight mt-0.5 truncate">
                          {opt.description}
                        </div>
                      )}
                    </div>
                  </div>
                  {isOptionActive && <Check size={14} className="text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function InvoiceGenerator({ category, tool }: InvoiceGeneratorProps) {
  const { isPro, user } = usePro();
  const { credits, refreshCredits, setShowUpsell } = useCredits();
  const { isCompact, toggleCompact, isFocusMode, toggleFocusMode } = useSidebarStore();
  const [zoom, setZoom] = useState<number>(0.85);
  const [data, setData] = useState<InvoiceData>(() => INVOICE_BLUEPRINTS[0].data);
  const [activeBlueprintId, setActiveBlueprintId] = useState<string>("design");
  const [activeTab, setActiveTab] = useState<StudioTab>("details");
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [draftNotice, setDraftNotice] = useState<string | null>(null);
  const [aiBrief, setAiBrief] = useState("");
  const [aiStatus, setAiStatus] = useState<"idle" | "thinking" | "done">("idle");
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = getFunctionalStorageItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as InvoiceData;
          setData(parsed);
          setActiveBlueprintId("");
        }
      } catch {
        removeFunctionalStorageItem(STORAGE_KEY);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const subtotal = useMemo(
    () => data.items.reduce((sum, item) => sum + item.quantity * item.price, 0),
    [data.items],
  );

  const discountAmount = useMemo(() => {
    const raw = data.discountType === "percent" ? (subtotal * data.discountValue) / 100 : data.discountValue;
    return Math.min(Math.max(raw, 0), subtotal);
  }, [data.discountType, data.discountValue, subtotal]);

  const taxableBase = useMemo(() => Math.max(0, subtotal - discountAmount), [discountAmount, subtotal]);
  const taxAmount = useMemo(() => (taxableBase * data.taxRate) / 100, [data.taxRate, taxableBase]);
  const total = useMemo(() => taxableBase + taxAmount + data.shippingFee, [data.shippingFee, taxAmount, taxableBase]);
  const currency = getCurrency(data.currency);

  const completion = useMemo(() => {
    const fields = [
      data.invoiceNumber,
      data.issueDate,
      data.dueDate,
      data.senderName,
      data.senderAddress,
      data.clientName,
      data.clientAddress,
      data.items.some((item) => item.description && item.price > 0) ? "items" : "",
    ];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  }, [data]);

  const missingRecommendations = useMemo(() => {
    const recs: Array<{ label: string; tab: StudioTab }> = [];
    if (!data.senderName) recs.push({ label: "Add sender name", tab: "details" });
    if (!data.clientName) recs.push({ label: "Add client name", tab: "details" });
    if (!data.dueDate) recs.push({ label: "Set due date", tab: "details" });
    if (!data.items.some((item) => item.description && item.price > 0)) recs.push({ label: "Add priced items", tab: "items" });
    return recs;
  }, [data]);

  const updateData = <K extends keyof InvoiceData>(field: K, value: InvoiceData[K]) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const applyBlueprint = (blueprint: InvoiceBlueprint) => {
    setActiveBlueprintId(blueprint.id);
    setData(blueprint.data);
    setDraftNotice(`Loaded "${blueprint.title}" blueprint.`);
    window.setTimeout(() => setDraftNotice(null), 2500);
  };

  const startBlank = () => {
    setActiveBlueprintId("");
    setData(createBlankInvoice());
    setDraftNotice("Started with blank invoice.");
    window.setTimeout(() => setDraftNotice(null), 2500);
  };

  const addItem = () => {
    setData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { id: crypto.randomUUID(), description: "", quantity: 1, unit: "service", price: 0 },
      ],
    }));
  };

  const removeItem = (id: string) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.length === 1 ? prev.items : prev.items.filter((item) => item.id !== id),
    }));
  };

  const updateItem = <K extends keyof InvoiceItem>(id: string, field: K, value: InvoiceItem[K]) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  };

  const saveDraft = () => {
    setSaveStatus("saving");
    const saved = setFunctionalStorageItem(STORAGE_KEY, JSON.stringify(data));
    setSaveStatus(saved ? "saved" : "idle");
    setDraftNotice(saved ? "Invoice draft saved to your device." : "Please enable functional cookies to save draft.");
    window.setTimeout(() => {
      setSaveStatus("idle");
      setDraftNotice(null);
    }, 2500);
  };

  const handleLogoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => updateData("logoDataUrl", String(reader.result));
    reader.readAsDataURL(file);
  };

  const applyExismicAI = async () => {
    if (!aiBrief.trim()) return;
    setAiStatus("thinking");
    setAiError(null);

    try {
      const response = await fetch("/api/tools/invoice-generator/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief: aiBrief.trim() }),
      });
      const payload = await response.json().catch(() => ({}));

      if (response.status === 402 || payload.error?.toLowerCase().includes("credits")) {
        setShowUpsell(true);
        throw new Error(payload.error || "Insufficient credits. Please top up to use AI invoice generator.");
      }

      if (!response.ok) {
        throw new Error(payload.error || "Exismic AI could not build this invoice.");
      }

      await refreshCredits();

      const invoice = (payload.invoice || {}) as AIInvoiceResult;
      const invoiceNumber = invoice.invoiceNumber || `INV-${Math.floor(10000 + Math.random() * 90000)}`;
      const allowedStatus = ["Draft", "Sent", "Paid", "Overdue"].includes(invoice.status || "")
        ? invoice.status
        : "Draft";
      const cleanItems = (invoice.items || [])
        .map((item) => ({
          id: crypto.randomUUID(),
          description: String(item.description || "Professional deliverable").slice(0, 120),
          quantity: Math.max(0.01, Number(item.quantity) || 1),
          unit: String(item.unit || "service").slice(0, 24),
          price: Math.max(0, Number(item.price) || 0),
        }))
        .filter((item) => item.price > 0)
        .slice(0, 8);
      const selectedCurrency = CURRENCIES.some((c) => c.code === invoice.currency)
        ? invoice.currency
        : undefined;

      setData((prev) => ({
        ...prev,
        invoiceNumber,
        status: allowedStatus as InvoiceData["status"],
        issueDate: invoice.issueDate || prev.issueDate,
        dueDate: invoice.dueDate || prev.dueDate,
        paymentTerms: invoice.paymentTerms || prev.paymentTerms,
        poNumber: invoice.poNumber || prev.poNumber,
        clientName: invoice.clientName || prev.clientName,
        clientEmail: invoice.clientEmail || prev.clientEmail,
        clientTaxId: invoice.clientTaxId || prev.clientTaxId,
        clientAddress: invoice.clientAddress || prev.clientAddress,
        senderName: invoice.senderName || prev.senderName,
        senderEmail: invoice.senderEmail || prev.senderEmail,
        senderTaxId: invoice.senderTaxId || prev.senderTaxId,
        senderAddress: invoice.senderAddress || prev.senderAddress,
        items: cleanItems.length ? cleanItems : prev.items,
        taxRate: Math.max(0, Math.min(100, Number(invoice.taxRate) || 0)),
        discountType: invoice.discountType === "fixed" ? "fixed" : "percent",
        discountValue: Math.max(0, Number(invoice.discountValue) || 0),
        shippingFee: Math.max(0, Number(invoice.shippingFee) || 0),
        currency: selectedCurrency || prev.currency,
        notes: invoice.notes || "Thank you for partnering with us. Organized from project brief for prompt billing.",
        paymentInstructions: invoice.paymentInstructions || `Please reference invoice ${invoiceNumber} in payment memo.`,
      }));
      setActiveBlueprintId("");
      setAiStatus("done");
      setActiveTab("items");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("quests-updated"));
        window.dispatchEvent(new Event("credits-updated"));
      }
      window.setTimeout(() => setAiStatus("idle"), 2500);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : "Exismic AI could not build this invoice.");
      setAiStatus("idle");
    }
  };

  const saveToHistory = async () => {
    try {
      await fetch("/api/files/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolType: "invoice-generator",
          originalName: `Invoice ${data.invoiceNumber}`,
          fileType: "pdf",
          status: "completed",
          metadata: { ...data, total, subtotal, discountAmount, taxAmount },
          resultUrl: null,
        }),
      });
    } catch (error) {
      console.error("Invoice history save failed:", error);
    }
  };

  const drawPdfHeader = async (
    pdfDoc: PDFDocument,
    page: PDFPage,
    fonts: { regular: PDFFont; bold: PDFFont },
    accent: RGB,
    pageNumber: number,
  ) => {
    const { width, height } = page.getSize();
    const textColor = rgb(0.08, 0.08, 0.1);
    const mutedColor = rgb(0.42, 0.45, 0.5);

    if (data.template === "modern") {
      page.drawRectangle({ x: 0, y: height - 118, width, height: 118, color: accent });
      page.drawText("INVOICE", { x: 42, y: height - 68, size: 33, font: fonts.bold, color: rgb(1, 1, 1) });
      page.drawText(`# ${sanitizePdfText(data.invoiceNumber)}`, { x: width - 185, y: height - 54, size: 13, font: fonts.bold, color: rgb(1, 1, 1) });
      page.drawText(`Issue: ${data.issueDate}`, { x: width - 185, y: height - 76, size: 9, font: fonts.regular, color: rgb(1, 1, 1) });
      page.drawText(`Due: ${data.dueDate}`, { x: width - 185, y: height - 92, size: 9, font: fonts.regular, color: rgb(1, 1, 1) });
    } else if (data.template === "executive") {
      page.drawRectangle({ x: 0, y: 0, width: 16, height, color: accent });
      page.drawText("INVOICE", { x: 44, y: height - 72, size: 34, font: fonts.bold, color: textColor });
      page.drawLine({ start: { x: 44, y: height - 94 }, end: { x: width - 42, y: height - 94 }, thickness: 1.4, color: accent });
      page.drawText(`# ${sanitizePdfText(data.invoiceNumber)}`, { x: width - 188, y: height - 60, size: 13, font: fonts.bold, color: textColor });
      page.drawText(`Due ${data.dueDate}`, { x: width - 188, y: height - 78, size: 9, font: fonts.regular, color: mutedColor });
    } else if (data.template === "compact") {
      page.drawRectangle({ x: 42, y: height - 50, width: width - 84, height: 3, color: accent });
      page.drawText("INVOICE", { x: 42, y: height - 40, size: 26, font: fonts.bold, color: textColor });
      page.drawText(`# ${sanitizePdfText(data.invoiceNumber)} • Due ${data.dueDate}`, { x: width - 240, y: height - 38, size: 10, font: fonts.bold, color: mutedColor });
    } else {
      // Minimal
      page.drawText("INVOICE", { x: 42, y: height - 64, size: 31, font: fonts.bold, color: textColor });
      page.drawText(`# ${sanitizePdfText(data.invoiceNumber)}`, { x: width - 182, y: height - 58, size: 12, font: fonts.bold, color: textColor });
      page.drawLine({ start: { x: 42, y: height - 88 }, end: { x: width - 42, y: height - 88 }, thickness: 1, color: accent });
    }

    if (data.logoDataUrl) {
      try {
        const bytes = dataUrlToBytes(data.logoDataUrl);
        const image = data.logoDataUrl.includes("image/png")
          ? await pdfDoc.embedPng(bytes)
          : await pdfDoc.embedJpg(bytes);
        const logoY = data.template === "compact" ? height - 95 : height - 150;
        page.drawImage(image, { x: 42, y: logoY, width: 48, height: 48 });
      } catch (error) {
        console.warn("Logo embed failed:", error);
      }
    }

    page.drawText(`Page ${pageNumber}`, { x: width - 82, y: 26, size: 8, font: fonts.regular, color: mutedColor });
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const pdfDoc = await PDFDocument.create();
      const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const theme = hexToRgb(data.themeColor);
      const accent = rgb(theme.r, theme.g, theme.b);
      const textColor = rgb(0.1, 0.1, 0.12);
      const mutedColor = rgb(0.42, 0.45, 0.5);
      const lightColor = rgb(0.94, 0.95, 0.97);
      let pageNumber = 1;
      let page = pdfDoc.addPage(A4_SIZE);
      await drawPdfHeader(pdfDoc, page, { regular, bold }, accent, pageNumber);
      let { width, height } = page.getSize();

      const newPage = async () => {
        pageNumber += 1;
        page = pdfDoc.addPage(A4_SIZE);
        await drawPdfHeader(pdfDoc, page, { regular, bold }, accent, pageNumber);
        width = page.getSize().width;
        height = page.getSize().height;
        return height - 138;
      };

      const topOffset = data.logoDataUrl
        ? (data.template === "compact" ? 115 : 178)
        : (data.template === "compact" ? 85 : 148);
      let y = height - topOffset;
      const senderX = 42;
      const clientX = width / 2 + 4;

      page.drawText("FROM", { x: senderX, y, size: 9, font: bold, color: accent });
      page.drawText("BILL TO", { x: clientX, y, size: 9, font: bold, color: accent });
      y -= 20;

      const senderLines = [
        data.senderName || "Your Company",
        data.senderEmail || "email@example.com",
        data.senderTaxId ? `Tax ID: ${data.senderTaxId}` : "",
        data.senderAddress || "Your address",
      ].filter(Boolean);
      const clientLines = [
        data.clientName || "Client Name",
        data.clientEmail || "client@example.com",
        data.clientTaxId ? `Tax ID: ${data.clientTaxId}` : "",
        data.clientAddress || "Client address",
      ].filter(Boolean);

      let blockY = y;
      senderLines.forEach((line, index) => {
        blockY = drawWrappedText({
          page,
          text: line,
          x: senderX,
          y: y - index * 16,
          maxWidth: 225,
          size: index === 0 ? 11 : 9,
          font: index === 0 ? bold : regular,
          color: index === 0 ? textColor : mutedColor,
          lineHeight: 12,
        });
      });

      let clientBlockY = y;
      clientLines.forEach((line, index) => {
        clientBlockY = drawWrappedText({
          page,
          text: line,
          x: clientX,
          y: y - index * 16,
          maxWidth: 220,
          size: index === 0 ? 11 : 9,
          font: index === 0 ? bold : regular,
          color: index === 0 ? textColor : mutedColor,
          lineHeight: 12,
        });
      });

      y = Math.min(blockY, clientBlockY) - 34;

      const metaRows = [
        ["Status", data.status],
        ["Terms", data.paymentTerms],
        ["PO", data.poNumber || "-"],
      ];
      page.drawRectangle({ x: 42, y: y - 34, width: width - 84, height: 38, color: lightColor });
      metaRows.forEach(([label, value], index) => {
        const x = 62 + index * 160;
        page.drawText(label.toUpperCase(), { x, y: y - 9, size: 7, font: bold, color: mutedColor });
        page.drawText(sanitizePdfText(value), { x, y: y - 24, size: 10, font: bold, color: textColor });
      });
      y -= 78;

      const drawTableHeader = () => {
        page.drawRectangle({ x: 42, y: y - 8, width: width - 84, height: 28, color: data.template === "minimal" ? lightColor : accent });
        const headerColor = data.template === "minimal" ? textColor : rgb(1, 1, 1);
        page.drawText("Description", { x: 54, y: y + 2, size: 9, font: bold, color: headerColor });
        page.drawText("Qty", { x: 332, y: y + 2, size: 9, font: bold, color: headerColor });
        page.drawText("Unit", { x: 380, y: y + 2, size: 9, font: bold, color: headerColor });
        page.drawText("Price", { x: 438, y: y + 2, size: 9, font: bold, color: headerColor });
        page.drawText("Total", { x: 512, y: y + 2, size: 9, font: bold, color: headerColor });
        y -= 34;
      };

      drawTableHeader();

      for (const item of data.items) {
        const descLines = wrapText(item.description || "Deliverable", regular, 9, 250);
        const rowHeight = Math.max(28, descLines.length * 12 + 10);
        if (y - rowHeight < 150) {
          y = await newPage();
          drawTableHeader();
        }

        descLines.forEach((line, lineIndex) => {
          page.drawText(line, { x: 54, y: y - lineIndex * 12, size: 9, font: regular, color: textColor });
        });
        page.drawText(String(item.quantity), { x: 334, y, size: 9, font: regular, color: textColor });
        page.drawText(sanitizePdfText(item.unit || "service"), { x: 380, y, size: 9, font: regular, color: mutedColor });
        page.drawText(formatMoney(item.price, data.currency, true), { x: 428, y, size: 9, font: regular, color: textColor });
        page.drawText(formatMoney(item.quantity * item.price, data.currency, true), { x: 500, y, size: 9, font: bold, color: textColor });
        y -= rowHeight;
        page.drawLine({ start: { x: 42, y: y + 12 }, end: { x: width - 42, y: y + 12 }, thickness: 0.45, color: rgb(0.88, 0.89, 0.91) });
      }

      if (y < 265) y = await newPage();

      const totalsX = width - 224;
      const totalRows = [
        ["Subtotal", subtotal],
        [`Discount${data.discountType === "percent" ? ` (${data.discountValue}%)` : ""}`, -discountAmount],
        [`Tax (${data.taxRate}%)`, taxAmount],
        ["Fees / shipping", data.shippingFee],
      ].filter(([, value]) => Math.abs(Number(value)) > 0 || String(value) === String(subtotal));

      totalRows.forEach(([label, value], index) => {
        const rowY = y - index * 19;
        page.drawText(String(label), { x: totalsX, y: rowY, size: 9, font: regular, color: mutedColor });
        page.drawText(formatMoney(Number(value), data.currency, true), { x: totalsX + 108, y: rowY, size: 9, font: bold, color: textColor });
      });

      y -= totalRows.length * 19 + 16;
      page.drawRectangle({ x: totalsX - 12, y: y - 12, width: 192, height: 36, color: accent });
      page.drawText("TOTAL", { x: totalsX, y: y, size: 12, font: bold, color: rgb(1, 1, 1) });
      page.drawText(formatMoney(total, data.currency, true), { x: totalsX + 88, y, size: 12, font: bold, color: rgb(1, 1, 1) });

      const notesY = y - 54;
      if (notesY < 112) y = await newPage();
      else y = notesY;

      page.drawText("NOTES", { x: 42, y, size: 9, font: bold, color: accent });
      y = drawWrappedText({ page, text: data.notes, x: 42, y: y - 17, maxWidth: 245, size: 9, font: regular, color: mutedColor, lineHeight: 12 });

      page.drawText("PAYMENT", { x: 322, y: y + 17, size: 9, font: bold, color: accent });
      drawWrappedText({ page, text: data.paymentInstructions, x: 322, y, maxWidth: 220, size: 9, font: regular, color: mutedColor, lineHeight: 12 });

      const pdfBytes = await pdfDoc.save();
      const pdfBuffer = pdfBytes.buffer.slice(
        pdfBytes.byteOffset,
        pdfBytes.byteOffset + pdfBytes.byteLength,
      ) as ArrayBuffer;
      const blob = new Blob([pdfBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${data.invoiceNumber || "exismic"}.pdf`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);

      if (user) await saveToHistory();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("quests-updated"));
      }
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-[1720px] mx-auto px-2 sm:px-4 lg:px-6 pb-12 space-y-6">
      {/* Studio Top Control Deck */}
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-4 sm:p-5 backdrop-blur-2xl shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider">
              <Receipt className="size-4 text-emerald-400" />
              <span>Invoice Studio</span>
            </div>

            {/* Dynamic Readiness Meter */}
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-3.5 py-1.5">
              <div className="flex flex-col">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Readiness</span>
                  <span
                    className={cn(
                      "text-xs font-mono font-black",
                      completion >= 80 ? "text-emerald-400" : completion >= 50 ? "text-cyan-400" : "text-amber-400"
                    )}
                  >
                    {completion}%
                  </span>
                </div>
                <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden mt-0.5">
                  <div
                    className={cn(
                      "h-full transition-all duration-300 rounded-full",
                      completion >= 80 ? "bg-emerald-400" : completion >= 50 ? "bg-cyan-400" : "bg-amber-400"
                    )}
                    style={{ width: `${completion}%` }}
                  />
                </div>
              </div>
            </div>

            <div className={cn("rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider", STATUS_STYLES[data.status])}>
              {data.status}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={saveDraft}
              className={cn(
                "min-h-11 rounded-2xl border px-4 text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer",
                saveStatus === "saved"
                  ? "border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20 hover:border-emerald-400/50"
              )}
            >
              {saveStatus === "saved" ? <Check size={14} /> : <Save size={14} />}
              <span>{saveStatus === "saved" ? "Draft Saved" : "Save Draft"}</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="min-h-11 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white px-3.5 text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer size={15} />
              <span>Print</span>
            </button>

            <button
              type="button"
              onClick={generatePDF}
              disabled={isGenerating}
              className="min-h-11 rounded-2xl bg-white hover:bg-zinc-200 text-black px-4 text-xs font-black uppercase tracking-wider transition flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGenerating ? <Loader2 size={15} className="animate-spin text-black" /> : <Download size={15} />}
              <span>{isGenerating ? "Building PDF..." : "Download PDF"}</span>
            </button>

            {/* Studio Workspace Layout Toggles */}
            <div className="hidden lg:flex items-center gap-1.5 pl-2 border-l border-white/10">
              <button
                type="button"
                onClick={toggleCompact}
                title={isCompact ? "Expand Sidebar" : "Collapse Sidebar"}
                className={cn(
                  "min-h-11 px-3.5 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer",
                  isCompact ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200" : "border-white/10 bg-white/5 text-zinc-300 hover:text-white"
                )}
              >
                {isCompact ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
                <span className="text-[11px] font-bold">{isCompact ? "Show Sidebar" : "Compact"}</span>
              </button>

              <button
                type="button"
                onClick={toggleFocusMode}
                title={isFocusMode ? "Exit Focus Mode" : "Focus Studio (Hide UI)"}
                className={cn(
                  "min-h-11 px-3.5 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer",
                  isFocusMode ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.2)]" : "border-white/10 bg-white/5 text-zinc-300 hover:text-white"
                )}
              >
                {isFocusMode ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                <span className="text-[11px] font-bold">{isFocusMode ? "Exit Focus" : "Focus Studio"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 1-Click Instant Invoice Blueprints Bar */}
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.025] p-4 sm:p-5 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <LayoutGrid size={15} />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white">Instant Invoice Blueprints</h3>
              <p className="text-[11px] font-medium text-zinc-400">Select a pre-filled client blueprint to jumpstart your invoice in 1 click</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={startBlank}
              className="px-3 py-1.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>Start Blank</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {INVOICE_BLUEPRINTS.map((bp) => {
            const isSelected = activeBlueprintId === bp.id;
            return (
              <button
                key={bp.id}
                type="button"
                onClick={() => applyBlueprint(bp)}
                className={cn(
                  "p-3 rounded-2xl text-left border transition-all duration-200 cursor-pointer flex flex-col justify-between group",
                  isSelected
                    ? "bg-emerald-500/15 border-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-400/30"
                    : "bg-white/[0.03] border-white/10 hover:border-white/25 hover:bg-white/[0.06]"
                )}
              >
                <div>
                  <span
                    className={cn(
                      "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md inline-block mb-1.5",
                      isSelected ? "bg-emerald-400 text-black font-black" : "bg-white/10 text-zinc-400 group-hover:text-zinc-200"
                    )}
                  >
                    {bp.badge}
                  </span>
                  <p
                    className={cn(
                      "text-xs font-bold leading-snug line-clamp-1",
                      isSelected ? "text-white font-black" : "text-zinc-300 group-hover:text-white"
                    )}
                  >
                    {bp.title}
                  </p>
                </div>
                <p className="text-[10px] text-zinc-500 line-clamp-1 mt-1 font-medium">{bp.role}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Actionable Readiness Checklist or Success Confirmation */}
      {draftNotice && (
        <div className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-5 py-3 text-sm font-bold text-emerald-200 flex items-center gap-3">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span>{draftNotice}</span>
        </div>
      )}

      {missingRecommendations.length > 0 ? (
        <div className="rounded-2xl border border-amber-300/20 bg-amber-500/[0.08] px-4 py-3 text-xs font-medium text-amber-200/90 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-400 shrink-0" />
            <span className="font-bold text-amber-100">Recommended invoice details:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {missingRecommendations.map((rec, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveTab(rec.tab)}
                className="px-2.5 py-1 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 text-amber-200 text-[11px] font-bold transition cursor-pointer"
              >
                + {rec.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.08] px-4 py-3 text-xs font-medium text-emerald-200 flex items-center gap-2.5">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span className="font-bold text-emerald-100">Invoice is 100% complete and ready for billing & client export.</span>
        </div>
      )}

      {/* Main Studio Arena */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Side: Segmented Tabbed Deck */}
        <div className="xl:col-span-5 space-y-5">
          {/* Segmented Tab Navigation with Zero Ellipsis Truncation */}
          <div className="grid grid-cols-4 gap-1.5 p-1.5 rounded-2xl bg-black/40 border border-white/10">
            {STUDIO_TABS.map((tab) => {
              const Icon = tab.icon;
              const isTabActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer text-center",
                    isTabActive
                      ? "bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon size={14} className={cn("shrink-0", isTabActive ? "text-emerald-400" : "text-zinc-400")} />
                  <span className="text-[11px] font-bold whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: DETAILS & PARTIES */}
          {activeTab === "details" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <Card title="Invoice Metadata" icon={ReceiptText}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Invoice Number">
                    <input
                      value={data.invoiceNumber}
                      onChange={(e) => updateData("invoiceNumber", e.target.value)}
                      className={inputClass}
                      placeholder="INV-0001"
                    />
                  </Field>

                  {/* Custom Glassmorphic Payment Status Dropdown */}
                  <Field label="Payment Status">
                    <StudioDropdown
                      value={data.status}
                      options={STATUS_OPTIONS}
                      onChange={(val) => updateData("status", val)}
                    />
                  </Field>

                  <Field label="Issue Date">
                    <input
                      type="date"
                      value={data.issueDate}
                      onChange={(e) => updateData("issueDate", e.target.value)}
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Due Date">
                    <input
                      type="date"
                      value={data.dueDate}
                      onChange={(e) => updateData("dueDate", e.target.value)}
                      className={inputClass}
                    />
                  </Field>

                  <div className="sm:col-span-2 space-y-2">
                    <Field label="Payment Terms">
                      <input
                        value={data.paymentTerms}
                        onChange={(e) => updateData("paymentTerms", e.target.value)}
                        placeholder="Net 14, Net 30, Due on Receipt"
                        className={inputClass}
                      />
                    </Field>
                    {/* 1-Click Quick Preset Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {["Net 14", "Net 30", "Due on Receipt", "50% Upfront"].map((term) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => updateData("paymentTerms", term)}
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer",
                            data.paymentTerms === term
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/5"
                          )}
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <Field label="Purchase Order (PO #)">
                      <input
                        value={data.poNumber}
                        onChange={(e) => updateData("poNumber", e.target.value)}
                        placeholder="Optional client PO reference"
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </div>
              </Card>

              <Card title="Billing Parties" icon={Building2}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-3">
                    <SectionLabel>Your Company (Sender)</SectionLabel>
                    <input
                      value={data.senderName}
                      onChange={(e) => updateData("senderName", e.target.value)}
                      placeholder="Your Company Name"
                      className={inputClass}
                    />
                    <input
                      value={data.senderEmail}
                      onChange={(e) => updateData("senderEmail", e.target.value)}
                      placeholder="billing@yourcompany.com"
                      className={inputClass}
                    />
                    <input
                      value={data.senderTaxId}
                      onChange={(e) => updateData("senderTaxId", e.target.value)}
                      placeholder="Tax / VAT / GST ID (optional)"
                      className={inputClass}
                    />
                    <textarea
                      value={data.senderAddress}
                      onChange={(e) => updateData("senderAddress", e.target.value)}
                      placeholder="Street address, City, Country"
                      className={textareaClass}
                    />
                  </div>
                  <div className="space-y-3">
                    <SectionLabel>Bill To (Client)</SectionLabel>
                    <input
                      value={data.clientName}
                      onChange={(e) => updateData("clientName", e.target.value)}
                      placeholder="Client Company or Name"
                      className={inputClass}
                    />
                    <input
                      value={data.clientEmail}
                      onChange={(e) => updateData("clientEmail", e.target.value)}
                      placeholder="client@company.com"
                      className={inputClass}
                    />
                    <input
                      value={data.clientTaxId}
                      onChange={(e) => updateData("clientTaxId", e.target.value)}
                      placeholder="Client Tax ID (optional)"
                      className={inputClass}
                    />
                    <textarea
                      value={data.clientAddress}
                      onChange={(e) => updateData("clientAddress", e.target.value)}
                      placeholder="Client address & billing location"
                      className={textareaClass}
                    />
                  </div>
                </div>
              </Card>

              <button
                type="button"
                onClick={() => setActiveTab("items")}
                className="w-full min-h-12 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-black uppercase tracking-wider text-zinc-300 hover:text-white transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to Line Items</span>
                <ChevronRight size={14} />
              </button>
            </motion.div>
          )}

          {/* TAB 2: LINE ITEMS & TOTALS */}
          {activeTab === "items" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <Card title="Line Items & Deliverables" icon={Calculator}>
                <div className="space-y-3.5">
                  {data.items.map((item, index) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-white/10 bg-black/30 p-3.5 space-y-2.5 transition hover:border-white/20"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                          Item #{index + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-black text-emerald-400">
                            {formatMoney(item.quantity * item.price, data.currency)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="size-7 rounded-lg text-zinc-500 hover:bg-rose-500/15 hover:text-rose-300 transition flex items-center justify-center cursor-pointer"
                            title="Delete item"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <input
                        value={item.description}
                        onChange={(e) => updateItem(item.id, "description", e.target.value)}
                        placeholder="Deliverable description..."
                        className={inputClass}
                      />

                      <div className="grid grid-cols-3 gap-2.5">
                        <div>
                          <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500 block mb-1">Qty</label>
                          <input
                            type="number"
                            min="0.01"
                            step="any"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value) || 0)}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500 block mb-1">Unit</label>
                          <input
                            value={item.unit}
                            onChange={(e) => updateItem(item.id, "unit", e.target.value)}
                            placeholder="hrs, items"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500 block mb-1">Rate</label>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={item.price}
                            onChange={(e) => updateItem(item.id, "price", Number(e.target.value) || 0)}
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addItem}
                    className="w-full min-h-11 rounded-2xl border border-dashed border-emerald-400/30 bg-emerald-500/10 text-emerald-200 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-500/20 hover:border-emerald-400/50 transition cursor-pointer"
                  >
                    <Plus size={15} />
                    Add Line Item
                  </button>

                  {/* Quick-Add Item Suggestions */}
                  <div className="pt-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block mb-1.5">
                      Quick Suggestions:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { desc: "Hourly Consulting Services", price: 120, unit: "hour" },
                        { desc: "Design & UX Sprint", price: 1500, unit: "sprint" },
                        { desc: "Rush Delivery & Priority Turnaround", price: 350, unit: "service" },
                        { desc: "Monthly Maintenance Retainer", price: 800, unit: "month" },
                      ].map((sug, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setData((prev) => ({
                              ...prev,
                              items: [
                                ...prev.items,
                                {
                                  id: crypto.randomUUID(),
                                  description: sug.desc,
                                  quantity: 1,
                                  unit: sug.unit,
                                  price: sug.price,
                                },
                              ],
                            }));
                          }}
                          className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-medium text-zinc-300 hover:text-white transition cursor-pointer"
                        >
                          + {sug.desc} (${sug.price})
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              <Card title="Calculations & Payment" icon={Receipt}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Custom Glassmorphic Currency Dropdown */}
                  <Field label="Billing Currency">
                    <StudioDropdown
                      value={data.currency}
                      options={CURRENCY_OPTIONS}
                      onChange={(val) => updateData("currency", val)}
                    />
                  </Field>

                  <Field label="Tax Rate (%)">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={data.taxRate}
                      onChange={(e) => updateData("taxRate", Number(e.target.value) || 0)}
                      className={inputClass}
                      placeholder="0.00%"
                    />
                  </Field>

                  {/* Custom Glassmorphic Discount Type Dropdown */}
                  <Field label="Discount Type">
                    <StudioDropdown
                      value={data.discountType}
                      options={DISCOUNT_OPTIONS}
                      onChange={(val) => updateData("discountType", val)}
                    />
                  </Field>

                  <Field label="Discount Value">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={data.discountValue}
                      onChange={(e) => updateData("discountValue", Number(e.target.value) || 0)}
                      className={inputClass}
                      placeholder="0"
                    />
                  </Field>

                  <Field label="Shipping or Additional Fees">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={data.shippingFee}
                      onChange={(e) => updateData("shippingFee", Number(e.target.value) || 0)}
                      className={inputClass}
                      placeholder="0.00"
                    />
                  </Field>

                  <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 flex flex-col justify-between">
                    <p className="text-[10px] font-black uppercase tracking-wider text-emerald-200/70">Grand Total</p>
                    <p className="mt-1 text-2xl font-black text-white font-mono">{formatMoney(total, data.currency)}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <Field label="Payment Instructions & Wire Details">
                    <textarea
                      value={data.paymentInstructions}
                      onChange={(e) => updateData("paymentInstructions", e.target.value)}
                      placeholder="Bank wire transfer details, ACH routing, Stripe or PayPal reference..."
                      className={textareaClass}
                    />
                  </Field>
                  <Field label="Invoice Notes / Terms">
                    <textarea
                      value={data.notes}
                      onChange={(e) => updateData("notes", e.target.value)}
                      placeholder="Notes for client, warranty terms, payment due dates..."
                      className={textareaClass}
                    />
                  </Field>
                </div>
              </Card>

              <button
                type="button"
                onClick={() => setActiveTab("branding")}
                className="w-full min-h-12 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-black uppercase tracking-wider text-zinc-300 hover:text-white transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to Branding</span>
                <ChevronRight size={14} />
              </button>
            </motion.div>
          )}

          {/* TAB 3: STYLE & BRANDING */}
          {activeTab === "branding" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <Card title="Invoice Layout Template" icon={LayoutTemplate}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {TEMPLATE_OPTIONS.map((tpl) => {
                    const isSelected = data.template === tpl.id;
                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => updateData("template", tpl.id)}
                        className={cn(
                          "rounded-2xl border p-4 text-left transition-all cursor-pointer group",
                          isSelected
                            ? "border-emerald-400 bg-emerald-500/15 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-400/30"
                            : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20"
                        )}
                      >
                        <p className={cn("text-xs font-black", isSelected ? "text-white" : "text-zinc-200")}>
                          {tpl.label}
                        </p>
                        <p className="mt-1 text-[11px] font-medium leading-relaxed text-zinc-400">
                          {tpl.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </Card>

              <Card title="Brand Accent Color" icon={Palette}>
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    {THEME_COLORS.map((color) => (
                      <button
                        key={color.hex}
                        type="button"
                        onClick={() => updateData("themeColor", color.hex)}
                        className={cn(
                          "h-10 w-10 rounded-full border-2 transition-all cursor-pointer relative",
                          data.themeColor.toLowerCase() === color.hex.toLowerCase()
                            ? "border-white scale-110 shadow-lg"
                            : "border-transparent opacity-75 hover:opacity-100"
                        )}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      >
                        {data.themeColor.toLowerCase() === color.hex.toLowerCase() && (
                          <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-black">
                            ✓
                          </span>
                        )}
                      </button>
                    ))}
                    {/* Custom Color Pipette */}
                    <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer">
                      <span className="text-[10px] font-black uppercase text-zinc-400">Custom</span>
                      <input
                        type="color"
                        value={data.themeColor}
                        onChange={(e) => updateData("themeColor", e.target.value)}
                        className="h-6 w-6 rounded border-0 bg-transparent cursor-pointer"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Active brand color: <span className="font-mono text-white font-bold">{data.themeColor}</span>
                  </p>
                </div>
              </Card>

              <Card title="Company Brand Logo" icon={ImagePlus}>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-white">Upload Brand Logo</p>
                      <p className="text-[11px] text-zinc-400 font-medium mt-0.5">
                        PNG or JPEG logo is embedded into the top header of both live preview and PDF export.
                      </p>
                    </div>
                    <label className="min-h-11 rounded-2xl bg-white text-black px-4 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer hover:bg-zinc-200 transition-all shadow-md shrink-0">
                      <ImagePlus size={15} />
                      <span>{data.logoDataUrl ? "Change Logo" : "Upload Logo"}</span>
                      <input type="file" accept="image/png,image/jpeg" onChange={handleLogoUpload} className="hidden" />
                    </label>
                  </div>

                  {data.logoDataUrl && (
                    <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={data.logoDataUrl} alt="Invoice logo preview" className="h-12 w-12 rounded-xl object-contain bg-white p-1" />
                        <span className="text-xs font-bold text-zinc-300">Logo attached</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateData("logoDataUrl", null)}
                        className="text-xs font-bold text-rose-400 hover:text-rose-300 transition cursor-pointer"
                      >
                        Remove Logo
                      </button>
                    </div>
                  )}
                </div>
              </Card>

              <button
                type="button"
                onClick={() => setActiveTab("ai")}
                className="w-full min-h-12 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-black uppercase tracking-wider text-zinc-300 hover:text-white transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to AI Draft</span>
                <ChevronRight size={14} />
              </button>
            </motion.div>
          )}

          {/* TAB 4: AI FAST DRAFT */}
          {activeTab === "ai" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <Card title="AI Invoice Assistant" icon={Bot}>
                <div className="space-y-4">
                  <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-black/25 text-emerald-300">
                        <Bot size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-white">Project Brief to Structured Invoice</p>
                        <p className="mt-1 text-xs font-medium leading-relaxed text-emerald-100/70">
                          Describe the client, deliverables, quantities, rates, tax, or discounts. Exismic AI organizes everything cleanly into your draft.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                      Quick Prompt Inspiration:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        "Agency Retainer for Northstar Creative $4,500, due in 14 days, tax 8.25%",
                        "Full-Stack Web App sprint $5,800, 3 milestones, Net 15, $300 discount",
                        "Photography Shoot 8 hours at $150/hr, studio gear $400, tax 7%",
                        "Consulting retainer 10 hours at $180, strategy workshop $1,200",
                      ].map((promptText, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setAiBrief(promptText)}
                          className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-medium text-zinc-300 hover:text-white transition cursor-pointer text-left"
                        >
                          "{promptText.slice(0, 38)}..."
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    value={aiBrief}
                    onChange={(e) => setAiBrief(e.target.value)}
                    placeholder="Example: Create an invoice for Northstar Creative for brand identity $2200, landing page $1800, consulting 10 hours at $120, tax 8.25%, discount 5%, due in 14 days..."
                    className={cn(textareaClass, "min-h-32")}
                  />

                  <button
                    type="button"
                    onClick={applyExismicAI}
                    disabled={!aiBrief.trim() || aiStatus === "thinking"}
                    className="relative flex min-h-12 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-xs font-black uppercase tracking-widest text-black shadow-lg transition-all hover:scale-[1.01] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                  >
                    {aiStatus === "thinking" ? (
                      <Loader2 size={16} className="animate-spin text-black" />
                    ) : (
                      <Bot size={16} className="text-black" />
                    )}
                    <span>
                      {aiStatus === "thinking"
                        ? "Exismic AI Organizing..."
                        : aiStatus === "done"
                        ? "Invoice Populated!"
                        : isPro
                        ? "Draft With AI (Pro)"
                        : "Draft With AI (8 Credits)"}
                    </span>
                  </button>

                  {aiError && (
                    <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-xs font-bold leading-relaxed text-rose-100">
                      {aiError}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Right Side: Pinned Interactive Live Preview Canvas */}
        <div className="xl:col-span-7 xl:sticky xl:top-24 space-y-4">
          {/* Canvas Zoom & Scale Controls */}
          <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl border border-white/10 bg-white/[0.035] text-xs font-bold text-zinc-300">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Live A4 Canvas</span>
              <span className="text-[11px] font-mono text-emerald-400 font-black">{Math.round(zoom * 100)}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.05).toFixed(2))))}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut size={14} />
              </button>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(1.4, Number((z + 0.05).toFixed(2))))}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn size={14} />
              </button>
              <button
                type="button"
                onClick={() => setZoom(0.85)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer",
                  zoom === 0.85 ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-white/5 text-zinc-400 hover:text-white"
                )}
              >
                Fit
              </button>
              <button
                type="button"
                onClick={() => setZoom(1)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer",
                  zoom === 1 ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-white/5 text-zinc-400 hover:text-white"
                )}
              >
                100%
              </button>
            </div>
          </div>

          {/* Interactive Live Invoice Canvas */}
          <InvoicePreview
            data={data}
            subtotal={subtotal}
            discountAmount={discountAmount}
            taxAmount={taxAmount}
            total={total}
            currencySymbol={currency.symbol}
            zoom={zoom}
          />

          {/* Bottom Quick Telemetry Summary */}
          <div className="grid grid-cols-3 gap-3">
            <StatPill label="Subtotal" value={formatMoney(subtotal, data.currency)} />
            <StatPill label="Discount" value={`-${formatMoney(discountAmount, data.currency)}`} />
            <StatPill label="Total Amount" value={formatMoney(total, data.currency)} highlight />
          </div>

          {/* Result Retention Bar */}
          <ResultRetentionBar
            toolType="invoice-generator"
            toolName="Invoice Generator"
            title={`Invoice #${data.invoiceNumber || "Draft"} - ${data.clientName || "Client"}`}
            content={`Invoice #${data.invoiceNumber}\nSender: ${data.senderName}\nClient: ${data.clientName}\nTotal: ${formatMoney(total, data.currency)}\nDue: ${data.dueDate}\nItems:\n${data.items.map(i => `• ${i.description} (${i.quantity}x @ ${formatMoney(i.price, data.currency)})`).join("\n")}`}
            metadata={{
              invoiceNumber: data.invoiceNumber,
              clientName: data.clientName,
              total,
              status: data.status,
            }}
            downloadAction={generatePDF}
            downloadLabel="Download PDF"
            className="mt-4"
          />
        </div>
      </section>
    </div>
  );
}

const inputClass =
  "w-full min-h-11 rounded-xl border border-white/10 bg-black/40 px-3.5 text-xs font-bold text-white placeholder:text-zinc-600 outline-none transition-all focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-50";

const textareaClass =
  "w-full min-h-24 rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs font-bold text-white placeholder:text-zinc-600 outline-none transition-all focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 resize-none leading-relaxed";

function Card({ title, icon: Icon, children }: { title: string; icon: typeof FileText; children: ReactNode }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.035] backdrop-blur-2xl p-4 sm:p-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
      <div className="mb-4 flex items-center gap-2.5 border-b border-white/10 pb-3.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-500/10">
          <Icon size={16} className="text-emerald-300" />
        </div>
        <h2 className="text-xs font-black uppercase tracking-wider text-white">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="space-y-1.5 block">
      <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">{label}</span>
      {children}
    </label>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="text-[10px] font-black uppercase tracking-wider text-emerald-400/80">{children}</p>;
}

function StatPill({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-3.5 transition",
        highlight
          ? "border-emerald-400/30 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
          : "border-white/10 bg-white/[0.035]"
      )}
    >
      <p className="text-[9px] font-black uppercase tracking-wider text-zinc-400">{label}</p>
      <p className={cn("mt-1 text-base sm:text-lg font-black font-mono truncate", highlight ? "text-emerald-300" : "text-white")}>
        {value}
      </p>
    </div>
  );
}

function InvoicePreview({
  data,
  subtotal,
  discountAmount,
  taxAmount,
  total,
  currencySymbol,
  zoom = 1,
}: {
  data: InvoiceData;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  currencySymbol: string;
  zoom?: number;
}) {
  const previewItems = data.items.slice(0, 7);
  const templateClass =
    data.template === "executive"
      ? "border-l-[16px]"
      : data.template === "compact"
      ? "border-t-[8px]"
      : data.template === "minimal"
      ? "border-t-[4px]"
      : "";

  return (
    <div className="rounded-[2rem] border border-white/10 bg-zinc-950/80 p-3 shadow-[0_30px_100px_rgba(0,0,0,0.55)] overflow-hidden flex justify-center">
      <div
        className="w-full transition-transform duration-200 origin-top flex justify-center"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "top center",
          marginBottom: zoom < 1 ? `-${Math.round((1 - zoom) * 850)}px` : 0,
        }}
      >
        <div
          className={cn(
            "relative mx-auto aspect-[1/1.414] w-full max-w-[760px] overflow-hidden rounded-[1.25rem] bg-white text-zinc-950 shadow-2xl",
            templateClass
          )}
          style={{ borderColor: data.themeColor }}
        >
          {/* Header depending on template */}
          {data.template === "modern" && (
            <div className="h-24 w-full p-6 text-white flex items-center justify-between" style={{ backgroundColor: data.themeColor }}>
              <div className="flex items-center gap-3">
                {data.logoDataUrl && (
                  <img src={data.logoDataUrl} alt="Logo" className="h-12 w-12 rounded-xl bg-white object-contain p-1 shadow" />
                )}
                <div>
                  <h3 className="text-2xl font-black tracking-tight">INVOICE</h3>
                  <p className="text-[11px] font-bold opacity-80"># {data.invoiceNumber}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black uppercase tracking-wider opacity-70">Amount Due</p>
                <p className="text-2xl font-black font-mono">{currencySymbol}{total.toFixed(2)}</p>
                <p className="text-[10px] font-bold opacity-80">Due {data.dueDate || "Upon Receipt"}</p>
              </div>
            </div>
          )}

          {data.template !== "modern" && (
            <div className="p-6 sm:p-8 pb-4 flex items-start justify-between border-b border-zinc-100">
              <div className="flex items-start gap-3">
                {data.logoDataUrl && (
                  <img src={data.logoDataUrl} alt="Logo" className="h-12 w-12 rounded-xl bg-white object-contain p-1 shadow border" />
                )}
                <div>
                  <h3 className="text-2xl font-black tracking-tight" style={{ color: data.themeColor }}>
                    INVOICE
                  </h3>
                  <p className="text-xs font-bold text-zinc-500"># {data.invoiceNumber}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Amount Due</p>
                <p className="text-2xl font-black text-zinc-950 font-mono">{currencySymbol}{total.toFixed(2)}</p>
                <p className="text-[10px] font-bold text-zinc-500">Due {data.dueDate || "Upon Receipt"}</p>
              </div>
            </div>
          )}

          {/* Parties & Metadata */}
          <div className="p-6 sm:p-8 pt-4 space-y-6">
            <div className="grid grid-cols-2 gap-6 border-b border-zinc-100 pb-5">
              <PreviewParty
                title="FROM"
                name={data.senderName || "Your Company Name"}
                email={data.senderEmail}
                taxId={data.senderTaxId}
                address={data.senderAddress || "Your street address"}
                color={data.themeColor}
              />
              <PreviewParty
                title="BILL TO"
                name={data.clientName || "Client Name or Company"}
                email={data.clientEmail}
                taxId={data.clientTaxId}
                address={data.clientAddress || "Client street address"}
                color={data.themeColor}
              />
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <MiniMeta label="Status" value={data.status} />
              <MiniMeta label="Terms" value={data.paymentTerms || "Net 14"} />
              <MiniMeta label="PO Number" value={data.poNumber || "-"} />
            </div>

            {/* Line Items Table */}
            <div>
              <div className="grid grid-cols-12 gap-2 border-b-2 border-zinc-100 pb-2 text-[9px] font-black uppercase tracking-wider text-zinc-400">
                <div className="col-span-6">Description</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Rate</div>
                <div className="col-span-2 text-right">Total</div>
              </div>
              <div className="divide-y divide-zinc-100">
                {previewItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 py-3 text-xs">
                    <div className="col-span-6 font-bold text-zinc-900 line-clamp-1">{item.description || "Deliverable"}</div>
                    <div className="col-span-2 text-center text-zinc-500">{item.quantity} {item.unit}</div>
                    <div className="col-span-2 text-right text-zinc-500 font-mono">{currencySymbol}{item.price.toFixed(2)}</div>
                    <div className="col-span-2 text-right font-black text-zinc-950 font-mono">
                      {currencySymbol}{(item.quantity * item.price).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Totals & Notes */}
            <div className="grid grid-cols-12 gap-6 pt-2">
              <div className="col-span-7 space-y-4 text-[10px] text-zinc-500">
                {data.notes && (
                  <div>
                    <p className="font-black uppercase tracking-wider text-zinc-400" style={{ color: data.themeColor }}>
                      Notes
                    </p>
                    <p className="mt-1 line-clamp-2 leading-relaxed text-zinc-600">{data.notes}</p>
                  </div>
                )}
                {data.paymentInstructions && (
                  <div>
                    <p className="font-black uppercase tracking-wider text-zinc-400" style={{ color: data.themeColor }}>
                      Payment Instructions
                    </p>
                    <p className="mt-1 line-clamp-2 leading-relaxed text-zinc-600">{data.paymentInstructions}</p>
                  </div>
                )}
              </div>

              <div className="col-span-5 space-y-2 text-xs">
                <SummaryRow label="Subtotal" value={`${currencySymbol}${subtotal.toFixed(2)}`} />
                {discountAmount > 0 && (
                  <SummaryRow label="Discount" value={`-${currencySymbol}${discountAmount.toFixed(2)}`} />
                )}
                {taxAmount > 0 && (
                  <SummaryRow label={`Tax (${data.taxRate}%)`} value={`${currencySymbol}${taxAmount.toFixed(2)}`} />
                )}
                {data.shippingFee > 0 && (
                  <SummaryRow label="Fees / Shipping" value={`${currencySymbol}${data.shippingFee.toFixed(2)}`} />
                )}
                <div
                  className="flex items-center justify-between rounded-xl px-3 py-2 text-white font-bold"
                  style={{ backgroundColor: data.themeColor }}
                >
                  <span className="text-[10px] font-black uppercase tracking-wider">Total</span>
                  <span className="text-base font-black font-mono">{currencySymbol}{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewParty({
  title,
  name,
  email,
  taxId,
  address,
  color,
}: {
  title: string;
  name: string;
  email: string;
  taxId: string;
  address: string;
  color: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-[8px] font-black uppercase tracking-widest" style={{ color }}>
        {title}
      </p>
      <p className="text-xs font-black text-zinc-950">{name}</p>
      {email && <p className="text-[10px] font-medium text-zinc-500">{email}</p>}
      {taxId && <p className="text-[10px] font-medium text-zinc-500">Tax ID: {taxId}</p>}
      <p className="whitespace-pre-line text-[10px] font-medium leading-relaxed text-zinc-500">{address}</p>
    </div>
  );
}

function MiniMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-zinc-50 p-2 border border-zinc-100">
      <p className="text-[8px] font-black uppercase tracking-wider text-zinc-400">{label}</p>
      <p className="mt-0.5 text-xs font-black text-zinc-900 truncate">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-zinc-500 text-[11px] font-medium">{label}</span>
      <span className="text-zinc-950 text-xs font-black font-mono">{value}</span>
    </div>
  );
}

export { InvoiceGenerator as InvoiceGeneratorClient };
