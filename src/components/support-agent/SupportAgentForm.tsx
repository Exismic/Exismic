"use client";

import { FormEvent, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, CheckCircle2, ImageIcon, MessageSquare, Save, Trash2, Upload } from "lucide-react";
import Link from "next/link";
import {
  SUPPORT_AGENT_DEFAULTS,
  SUPPORT_AGENT_THEMES,
  SUPPORT_AGENT_TONES,
  type SupportAgent,
  type SupportAgentInput,
  type SupportAgentTheme,
  type SupportAgentTone,
  type SupportAgentWidgetPosition,
} from "@/lib/support-agent/types";
import { removeSupportAgentForUser, saveSupportAgentForUser } from "@/lib/support-agent/client-service";

interface SupportAgentFormProps {
  userId: string;
  initialAgent?: SupportAgent;
}

const colorOptions = ["#8B5CF6", "#22D3EE", "#3B82F6", "#10B981", "#F59E0B", "#EC4899"];
const fieldInputClass =
  "min-h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm font-bold text-white outline-none transition placeholder:text-zinc-700 focus:border-cyan-300/40 focus:ring-4 focus:ring-cyan-300/10";

export function SupportAgentForm({ userId, initialAgent }: SupportAgentFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<SupportAgentInput>({
    ...SUPPORT_AGENT_DEFAULTS,
    ...initialAgent,
    widget_icon_url: initialAgent?.widget_icon_url ?? "",
  });
  const [agentNameTouched, setAgentNameTouched] = useState(Boolean(initialAgent?.name));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const previewGradient = useMemo(
    () => `linear-gradient(135deg, ${form.primary_color}, #22D3EE)`,
    [form.primary_color]
  );

  function updateField<K extends keyof SupportAgentInput>(key: K, value: SupportAgentInput[K]) {
    setSavedMessage("");
    setHasUnsavedChanges(true);
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateBusinessName(value: string) {
    setSavedMessage("");
    setHasUnsavedChanges(true);
    setForm((current) => ({
      ...current,
      business_name: value,
      name: agentNameTouched ? current.name : value.trim() ? `${value.trim()} Support` : "",
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSavedMessage("");

    if (!form.business_name.trim()) {
      setError("Business name is required.");
      return;
    }

    setSaving(true);
    const normalized: SupportAgentInput = {
      ...form,
      name: form.name.trim() || `${form.business_name.trim()} Support`,
      business_name: form.business_name.trim(),
      website_url: form.website_url.trim(),
      widget_icon_url: form.widget_icon_url.trim(),
      description: form.description.trim(),
      welcome_message: form.welcome_message.trim(),
      fallback_message: form.fallback_message.trim(),
    };

    void saveSupportAgentForUser(userId, normalized, initialAgent?.id)
      .then((saved) => {
        if (!saved) {
          setError("We could not save this support agent. Please try again.");
          return;
        }
        setForm({
          ...SUPPORT_AGENT_DEFAULTS,
          ...saved,
          widget_icon_url: saved.widget_icon_url ?? "",
        });
        setHasUnsavedChanges(false);
        setSavedMessage(initialAgent ? "Changes saved. Your widget has been updated." : "Support agent created.");

        if (!initialAgent) {
          router.push(`/dashboard/support-agent/${saved.id}`);
          return;
        }

        router.refresh();
        window.setTimeout(() => setSavedMessage(""), 3200);
      })
      .catch((saveError) => {
        setError(saveError instanceof Error ? saveError.message : "We could not save this support agent. Please try again.");
      })
      .finally(() => setSaving(false));
  }

  function handleDelete() {
    if (!initialAgent) return;
    void removeSupportAgentForUser(userId, initialAgent.id).then(() => {
      router.push("/dashboard/support-agent");
    });
  }

  function handleIconUpload(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file for the widget icon.");
      return;
    }

    if (file.size > 450 * 1024) {
      setError("Widget icon image should be under 450KB. Use a small logo or compressed image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateField("widget_icon_url", String(reader.result || ""));
      setError("");
    };
    reader.onerror = () => setError("Could not read this image. Try another file.");
    reader.readAsDataURL(file);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <form onSubmit={handleSubmit} className="space-y-5 rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 backdrop-blur-2xl sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/dashboard/support-agent" className="inline-flex min-h-11 items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-500 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Agents
          </Link>
          <div className="flex flex-col gap-3 sm:items-end">
            {initialAgent && (
              <span className={`inline-flex min-h-8 items-center justify-center rounded-full border px-3 text-[10px] font-black uppercase tracking-[0.18em] ${
                hasUnsavedChanges
                  ? "border-amber-300/20 bg-amber-300/10 text-amber-100"
                  : "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
              }`}>
                {hasUnsavedChanges ? "Unsaved changes" : "Saved"}
              </span>
            )}
            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 px-5 text-xs font-black uppercase tracking-[0.18em] text-white shadow-[0_18px_60px_rgba(34,211,238,0.16)] transition hover:scale-[1.02] disabled:opacity-60"
            >
              {savedMessage && !hasUnsavedChanges ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving..." : savedMessage && !hasUnsavedChanges ? "Saved" : initialAgent ? "Save Changes" : "Create Agent"}
            </button>
          </div>
        </div>

        {savedMessage && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm font-bold text-emerald-100">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            {savedMessage}
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-100">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Agent name">
            <input
              value={form.name}
              onChange={(event) => {
                setAgentNameTouched(true);
                updateField("name", event.target.value);
              }}
              className={fieldInputClass}
              placeholder="Auto-filled from business name"
            />
          </Field>
          <Field label="Business name">
            <input value={form.business_name} onChange={(event) => updateBusinessName(event.target.value)} className={fieldInputClass} placeholder="Your brand or company" />
          </Field>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="max-w-xl">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">Widget icon image</p>
              <p className="mt-2 text-xs font-semibold leading-6 text-zinc-500">
                Add a logo or avatar image to replace the letter inside the animated launcher orb. Small square images work best.
              </p>
            </div>
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 text-sm font-black text-white" style={{ background: previewGradient }}>
              {form.widget_icon_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.widget_icon_url} alt="Widget icon preview" className="h-full w-full object-cover" />
              ) : (
                <ImageIcon className="h-6 w-6" />
              )}
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto]">
            <input
              value={form.widget_icon_url}
              onChange={(event) => updateField("widget_icon_url", event.target.value)}
              className={fieldInputClass}
              placeholder="https://yourbusiness.com/logo.png"
            />
            <label className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-white/10">
              <Upload className="h-4 w-4" />
              Upload
              <input type="file" accept="image/*" className="hidden" onChange={(event) => handleIconUpload(event.target.files?.[0])} />
            </label>
            <button
              type="button"
              onClick={() => updateField("widget_icon_url", "")}
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/10 bg-black/30 px-4 text-xs font-black uppercase tracking-[0.16em] text-zinc-300 transition hover:bg-white/10 hover:text-white"
            >
              Clear
            </button>
          </div>
        </div>

        <Field label="Website URL">
          <input value={form.website_url} onChange={(event) => updateField("website_url", event.target.value)} className={fieldInputClass} placeholder="https://yourbusiness.com" />
        </Field>

        <Field label="Business description">
          <textarea
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            className={`${fieldInputClass} min-h-32 resize-none py-4`}
            placeholder="Describe what your business sells, who you serve, and what customers usually ask about."
          />
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Tone">
            <select value={form.tone} onChange={(event) => updateField("tone", event.target.value as SupportAgentTone)} className={fieldInputClass}>
              {SUPPORT_AGENT_TONES.map((tone) => (
                <option key={tone.value} value={tone.value}>{tone.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Widget position">
            <select value={form.widget_position} onChange={(event) => updateField("widget_position", event.target.value as SupportAgentWidgetPosition)} className={fieldInputClass}>
              <option value="bottom-right">Bottom right</option>
              <option value="bottom-left">Bottom left</option>
            </select>
          </Field>
        </div>

        <Field label="Welcome message">
          <textarea value={form.welcome_message} onChange={(event) => updateField("welcome_message", event.target.value)} className={`${fieldInputClass} min-h-24 resize-none py-4`} />
        </Field>

        <Field label="Fallback message">
          <textarea value={form.fallback_message} onChange={(event) => updateField("fallback_message", event.target.value)} className={`${fieldInputClass} min-h-24 resize-none py-4`} />
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">Primary color</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => updateField("primary_color", color)}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 transition hover:scale-105"
                  style={{ backgroundColor: color }}
                  aria-label={`Use color ${color}`}
                >
                  {form.primary_color === color && <Check className="h-4 w-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">Lead capture</p>
            <button
              type="button"
              onClick={() => updateField("lead_capture_enabled", !form.lead_capture_enabled)}
              className="mt-4 flex min-h-12 w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-left"
            >
              <span className="text-sm font-black text-white">{form.lead_capture_enabled ? "Enabled" : "Disabled"}</span>
              <span className={`h-6 w-11 rounded-full p-1 transition ${form.lead_capture_enabled ? "bg-cyan-400" : "bg-zinc-700"}`}>
                <span className={`block h-4 w-4 rounded-full bg-white transition ${form.lead_capture_enabled ? "translate-x-5" : ""}`} />
              </span>
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {SUPPORT_AGENT_THEMES.map((theme) => (
            <button
              key={theme.value}
              type="button"
              onClick={() => updateField("theme", theme.value as SupportAgentTheme)}
              className={`rounded-3xl border p-4 text-left transition hover:-translate-y-0.5 ${
                form.theme === theme.value ? "border-cyan-300/50 bg-cyan-300/10" : "border-white/10 bg-black/20"
              }`}
            >
              <div className="flex items-center gap-2">
                {theme.colors.map((color) => (
                  <span key={color} className="h-5 w-5 rounded-full border border-white/20" style={{ backgroundColor: color }} />
                ))}
              </div>
              <p className="mt-4 text-sm font-black text-white">{theme.label}</p>
            </button>
          ))}
        </div>

        {initialAgent && (
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 text-xs font-black uppercase tracking-[0.18em] text-red-100 transition hover:bg-red-500/20"
          >
            <Trash2 className="h-4 w-4" />
            Delete Agent
          </button>
        )}
      </form>

      <aside className="space-y-5">
        <div className="sticky top-24 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl backdrop-blur-2xl">
          <div className="rounded-[1.5rem] border border-white/10 bg-[#08080d] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-black text-white" style={{ background: previewGradient }}>
                {form.widget_icon_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.widget_icon_url} alt="Widget icon preview" className="h-full w-full rounded-2xl object-cover" />
                ) : (
                  form.name.slice(0, 2).toUpperCase() || "LA"
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-white">{form.name || (form.business_name ? `${form.business_name} Support` : "Support Agent")}</p>
                <p className="truncate text-xs font-bold text-zinc-500">{form.business_name || "Business name"}</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              <div className="max-w-[85%] rounded-2xl bg-white/[0.06] px-4 py-3 text-xs font-semibold leading-5 text-zinc-300">
                {form.welcome_message || SUPPORT_AGENT_DEFAULTS.welcome_message}
              </div>
              <div className="ml-auto max-w-[78%] rounded-2xl px-4 py-3 text-xs font-black text-white" style={{ background: previewGradient }}>
                I need help with an order.
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Widget</span>
              <MessageSquare className="h-4 w-4 text-cyan-200" />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">{label}</span>
      {children}
    </label>
  );
}
