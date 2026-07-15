"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MessageSquare, Mail, HelpCircle, Sparkles, Send, Zap, Shield, User, FileText, AlignLeft, ChevronDown, ImagePlus, CheckCircle, X } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect, useMemo } from "react";
import { submitContactRequest } from "@/app/actions/contact";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";

export default function HelpPage() {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("General Support");
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Prefill logged-in user profile details
  useEffect(() => {
    async function loadUserSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setName(session.user.user_metadata?.full_name || session.user.user_metadata?.name || "");
        setEmail(session.user.email || "");
      }
    }
    loadUserSession();
  }, [supabase]);

  const isReadOnly = !!user;

  const subjects = ["General Support", "Billing Inquiry", "Bug Report", "Feature Request"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      setErrorMsg("Please fill out all required fields.");
      return;
    }
    
    setIsSubmitting(true);
    setErrorMsg("");
    
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("subject", subject);
    formData.append("message", message);
    if (imageFile) {
      formData.append("image", imageFile);
    }
    
    const result = await submitContactRequest(formData);
    
    if (result.error) {
      setErrorMsg(result.error);
      setIsSubmitting(false);
    } else {
      setIsSuccess(true);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg("Image size must be less than 5MB.");
        return;
      }
      setImageFile(file);
    }
  };
  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-accent-purple/30 pb-32 overflow-hidden" suppressHydrationWarning>
      {/* Cinematic Background Architecture */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1000px] bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.08)_0%,transparent_70%)]" />
        <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-accent-purple/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-accent-cyan/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
      </div>
      
      <main className="max-w-6xl mx-auto px-6 pt-32 space-y-24 relative z-10">
        <Link href="/" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 hover:text-white transition-all group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Support / Back
        </Link>

        <header className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-4 text-accent-purple"
          >
            <div className="w-16 h-16 rounded-2xl bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-accent-purple/20 blur-xl animate-pulse" />
              <HelpCircle size={32} className="relative z-10 animate-pulse drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]" />
            </div>
            <div className="h-px w-24 bg-linear-to-r from-accent-purple/50 to-transparent" />
          </motion.div>
          
          <div className="space-y-4">
            <h1 className="text-7xl md:text-[9rem] font-black tracking-tighter uppercase italic leading-[0.8] select-none">
              Get <br />
              <span className="text-transparent bg-clip-text bg-[linear-gradient(110deg,#c084fc_0%,#ffffff_45%,#a855f7_55%,#ffffff_100%)] bg-[length:200%_100%] animate-[shine_4s_linear_infinite] drop-shadow-[0_2px_15px_rgba(168,85,247,0.4)]">Help.</span>
            </h1>
            <p className="text-zinc-500 font-medium text-xl max-w-xl leading-relaxed">
              Our team of specialists is standing by to ensure your creative flow remains uninterrupted.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3 relative group p-8 sm:p-12 rounded-[3rem] bg-[#0b0c12]/80 backdrop-blur-2xl border border-white/5 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-700 hover:border-accent-purple/30"
          >
            {/* Animated Glow Behind Form */}
            <div className="absolute inset-0 bg-linear-to-br from-accent-purple/10 via-transparent to-accent-cyan/10 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute -inset-[100%] animate-[spin_8s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0%,rgba(168,85,247,0.1)_25%,transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <div className="relative z-10 space-y-10">
              <div className="space-y-3">
                <h2 className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-white to-white/50 italic tracking-tighter uppercase">Send a Request</h2>
                <p className="text-zinc-400 font-medium text-sm">We'll get back to you as soon as possible.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {errorMsg && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium flex items-center gap-3">
                    <X size={16} /> {errorMsg}
                  </div>
                )}
                
                {isSuccess ? (
                  <div className="flex flex-col items-center justify-center space-y-6 py-16">
                    <div className="relative w-24 h-24">
                      <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
                      <div className="relative w-full h-full rounded-full border border-emerald-500/50 bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                        <CheckCircle size={40} />
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-500 uppercase italic tracking-tighter drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]">Transmission Sent</p>
                      <p className="text-zinc-400 font-medium">Our specialists will review your request shortly.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Name Input */}
                      <div className="space-y-2.5 relative group/input">
                        <label className={cn(
                          "text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 transition-colors",
                          !isReadOnly && "group-focus-within/input:text-white"
                        )}>Name</label>
                        <div className="relative flex items-center">
                          <div className={cn(
                            "absolute left-4 text-zinc-500 transition-colors",
                            !isReadOnly && "group-focus-within/input:text-accent-cyan"
                          )}>
                            <User size={18} />
                          </div>
                          <input 
                            required 
                            value={name} 
                            onChange={e => !isReadOnly && setName(e.target.value)} 
                            type="text" 
                            placeholder="John Doe" 
                            readOnly={isReadOnly}
                            className={cn(
                              "w-full h-14 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm font-medium transition-all duration-300 outline-none",
                              isReadOnly 
                                ? "text-zinc-400 bg-white/[0.02] border-white/5 cursor-not-allowed select-none" 
                                : "text-white hover:border-white/20 hover:bg-white/[0.07] focus:border-accent-cyan/50 focus:bg-white/10 focus:shadow-[0_0_25px_rgba(34,211,238,0.15)]"
                            )} 
                          />
                        </div>
                      </div>
                      
                      {/* Email Input */}
                      <div className="space-y-2.5 relative group/input">
                        <label className={cn(
                          "text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 transition-colors",
                          !isReadOnly && "group-focus-within/input:text-white"
                        )}>Email Address</label>
                        <div className="relative flex items-center">
                          <div className={cn(
                            "absolute left-4 text-zinc-500 transition-colors",
                            !isReadOnly && "group-focus-within/input:text-accent-purple"
                          )}>
                            <Mail size={18} />
                          </div>
                          <input 
                            required 
                            value={email} 
                            onChange={e => !isReadOnly && setEmail(e.target.value)} 
                            type="email" 
                            placeholder="john@example.com" 
                            readOnly={isReadOnly}
                            className={cn(
                              "w-full h-14 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm font-medium transition-all duration-300 outline-none",
                              isReadOnly 
                                ? "text-zinc-400 bg-white/[0.02] border-white/5 cursor-not-allowed select-none" 
                                : "text-white hover:border-white/20 hover:bg-white/[0.07] focus:border-accent-purple/50 focus:bg-white/10 focus:shadow-[0_0_25px_rgba(168,85,247,0.15)]"
                            )} 
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Custom Subject Dropdown */}
                    <div className="space-y-2.5 relative">
                      <label className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 transition-colors">Subject</label>
                      <div className="relative">
                        <div 
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className={`w-full h-14 bg-white/5 border ${isDropdownOpen ? 'border-accent-purple/50 bg-white/10 shadow-[0_0_25px_rgba(168,85,247,0.15)]' : 'border-white/10 hover:border-white/20 hover:bg-white/[0.07]'} rounded-xl pl-12 pr-4 flex items-center justify-between cursor-pointer transition-all duration-300 group/dropdown`}
                        >
                          <div className={`absolute left-4 transition-colors ${isDropdownOpen ? 'text-accent-purple' : 'text-zinc-500 group-hover/dropdown:text-zinc-300'}`}>
                            <FileText size={18} />
                          </div>
                          <span className="text-sm font-medium text-white">{subject}</span>
                          <ChevronDown size={16} className={`text-zinc-500 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-white' : ''}`} />
                        </div>
                        
                        <AnimatePresence>
                          {isDropdownOpen && (
                            <motion.div 
                              initial={{ opacity: 0, y: -10, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -10, scale: 0.98 }}
                              transition={{ duration: 0.2 }}
                              className="absolute top-[calc(100%+8px)] left-0 w-full bg-[#111218]/95 backdrop-blur-3xl border border-white/10 rounded-xl overflow-hidden z-50 shadow-[0_20px_60px_rgba(0,0,0,0.6)] p-2"
                            >
                              {subjects.map(sub => (
                                <div 
                                  key={sub}
                                  onClick={() => { setSubject(sub); setIsDropdownOpen(false); }}
                                  className={`px-4 py-3 text-sm font-medium rounded-lg cursor-pointer transition-all flex items-center justify-between ${subject === sub ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
                                >
                                  {sub}
                                  {subject === sub && <div className="w-1.5 h-1.5 rounded-full bg-accent-purple shadow-[0_0_10px_rgba(168,85,247,0.8)] animate-pulse" />}
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Message Textarea */}
                    <div className="space-y-2.5 relative group/input">
                      <label className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 transition-colors group-focus-within/input:text-white">Message</label>
                      <div className="relative">
                        <div className="absolute left-4 top-5 text-zinc-500 transition-colors group-focus-within/input:text-accent-purple">
                          <AlignLeft size={18} />
                        </div>
                        <textarea 
                          required 
                          value={message} 
                          onChange={e => setMessage(e.target.value)} 
                          placeholder={
                            subject === "Bug Report" ? "What did you expect to happen, and what actually happened?" :
                            subject === "Feature Request" ? "Describe the feature you'd like to see..." :
                            subject === "Billing Inquiry" ? "Please describe your billing issue or question..." :
                            "How can we help you today?"
                          }
                          className="w-full h-40 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/[0.07] rounded-xl pl-12 pr-4 pt-5 pb-4 text-sm font-medium text-white placeholder-zinc-600 outline-none focus:border-accent-purple/50 focus:bg-white/10 focus:shadow-[0_0_25px_rgba(168,85,247,0.15)] transition-all duration-300 resize-none"
                        ></textarea>
                      </div>
                    </div>

                    {/* Image Attachment */}
                    <div className="space-y-2.5 group/upload">
                      <label className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 transition-colors group-hover/upload:text-white">Attachment (Optional)</label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleImageChange}
                      />
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`w-full h-20 border-2 border-dashed rounded-xl flex items-center justify-center gap-3 cursor-pointer transition-all duration-300 ${imageFile ? 'border-accent-purple/50 text-white bg-accent-purple/[0.05] shadow-[0_0_20px_rgba(168,85,247,0.1)]' : 'border-white/10 bg-white/[0.02] text-zinc-500 hover:border-accent-purple/30 hover:bg-white/[0.05] hover:text-white'}`}
                      >
                        {imageFile ? (
                          <>
                            <CheckCircle size={20} className="text-accent-purple drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]" />
                            <span className="text-sm font-black tracking-wide">{imageFile.name} attached</span>
                            <div 
                              className="ml-auto mr-4 p-2 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-red-400 hover:rotate-90 transition-all duration-300"
                              onClick={(e) => { e.stopPropagation(); setImageFile(null); }}
                            >
                              <X size={18} />
                            </div>
                          </>
                        ) : (
                          <>
                            <ImagePlus size={20} className="transition-transform group-hover/upload:scale-110 group-hover/upload:rotate-3 duration-300" />
                            <span className="text-sm font-medium tracking-wide">Click to attach a screenshot</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="pt-6">
                      <button disabled={isSubmitting} type="submit" className="relative group/btn w-full h-16 rounded-xl bg-white/[0.05] border border-white/10 text-white font-black text-sm uppercase tracking-[0.3em] overflow-hidden transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none hover:border-white/30 hover:shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                        {/* Dynamic energetic background sweep */}
                        <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0)_100%)] bg-[length:200%_100%] animate-[shine_2s_linear_infinite]" />
                        
                        {/* Colorful glow underneath on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-accent-purple/20 via-accent-cyan/20 to-accent-purple/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
                        
                        <span className="relative z-10 flex items-center justify-center gap-3 drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)]">
                          {isSubmitting ? (
                            <span className="flex items-center gap-2">
                              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> 
                              Sending...
                            </span>
                          ) : (
                            <>Submit Request <Send size={18} className="transition-transform duration-300 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" /></>
                          )}
                        </span>
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          </motion.div>

          {/* Email Support Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 relative group p-8 sm:p-12 rounded-[3rem] glass-dark border border-white/5 overflow-hidden transition-all duration-700 hover:border-white/20 flex flex-col justify-center"
          >
            <div className="absolute inset-0 bg-linear-to-br from-accent-cyan/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative z-10 space-y-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-3xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan shadow-[0_0_40px_rgba(34,211,238,0.15)] group-hover:scale-110 transition-transform duration-500">
                <Mail size={36} />
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Support Mail</h2>
                <p className="text-zinc-500 font-medium text-sm leading-relaxed">
                  Detailed inquiries or bug reports. We guarantee a response within <span className="text-white">24 business hours</span>.
                </p>
              </div>
              <a 
                href="mailto:support@exismic.xyz"
                className="w-full h-16 rounded-xl bg-white/5 border border-white/10 text-zinc-400 font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] hover:text-white hover:border-white/20 hover:bg-white/[0.08] transition-all flex items-center justify-center gap-3 break-all px-2"
              >
                support@exismic.xyz <Send size={14} className="shrink-0" />
              </a>
            </div>
          </motion.div>
        </div>

        {/* FAQ Section with Premium Styling */}
        <section className="space-y-16">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-zinc-600">Common Questions</h2>
            <div className="h-px flex-1 mx-12 bg-white/5" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { q: "How do I upgrade to Pro?", a: "Access the Pricing page or visit your Account Settings to upgrade instantly.", icon: Sparkles },
              { q: "What files are supported?", a: "We support all major image, audio, and document formats with high-fidelity output.", icon: Zap },
              { q: "Is my data secure?", a: "Yes. All processing is transient and encrypted. Your original files are never permanently stored.", icon: Shield }
            ].map((faq, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="p-8 rounded-[2.5rem] glass-dark border border-white/5 space-y-6"
              >
                <faq.icon size={20} className="text-accent-purple" />
                <div className="space-y-3">
                  <h3 className="text-lg font-black text-white uppercase italic tracking-tight">{faq.q}</h3>
                  <p className="text-zinc-500 font-medium text-sm leading-relaxed">{faq.a}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
