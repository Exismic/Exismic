"use client";

import React, { useState } from "react";
import { Check, Copy, ArrowUp } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface ChatMarkdownRendererProps {
  content: string;
}

// 1. Inline content renderer: handles links, images, bold, italic, code, and inline HTML
export function renderInline(text: string): React.ReactNode {
  if (!text) return null;

  // If text contains HTML tags like <ul>, <ol>, <li>, parse them into real elements
  if (/<(ul|ol|li|br|strong|b|em|i|code)[^>]*>/i.test(text)) {
    // Check if it's an HTML list block
    const listMatch = text.match(/<(ul|ol)[^>]*>([\s\S]*?)<\/(ul|ol)>/i);
    if (listMatch) {
      const isOrdered = listMatch[1].toLowerCase() === "ol";
      const innerHtml = listMatch[2];
      const liMatches = [...innerHtml.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)];
      const items = liMatches.map((m) => m[1].trim());

      const prefix = text.slice(0, listMatch.index).trim();
      const suffix = text.slice((listMatch.index || 0) + listMatch[0].length).trim();

      return (
        <span className="inline-block w-full">
          {prefix && <span className="block mb-2">{renderInline(prefix)}</span>}
          <span className="my-2 block space-y-1.5 pl-2">
            {items.map((item, idx) => (
              <span key={idx} className="flex items-start gap-2.5">
                {isOrdered ? (
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-purple-500/20 border border-purple-400/30 text-[9.5px] font-mono font-bold text-purple-200 mt-1">
                    {idx + 1}
                  </span>
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] mt-2 shrink-0" />
                )}
                <span className="flex-1 text-zinc-300 leading-relaxed text-[13.5px]">
                  {renderInline(item)}
                </span>
              </span>
            ))}
          </span>
          {suffix && <span className="block mt-2">{renderInline(suffix)}</span>}
        </span>
      );
    }
  }

  // Tokenize standard markdown & remaining HTML tags
  const tokens = text.split(
    /(!\[.*?\]\(.*?\))|(\[.*?\]\s*\(.*?\))|(\*\*\*[\s\S]*?\*\*\*)|(\*\*[\s\S]*?\*\*)|(\*[\s\S]*?\*)|(__[\s\S]*?__)|(_[\s\S]*?_)|(~~[\s\S]*?~~)|(`[\s\S]*?`)|(<br\s*\/?>)|(<\/?(strong|b|em|i|code)[^>]*>)/gi
  );

  return tokens.map((token, ti) => {
    if (!token) return null;

    // Image: ![alt](url)
    if (token.startsWith("![") && token.includes("](") && token.endsWith(")")) {
      const match = token.match(/!\[(.*?)\]\((.*?)\)/);
      if (match) {
        const alt = match[1];
        const url = match[2];
        return (
          <span key={ti} className="my-4 block max-w-full">
            <img
              src={url}
              alt={alt}
              className="rounded-2xl border border-white/10 shadow-2xl max-w-full h-auto object-cover hover:scale-[1.01] transition-transform duration-300"
            />
          </span>
        );
      }
    }

    // Link: [text](url)
    if (token.startsWith("[") && token.includes("](") && token.endsWith(")")) {
      const match = token.match(/\[(.*?)\]\s*\((.*?)\)/);
      if (match) {
        const linkText = match[1];
        const url = match[2];
        return (
          <a
            key={ti}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-300 hover:text-cyan-200 underline underline-offset-4 decoration-cyan-400/40 hover:decoration-cyan-300 transition-colors font-bold inline-flex items-center gap-0.5"
          >
            <span>{linkText}</span>
            <ArrowUp className="rotate-45 shrink-0" size={10} />
          </a>
        );
      }
    }

    // Bold-Italic: ***text***
    if (token.startsWith("***") && token.endsWith("***") && token.length > 6) {
      return (
        <strong key={ti} className="text-white font-bold italic tracking-tight">
          {token.slice(3, -3)}
        </strong>
      );
    }

    // Bold: **text** or __text__
    if (
      (token.startsWith("**") && token.endsWith("**") && token.length > 4) ||
      (token.startsWith("__") && token.endsWith("__") && token.length > 4)
    ) {
      return (
        <strong key={ti} className="text-white font-bold tracking-tight">
          {token.slice(2, -2)}
        </strong>
      );
    }

    // Italic: *text* or _text_
    if (
      (token.startsWith("*") && token.endsWith("*") && token.length > 2) ||
      (token.startsWith("_") && token.endsWith("_") && token.length > 2)
    ) {
      return (
        <em key={ti} className="text-zinc-200 italic">
          {token.slice(1, -1)}
        </em>
      );
    }

    // Strikethrough: ~~text~~
    if (token.startsWith("~~") && token.endsWith("~~") && token.length > 4) {
      return (
        <del key={ti} className="text-zinc-500 line-through">
          {token.slice(2, -2)}
        </del>
      );
    }

    // Inline Code: `code`
    if (token.startsWith("`") && token.endsWith("`") && token.length > 2) {
      return (
        <code
          key={ti}
          className="bg-white/10 text-cyan-300 px-1.5 py-0.5 rounded-md font-mono text-[13px] border border-white/5 font-semibold"
        >
          {token.slice(1, -1)}
        </code>
      );
    }

    // HTML <br>
    if (/<br\s*\/?>/i.test(token)) {
      return <br key={ti} />;
    }

    // Clean stray HTML tags
    if (/^<\/?(strong|b|em|i|code)[^>]*>$/i.test(token)) {
      return null;
    }

    return token;
  });
}

// 2. Syntax-highlighted Code Block Component
function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-5 rounded-2xl overflow-hidden border border-white/10 bg-[#09090e] shadow-2xl">
      <div className="px-4 py-2.5 bg-[#12121a] border-b border-white/5 flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            {lang || "code"}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="text-zinc-400 hover:text-white transition-colors px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-[10px] font-bold bg-white/5 hover:bg-white/10 active:scale-95 cursor-pointer"
        >
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <SyntaxHighlighter
        language={lang || "text"}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: "1.25rem",
          background: "transparent",
          fontSize: "13.5px",
          lineHeight: "1.65",
          fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        }}
      >
        {code.trim()}
      </SyntaxHighlighter>
    </div>
  );
}

// 3. Markdown Table Component
function TableBlock({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="my-6 overflow-hidden rounded-2xl border border-white/10 bg-[#0a0c16]/90 shadow-[0_15px_45px_rgba(0,0,0,0.5)] backdrop-blur-xl">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-white/[0.06] via-cyan-500/[0.06] to-purple-500/[0.06] border-b border-white/10 text-cyan-200">
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="px-5 py-3.5 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-200 whitespace-nowrap"
                >
                  {renderInline(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {rows.map((row, rIdx) => (
              <tr
                key={rIdx}
                className="transition-colors hover:bg-white/[0.025] even:bg-white/[0.01]"
              >
                {row.map((cell, cIdx) => (
                  <td
                    key={cIdx}
                    className="px-5 py-3.5 text-zinc-300 font-medium align-top leading-relaxed text-[13px]"
                  >
                    {renderInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 4. Main Markdown Parser and Renderer
export function ChatMarkdownRenderer({ content }: ChatMarkdownRendererProps) {
  if (!content) return null;

  // Split code blocks first
  const segments = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-4 text-zinc-200 leading-[1.75] font-normal break-words">
      {segments.map((seg, sIdx) => {
        // Code Block
        if (seg.startsWith("```")) {
          const match = seg.match(/```([\w-]*)\n?([\s\S]*?)```/);
          const lang = match ? match[1] || "text" : "text";
          const code = match ? match[2] : seg.replace(/```/g, "");
          return <CodeBlock key={sIdx} lang={lang} code={code} />;
        }

        // Parse line blocks for tables, headings, lists, blockquotes, paragraphs
        const lines = seg.split("\n");
        const elements: React.ReactNode[] = [];
        let i = 0;

        while (i < lines.length) {
          const rawLine = lines[i];
          const trimmed = rawLine.trim();

          // Blank line
          if (!trimmed) {
            i++;
            continue;
          }

          // Table detection: consecutive lines starting with '|' and containing separator
          if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
            const tableLines: string[] = [];
            while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
              tableLines.push(lines[i].trim());
              i++;
            }

            if (tableLines.length >= 2 && tableLines[1].includes("-")) {
              const parseRow = (line: string) => {
                let s = line;
                if (s.startsWith("|")) s = s.slice(1);
                if (s.endsWith("|")) s = s.slice(0, -1);
                return s.split("|").map((c) => c.trim());
              };

              const headers = parseRow(tableLines[0]);
              const rows = tableLines.slice(2).map(parseRow);
              elements.push(<TableBlock key={`table-${i}`} headers={headers} rows={rows} />);
              continue;
            } else {
              tableLines.forEach((tl, tlIdx) => {
                elements.push(
                  <p key={`tline-${i}-${tlIdx}`} className="leading-relaxed">
                    {renderInline(tl)}
                  </p>
                );
              });
              continue;
            }
          }

          // Headings: #, ##, ###, ####, #####, ######
          const headingMatch = rawLine.match(/^(#{1,6})\s+(.*)$/);
          if (headingMatch) {
            const level = headingMatch[1].length;
            const headingText = headingMatch[2];

            if (level === 1) {
              elements.push(
                <h1
                  key={`h-${i}`}
                  className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-7 mb-3 leading-snug pt-1"
                >
                  {renderInline(headingText)}
                </h1>
              );
            } else if (level === 2) {
              elements.push(
                <h2
                  key={`h-${i}`}
                  className="text-xl sm:text-2xl font-black text-white tracking-tight mt-6 mb-3 leading-snug pt-1"
                >
                  {renderInline(headingText)}
                </h2>
              );
            } else if (level === 3) {
              elements.push(
                <h3
                  key={`h-${i}`}
                  className="text-lg sm:text-xl font-bold text-white tracking-tight mt-5 mb-2 leading-snug pt-1"
                >
                  {renderInline(headingText)}
                </h3>
              );
            } else {
              elements.push(
                <h4
                  key={`h-${i}`}
                  className="text-base sm:text-lg font-bold text-white mt-4 mb-2 leading-snug pt-1"
                >
                  {renderInline(headingText)}
                </h4>
              );
            }
            i++;
            continue;
          }

          // Horizontal rule: --- or === or ***
          if (/^\s*([*\-_]){3,}\s*$/.test(trimmed)) {
            elements.push(
              <div
                key={`hr-${i}`}
                className="my-6 h-px w-full bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"
              />
            );
            i++;
            continue;
          }

          // Blockquote: > quote
          if (trimmed.startsWith(">")) {
            const quoteLines: string[] = [];
            while (i < lines.length && lines[i].trim().startsWith(">")) {
              quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
              i++;
            }
            elements.push(
              <div
                key={`quote-${i}`}
                className="my-3 border-l-2 border-cyan-400/70 bg-cyan-500/[0.04] px-4 py-2.5 rounded-r-xl text-zinc-200 italic text-[14px]"
              >
                {renderInline(quoteLines.join(" "))}
              </div>
            );
            continue;
          }

          // Numbered List: 1. Item
          if (/^\s*\d+\.\s+/.test(rawLine)) {
            const listItems: { num: string; text: string }[] = [];
            while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
              const m = lines[i].match(/^\s*(\d+)\.\s+(.*)$/);
              if (m) {
                listItems.push({ num: m[1], text: m[2] });
              }
              i++;
            }
            elements.push(
              <div key={`nlist-${i}`} className="space-y-2.5 my-3 pl-1">
                {listItems.map((item, lIdx) => (
                  <div key={lIdx} className="flex items-start gap-3 group/item">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-purple-500/20 border border-purple-400/30 text-[10.5px] font-mono font-bold text-purple-200 mt-0.5">
                      {item.num}
                    </span>
                    <div className="flex-1 text-zinc-200 leading-relaxed text-[14.5px]">
                      {renderInline(item.text)}
                    </div>
                  </div>
                ))}
              </div>
            );
            continue;
          }

          // Bullet List: - Item or * Item or • Item
          if (/^\s*([*\-•])\s+/.test(rawLine)) {
            const listItems: string[] = [];
            while (i < lines.length && /^\s*([*\-•])\s+/.test(lines[i])) {
              const m = lines[i].match(/^\s*([*\-•])\s+(.*)$/);
              if (m) {
                listItems.push(m[2]);
              }
              i++;
            }
            elements.push(
              <div key={`blist-${i}`} className="space-y-2 my-3 pl-1">
                {listItems.map((item, lIdx) => (
                  <div key={lIdx} className="flex items-start gap-3 group/item">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] mt-2.5 shrink-0 group-hover/item:scale-125 transition-transform" />
                    <div className="flex-1 text-zinc-200 leading-relaxed text-[14.5px]">
                      {renderInline(item)}
                    </div>
                  </div>
                ))}
              </div>
            );
            continue;
          }

          // Standard Paragraph
          const paraLines: string[] = [];
          while (
            i < lines.length &&
            lines[i].trim() &&
            !lines[i].trim().startsWith("|") &&
            !lines[i].trim().startsWith("#") &&
            !lines[i].trim().startsWith(">") &&
            !/^\s*\d+\.\s+/.test(lines[i]) &&
            !/^\s*([*\-•])\s+/.test(lines[i]) &&
            !/^\s*([*\-_]){3,}\s*$/.test(lines[i])
          ) {
            paraLines.push(lines[i]);
            i++;
          }

          if (paraLines.length > 0) {
            elements.push(
              <p key={`p-${i}`} className="text-zinc-200 leading-relaxed text-[14.5px] sm:text-[15px]">
                {renderInline(paraLines.join(" "))}
              </p>
            );
          }
        }

        return <React.Fragment key={sIdx}>{elements}</React.Fragment>;
      })}
    </div>
  );
}
