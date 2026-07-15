"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  TrendingUp, 
  Search, 
  Coins, 
  Sparkles, 
  Lock,
  Edit2,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Database,
  Sliders,
  Mail,
  Eye,
  Trash2,
  Ticket,
  Plus,
  Send,
  Loader2,
  Calendar,
  AlertTriangle,
  Play,
  Settings,
  Megaphone,
  Clock,
  Globe,
  FileText,
  Ban
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";

interface AdminStats {
  totalUsers: number;
  proUsers: number;
  totalCredits: number;
  totalReferrals: number;
  totalGenerations: number;
  totalTransactions: number;
}

interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  plan: string;
  dailyCredits: number;
  bonusCredits: number;
  createdAt: string;
  image: string | null;
  status: string;
}

interface SupportTicket {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  attachmentUrl: string | null;
  createdAt: string;
}

interface ActivityFile {
  id: string;
  userId: string;
  toolType: string;
  originalName: string;
  originalUrl: string | null;
  resultUrl: string | null;
  fileType: string;
  status: string;
  createdAt: string;
  user: {
    name: string | null;
    email: string | null;
  };
}

interface PromoCode {
  id: string;
  code: string;
  bonusCredits: number;
  maxRedemptions: number;
  redemptionCount: number;
  expiresAt: string | null;
  createdAt: string;
}

interface SystemLog {
  id: string;
  level: string;
  source: string;
  message: string;
  stack: string | null;
  createdAt: string;
}

interface ReferralLog {
  id: string;
  referrerId: string;
  referredId: string;
  status: string;
  rewardClaimed: boolean;
  createdAt: string;
  referrer: {
    name: string | null;
    email: string | null;
  };
  referred: {
    name: string | null;
    email: string | null;
  };
}

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState("users"); // "users" | "tickets" | "activity" | "promos" | "announcements" | "referrals" | "logs" | "config"
  const [stats, setStats] = useState<AdminStats | null>(null);

  // Users Directory Tab State
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [userSearch, setUserSearch] = useState("");
  const [userPlanFilter, setUserPlanFilter] = useState("all");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState({
    plan: "free",
    role: "user",
    dailyCredits: 50,
    bonusCredits: 0,
    status: "active",
  });
  const [submittingUserEdit, setSubmittingUserEdit] = useState(false);

  // Tickets Tab State
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [ticketSearch, setTicketSearch] = useState("");
  const [ticketStatusFilter, setTicketStatusFilter] = useState("all");
  const [ticketPage, setTicketPage] = useState(1);
  const [ticketTotalPages, setTicketTotalPages] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // Activity/Moderation Tab State
  const [files, setFiles] = useState<ActivityFile[]>([]);
  const [filePage, setFilePage] = useState(1);
  const [fileTotalPages, setFileTotalPages] = useState(1);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);

  // Promos Tab State
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [newPromo, setNewPromo] = useState({
    code: "",
    bonusCredits: 50,
    maxRedemptions: 100,
    expiresAt: "",
  });
  const [creatingPromo, setCreatingPromo] = useState(false);
  const [promoError, setPromoError] = useState("");

  // Announcements Tab State
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    type: "info",
  });
  const [creatingAnnouncement, setCreatingAnnouncement] = useState(false);
  const [announcementError, setAnnouncementError] = useState("");

  // Referrals Tab State
  const [referrals, setReferrals] = useState<ReferralLog[]>([]);
  const [referralPage, setReferralPage] = useState(1);
  const [referralTotalPages, setReferralTotalPages] = useState(1);
  const [referralTotal, setReferralTotal] = useState(0);

  // Logs Tab State
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [logPage, setLogPage] = useState(1);
  const [logTotalPages, setLogTotalPages] = useState(1);
  const [clearingLogs, setClearingLogs] = useState(false);

  // Config Tab State
  const [configs, setConfigs] = useState<Record<string, string>>({});
  const [updatingConfigKey, setUpdatingConfigKey] = useState<string | null>(null);

  // Check auth and initial stats on mount
  useEffect(() => {
    async function initAdmin() {
      try {
        const statsRes = await fetch("/api/admin/stats");
        if (statsRes.status === 401 || statsRes.status === 403) {
          setAuthorized(false);
          setLoading(false);
          return;
        }

        const data = await statsRes.json();
        if (data.success) {
          setStats(data.stats);
          setAuthorized(true);
          // Load users tab initially
          await loadUsers(1, "", "all", "all");
        }
      } catch (error) {
        console.error("Failed to load admin stats:", error);
      } finally {
        setLoading(false);
      }
    }
    initAdmin();
  }, []);

  // Fetch lists based on active tab
  useEffect(() => {
    if (!authorized) return;
    if (activeTab === "users") {
      loadUsers(userPage, userSearch, userPlanFilter, userRoleFilter);
    } else if (activeTab === "tickets") {
      loadTickets(ticketPage, ticketSearch, ticketStatusFilter);
    } else if (activeTab === "activity") {
      loadActivity(filePage);
    } else if (activeTab === "promos") {
      loadPromos();
    } else if (activeTab === "announcements") {
      loadAnnouncements();
    } else if (activeTab === "referrals") {
      loadReferrals(referralPage);
    } else if (activeTab === "logs") {
      loadLogs(logPage);
    } else if (activeTab === "config") {
      loadConfigs();
    }
  }, [activeTab, userPage, userSearch, userPlanFilter, userRoleFilter, ticketPage, ticketSearch, ticketStatusFilter, filePage, referralPage, logPage, authorized]);

  // Loaders
  async function loadUsers(page: number, query: string, plan: string, role: string) {
    try {
      const res = await fetch(`/api/admin/users?page=${page}&search=${encodeURIComponent(query)}&plan=${plan}&role=${role}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(data.users);
        setTotalUsers(data.total);
        setUserTotalPages(data.totalPages);
        setUserPage(data.page);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function loadTickets(page: number, query: string, status: string) {
    try {
      const res = await fetch(`/api/admin/tickets?page=${page}&search=${encodeURIComponent(query)}&status=${status}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setTickets(data.tickets);
        setTicketTotalPages(data.totalPages);
        setTicketPage(data.page);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function loadActivity(page: number) {
    try {
      const res = await fetch(`/api/admin/activity?page=${page}&limit=12`);
      const data = await res.json();
      if (res.ok && data.success) {
        setFiles(data.files);
        setFileTotalPages(data.totalPages);
        setFilePage(data.page);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function loadPromos() {
    try {
      const res = await fetch("/api/admin/promos");
      const data = await res.json();
      if (res.ok && data.success) {
        setPromos(data.promos);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function loadAnnouncements() {
    try {
      const res = await fetch("/api/admin/announcements");
      const data = await res.json();
      if (res.ok && data.success) {
        setAnnouncements(data.announcements);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function loadReferrals(page: number) {
    try {
      const res = await fetch(`/api/admin/referrals?page=${page}&limit=15`);
      const data = await res.json();
      if (res.ok && data.success) {
        setReferrals(data.referrals);
        setReferralTotal(data.total);
        setReferralTotalPages(data.totalPages);
        setReferralPage(data.page);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function loadLogs(page: number) {
    try {
      const res = await fetch(`/api/admin/logs?page=${page}&limit=25`);
      const data = await res.json();
      if (res.ok && data.success) {
        setLogs(data.logs);
        setLogTotalPages(data.totalPages);
        setLogPage(data.page);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function loadConfigs() {
    try {
      const res = await fetch("/api/admin/configs");
      const data = await res.json();
      if (res.ok && data.success) {
        setConfigs(data.configs);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // User Edit handlers
  const handleEditUser = (user: AdminUser) => {
    setEditingUser(user);
    setEditForm({
      plan: user.plan,
      role: user.role,
      dailyCredits: user.dailyCredits,
      bonusCredits: user.bonusCredits,
      status: user.status || "active",
    });
  };

  const handleSaveUserEdit = async () => {
    if (!editingUser) return;
    setSubmittingUserEdit(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: editingUser.id, ...editForm }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await loadUsers(userPage, userSearch, userPlanFilter, userRoleFilter);
        setEditingUser(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingUserEdit(false);
    }
  };

  // Announcements Handlers
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingAnnouncement(true);
    setAnnouncementError("");
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAnnouncement),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNewAnnouncement({ title: "", content: "", type: "info" });
        await loadAnnouncements();
      } else {
        setAnnouncementError(data.error || "Failed to create announcement.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingAnnouncement(false);
    }
  };

  const handleToggleAnnouncement = async (id: string, active: boolean) => {
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active }),
      });
      if (res.ok) {
        await loadAnnouncements();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/announcements?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        await loadAnnouncements();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Logs Handlers
  const handleClearLogs = async () => {
    setClearingLogs(true);
    try {
      const res = await fetch("/api/admin/logs", { method: "DELETE" });
      if (res.ok) {
        setLogs([]);
        setLogPage(1);
        setLogTotalPages(1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setClearingLogs(false);
    }
  };

  // Support Reply handler
  const handleSendReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;
    setSendingReply(true);
    try {
      const res = await fetch("/api/admin/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: selectedTicket.id, replyText }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setReplyText("");
        setSelectedTicket(data.ticket);
        await loadTickets(ticketPage, ticketSearch, ticketStatusFilter);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSendingReply(false);
    }
  };

  // Support Ticket status toggle handler
  const handleToggleTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket(data.ticket);
        }
        await loadTickets(ticketPage, ticketSearch, ticketStatusFilter);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Moderation delete handler
  const handleModerationDelete = async (fileId: string) => {
    setDeletingFileId(fileId);
    try {
      const res = await fetch(`/api/admin/moderation?fileId=${fileId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        await loadActivity(filePage);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingFileId(null);
    }
  };

  // Promo creation handler
  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingPromo(true);
    setPromoError("");
    try {
      const res = await fetch("/api/admin/promos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPromo),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNewPromo({ code: "", bonusCredits: 50, maxRedemptions: 100, expiresAt: "" });
        await loadPromos();
      } else {
        setPromoError(data.error || "Failed to create promo code.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingPromo(false);
    }
  };

  // Promo delete handler
  const handleDeletePromo = async (promoId: string) => {
    try {
      const res = await fetch(`/api/admin/promos?id=${promoId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        await loadPromos();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Config Update switcher
  const handleUpdateConfig = async (key: string, value: string) => {
    setUpdatingConfigKey(key);
    try {
      const res = await fetch("/api/admin/configs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setConfigs(prev => ({ ...prev, [key]: value }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingConfigKey(null);
    }
  };

  // Block screen view if unauthorized
  if (!loading && !authorized) {
    return (
      <div className="min-h-screen bg-[#030303] text-white flex items-center justify-center relative px-6 overflow-hidden">
        <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-red-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-accent-purple/5 blur-[120px] rounded-full" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative max-w-md w-full bg-[#0b0c12]/80 border border-white/5 p-8 sm:p-10 rounded-[2rem] text-center backdrop-blur-xl shadow-2xl"
        >
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400 mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-red-500/15 blur-md" />
            <Lock size={26} className="relative z-10 animate-pulse" />
          </div>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter mb-3">Workspace Restricted</h1>
          <p className="text-zinc-500 text-sm leading-relaxed mb-8">
            You do not have administrative credentials to view the control panel.
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-sm font-black uppercase tracking-wider text-white hover:bg-white/10 active:scale-95 transition-all"
          >
            Return to Dashboard
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-accent-purple/30 pb-32 overflow-hidden" suppressHydrationWarning>
      {/* Background radial effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.03)_0%,transparent_70%)]" />
        <div className="absolute top-[30%] right-[-10%] w-[600px] h-[600px] bg-accent-purple/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/3 blur-[120px] rounded-full animate-pulse" />
      </div>

      <main className="max-w-6xl mx-auto px-6 pt-32 space-y-16 relative z-10">
        {/* Header */}
        <header className="space-y-6">
          <div className="inline-flex items-center gap-3 text-accent-purple">
            <div className="w-12 h-12 rounded-xl bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-accent-purple/20 blur-xl animate-pulse" />
              <Database size={22} className="relative z-10" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Operations / System Control</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none select-none">
              Control <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-accent-purple via-purple-300 to-purple-500 drop-shadow-[0_2px_15px_rgba(168,85,247,0.3)]">Center.</span>
            </h1>
          </div>
        </header>

        {loading ? (
          <div className="space-y-12">
            <Skeleton className="h-12 w-full bg-white/5 border border-white/10 rounded-2xl" />
            <Skeleton className="h-96 w-full bg-white/5 border border-white/10 rounded-3xl" />
          </div>
        ) : (
          <div className="space-y-10">
            {/* Custom Admin Navigation Tab Bar */}
            <div className="flex overflow-x-auto gap-2 p-1.5 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md max-w-fit scrollbar-none">
              {[
                { id: "users", label: "Users Directory", icon: Users },
                { id: "announcements", label: "Announcements", icon: Megaphone },
                { id: "tickets", label: "Support Tickets", icon: Ticket },
                { id: "activity", label: "Moderation Logs", icon: Eye },
                { id: "promos", label: "Promo Codes", icon: Coins },
                { id: "referrals", label: "Referrals", icon: Clock },
                { id: "logs", label: "System Logs", icon: FileText },
                { id: "config", label: "System Config", icon: Settings },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap active:scale-95",
                    activeTab === tab.id
                      ? "bg-accent-purple text-black shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
                  )}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENT GRID */}
            <div className="space-y-8">
              {/* TAB 1: USERS DIRECTORY */}
              {activeTab === "users" && (
                <div className="space-y-6">
                  {/* Stats Overview */}
                  <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-6 rounded-3xl bg-[#0b0c12]/60 border border-white/5 relative overflow-hidden group hover:border-accent-purple/30 transition-all">
                      <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block mb-3">Total Creators</span>
                      <h3 className="text-3xl font-black text-white italic tracking-tight">{stats?.totalUsers}</h3>
                    </div>
                    <div className="p-6 rounded-3xl bg-[#0b0c12]/60 border border-white/5 relative overflow-hidden group hover:border-accent-purple/30 transition-all">
                      <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block mb-3">Pro Members</span>
                      <h3 className="text-3xl font-black text-transparent bg-clip-text bg-linear-to-r from-purple-300 to-purple-500 italic tracking-tight">{stats?.proUsers}</h3>
                    </div>
                    <div className="p-6 rounded-3xl bg-[#0b0c12]/60 border border-white/5 relative overflow-hidden group hover:border-accent-purple/30 transition-all">
                      <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block mb-3">Circulating Credits</span>
                      <h3 className="text-3xl font-black text-white italic tracking-tight">{stats?.totalCredits}</h3>
                    </div>
                    <div className="p-6 rounded-3xl bg-[#0b0c12]/60 border border-white/5 relative overflow-hidden group hover:border-accent-purple/30 transition-all">
                      <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block mb-3">AI Generations</span>
                      <h3 className="text-3xl font-black text-white italic tracking-tight">{stats?.totalGenerations}</h3>
                    </div>
                  </section>

                  {/* Users Directory list */}
                  <div className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Users Directory</h3>
                        <p className="text-xs text-zinc-500">Audit and update parameters for platform creators.</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                          <input
                            type="text"
                            placeholder="Search name or email..."
                            value={userSearch}
                            onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
                            className="bg-white/[0.02] border border-white/5 hover:border-white/10 focus:border-accent-purple/40 text-xs font-semibold rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-500 outline-hidden w-full sm:w-[220px]"
                          />
                        </div>

                        <select
                          value={userPlanFilter}
                          onChange={(e) => { setUserPlanFilter(e.target.value); setUserPage(1); }}
                          className="bg-white/[0.02] border border-white/5 hover:border-white/10 text-xs font-black uppercase tracking-wide rounded-xl px-4 py-3 text-zinc-300 outline-hidden cursor-pointer"
                        >
                          <option value="all" className="bg-[#0b0c12] text-white">All Plans</option>
                          <option value="free" className="bg-[#0b0c12] text-white">Free Plan</option>
                          <option value="pro" className="bg-[#0b0c12] text-white">Pro Plan</option>
                        </select>
                      </div>
                    </div>

                    <div className="border border-white/5 bg-[#0b0c12]/40 rounded-[2rem] overflow-hidden backdrop-blur-md">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-white/5 bg-white/[0.01]">
                              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Creator</th>
                              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Plan</th>
                              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Role</th>
                              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Status</th>
                              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Daily Credits</th>
                              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Bonus Credits</th>
                              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500 text-right">Edit</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {users.map((u) => (
                              <tr key={u.id} className="hover:bg-white/[0.01] transition-colors">
                                <td className="px-6 py-4 flex items-center gap-3">
                                  {u.image ? (
                                    <img src={u.image} alt={u.name || ""} className="w-7 h-7 rounded-full border border-white/10" />
                                  ) : (
                                    <div className="w-7 h-7 rounded-full bg-accent-purple/10 border border-accent-purple/20 text-accent-purple flex items-center justify-center text-[10px] font-black">
                                      {u.name ? u.name[0]?.toUpperCase() : "E"}
                                    </div>
                                  )}
                                  <div className="flex flex-col">
                                    <span className="text-sm font-bold text-white leading-tight">{u.name || "Explorer"}</span>
                                    <span className="text-[10px] text-zinc-500 font-semibold">{u.email}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={cn(
                                    "inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider",
                                    u.plan === "pro" ? "bg-accent-purple/10 border border-accent-purple/20 text-accent-purple" : "bg-white/5 border border-white/5 text-zinc-400"
                                  )}>{u.plan}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={cn(
                                    "inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider",
                                    u.role === "admin" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-white/5 border border-white/5 text-zinc-400"
                                  )}>{u.role}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={cn(
                                    "inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider",
                                    u.status === "suspended" ? "bg-red-500/10 border border-red-500/20 text-red-400" : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                                  )}>{u.status || "active"}</span>
                                </td>
                                <td className="px-6 py-4 text-xs font-black text-zinc-300">{u.dailyCredits}</td>
                                <td className="px-6 py-4 text-xs font-black text-zinc-300">{u.bonusCredits}</td>
                                <td className="px-6 py-4 text-right">
                                  <button
                                    onClick={() => handleEditUser(u)}
                                    className="p-2 rounded-lg bg-white/5 border border-white/5 hover:border-accent-purple/30 hover:bg-accent-purple/10 text-zinc-400 hover:text-accent-purple transition-all"
                                  >
                                    <Edit2 size={13} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {userTotalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-white/5 px-6 py-4 bg-white/[0.01]">
                          <span className="text-[10px] font-bold text-zinc-500">Page {userPage} of {userTotalPages}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setUserPage(p => Math.max(p - 1, 1))}
                              disabled={userPage === 1}
                              className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                              <ChevronLeft size={14} />
                            </button>
                            <button
                              onClick={() => setUserPage(p => Math.min(p + 1, userTotalPages))}
                              disabled={userPage === userTotalPages}
                              className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                              <ChevronRight size={14} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SUPPORT TICKETS */}
              {activeTab === "tickets" && (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                  {/* Tickets List */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="space-y-2">
                      <div className="relative">
                        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                          type="text"
                          placeholder="Search tickets..."
                          value={ticketSearch}
                          onChange={(e) => { setTicketSearch(e.target.value); setTicketPage(1); }}
                          className="bg-white/[0.02] border border-white/5 focus:border-accent-purple/40 text-xs font-semibold rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-500 outline-hidden w-full"
                        />
                      </div>
                      <select
                        value={ticketStatusFilter}
                        onChange={(e) => { setTicketStatusFilter(e.target.value); setTicketPage(1); }}
                        className="w-full bg-white/[0.02] border border-white/5 text-xs font-black uppercase tracking-wide rounded-xl px-4 py-3.5 text-zinc-300 outline-hidden"
                      >
                        <option value="all" className="bg-[#0b0c12]">All Statuses</option>
                        <option value="open" className="bg-[#0b0c12]">Open</option>
                        <option value="replied" className="bg-[#0b0c12]">Replied</option>
                        <option value="resolved" className="bg-[#0b0c12]">Resolved</option>
                      </select>
                    </div>

                    <div className="border border-white/5 bg-[#0b0c12]/40 rounded-[2rem] overflow-hidden backdrop-blur-md divide-y divide-white/5">
                      {tickets.length === 0 ? (
                        <div className="text-center py-16 text-zinc-500 text-xs font-bold">No tickets found.</div>
                      ) : (
                        tickets.map((t) => (
                          <div 
                            key={t.id} 
                            onClick={() => setSelectedTicket(t)}
                            className={cn(
                              "p-5 cursor-pointer hover:bg-white/[0.01] transition-colors relative",
                              selectedTicket?.id === t.id && "bg-white/[0.02]"
                            )}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className={cn(
                                "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider",
                                t.status === "open" && "bg-red-500/10 border border-red-500/20 text-red-400",
                                t.status === "replied" && "bg-accent-purple/10 border border-accent-purple/20 text-accent-purple",
                                t.status === "resolved" && "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                              )}>{t.status}</span>
                              <span className="text-[9px] text-zinc-500 font-bold">{new Date(t.createdAt).toLocaleDateString()}</span>
                            </div>
                            <h4 className="text-xs font-black text-white truncate">{t.subject}</h4>
                            <p className="text-[10px] text-zinc-400 font-semibold truncate mt-1">{t.name} • {t.email}</p>
                          </div>
                        ))
                      )}

                      {ticketTotalPages > 1 && (
                        <div className="flex items-center justify-between p-4 bg-white/[0.01]">
                          <span className="text-[9px] font-bold text-zinc-500">Page {ticketPage} / {ticketTotalPages}</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setTicketPage(p => Math.max(p - 1, 1))}
                              disabled={ticketPage === 1}
                              className="p-1.5 rounded-lg bg-white/5 disabled:opacity-30 transition-all"
                            >
                              <ChevronLeft size={12} />
                            </button>
                            <button
                              onClick={() => setTicketPage(p => Math.min(p + 1, ticketTotalPages))}
                              disabled={ticketPage === ticketTotalPages}
                              className="p-1.5 rounded-lg bg-white/5 disabled:opacity-30 transition-all"
                            >
                              <ChevronRight size={12} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reply Details */}
                  <div className="lg:col-span-3">
                    {selectedTicket ? (
                      <div className="p-8 rounded-[2.5rem] bg-[#0b0c12]/60 border border-white/5 backdrop-blur-md space-y-6 relative">
                        <div className="flex justify-between items-start border-b border-white/5 pb-5">
                          <div className="space-y-1">
                            <h3 className="text-lg font-black text-white uppercase italic tracking-tight">{selectedTicket.subject}</h3>
                            <p className="text-xs text-zinc-500 font-medium">From: <strong className="text-white">{selectedTicket.name}</strong> ({selectedTicket.email})</p>
                            <p className="text-[10px] text-zinc-600 font-semibold">Submitted: {new Date(selectedTicket.createdAt).toLocaleString()}</p>
                          </div>

                          <div className="flex gap-2">
                            {selectedTicket.status !== "resolved" ? (
                              <button
                                onClick={() => handleToggleTicketStatus(selectedTicket.id, "resolved")}
                                className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider hover:bg-emerald-500/20 transition-all"
                              >
                                Mark Resolved
                              </button>
                            ) : (
                              <button
                                onClick={() => handleToggleTicketStatus(selectedTicket.id, "open")}
                                className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-zinc-400 text-[10px] font-black uppercase tracking-wider hover:bg-white/10 transition-all"
                              >
                                Reopen Ticket
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Ticket Message */}
                        <div className="space-y-2">
                          <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">User Message</span>
                          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed font-semibold">
                            {selectedTicket.message}
                          </div>
                        </div>

                        {/* Ticket Screenshot Attachment */}
                        {selectedTicket.attachmentUrl && (
                          <div className="space-y-2">
                            <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Attachment</span>
                            <div className="relative w-full max-w-md rounded-2xl overflow-hidden border border-white/10 group">
                              <img src={selectedTicket.attachmentUrl} alt="Ticket attachment" className="w-full h-auto" />
                              <a 
                                href={selectedTicket.attachmentUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-black uppercase tracking-widest text-white gap-2"
                              >
                                <Eye size={14} /> View Fullscreen
                              </a>
                            </div>
                          </div>
                        )}

                        {/* Ticket Reply Form */}
                        <div className="border-t border-white/5 pt-5 space-y-4">
                          <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Send Email Reply</span>
                          <textarea
                            placeholder="Type support response to be emailed directly to user..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            rows={5}
                            className="w-full bg-white/[0.02] border border-white/5 focus:border-accent-purple/40 text-sm font-semibold rounded-2xl p-5 text-white placeholder-zinc-500 outline-hidden resize-none leading-relaxed"
                          />
                          <button
                            onClick={handleSendReply}
                            disabled={sendingReply || !replyText.trim()}
                            className="px-6 py-3.5 rounded-xl bg-accent-purple hover:bg-purple-400 text-black text-xs font-black uppercase tracking-wider flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all ml-auto"
                          >
                            {sendingReply ? (
                              <>
                                <Loader2 size={13} className="animate-spin" />
                                Sending response...
                              </>
                            ) : (
                              <>
                                <Send size={13} />
                                Dispatch Reply
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full min-h-[300px] border border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center text-zinc-500">
                        <Mail size={32} className="mb-4 text-zinc-700" />
                        <span className="text-xs font-bold uppercase tracking-wider">Select a support ticket from the list.</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: LIVE ACTIVITY & MODERATION */}
              {activeTab === "activity" && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Platform Generation Stream</h3>
                    <p className="text-xs text-zinc-500">Moderate recent creations across images, audio files, and videos.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {files.length === 0 ? (
                      <div className="col-span-full text-center py-20 text-zinc-500 text-xs font-bold">No active generations catalogued.</div>
                    ) : (
                      files.map((file) => (
                        <div key={file.id} className="relative group p-4 bg-[#0b0c12]/60 border border-white/5 rounded-3xl overflow-hidden hover:border-red-500/20 transition-all">
                          {/* Top user badge */}
                          <div className="flex justify-between items-start mb-3 border-b border-white/5 pb-2">
                            <div className="flex flex-col max-w-[120px]">
                              <span className="text-[10px] font-black text-white truncate">{file.user.name || "Explorer"}</span>
                              <span className="text-[8px] text-zinc-500 truncate">{file.user.email}</span>
                            </div>
                            <span className="px-1.5 py-0.5 rounded bg-white/5 text-[8px] font-black uppercase tracking-wider text-zinc-400">{file.toolType}</span>
                          </div>

                          {/* Media Preview Box */}
                          <div className="relative aspect-video w-full rounded-2xl bg-zinc-950/80 border border-white/5 overflow-hidden flex items-center justify-center text-zinc-600 mb-4">
                            {file.fileType.startsWith("image/") && file.resultUrl ? (
                              <img src={file.resultUrl} alt="User creation" className="w-full h-full object-cover" />
                            ) : file.fileType.startsWith("audio/") && file.resultUrl ? (
                              <audio src={file.resultUrl} controls className="max-w-[90%] scale-75" />
                            ) : file.fileType.startsWith("video/") && file.resultUrl ? (
                              <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                <Play size={16} className="text-accent-purple" /> Video File
                              </div>
                            ) : (
                              <div className="text-[10px] font-black uppercase tracking-wider text-zinc-600">No Preview</div>
                            )}
                          </div>

                          {/* File details */}
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] text-zinc-500 font-bold">{new Date(file.createdAt).toLocaleDateString()}</span>
                            <button
                              onClick={() => handleModerationDelete(file.id)}
                              disabled={deletingFileId === file.id}
                              className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-black transition-all active:scale-95 disabled:opacity-50"
                            >
                              {deletingFileId === file.id ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <Trash2 size={12} />
                              )}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {fileTotalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-white/5 px-6 py-4 bg-white/[0.01] rounded-3xl">
                      <span className="text-[10px] font-bold text-zinc-500">Page {filePage} of {fileTotalPages}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setFilePage(p => Math.max(p - 1, 1))}
                          disabled={filePage === 1}
                          className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          <ChevronLeft size={14} />
                        </button>
                        <button
                          onClick={() => setFilePage(p => Math.min(p + 1, fileTotalPages))}
                          disabled={filePage === fileTotalPages}
                          className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: PROMO CODES */}
              {activeTab === "promos" && (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                  {/* Create promo form */}
                  <div className="lg:col-span-2 p-8 rounded-[2.5rem] bg-[#0b0c12]/60 border border-white/5 backdrop-blur-md space-y-6 max-h-fit">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-accent-purple">Promo Vouchers</span>
                      <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Create Code</h3>
                    </div>

                    <form onSubmit={handleCreatePromo} className="space-y-4">
                      {promoError && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2">
                          <AlertTriangle size={14} /> {promoError}
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-500">Code String</label>
                        <input
                          type="text"
                          placeholder="E.G. EXISMIC100"
                          value={newPromo.code}
                          onChange={(e) => setNewPromo(prev => ({ ...prev, code: e.target.value }))}
                          required
                          className="w-full bg-white/[0.02] border border-white/5 focus:border-accent-purple/40 text-xs font-black uppercase tracking-widest rounded-xl px-4 py-3.5 text-white placeholder-zinc-500 outline-hidden"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-500">Bonus Credits Granted</label>
                        <input
                          type="number"
                          value={newPromo.bonusCredits}
                          onChange={(e) => setNewPromo(prev => ({ ...prev, bonusCredits: parseInt(e.target.value) || 0 }))}
                          required
                          min={1}
                          className="w-full bg-white/[0.02] border border-white/5 focus:border-accent-purple/40 text-xs font-bold rounded-xl px-4 py-3.5 text-white outline-hidden"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-500">Usage Limit (Max Redemptions)</label>
                        <input
                          type="number"
                          value={newPromo.maxRedemptions}
                          onChange={(e) => setNewPromo(prev => ({ ...prev, maxRedemptions: parseInt(e.target.value) || 100 }))}
                          required
                          min={1}
                          className="w-full bg-white/[0.02] border border-white/5 focus:border-accent-purple/40 text-xs font-bold rounded-xl px-4 py-3.5 text-white outline-hidden"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-500">Expiration Date (Optional)</label>
                        <input
                          type="date"
                          value={newPromo.expiresAt}
                          onChange={(e) => setNewPromo(prev => ({ ...prev, expiresAt: e.target.value }))}
                          className="w-full bg-white/[0.02] border border-white/5 focus:border-accent-purple/40 text-xs font-semibold rounded-xl px-4 py-3.5 text-white outline-hidden cursor-pointer"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={creatingPromo}
                        className="w-full py-4 rounded-xl bg-accent-purple text-black text-xs font-black uppercase tracking-wider hover:bg-purple-400 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {creatingPromo ? (
                          <>
                            <Loader2 size={13} className="animate-spin" /> Generating Code...
                          </>
                        ) : (
                          <>
                            <Plus size={13} /> Add Voucher Code
                          </>
                        )}
                      </button>
                    </form>
                  </div>

                  {/* Active promo codes list */}
                  <div className="lg:col-span-3 space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Active Vouchers</h3>
                      <p className="text-xs text-zinc-500">Voucher codes created for promotional credit campaigns.</p>
                    </div>

                    <div className="border border-white/5 bg-[#0b0c12]/40 rounded-[2rem] overflow-hidden backdrop-blur-md">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-white/5 bg-white/[0.01]">
                              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Promo Code</th>
                              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Bonus Credits</th>
                              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Redemptions</th>
                              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Expires</th>
                              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500 text-right">Delete</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {promos.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="text-center py-12 text-zinc-500 text-xs font-bold">No active vouchers generated.</td>
                              </tr>
                            ) : (
                              promos.map((p) => (
                                <tr key={p.id} className="hover:bg-white/[0.01] transition-colors">
                                  <td className="px-6 py-4 text-sm font-black uppercase tracking-widest text-emerald-400">{p.code}</td>
                                  <td className="px-6 py-4 text-xs font-black text-white">+{p.bonusCredits}</td>
                                  <td className="px-6 py-4 text-xs font-semibold text-zinc-300">{p.redemptionCount} / {p.maxRedemptions}</td>
                                  <td className="px-6 py-4 text-xs text-zinc-500 font-medium">
                                    {p.expiresAt ? new Date(p.expiresAt).toLocaleDateString() : "Never"}
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <button
                                      onClick={() => handleDeletePromo(p.id)}
                                      className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-black transition-all active:scale-95"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: SYSTEM CONFIG */}
              {activeTab === "config" && (
                <div className="max-w-2xl p-8 rounded-[2.5rem] bg-[#0b0c12]/60 border border-white/5 backdrop-blur-md space-y-8">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-wider text-accent-purple">Control Board</span>
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Platform Configurations</h3>
                  </div>

                  <div className="space-y-6">
                    {/* Maintenance Mode switcher */}
                    <div className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.01] border border-white/5">
                      <div className="space-y-1 pr-6">
                        <h4 className="text-sm font-black uppercase tracking-tight text-white flex items-center gap-2">
                          <AlertTriangle size={14} className="text-amber-400" /> Maintenance Mode
                        </h4>
                        <p className="text-xs text-zinc-500 leading-relaxed font-semibold">
                          Toggles a system-wide block page for non-admin accounts. Used for scheduled deployments.
                        </p>
                      </div>

                      <button
                        onClick={() => handleUpdateConfig("maintenance_mode", configs.maintenance_mode === "true" ? "false" : "true")}
                        disabled={updatingConfigKey === "maintenance_mode"}
                        className={cn(
                          "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all min-w-[120px] text-center border active:scale-95 disabled:opacity-50",
                          configs.maintenance_mode === "true"
                            ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500 hover:text-black"
                            : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-black"
                        )}
                      >
                        {updatingConfigKey === "maintenance_mode" ? (
                          <Loader2 size={12} className="animate-spin mx-auto" />
                        ) : configs.maintenance_mode === "true" ? (
                          "ON (Locked)"
                        ) : (
                          "OFF (Live)"
                        )}
                      </button>
                    </div>

                    {/* Daily credit limits configuration */}
                    <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 space-y-4">
                      <h4 className="text-sm font-black uppercase tracking-tight text-white">Daily Credits Policy</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Free Tier Daily Reset</label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              defaultValue={configs.free_plan_daily_credits || "50"}
                              id="freeCreditsInput"
                              className="bg-white/[0.02] border border-white/5 focus:border-accent-purple/40 text-xs font-bold rounded-xl px-4 py-3 text-white placeholder-zinc-500 outline-hidden w-full"
                            />
                            <button
                              onClick={() => {
                                const val = (document.getElementById("freeCreditsInput") as HTMLInputElement)?.value;
                                if (val) handleUpdateConfig("free_plan_daily_credits", val);
                              }}
                              disabled={updatingConfigKey === "free_plan_daily_credits"}
                              className="px-3 rounded-xl bg-white/5 hover:bg-accent-purple hover:text-black text-zinc-400 text-xs font-bold transition-colors"
                            >
                              Save
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Pro Tier Daily Reset</label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              defaultValue={configs.pro_plan_daily_credits || "1000"}
                              id="proCreditsInput"
                              className="bg-white/[0.02] border border-white/5 focus:border-accent-purple/40 text-xs font-bold rounded-xl px-4 py-3 text-white placeholder-zinc-500 outline-hidden w-full"
                            />
                            <button
                              onClick={() => {
                                const val = (document.getElementById("proCreditsInput") as HTMLInputElement)?.value;
                                if (val) handleUpdateConfig("pro_plan_daily_credits", val);
                              }}
                              disabled={updatingConfigKey === "pro_plan_daily_credits"}
                              className="px-3 rounded-xl bg-white/5 hover:bg-accent-purple hover:text-black text-zinc-400 text-xs font-bold transition-colors"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: BROADCAST ANNOUNCEMENTS */}
              {activeTab === "announcements" && (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                  {/* Create Announcement Form */}
                  <div className="lg:col-span-2 p-8 rounded-[2.5rem] bg-[#0b0c12]/60 border border-white/5 backdrop-blur-md space-y-6 max-h-fit">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-accent-purple">Broadcast Banners</span>
                      <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Create Alert</h3>
                    </div>

                    <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                      {announcementError && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2">
                          <AlertTriangle size={14} /> {announcementError}
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-500">Alert Title</label>
                        <input
                          type="text"
                          placeholder="E.G. NEW SYSTEM UPGRADE"
                          value={newAnnouncement.title}
                          onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                          required
                          className="w-full bg-white/[0.02] border border-white/5 focus:border-accent-purple/40 text-xs font-black uppercase tracking-widest rounded-xl px-4 py-3.5 text-white placeholder-zinc-500 outline-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-500">Alert Message</label>
                        <textarea
                          placeholder="Write announcement body message here..."
                          value={newAnnouncement.content}
                          onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                          required
                          rows={4}
                          className="w-full bg-white/[0.02] border border-white/5 focus:border-accent-purple/40 text-xs font-semibold rounded-xl p-4 text-white placeholder-zinc-500 outline-none resize-none leading-relaxed"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-500">Alert Banner Type</label>
                        <select
                          value={newAnnouncement.type}
                          onChange={(e) => setNewAnnouncement(prev => ({ ...prev, type: e.target.value }))}
                          className="w-full bg-white/[0.02] border border-white/5 text-xs font-bold rounded-xl px-4 py-3.5 text-white outline-none cursor-pointer"
                        >
                          <option value="info" className="bg-[#0b0c12]">Information (Purple Glow)</option>
                          <option value="warning" className="bg-[#0b0c12]">Warning Alert (Amber Glow)</option>
                          <option value="success" className="bg-[#0b0c12]">Success Notice (Emerald Glow)</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        disabled={creatingAnnouncement}
                        className="w-full py-4 rounded-xl bg-accent-purple text-black text-xs font-black uppercase tracking-wider hover:bg-purple-400 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {creatingAnnouncement ? (
                          <>
                            <Loader2 size={13} className="animate-spin" /> Publishing...
                          </>
                        ) : (
                          <>
                            <Plus size={13} /> Publish Announcement
                          </>
                        )}
                      </button>
                    </form>
                  </div>

                  {/* Announcements List */}
                  <div className="lg:col-span-3 space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Broadcast History</h3>
                      <p className="text-xs text-zinc-500">Manage all announcements displayed to platform users.</p>
                    </div>

                    <div className="border border-white/5 bg-[#0b0c12]/40 rounded-[2rem] overflow-hidden backdrop-blur-md">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-white/5 bg-white/[0.01]">
                              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Alert</th>
                              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Type</th>
                              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Status</th>
                              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500 text-right">Delete</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {announcements.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="text-center py-12 text-zinc-500 text-xs font-bold">No announcements published.</td>
                              </tr>
                            ) : (
                              announcements.map((a) => (
                                <tr key={a.id} className="hover:bg-white/[0.01] transition-colors">
                                  <td className="px-6 py-4 flex flex-col gap-1 max-w-[250px]">
                                    <span className="text-xs font-black uppercase tracking-wider text-white leading-tight">{a.title}</span>
                                    <span className="text-[10px] text-zinc-400 font-semibold leading-relaxed line-clamp-2">{a.content}</span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className={cn(
                                      "inline-flex px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider",
                                      a.type === "info" && "bg-purple-500/10 border border-purple-500/20 text-purple-400",
                                      a.type === "warning" && "bg-amber-500/10 border border-amber-500/20 text-amber-400",
                                      a.type === "success" && "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                                    )}>{a.type}</span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <button
                                      onClick={() => handleToggleAnnouncement(a.id, !a.active)}
                                      className={cn(
                                        "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border active:scale-95 transition-all",
                                        a.active
                                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black"
                                          : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white"
                                      )}
                                    >
                                      {a.active ? "Active" : "Inactive"}
                                    </button>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <button
                                      onClick={() => handleDeleteAnnouncement(a.id)}
                                      className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-black transition-all active:scale-95"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: REFERRALS AUDITOR */}
              {activeTab === "referrals" && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Affiliate Tree Auditor</h3>
                    <p className="text-xs text-zinc-500">Track registration invite conversions and credit commission rewards ({referralTotal} total invite relationships).</p>
                  </div>

                  <div className="border border-white/5 bg-[#0b0c12]/40 rounded-[2rem] overflow-hidden backdrop-blur-md">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/5 bg-white/[0.01]">
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Referrer (Invited By)</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Referee (New Account)</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Invite Status</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Commission Granted</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Timestamp</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {referrals.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="text-center py-16 text-zinc-500 text-xs font-bold">No referral logs registered.</td>
                            </tr>
                          ) : (
                            referrals.map((ref) => (
                              <tr key={ref.id} className="hover:bg-white/[0.01] transition-colors text-xs font-semibold">
                                <td className="px-6 py-4 flex flex-col gap-0.5">
                                  <span className="text-white font-bold">{ref.referrer?.name || "Explorer"}</span>
                                  <span className="text-[10px] text-zinc-500">{ref.referrer?.email}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-white font-bold">{ref.referred?.name || "New User"}</span>
                                    <span className="text-[10px] text-zinc-500">{ref.referred?.email}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={cn(
                                    "inline-flex px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider",
                                    ref.status === "registered" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-white/5 border border-white/5 text-zinc-500"
                                  )}>{ref.status}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={cn(
                                    "inline-flex px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider",
                                    ref.rewardClaimed ? "bg-accent-purple/10 border border-accent-purple/20 text-accent-purple" : "bg-white/5 border border-white/5 text-zinc-500"
                                  )}>
                                    {ref.rewardClaimed ? "Claimed (+10%)" : "Pending"}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-[10px] text-zinc-500 font-medium">
                                  {new Date(ref.createdAt).toLocaleString()}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {referralTotalPages > 1 && (
                      <div className="flex items-center justify-between border-t border-white/5 px-6 py-4 bg-white/[0.01]">
                        <span className="text-[10px] font-bold text-zinc-500">Page {referralPage} of {referralTotalPages}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setReferralPage(p => Math.max(p - 1, 1))}
                            disabled={referralPage === 1}
                            className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                          >
                            <ChevronLeft size={14} />
                          </button>
                          <button
                            onClick={() => setReferralPage(p => Math.min(p + 1, referralTotalPages))}
                            disabled={referralPage === referralTotalPages}
                            className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                          >
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 8: SYSTEM LOGS AUDITOR */}
              {activeTab === "logs" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">System Logs Auditor</h3>
                      <p className="text-xs text-zinc-500">Monitor server exceptions, payment webhooks, and credit errors in real time.</p>
                    </div>

                    <button
                      onClick={handleClearLogs}
                      disabled={clearingLogs || logs.length === 0}
                      className="px-5 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black uppercase tracking-wider hover:bg-red-500 hover:text-black active:scale-95 transition-all flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                    >
                      {clearingLogs ? (
                        <>
                          <Loader2 size={13} className="animate-spin" /> Clearing console...
                        </>
                      ) : (
                        <>
                          <Trash2 size={13} /> Clear Console Logs
                        </>
                      )}
                    </button>
                  </div>

                  <div className="border border-white/5 bg-[#08080c] rounded-[2rem] overflow-hidden backdrop-blur-md p-6 font-mono text-[11px] leading-relaxed space-y-4 max-h-[600px] overflow-y-auto">
                    {logs.length === 0 ? (
                      <div className="text-center py-20 text-zinc-600 font-bold uppercase tracking-widest font-sans text-xs">Console is completely clean. No exceptions logged.</div>
                    ) : (
                      logs.map((log) => (
                        <div key={log.id} className="border-b border-white/5 pb-4 last:border-b-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className={cn(
                              "px-1.5 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-wider leading-none",
                              log.level === "error" && "bg-red-500/20 text-red-400",
                              log.level === "warning" && "bg-amber-500/20 text-amber-400",
                              log.level === "info" && "bg-blue-500/20 text-blue-400"
                            )}>{log.level}</span>
                            <span className="text-zinc-500 font-bold">[{new Date(log.createdAt).toLocaleString()}]</span>
                            <span className="text-purple-400 font-bold">SRC: {log.source}</span>
                          </div>
                          <div className="text-zinc-300 whitespace-pre-wrap font-semibold break-all leading-normal">
                            {log.message}
                          </div>
                          {log.stack && (
                            <pre className="text-[10px] text-zinc-600 bg-white/[0.01] p-3 rounded-lg overflow-x-auto select-all max-h-[150px]">
                              {log.stack}
                            </pre>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {logTotalPages > 1 && (
                    <div className="flex items-center justify-between border border-white/5 px-6 py-4 bg-[#0b0c12]/40 rounded-3xl backdrop-blur-md">
                      <span className="text-[10px] font-bold text-zinc-500">Page {logPage} of {logTotalPages}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setLogPage(p => Math.max(p - 1, 1))}
                          disabled={logPage === 1}
                          className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          <ChevronLeft size={14} />
                        </button>
                        <button
                          onClick={() => setLogPage(p => Math.min(p + 1, logTotalPages))}
                          disabled={logPage === logTotalPages}
                          className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Edit User Modal Overlay */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingUser(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative max-w-md w-full bg-[#0b0c12]/95 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-xl space-y-6"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-wider text-accent-purple">Modify Creator Account</span>
                  <h4 className="text-lg font-black text-white italic tracking-tight">{editingUser.name || "Explorer"}</h4>
                  <p className="text-[10px] text-zinc-500 font-semibold">{editingUser.email}</p>
                </div>
                <button
                  onClick={() => setEditingUser(null)}
                  className="p-2 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all active:scale-95"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-500">Plan Tier</label>
                  <select
                    value={editForm.plan}
                    onChange={(e) => setEditForm(prev => ({ ...prev, plan: e.target.value }))}
                    className="w-full bg-white/[0.02] border border-white/5 text-xs font-bold rounded-xl px-4 py-3.5 text-white outline-hidden cursor-pointer"
                  >
                    <option value="free" className="bg-[#0b0c12]">Free</option>
                    <option value="pro" className="bg-[#0b0c12]">Pro</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-500">Role Privilege</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full bg-white/[0.02] border border-white/5 text-xs font-bold rounded-xl px-4 py-3.5 text-white outline-hidden cursor-pointer"
                  >
                    <option value="user" className="bg-[#0b0c12]">User</option>
                    <option value="admin" className="bg-[#0b0c12]">Admin</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-500">Account status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full bg-white/[0.02] border border-white/5 text-xs font-bold rounded-xl px-4 py-3.5 text-white outline-hidden cursor-pointer"
                  >
                    <option value="active" className="bg-[#0b0c12]">Active</option>
                    <option value="suspended" className="bg-[#0b0c12]">Suspended (Access Banned)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-500">Daily Credits</label>
                  <input
                    type="number"
                    value={editForm.dailyCredits}
                    onChange={(e) => setEditForm(prev => ({ ...prev, dailyCredits: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-white/[0.02] border border-white/5 focus:border-accent-purple/40 text-xs font-bold rounded-xl px-4 py-3.5 text-white outline-hidden"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-500">Bonus/Permanent Credits</label>
                  <input
                    type="number"
                    value={editForm.bonusCredits}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bonusCredits: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-white/[0.02] border border-white/5 focus:border-accent-purple/40 text-xs font-bold rounded-xl px-4 py-3.5 text-white outline-hidden"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveUserEdit}
                disabled={submittingUserEdit}
                className="w-full py-4 rounded-2xl bg-accent-purple text-black text-xs font-black uppercase tracking-wider hover:bg-purple-400 active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submittingUserEdit ? "Applying settings..." : "Save Changes"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
