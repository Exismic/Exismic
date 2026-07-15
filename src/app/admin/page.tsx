"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  TrendingUp, 
  Search, 
  Filter, 
  Coins, 
  Sparkles, 
  ShieldAlert, 
  Lock,
  Edit2,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Database,
  ArrowUpRight,
  AlertCircle
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
}

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  
  // Search & Filter state
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal / Edit state
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState({
    plan: "free",
    role: "user",
    dailyCredits: 50,
    bonusCredits: 0,
  });
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Initial Auth & Stats load
  useEffect(() => {
    async function initAdmin() {
      try {
        const statsRes = await fetch("/api/admin/stats");
        if (statsRes.status === 401 || statsRes.status === 403) {
          setAuthorized(false);
          setLoading(false);
          return;
        }

        const statsData = await statsRes.json();
        if (statsData.success) {
          setStats(statsData.stats);
          setAuthorized(true);
          // Load users
          await loadUsers(1, "", "all", "all");
        }
      } catch (error) {
        console.error("Failed to initialize admin workspace:", error);
      } finally {
        setLoading(false);
      }
    }

    initAdmin();
  }, []);

  // Fetch users list
  async function loadUsers(targetPage: number, query: string, plan: string, role: string) {
    try {
      const res = await fetch(
        `/api/admin/users?page=${targetPage}&search=${encodeURIComponent(query)}&plan=${plan}&role=${role}`
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(data.users);
        setTotalUsersCount(data.total);
        setTotalPages(data.totalPages);
        setPage(data.page);
      }
    } catch (err) {
      console.error("Failed to fetch user directory:", err);
    }
  }

  // Triggered on filter or search updates
  useEffect(() => {
    if (authorized) {
      const delayDebounce = setTimeout(() => {
        loadUsers(1, search, planFilter, roleFilter);
      }, 300);
      return () => clearTimeout(delayDebounce);
    }
  }, [search, planFilter, roleFilter]);

  const handleEditClick = (user: AdminUser) => {
    setEditingUser(user);
    setEditForm({
      plan: user.plan,
      role: user.role,
      dailyCredits: user.dailyCredits,
      bonusCredits: user.bonusCredits,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    setSubmittingEdit(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editingUser.id,
          ...editForm,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Refresh users list and stats
        await loadUsers(page, search, planFilter, roleFilter);
        // Refresh general stats count
        const statsRes = await fetch("/api/admin/stats");
        const statsData = await statsRes.json();
        if (statsData.success) {
          setStats(statsData.stats);
        }
        setEditingUser(null);
      }
    } catch (error) {
      console.error("Failed to update user profile:", error);
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Forbidden Page View
  if (!loading && !authorized) {
    return (
      <div className="min-h-screen bg-[#030303] text-white flex items-center justify-center relative px-6 overflow-hidden">
        {/* Glowing light structures */}
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
            You do not have administrative credentials to view the control panel. If you believe this is an error, please contact platform operations.
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
      {/* Background cinematic aura */}
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
            <p className="text-zinc-500 font-medium text-lg max-w-xl leading-relaxed">
              Exismic platform administrator panel. Audit active users, manage daily credit policies, adjust subscription statuses, and monitor growth metrics.
            </p>
          </div>
        </header>

        {loading ? (
          <div className="space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <Skeleton key={n} className="h-32 bg-white/5 border border-white/10 rounded-3xl" />
              ))}
            </div>
            <Skeleton className="h-96 w-full bg-white/5 border border-white/10 rounded-3xl" />
          </div>
        ) : (
          <div className="space-y-16">
            {/* Analytics Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Stat 1 */}
              <div className="p-6 rounded-3xl bg-[#0b0c12]/60 border border-white/5 relative overflow-hidden group hover:border-accent-purple/30 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Total Users</span>
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-accent-purple">
                    <Users size={16} />
                  </div>
                </div>
                <h3 className="text-3xl font-black text-white italic tracking-tight">{stats?.totalUsers}</h3>
              </div>

              {/* Stat 2 */}
              <div className="p-6 rounded-3xl bg-[#0b0c12]/60 border border-white/5 relative overflow-hidden group hover:border-accent-purple/30 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Pro Subscriptions</span>
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-accent-purple">
                    <Sparkles size={16} />
                  </div>
                </div>
                <h3 className="text-3xl font-black text-transparent bg-clip-text bg-linear-to-r from-purple-300 to-purple-500 italic tracking-tight">
                  {stats?.proUsers}
                </h3>
              </div>

              {/* Stat 3 */}
              <div className="p-6 rounded-3xl bg-[#0b0c12]/60 border border-white/5 relative overflow-hidden group hover:border-accent-purple/30 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Circulating Credits</span>
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-accent-purple">
                    <Coins size={16} />
                  </div>
                </div>
                <h3 className="text-3xl font-black text-white italic tracking-tight">{stats?.totalCredits}</h3>
              </div>

              {/* Stat 4 */}
              <div className="p-6 rounded-3xl bg-[#0b0c12]/60 border border-white/5 relative overflow-hidden group hover:border-accent-purple/30 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">AI Generations</span>
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-accent-purple">
                    <TrendingUp size={16} />
                  </div>
                </div>
                <h3 className="text-3xl font-black text-white italic tracking-tight">{stats?.totalGenerations}</h3>
              </div>
            </section>

            {/* Users Directory Header & Controls */}
            <section className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Users Directory</h3>
                  <p className="text-xs text-zinc-500">Audit and update parameters for {totalUsersCount} platform creators.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Search input */}
                  <div className="relative">
                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Search name or email..."
                      value={search}
                      onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                      className="bg-white/[0.02] border border-white/5 hover:border-white/10 focus:border-accent-purple/40 text-xs font-semibold rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-500 outline-hidden transition-all w-full sm:w-[220px]"
                    />
                  </div>

                  {/* Plan selector */}
                  <select
                    value={planFilter}
                    onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
                    className="bg-white/[0.02] border border-white/5 hover:border-white/10 text-xs font-black uppercase tracking-wide rounded-xl px-4 py-3 text-zinc-300 outline-hidden transition-all cursor-pointer"
                  >
                    <option value="all" className="bg-[#0b0c12] text-white">All Plans</option>
                    <option value="free" className="bg-[#0b0c12] text-white">Free Plan</option>
                    <option value="pro" className="bg-[#0b0c12] text-white">Pro Plan</option>
                  </select>

                  {/* Role selector */}
                  <select
                    value={roleFilter}
                    onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                    className="bg-white/[0.02] border border-white/5 hover:border-white/10 text-xs font-black uppercase tracking-wide rounded-xl px-4 py-3 text-zinc-300 outline-hidden transition-all cursor-pointer"
                  >
                    <option value="all" className="bg-[#0b0c12] text-white">All Roles</option>
                    <option value="user" className="bg-[#0b0c12] text-white">User Role</option>
                    <option value="admin" className="bg-[#0b0c12] text-white">Admin Role</option>
                  </select>
                </div>
              </div>

              {/* Users Directory Table */}
              <div className="border border-white/5 bg-[#0b0c12]/40 rounded-[2rem] overflow-hidden backdrop-blur-md">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.01]">
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Creator</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Plan</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Role</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Daily Credits</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Bonus Credits</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500 text-right">Settings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-20 text-zinc-500 text-xs font-bold">
                            No profiles match the search criteria.
                          </td>
                        </tr>
                      ) : (
                        users.map((u) => (
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
                                u.plan === "pro"
                                  ? "bg-accent-purple/10 border border-accent-purple/20 text-accent-purple"
                                  : "bg-white/5 border border-white/5 text-zinc-400"
                              )}>
                                {u.plan}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={cn(
                                "inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider",
                                u.role === "admin"
                                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                                  : "bg-white/5 border border-white/5 text-zinc-400"
                              )}>
                                {u.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs font-black text-zinc-300">{u.dailyCredits}</td>
                            <td className="px-6 py-4 text-xs font-black text-zinc-300">{u.bonusCredits}</td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleEditClick(u)}
                                className="p-2 rounded-lg bg-white/5 border border-white/5 hover:border-accent-purple/30 hover:bg-accent-purple/10 text-zinc-400 hover:text-accent-purple active:scale-95 transition-all"
                              >
                                <Edit2 size={13} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination bar */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-white/5 px-6 py-4 bg-white/[0.01]">
                    <span className="text-[10px] font-bold text-zinc-500">Page {page} of {totalPages}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => loadUsers(page - 1, search, planFilter, roleFilter)}
                        disabled={page === 1}
                        className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <button
                        onClick={() => loadUsers(page + 1, search, planFilter, roleFilter)}
                        disabled={page === totalPages}
                        className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Edit User Modal */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-150 flex items-center justify-center px-6">
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
                  className="p-2 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 text-zinc-400 hover:text-white transition-all active:scale-95"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Plan Dropdown */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-500">Plan Tier</label>
                  <select
                    value={editForm.plan}
                    onChange={(e) => setEditForm(prev => ({ ...prev, plan: e.target.value }))}
                    className="w-full bg-white/[0.02] border border-white/5 hover:border-white/10 text-xs font-bold rounded-xl px-4 py-3.5 text-white outline-hidden cursor-pointer"
                  >
                    <option value="free" className="bg-[#0b0c12]">Free</option>
                    <option value="pro" className="bg-[#0b0c12]">Pro</option>
                  </select>
                </div>

                {/* Role Dropdown */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-500">Role Privilege</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full bg-white/[0.02] border border-white/5 hover:border-white/10 text-xs font-bold rounded-xl px-4 py-3.5 text-white outline-hidden cursor-pointer"
                  >
                    <option value="user" className="bg-[#0b0c12]">User</option>
                    <option value="admin" className="bg-[#0b0c12]">Admin</option>
                  </select>
                </div>

                {/* Daily Credits Input */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-500">Daily Credits</label>
                  <input
                    type="number"
                    value={editForm.dailyCredits}
                    onChange={(e) => setEditForm(prev => ({ ...prev, dailyCredits: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-white/[0.02] border border-white/5 focus:border-accent-purple/40 text-xs font-bold rounded-xl px-4 py-3.5 text-white outline-hidden"
                  />
                </div>

                {/* Bonus Credits Input */}
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

              {/* Submit button */}
              <button
                onClick={handleSaveEdit}
                disabled={submittingEdit}
                className="w-full py-4 rounded-2xl bg-accent-purple text-black text-xs font-black uppercase tracking-wider hover:bg-purple-400 active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submittingEdit ? "Applying settings..." : "Save Changes"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
