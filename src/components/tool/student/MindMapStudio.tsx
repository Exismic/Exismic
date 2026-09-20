"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Network,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Download,
  Copy,
  Check,
  Plus,
  Minus,
  Trash2,
  Edit3,
  Palette,
  FileText,
  FileDown,
  LayoutGrid,
  Layers,
  Eye,
  Share2,
  ChevronRight,
  ChevronDown,
  Sliders,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Move,
  CheckCircle2,
  FolderTree,
  FileCode,
  AlignLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaPipelineBar } from "@/components/tool/MediaPipelineBar";

// ============================================================================
// DATA TYPES & INTERFACES
// ============================================================================

export interface MindMapNode {
  id: string;
  text: string;
  children: MindMapNode[];
  collapsed?: boolean;
  color?: string; // Custom accent color
}

export type LayoutMode = "radial" | "horizontal" | "vertical";
export type LineStyle = "curve" | "step" | "straight";
export type ThemeId = "obsidian-cyber" | "synthwave" | "emerald-aurora" | "tokyo-twilight" | "clean-studio";

interface ThemeConfig {
  id: ThemeId;
  name: string;
  badge: string;
  bgClass: string;
  canvasBg: string;
  gridColor: string;
  textColor: string;
  nodeBg: string;
  nodeBorder: string;
  lineGlow: string;
  accentColors: string[];
}

const THEMES: Record<ThemeId, ThemeConfig> = {
  "obsidian-cyber": {
    id: "obsidian-cyber",
    name: "Obsidian Cyber",
    badge: "SIGNATURE",
    bgClass: "from-[#080914] via-[#05060b] to-[#020306]",
    canvasBg: "#070913",
    gridColor: "rgba(99, 102, 241, 0.07)",
    textColor: "#f1f5f9",
    nodeBg: "rgba(15, 23, 42, 0.85)",
    nodeBorder: "rgba(99, 102, 241, 0.35)",
    lineGlow: "rgba(99, 102, 241, 0.5)",
    accentColors: [
      "#06b6d4", // Cyan
      "#8b5cf6", // Purple
      "#10b981", // Emerald
      "#f59e0b", // Amber
      "#ec4899", // Pink
      "#3b82f6", // Blue
      "#14b8a6", // Teal
      "#f97316", // Orange
    ],
  },
  "synthwave": {
    id: "synthwave",
    name: "Synthwave Sunset",
    badge: "VIBRANT",
    bgClass: "from-[#130722] via-[#0d0417] to-[#05020a]",
    canvasBg: "#0f051d",
    gridColor: "rgba(236, 72, 153, 0.08)",
    textColor: "#fdf4ff",
    nodeBg: "rgba(35, 14, 58, 0.85)",
    nodeBorder: "rgba(236, 72, 153, 0.4)",
    lineGlow: "rgba(236, 72, 153, 0.6)",
    accentColors: [
      "#ec4899", // Neon Pink
      "#06b6d4", // Cyan
      "#fbbf24", // Gold
      "#a855f7", // Violet
      "#f43f5e", // Rose
      "#38bdf8", // Sky
      "#34d399", // Mint
      "#fb923c", // Sunset Orange
    ],
  },
  "emerald-aurora": {
    id: "emerald-aurora",
    name: "Emerald Aurora",
    badge: "ORGANIC",
    bgClass: "from-[#05140d] via-[#030d08] to-[#010604]",
    canvasBg: "#06130d",
    gridColor: "rgba(16, 185, 129, 0.08)",
    textColor: "#ecfdf5",
    nodeBg: "rgba(6, 32, 20, 0.85)",
    nodeBorder: "rgba(16, 185, 129, 0.35)",
    lineGlow: "rgba(16, 185, 129, 0.5)",
    accentColors: [
      "#10b981", // Emerald
      "#14b8a6", // Teal
      "#84cc16", // Lime
      "#06b6d4", // Cyan
      "#eab308", // Yellow
      "#22c55e", // Green
      "#38bdf8", // Sky
      "#a3e635", // Light Lime
    ],
  },
  "tokyo-twilight": {
    id: "tokyo-twilight",
    name: "Tokyo Twilight",
    badge: "POPULAR",
    bgClass: "from-[#0b0d1e] via-[#070814] to-[#03040a]",
    canvasBg: "#090c1c",
    gridColor: "rgba(129, 140, 248, 0.08)",
    textColor: "#e0e7ff",
    nodeBg: "rgba(19, 24, 52, 0.85)",
    nodeBorder: "rgba(129, 140, 248, 0.35)",
    lineGlow: "rgba(129, 140, 248, 0.5)",
    accentColors: [
      "#6366f1", // Indigo
      "#a855f7", // Purple
      "#38bdf8", // Sky
      "#ec4899", // Pink
      "#10b981", // Emerald
      "#f43f5e", // Crimson
      "#8b5cf6", // Violet
      "#06b6d4", // Cyan
    ],
  },
  "clean-studio": {
    id: "clean-studio",
    name: "Clean Whiteboard",
    badge: "MINIMAL",
    bgClass: "from-slate-100 via-slate-50 to-white",
    canvasBg: "#f8fafc",
    gridColor: "rgba(100, 116, 139, 0.12)",
    textColor: "#0f172a",
    nodeBg: "rgba(255, 255, 255, 0.95)",
    nodeBorder: "rgba(203, 213, 225, 0.9)",
    lineGlow: "rgba(100, 116, 139, 0.2)",
    accentColors: [
      "#2563eb", // Royal Blue
      "#7c3aed", // Deep Purple
      "#059669", // Deep Emerald
      "#d97706", // Deep Amber
      "#db2777", // Deep Rose
      "#0284c7", // Deep Sky
      "#0d9488", // Deep Teal
      "#ea580c", // Deep Orange
    ],
  },
};

// ============================================================================
// BUILT-IN TEMPLATES / PRESETS (Academic & Creator Focused)
// ============================================================================

interface MindMapPreset {
  id: string;
  name: string;
  category: string;
  description: string;
  outlineText: string;
}

const PRESETS: MindMapPreset[] = [
  {
    id: "web-dev-roadmap",
    name: "Full-Stack Web Roadmap",
    category: "Computer Science",
    description: "Frontend, Backend, Databases, and Modern Cloud DevOps",
    outlineText: `# Full-Stack Web Development
- Frontend Essentials
  - HTML & CSS Architecture
    - Flexbox & Grid Systems
    - Responsive Mobile Design
  - Modern JavaScript
    - ES6+ Syntax & Modules
    - Async / Await & Promises
  - Modern Frameworks
    - React & Component State
    - Next.js & Server Actions
    - Tailwind CSS Styling
- Backend Engineering
  - Runtime & Languages
    - Node.js & TypeScript
    - Python & FastAPI
  - API Architecture
    - RESTful Endpoints
    - GraphQL Queries
    - WebSockets & Streaming
  - Security & Auth
    - JWT & Session Cookies
    - OAuth2 Providers
- Data & Storage
  - Relational Databases
    - PostgreSQL & Indexing
    - Prisma ORM
  - In-Memory Caching
    - Redis Key-Value
    - Session Storage
  - Blob & Cloud Storage
    - S3 & Supabase Storage
- DevOps & Cloud
  - CI / CD Pipelines
    - GitHub Actions
  - Containerization
    - Docker Images
  - Serverless Hosting
    - Vercel & Cloudflare`,
  },
  {
    id: "human-nervous-system",
    name: "Human Nervous System",
    category: "Biology & Health",
    description: "Central, Peripheral, Autonomic, and Somatic divisions",
    outlineText: `# Human Nervous System
- Central Nervous System (CNS)
  - Brain Structures
    - Cerebrum (Higher Thought)
      - Frontal Lobe (Decisions)
      - Parietal Lobe (Sensory)
      - Occipital Lobe (Vision)
      - Temporal Lobe (Memory)
    - Cerebellum (Coordination)
    - Brainstem (Vital Controls)
  - Spinal Cord
    - Reflex Arcs
    - Neural Conduits
- Peripheral Nervous System (PNS)
  - Somatic Nervous System
    - Sensory Afferent Neurons
    - Motor Efferent Neurons
  - Autonomic Nervous System
    - Sympathetic (Fight or Flight)
      - Elevated Heart Rate
      - Pupil Dilation
    - Parasympathetic (Rest & Digest)
      - Stimulated Digestion
      - Decreased Heart Rate
- Cellular Components
  - Neurons
    - Dendrites (Input)
    - Axon & Myelin Sheath
    - Synaptic Terminals
  - Glial Cells
    - Astrocytes (Nutritional)
    - Microglia (Immune Defense)`,
  },
  {
    id: "product-launch-strategy",
    name: "Product Launch Strategy",
    category: "Business & Growth",
    description: "Pre-launch preparation, launch day execution, and post-launch loops",
    outlineText: `# Product Launch Strategy
- Phase 1: Pre-Launch
  - Audience Research
    - Customer Interviews
    - Competitor Teardowns
  - Teaser Campaign
    - Waitlist Landing Page
    - Sneak Peek Twitter Clips
  - VIP Beta Group
    - Private Discord Alpha
    - Bug Bounties & Polish
- Phase 2: Launch Day
  - Platform Showcases
    - Product Hunt Featured Hunt
    - Hacker News Show HN
    - Reddit Niche Communities
  - Founder Storytelling
    - Behind the Scenes Thread
    - Launch Video Demo
  - Email Broadcast
    - Waitlist Early Bird Code
- Phase 3: Post-Launch Growth
  - Viral Referral Loops
    - Invite Friends For Credits
    - Shareable Badges & Milestones
  - Analytics & Retention
    - Day-1 & Day-7 Churn Rates
    - Session Recordings
  - Customer Feedback
    - Feature Request Board
    - Rapid Weekly Updates`,
  },
  {
    id: "industrial-revolution",
    name: "The Industrial Revolution",
    category: "History & Society",
    description: "Causes, technological inventions, and worldwide social transformation",
    outlineText: `# The Industrial Revolution
- Primary Causes
  - Agricultural Revolution
    - Increased Food Supply
    - Enclosure Acts
  - Natural Resources
    - Abundant British Coal
    - Iron Ore Deposits
  - Financial Capital
    - Bank of England Stability
    - Global Trading Networks
- Breakthrough Inventions
  - Steam & Mechanical Power
    - James Watt Steam Engine
  - Textile Mechanization
    - Spinning Jenny
    - Power Loom
  - Transportation
    - Steam Locomotives
    - Canal Networks
- Societal Consequences
  - Rapid Urbanization
    - Population Shift to Cities
    - Tenement Housing
  - Labor Transformation
    - Factory Clock Schedules
    - Rise of Trade Unions
  - Economic Shifts
    - Rise of Industrial Capitalism
    - Expanding Middle Class`,
  },
];

// ============================================================================
// OUTLINE PARSER & GENERATOR ENGINE
// ============================================================================

/**
 * Parses markdown headers, bullet points (- * + •), numbered lists,
 * and indented text into a hierarchical tree.
 */
function parseOutlineToTree(rawText: string): MindMapNode {
  const lines = rawText.split("\n").filter((l) => l.trim().length > 0);

  if (lines.length === 0) {
    return {
      id: "root-empty",
      text: "Central Idea",
      children: [],
    };
  }

  interface StackItem {
    level: number;
    node: MindMapNode;
  }

  const rootNodes: MindMapNode[] = [];
  const stack: StackItem[] = [];

  let nodeCounter = 0;

  lines.forEach((line) => {
    // 1. Calculate indent level
    let level = 0;
    let cleanLine = line;

    // Check for markdown headers (# Title, ## Branch, ### Sub-branch)
    const headerMatch = cleanLine.match(/^(#{1,6})\s+(.*)$/);
    if (headerMatch) {
      level = headerMatch[1].length - 1;
      cleanLine = headerMatch[2];
    } else {
      // Indent based on spaces or tabs
      const indentMatch = cleanLine.match(/^([ \t]+)/);
      if (indentMatch) {
        const spaces = indentMatch[1].replace(/\t/g, "  ").length;
        level = Math.floor(spaces / 2);
      }
      // Strip leading bullets (-, *, +, •, 1., 1), etc.)
      cleanLine = cleanLine.trim().replace(/^([*\-+•]|\d+[.)])\s*/, "");
    }

    cleanLine = cleanLine.trim();
    if (!cleanLine) return;

    nodeCounter++;
    const newNode: MindMapNode = {
      id: `node-${Date.now()}-${nodeCounter}`,
      text: cleanLine,
      children: [],
    };

    if (stack.length === 0) {
      stack.push({ level, node: newNode });
      rootNodes.push(newNode);
      return;
    }

    // Pop stack until we find the parent (level < current level)
    while (stack.length > 0 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }

    if (stack.length > 0) {
      stack[stack.length - 1].node.children.push(newNode);
      stack.push({ level, node: newNode });
    } else {
      rootNodes.push(newNode);
      stack.push({ level, node: newNode });
    }
  });

  // If multiple top-level nodes were found, wrap them under a unified root
  if (rootNodes.length === 1) {
    return rootNodes[0];
  } else {
    return {
      id: `root-${Date.now()}`,
      text: "Central Topic",
      children: rootNodes,
    };
  }
}

/**
 * Converts hierarchical tree back into clean Markdown outline with indented bullets.
 */
function treeToMarkdownOutline(node: MindMapNode, depth: number = 0): string {
  const indent = "  ".repeat(depth);
  const bullet = depth === 0 ? `# ${node.text}` : `${indent}- ${node.text}`;

  let result = bullet + "\n";
  if (node.children && node.children.length > 0) {
    node.children.forEach((child) => {
      result += treeToMarkdownOutline(child, depth === 0 ? 1 : depth + 1);
    });
  }
  return result;
}

// ============================================================================
// TREE LAYOUT COMPUTATION ENGINES
// ============================================================================

export interface PositionedNode {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  depth: number;
  color: string;
  hasChildren: boolean;
  isCollapsed: boolean;
  childrenCount: number;
  parentId: string | null;
  side?: "left" | "right";
  rawNode: MindMapNode;
}

export interface PositionedEdge {
  id: string;
  fromId: string;
  toId: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  side?: "left" | "right";
}

// Node dimensions (generously sized so topic titles never truncate)
const NODE_WIDTH = 225;
const NODE_HEIGHT = 52;
const ROOT_WIDTH = 240;
const ROOT_HEIGHT = 60;

// Gap settings
const HORIZONTAL_GAP = 95;
const VERTICAL_GAP = 22;

/**
 * Recursively computes layout coordinates based on mode.
 */
function computeTreeLayout(
  root: MindMapNode,
  mode: LayoutMode,
  theme: ThemeConfig
): { nodes: PositionedNode[]; edges: PositionedEdge[]; boundingBox: { minX: number; maxX: number; minY: number; maxY: number } } {
  const nodes: PositionedNode[] = [];
  const edges: PositionedEdge[] = [];

  // Helper to get total height of a subtree
  function getSubtreeHeight(node: MindMapNode): number {
    if (!node.children || node.children.length === 0 || node.collapsed) {
      return NODE_HEIGHT + VERTICAL_GAP;
    }
    let total = 0;
    node.children.forEach((child) => {
      total += getSubtreeHeight(child);
    });
    return Math.max(NODE_HEIGHT + VERTICAL_GAP, total);
  }

  // Helper to count visible descendants
  function countAllDescendants(node: MindMapNode): number {
    if (!node.children) return 0;
    let count = node.children.length;
    node.children.forEach((c) => {
      count += countAllDescendants(c);
    });
    return count;
  }

  // --------------------------------------------------------------------------
  // 1. HORIZONTAL TREE (Left to Right)
  // --------------------------------------------------------------------------
  if (mode === "horizontal") {
    let currentY = 0;

    function layoutHorizontalBranch(
      node: MindMapNode,
      depth: number,
      parentId: string | null,
      parentColor: string
    ): PositionedNode {
      const isRoot = depth === 0;
      const w = isRoot ? ROOT_WIDTH : NODE_WIDTH;
      const h = isRoot ? ROOT_HEIGHT : NODE_HEIGHT;
      const color = node.color || (isRoot ? theme.accentColors[0] : parentColor);

      const isCollapsed = Boolean(node.collapsed);
      const hasChildren = Boolean(node.children && node.children.length > 0);
      const childrenCount = hasChildren ? countAllDescendants(node) : 0;

      let nodeY: number;

      if (!hasChildren || isCollapsed) {
        nodeY = currentY + h / 2;
        currentY += h + VERTICAL_GAP;
      } else {
        // Layout children first to compute centered Y
        const childPositions: PositionedNode[] = [];
        node.children.forEach((child, index) => {
          const childColor = isRoot
            ? theme.accentColors[index % theme.accentColors.length]
            : color;
          const pos = layoutHorizontalBranch(child, depth + 1, node.id, childColor);
          childPositions.push(pos);
        });

        // Center parent between first and last child
        const firstY = childPositions[0].y;
        const lastY = childPositions[childPositions.length - 1].y;
        nodeY = (firstY + lastY) / 2;

        // Add edges
        childPositions.forEach((cp) => {
          edges.push({
            id: `edge-${node.id}-${cp.id}`,
            fromId: node.id,
            toId: cp.id,
            x1: depth * (NODE_WIDTH + HORIZONTAL_GAP) + w,
            y1: nodeY,
            x2: (depth + 1) * (NODE_WIDTH + HORIZONTAL_GAP),
            y2: cp.y,
            color: cp.color,
          });
        });
      }

      const positioned: PositionedNode = {
        id: node.id,
        text: node.text,
        x: depth * (NODE_WIDTH + HORIZONTAL_GAP),
        y: nodeY,
        width: w,
        height: h,
        depth,
        color,
        hasChildren,
        isCollapsed,
        childrenCount,
        parentId,
        rawNode: node,
      };

      nodes.push(positioned);
      return positioned;
    }

    layoutHorizontalBranch(root, 0, null, theme.accentColors[0]);
  }

  // --------------------------------------------------------------------------
  // 2. RADIAL / BALANCED MIND MAP (Center out to Left & Right)
  // --------------------------------------------------------------------------
  else if (mode === "radial") {
    // Root at (0, 0)
    const rootPos: PositionedNode = {
      id: root.id,
      text: root.text,
      x: 0,
      y: 0,
      width: ROOT_WIDTH,
      height: ROOT_HEIGHT,
      depth: 0,
      color: theme.accentColors[0],
      hasChildren: Boolean(root.children && root.children.length > 0),
      isCollapsed: Boolean(root.collapsed),
      childrenCount: countAllDescendants(root),
      parentId: null,
      rawNode: root,
    };
    nodes.push(rootPos);

    if (root.children && root.children.length > 0 && !root.collapsed) {
      // Split children into Right side and Left side
      const half = Math.ceil(root.children.length / 2);
      const rightChildren = root.children.slice(0, half);
      const leftChildren = root.children.slice(half);

      // Helper to layout one side
      function layoutSide(
        branchChildren: MindMapNode[],
        side: "left" | "right",
        colorStartIndex: number
      ) {
        let sideCurrentY = -(branchChildren.reduce((sum, c) => sum + getSubtreeHeight(c), 0) / 2);

        function layoutRadialNode(
          node: MindMapNode,
          depth: number,
          parentId: string,
          parentColor: string
        ): PositionedNode {
          const w = NODE_WIDTH;
          const h = NODE_HEIGHT;
          const color = node.color || parentColor;
          const isCollapsed = Boolean(node.collapsed);
          const hasChildren = Boolean(node.children && node.children.length > 0);
          const childrenCount = hasChildren ? countAllDescendants(node) : 0;

          const dir = side === "right" ? 1 : -1;
          const nodeX = dir * (ROOT_WIDTH / 2 + HORIZONTAL_GAP + (depth - 1) * (NODE_WIDTH + HORIZONTAL_GAP));

          let nodeY: number;

          if (!hasChildren || isCollapsed) {
            nodeY = sideCurrentY + h / 2;
            sideCurrentY += h + VERTICAL_GAP;
          } else {
            const childPositions: PositionedNode[] = [];
            node.children.forEach((child) => {
              const pos = layoutRadialNode(child, depth + 1, node.id, color);
              childPositions.push(pos);
            });

            const firstY = childPositions[0].y;
            const lastY = childPositions[childPositions.length - 1].y;
            nodeY = (firstY + lastY) / 2;

            // Edges from this node to its children
            childPositions.forEach((cp) => {
              edges.push({
                id: `edge-${node.id}-${cp.id}`,
                fromId: node.id,
                toId: cp.id,
                x1: side === "right" ? nodeX + w : nodeX,
                y1: nodeY,
                x2: side === "right" ? cp.x : cp.x + w,
                y2: cp.y,
                color: cp.color,
                side,
              });
            });
          }

          const positioned: PositionedNode = {
            id: node.id,
            text: node.text,
            x: side === "right" ? nodeX : nodeX - w,
            y: nodeY,
            width: w,
            height: h,
            depth,
            color,
            hasChildren,
            isCollapsed,
            childrenCount,
            parentId,
            side,
            rawNode: node,
          };

          nodes.push(positioned);
          return positioned;
        }

        branchChildren.forEach((child, idx) => {
          const branchColor =
            theme.accentColors[(colorStartIndex + idx) % theme.accentColors.length];
          const pos = layoutRadialNode(child, 1, root.id, branchColor);

          // Connect from Root to this level 1 node
          edges.push({
            id: `edge-${root.id}-${pos.id}`,
            fromId: root.id,
            toId: pos.id,
            x1: side === "right" ? ROOT_WIDTH / 2 : -ROOT_WIDTH / 2,
            y1: 0,
            x2: side === "right" ? pos.x : pos.x + pos.width,
            y2: pos.y,
            color: pos.color,
            side,
          });
        });
      }

      layoutSide(rightChildren, "right", 0);
      layoutSide(leftChildren, "left", rightChildren.length);
    }
  }

  // --------------------------------------------------------------------------
  // 3. VERTICAL HIERARCHY (Top to Bottom)
  // --------------------------------------------------------------------------
  else if (mode === "vertical") {
    let currentX = 0;

    function getSubtreeWidth(node: MindMapNode): number {
      if (!node.children || node.children.length === 0 || node.collapsed) {
        return NODE_WIDTH + 40;
      }
      let total = 0;
      node.children.forEach((child) => {
        total += getSubtreeWidth(child);
      });
      return Math.max(NODE_WIDTH + 40, total);
    }

    function layoutVerticalBranch(
      node: MindMapNode,
      depth: number,
      parentId: string | null,
      parentColor: string
    ): PositionedNode {
      const isRoot = depth === 0;
      const w = isRoot ? ROOT_WIDTH : NODE_WIDTH;
      const h = isRoot ? ROOT_HEIGHT : NODE_HEIGHT;
      const color = node.color || (isRoot ? theme.accentColors[0] : parentColor);

      const isCollapsed = Boolean(node.collapsed);
      const hasChildren = Boolean(node.children && node.children.length > 0);
      const childrenCount = hasChildren ? countAllDescendants(node) : 0;

      const nodeY = depth * (NODE_HEIGHT + 100);
      let nodeX: number;

      if (!hasChildren || isCollapsed) {
        nodeX = currentX + w / 2;
        currentX += w + 40;
      } else {
        const childPositions: PositionedNode[] = [];
        node.children.forEach((child, index) => {
          const childColor = isRoot
            ? theme.accentColors[index % theme.accentColors.length]
            : color;
          const pos = layoutVerticalBranch(child, depth + 1, node.id, childColor);
          childPositions.push(pos);
        });

        const firstX = childPositions[0].x;
        const lastX = childPositions[childPositions.length - 1].x;
        nodeX = (firstX + lastX) / 2;

        childPositions.forEach((cp) => {
          edges.push({
            id: `edge-${node.id}-${cp.id}`,
            fromId: node.id,
            toId: cp.id,
            x1: nodeX,
            y1: nodeY + h,
            x2: cp.x,
            y2: cp.y,
            color: cp.color,
          });
        });
      }

      const positioned: PositionedNode = {
        id: node.id,
        text: node.text,
        x: nodeX - w / 2,
        y: nodeY,
        width: w,
        height: h,
        depth,
        color,
        hasChildren,
        isCollapsed,
        childrenCount,
        parentId,
        rawNode: node,
      };

      nodes.push(positioned);
      return positioned;
    }

    layoutVerticalBranch(root, 0, null, theme.accentColors[0]);
  }

  // Compute overall bounding box
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  nodes.forEach((n) => {
    const left = n.x;
    const right = n.x + n.width;
    const top = n.y - n.height / 2;
    const bottom = n.y + n.height / 2;

    if (left < minX) minX = left;
    if (right > maxX) maxX = right;
    if (top < minY) minY = top;
    if (bottom > maxY) maxY = bottom;
  });

  if (nodes.length === 0) {
    minX = 0;
    maxX = 800;
    minY = 0;
    maxY = 600;
  }

  return {
    nodes,
    edges,
    boundingBox: { minX, maxX, minY, maxY },
  };
}

// ============================================================================
// MAIN MIND MAP STUDIO COMPONENT
// ============================================================================

export default function MindMapStudio() {
  // Outline & Tree State
  const [outlineText, setOutlineText] = useState<string>(PRESETS[0].outlineText);
  const [rootNode, setRootNode] = useState<MindMapNode>(() => parseOutlineToTree(PRESETS[0].outlineText));

  // Visual Customization State
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("radial");
  const [lineStyle, setLineStyle] = useState<LineStyle>("curve");
  const [themeId, setThemeId] = useState<ThemeId>("obsidian-cyber");
  const activeTheme = THEMES[themeId];

  // Canvas Viewport Pan & Zoom State
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Selected & Editing Node State
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>("");

  // Mobile navigation tabs
  const [mobileTab, setMobileTab] = useState<"map" | "outline" | "style" | "presets">("map");

  // Export / Pipeline States
  const [isCopyingImage, setIsCopyingImage] = useState<boolean>(false);
  const [isDownloadingPng, setIsDownloadingPng] = useState<boolean>(false);
  const [isDownloadingSvg, setIsDownloadingSvg] = useState<boolean>(false);
  const [copySuccessToast, setCopySuccessToast] = useState<string | null>(null);
  const [exportedImageUrl, setExportedImageUrl] = useState<string | null>(null);

  // DOM Refs
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const exportStageRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Focus input on edit
  useEffect(() => {
    if (editingNodeId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingNodeId]);

  // Compute Layout when tree, layoutMode, or theme changes
  const { nodes, edges, boundingBox } = useMemo(() => {
    return computeTreeLayout(rootNode, layoutMode, activeTheme);
  }, [rootNode, layoutMode, activeTheme]);

  // Fit to screen helper
  const handleFitToScreen = useCallback(() => {
    if (!canvasContainerRef.current) return;
    const containerWidth = canvasContainerRef.current.clientWidth;
    const containerHeight = canvasContainerRef.current.clientHeight;

    const contentWidth = boundingBox.maxX - boundingBox.minX + 160;
    const contentHeight = boundingBox.maxY - boundingBox.minY + 160;

    const scaleX = containerWidth / contentWidth;
    const scaleY = containerHeight / contentHeight;
    const newZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.35), 1.6);

    const centerX = (boundingBox.minX + boundingBox.maxX) / 2;
    const centerY = (boundingBox.minY + boundingBox.maxY) / 2;

    setZoom(newZoom);
    setPan({
      x: containerWidth / 2 - centerX * newZoom,
      y: containerHeight / 2 - centerY * newZoom,
    });
  }, [boundingBox]);

  // Center on mount or when template loads
  useEffect(() => {
    const timer = setTimeout(() => {
      handleFitToScreen();
    }, 150);
    return () => clearTimeout(timer);
  }, [handleFitToScreen]);

  // Pan handlers with mouse & touch
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only pan if clicking canvas background (not inside a node card)
    if ((e.target as HTMLElement).closest("[data-mindmap-node]")) {
      return;
    }
    setIsPanning(true);
    panStartRef.current = {
      x: e.clientX - pan.x,
      y: e.clientY - pan.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPanning) return;
    setPan({
      x: e.clientX - panStartRef.current.x,
      y: e.clientY - panStartRef.current.y,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isPanning) {
      setIsPanning(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Safe ignore
      }
    }
  };

  // Native non-passive wheel zoom handler (stops outer page scrolling and anchors zoom to cursor)
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;

      setZoom((prevZoom) => {
        const nextZoom = Math.min(Math.max(prevZoom * zoomFactor, 0.25), 2.5);
        // Anchor zoom around cursor position
        setPan((prevPan) => ({
          x: mouseX - (mouseX - prevPan.x) * (nextZoom / prevZoom),
          y: mouseY - (mouseY - prevPan.y) * (nextZoom / prevZoom),
        }));
        return nextZoom;
      });
    };

    container.addEventListener("wheel", handleNativeWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleNativeWheel);
    };
  }, []);

  // --------------------------------------------------------------------------
  // TREE MUTATION ACTIONS
  // --------------------------------------------------------------------------

  // Helper to deep clone and modify tree
  const updateTreeNode = useCallback((targetId: string, modifier: (n: MindMapNode) => void) => {
    setRootNode((prev) => {
      const clone: MindMapNode = JSON.parse(JSON.stringify(prev));
      function traverse(n: MindMapNode): boolean {
        if (n.id === targetId) {
          modifier(n);
          return true;
        }
        if (n.children) {
          for (const c of n.children) {
            if (traverse(c)) return true;
          }
        }
        return false;
      }
      traverse(clone);
      setOutlineText(treeToMarkdownOutline(clone));
      return clone;
    });
  }, []);

  // Toggle Collapse
  const handleToggleCollapse = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    updateTreeNode(nodeId, (n) => {
      n.collapsed = !n.collapsed;
    });
  };

  // Add Child Node
  const handleAddChild = (parentId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newId = `node-${Date.now()}`;
    updateTreeNode(parentId, (n) => {
      if (!n.children) n.children = [];
      n.collapsed = false;
      n.children.push({
        id: newId,
        text: "New Topic",
        children: [],
      });
    });
    setSelectedNodeId(newId);
    setEditingNodeId(newId);
    setEditingText("New Topic");
  };

  // Add Sibling Node
  const handleAddSibling = (targetId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (targetId === rootNode.id) {
      // Root cannot have sibling; add child instead
      handleAddChild(targetId);
      return;
    }

    const newId = `node-${Date.now()}`;
    setRootNode((prev) => {
      const clone: MindMapNode = JSON.parse(JSON.stringify(prev));
      function insertSibling(parent: MindMapNode): boolean {
        if (!parent.children) return false;
        const idx = parent.children.findIndex((c) => c.id === targetId);
        if (idx !== -1) {
          parent.children.splice(idx + 1, 0, {
            id: newId,
            text: "New Sibling",
            children: [],
          });
          return true;
        }
        for (const c of parent.children) {
          if (insertSibling(c)) return true;
        }
        return false;
      }
      insertSibling(clone);
      setOutlineText(treeToMarkdownOutline(clone));
      return clone;
    });

    setSelectedNodeId(newId);
    setEditingNodeId(newId);
    setEditingText("New Sibling");
  };

  // Delete Node
  const handleDeleteNode = (nodeId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (nodeId === rootNode.id) {
      alert("Cannot delete the root node.");
      return;
    }

    setRootNode((prev) => {
      const clone: MindMapNode = JSON.parse(JSON.stringify(prev));
      function remove(parent: MindMapNode): boolean {
        if (!parent.children) return false;
        const idx = parent.children.findIndex((c) => c.id === nodeId);
        if (idx !== -1) {
          parent.children.splice(idx, 1);
          return true;
        }
        for (const c of parent.children) {
          if (remove(c)) return true;
        }
        return false;
      }
      remove(clone);
      setOutlineText(treeToMarkdownOutline(clone));
      return clone;
    });

    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
  };

  // Change Node Branch Color
  const handleSetNodeColor = (nodeId: string, color: string) => {
    updateTreeNode(nodeId, (n) => {
      n.color = color;
    });
  };

  // Commit text edit
  const handleCommitEdit = () => {
    if (!editingNodeId) return;
    const trimmed = editingText.trim() || "Untitled Topic";
    updateTreeNode(editingNodeId, (n) => {
      n.text = trimmed;
    });
    setEditingNodeId(null);
  };

  // Handle Outline Textarea Change
  const handleOutlineChange = (newText: string) => {
    setOutlineText(newText);
    const parsed = parseOutlineToTree(newText);
    setRootNode(parsed);
  };

  // Load Preset
  const handleLoadPreset = (preset: MindMapPreset) => {
    setOutlineText(preset.outlineText);
    const parsed = parseOutlineToTree(preset.outlineText);
    setRootNode(parsed);
    setSelectedNodeId(null);
    setEditingNodeId(null);
    setTimeout(() => {
      handleFitToScreen();
    }, 100);
  };

  // --------------------------------------------------------------------------
  // EXPORT ENGINE (100% Client-Side, $0 Server Cost)
  // --------------------------------------------------------------------------

  // 1-Click Copy Picture (PNG to Clipboard)
  const handleCopyPicture = async () => {
    if (!exportStageRef.current || isCopyingImage) return;
    setIsCopyingImage(true);

    try {
      const { toBlob, toPng } = await import("html-to-image");
      const blob = await toBlob(exportStageRef.current, {
        pixelRatio: 2.5,
        cacheBust: true,
        backgroundColor: activeTheme.canvasBg,
      });

      if (blob && navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setCopySuccessToast("Copied picture to clipboard!");
        setTimeout(() => setCopySuccessToast(null), 2500);

        // Also create a data URL for the MediaPipelineBar
        const dataUrl = await toPng(exportStageRef.current, {
          pixelRatio: 1.5,
          backgroundColor: activeTheme.canvasBg,
        });
        setExportedImageUrl(dataUrl);
      } else {
        throw new Error("Clipboard API unsupported");
      }
    } catch {
      // Fallback: trigger download
      handleDownloadPng();
    } finally {
      setIsCopyingImage(false);
    }
  };

  // 1-Click Download High-Res PNG (Retina)
  const handleDownloadPng = async () => {
    if (!exportStageRef.current || isDownloadingPng) return;
    setIsDownloadingPng(true);

    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(exportStageRef.current, {
        pixelRatio: 2.5,
        cacheBust: true,
        backgroundColor: activeTheme.canvasBg,
      });

      setExportedImageUrl(dataUrl);

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `mind-map-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setCopySuccessToast("High-res PNG downloaded!");
      setTimeout(() => setCopySuccessToast(null), 2500);
    } catch {
      alert("Failed to export image. Please try again.");
    } finally {
      setIsDownloadingPng(false);
    }
  };

  // 1-Click Download Scalable Vector SVG
  const handleDownloadSvg = () => {
    if (isDownloadingSvg) return;
    setIsDownloadingSvg(true);

    try {
      // Build pure standalone vector SVG with exact paths and rects
      const padding = 80;
      const svgWidth = boundingBox.maxX - boundingBox.minX + padding * 2;
      const svgHeight = boundingBox.maxY - boundingBox.minY + padding * 2;
      const offsetX = -boundingBox.minX + padding;
      const offsetY = -boundingBox.minY + padding;

      let pathsMarkup = "";
      edges.forEach((edge) => {
        const x1 = edge.x1 + offsetX;
        const y1 = edge.y1 + offsetY;
        const x2 = edge.x2 + offsetX;
        const y2 = edge.y2 + offsetY;

        let d = "";
        if (lineStyle === "curve") {
          const midX = (x1 + x2) / 2;
          d = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
        } else if (lineStyle === "step") {
          const midX = (x1 + x2) / 2;
          d = `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
        } else {
          d = `M ${x1} ${y1} L ${x2} ${y2}`;
        }

        pathsMarkup += `  <path d="${d}" fill="none" stroke="${edge.color}" stroke-width="2.5" stroke-opacity="0.85" stroke-linecap="round"/>\n`;
      });

      let nodesMarkup = "";
      nodes.forEach((n) => {
        const x = n.x + offsetX;
        const y = n.y - n.height / 2 + offsetY;
        const isRoot = n.depth === 0;
        const rx = isRoot ? 16 : 10;
        const fill = isRoot ? "#13172e" : "#0f172a";
        const stroke = n.color || "#6366f1";
        const strokeWidth = isRoot ? 2.5 : 1.5;

        // Escape text for XML
        const escapedText = n.text
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;");

        nodesMarkup += `  <g transform="translate(${x}, ${y})">\n`;
        nodesMarkup += `    <rect width="${n.width}" height="${n.height}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />\n`;
        nodesMarkup += `    <text x="${n.width / 2}" y="${n.height / 2 + 5}" fill="${activeTheme.textColor}" font-family="system-ui, sans-serif" font-size="${isRoot ? 15 : 13}" font-weight="${isRoot ? 700 : 500}" text-anchor="middle">${escapedText}</text>\n`;
        nodesMarkup += `  </g>\n`;
      });

      const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="${svgWidth}" height="${svgHeight}">
  <rect width="100%" height="100%" fill="${activeTheme.canvasBg}"/>
  <g id="edges">
${pathsMarkup}  </g>
  <g id="nodes">
${nodesMarkup}  </g>
  <text x="${svgWidth - 16}" y="${svgHeight - 16}" fill="rgba(255,255,255,0.3)" font-family="sans-serif" font-size="11" text-anchor="end">Created with Exismic Mind Map Studio</text>
</svg>`;

      const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `mind-map-vector-${Date.now()}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setCopySuccessToast("Scalable Vector SVG downloaded!");
      setTimeout(() => setCopySuccessToast(null), 2500);
    } catch {
      alert("Failed to export SVG vector graphic.");
    } finally {
      setIsDownloadingSvg(false);
    }
  };

  // Copy Markdown Outline
  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(outlineText);
    setCopySuccessToast("Markdown outline copied!");
    setTimeout(() => setCopySuccessToast(null), 2500);
  };

  // Helper to render SVG connecting edge path
  const renderEdgePath = (edge: PositionedEdge) => {
    const { x1, y1, x2, y2 } = edge;

    if (lineStyle === "curve") {
      let cx1: number;
      let cx2: number;
      let cy1: number;
      let cy2: number;

      if (layoutMode === "vertical") {
        const midY = (y1 + y2) / 2;
        return `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
      } else {
        const midX = (x1 + x2) / 2;
        cx1 = midX;
        cy1 = y1;
        cx2 = midX;
        cy2 = y2;
        return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
      }
    } else if (lineStyle === "step") {
      if (layoutMode === "vertical") {
        const midY = (y1 + y2) / 2;
        return `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
      } else {
        const midX = (x1 + x2) / 2;
        return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
      }
    } else {
      // Straight line
      return `M ${x1} ${y1} L ${x2} ${y2}`;
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex flex-col gap-6 p-2 sm:p-4 md:p-6 lg:p-8 max-w-[1700px] mx-auto text-slate-100">
      {/* Toast Notification */}
      {copySuccessToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#0a0f1d]/95 border border-emerald-500/40 text-emerald-200 backdrop-blur-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="text-xs sm:text-sm font-medium whitespace-nowrap">{copySuccessToast}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-white/[0.08] rounded-2xl p-4 sm:p-6 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Notes to Mind Map Studio
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                100% Client Private
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-0.5">
              Paste outlines or bullet points &rarr; instantly draw interactive, expandable concept maps with zero server costs.
            </p>
          </div>
        </div>

        {/* Action Export Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={handleCopyPicture}
            disabled={isCopyingImage}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-200 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.1] hover:border-white/[0.2] transition-all shadow-sm active:scale-95"
            title="Copy high-res image directly to system clipboard"
          >
            {isCopyingImage ? (
              <RotateCcw className="w-4 h-4 animate-spin text-indigo-400" />
            ) : (
              <Copy className="w-4 h-4 text-indigo-400" />
            )}
            <span>Copy Picture</span>
          </button>

          <button
            onClick={handleDownloadPng}
            disabled={isDownloadingPng}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border border-indigo-400/40 shadow-[0_0_20px_rgba(99,102,241,0.25)] transition-all active:scale-95"
          >
            {isDownloadingPng ? (
              <RotateCcw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>Download PNG</span>
          </button>

          <button
            onClick={handleDownloadSvg}
            disabled={isDownloadingSvg}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] hover:border-white/[0.18] transition-all active:scale-95"
            title="Download Scalable Vector Graphics for Figma, Illustrator, or high-res printing"
          >
            <FileCode className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">Vector SVG</span>
          </button>
        </div>
      </div>

      {/* Mobile Segmented Navigation Tabs */}
      <div className="flex md:hidden items-center justify-between p-1 rounded-xl bg-slate-900/80 border border-white/[0.08]">
        <button
          onClick={() => setMobileTab("map")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all",
            mobileTab === "map"
              ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          )}
        >
          <Network className="w-3.5 h-3.5" />
          <span>Canvas</span>
        </button>
        <button
          onClick={() => setMobileTab("outline")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all",
            mobileTab === "outline"
              ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          )}
        >
          <AlignLeft className="w-3.5 h-3.5" />
          <span>Notes</span>
        </button>
        <button
          onClick={() => setMobileTab("style")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all",
            mobileTab === "style"
              ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          )}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Style</span>
        </button>
        <button
          onClick={() => setMobileTab("presets")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all",
            mobileTab === "presets"
              ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          )}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Presets</span>
        </button>
      </div>

      {/* Main Studio Grid: Left Sidebar Controls + Center/Right Interactive Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Outline Editor & Style Settings (Hidden on mobile if not active tab) */}
        <div
          className={cn(
            "lg:col-span-4 flex-col gap-6",
            mobileTab === "map" ? "hidden lg:flex" : "flex"
          )}
        >
          {/* Panel 1: Outline Editor */}
          <div
            className={cn(
              "flex-col gap-3 p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl",
              mobileTab !== "outline" && mobileTab !== "map" ? "hidden lg:flex" : "flex"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlignLeft className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-white">Notes & Outline</h3>
              </div>
              <button
                onClick={handleCopyMarkdown}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] transition-colors"
                title="Copy markdown outline"
              >
                <Copy className="w-3 h-3" />
                <span>Copy Text</span>
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Type or paste bullet points, indented lists, or markdown. The mind map updates in real time.
            </p>

            <div className="relative">
              <textarea
                value={outlineText}
                onChange={(e) => handleOutlineChange(e.target.value)}
                rows={12}
                className="w-full font-mono text-xs sm:text-sm bg-black/40 border border-white/[0.08] rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 resize-y transition-all leading-relaxed"
                placeholder="# Main Topic&#10;- Branch 1&#10;  - Subtopic A&#10;  - Subtopic B&#10;- Branch 2"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Tip: Indent with 2 spaces for sub-branches</span>
              <span>{outlineText.split("\n").filter(Boolean).length} lines</span>
            </div>
          </div>

          {/* Panel 2: Themes & Style Controls */}
          <div
            className={cn(
              "flex-col gap-4 p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl",
              mobileTab !== "style" && mobileTab !== "map" ? "hidden lg:flex" : "flex"
            )}
          >
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-white">Layout & Appearance</h3>
            </div>

            {/* Layout Mode Selector */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Mind Map Shape</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setLayoutMode("radial")}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-medium transition-all",
                    layoutMode === "radial"
                      ? "bg-indigo-600/20 border-indigo-500/50 text-white shadow-[0_0_12px_rgba(99,102,241,0.2)]"
                      : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200"
                  )}
                >
                  <Network className="w-4 h-4 text-indigo-400" />
                  <span>Central Map</span>
                </button>
                <button
                  onClick={() => setLayoutMode("horizontal")}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-medium transition-all",
                    layoutMode === "horizontal"
                      ? "bg-indigo-600/20 border-indigo-500/50 text-white shadow-[0_0_12px_rgba(99,102,241,0.2)]"
                      : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200"
                  )}
                >
                  <ChevronRight className="w-4 h-4 text-cyan-400" />
                  <span>Left to Right</span>
                </button>
                <button
                  onClick={() => setLayoutMode("vertical")}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-medium transition-all",
                    layoutMode === "vertical"
                      ? "bg-indigo-600/20 border-indigo-500/50 text-white shadow-[0_0_12px_rgba(99,102,241,0.2)]"
                      : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200"
                  )}
                >
                  <ChevronDown className="w-4 h-4 text-emerald-400" />
                  <span>Org Chart</span>
                </button>
              </div>
            </div>

            {/* Line Connection Style */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Branch Line Style</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setLineStyle("curve")}
                  className={cn(
                    "py-2 px-3 rounded-lg border text-xs font-medium transition-all text-center",
                    lineStyle === "curve"
                      ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-300"
                      : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200"
                  )}
                >
                  Smooth Curve
                </button>
                <button
                  onClick={() => setLineStyle("step")}
                  className={cn(
                    "py-2 px-3 rounded-lg border text-xs font-medium transition-all text-center",
                    lineStyle === "step"
                      ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-300"
                      : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200"
                  )}
                >
                  Stepped 90°
                </button>
                <button
                  onClick={() => setLineStyle("straight")}
                  className={cn(
                    "py-2 px-3 rounded-lg border text-xs font-medium transition-all text-center",
                    lineStyle === "straight"
                      ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-300"
                      : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200"
                  )}
                >
                  Straight
                </button>
              </div>
            </div>

            {/* Theme / Palette Selection */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Atmosphere Theme</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(THEMES) as ThemeId[]).map((tid) => {
                  const t = THEMES[tid];
                  const isSelected = themeId === tid;
                  return (
                    <button
                      key={tid}
                      onClick={() => setThemeId(tid)}
                      className={cn(
                        "flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium text-left transition-all",
                        isSelected
                          ? "bg-white/[0.08] border-indigo-500/60 text-white shadow-sm"
                          : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200"
                      )}
                    >
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-white/20 flex-shrink-0"
                        style={{ backgroundColor: t.accentColors[0] }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold text-slate-200">{t.name}</div>
                        <div className="text-[10px] text-slate-500">{t.badge}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Panel 3: Instant Academic & Business Presets */}
          <div
            className={cn(
              "flex-col gap-3 p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl",
              mobileTab !== "presets" && mobileTab !== "map" ? "hidden lg:flex" : "flex"
            )}
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-white">Example Templates</h3>
            </div>
            <p className="text-xs text-slate-400">
              Click any subject to load an instant outline and diagram.
            </p>

            <div className="grid grid-cols-1 gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleLoadPreset(preset)}
                  className="group flex flex-col p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] hover:border-indigo-500/40 text-left transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 group-hover:text-white">
                      {preset.name}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-indigo-400 px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                      {preset.category}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                    {preset.description}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER / RIGHT COLUMN: Interactive Canvas Area */}
        <div
          className={cn(
            "lg:col-span-8 flex-col gap-4",
            mobileTab !== "map" ? "hidden lg:flex" : "flex"
          )}
        >
          {/* Canvas Wrapper */}
          <div
            ref={canvasContainerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={cn(
              "relative w-full h-[620px] sm:h-[720px] rounded-2xl border border-white/[0.1] overflow-hidden select-none cursor-grab active:cursor-grabbing transition-colors",
              isPanning && "cursor-grabbing"
            )}
            style={{
              backgroundColor: activeTheme.canvasBg,
              touchAction: "none",
            }}
          >
            {/* Background Cyber Grid Pattern */}
            <div
              className="absolute inset-0 pointer-events-none opacity-40"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, ${activeTheme.gridColor} 1px, transparent 0)`,
                backgroundSize: "28px 28px",
              }}
            />

            {/* THE EXPORT STAGE (Captured by html-to-image or visually rendered) */}
            <div
              ref={exportStageRef}
              className="absolute inset-0 origin-top-left transition-transform duration-75"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "0 0",
              }}
            >
              {/* SVG Connecting Lines Layer */}
              <svg
                className="absolute inset-0 pointer-events-none overflow-visible"
                style={{ width: "100%", height: "100%" }}
              >
                <defs>
                  {/* Glow filter for connecting branch lines */}
                  <filter id="line-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {edges.map((edge) => {
                  const pathD = renderEdgePath(edge);
                  return (
                    <g key={edge.id}>
                      {/* Ambient outer glow */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke={edge.color}
                        strokeWidth={5}
                        strokeOpacity={0.25}
                        strokeLinecap="round"
                      />
                      {/* Crisp core wire */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke={edge.color}
                        strokeWidth={2}
                        strokeOpacity={0.9}
                        strokeLinecap="round"
                      />
                    </g>
                  );
                })}
              </svg>

              {/* HTML Interactive Node Cards Layer */}
              {nodes.map((node) => {
                const isSelected = selectedNodeId === node.id;
                const isEditing = editingNodeId === node.id;
                const isRoot = node.depth === 0;

                return (
                  <div
                    key={node.id}
                    data-mindmap-node="true"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNodeId(node.id);
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setSelectedNodeId(node.id);
                      setEditingNodeId(node.id);
                      setEditingText(node.text);
                    }}
                    className={cn(
                      "absolute flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition-all duration-150 backdrop-blur-md cursor-pointer group shadow-lg",
                      isRoot
                        ? "font-bold text-base shadow-2xl"
                        : "font-medium text-xs sm:text-sm",
                      isSelected
                        ? "ring-2 ring-indigo-400/80 shadow-[0_0_20px_rgba(99,102,241,0.4)] z-30"
                        : "hover:scale-[1.02] z-10"
                    )}
                    style={{
                      left: `${node.x}px`,
                      top: `${node.y - node.height / 2}px`,
                      width: `${node.width}px`,
                      height: `${node.height}px`,
                      backgroundColor: activeTheme.nodeBg,
                      borderColor: isSelected
                        ? node.color || activeTheme.nodeBorder
                        : `${node.color}55` || activeTheme.nodeBorder,
                      color: activeTheme.textColor,
                    }}
                  >
                    {/* Node Accent Left Glow Strip */}
                    <div
                      className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full"
                      style={{ backgroundColor: node.color }}
                    />

                    {/* Node Text or Inline Editor */}
                    <div className="flex-1 min-w-0 pr-2 pl-1">
                      {isEditing ? (
                        <input
                          ref={editInputRef}
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleCommitEdit();
                            if (e.key === "Escape") setEditingNodeId(null);
                          }}
                          onBlur={handleCommitEdit}
                          className="w-full bg-black/60 text-white px-2 py-0.5 rounded text-xs focus:outline-none border border-indigo-400"
                        />
                      ) : (
                        <span className="block text-left text-xs sm:text-[13px] font-semibold leading-snug line-clamp-2 break-words select-none">
                          {node.text}
                        </span>
                      )}
                    </div>

                    {/* Expand/Collapse Toggle Button (If has children) */}
                    {node.hasChildren && (
                      <button
                        onClick={(e) => handleToggleCollapse(node.id, e)}
                        className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-transform flex-shrink-0",
                          node.isCollapsed
                            ? "bg-indigo-500 text-white hover:bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.6)]"
                            : "bg-white/[0.1] text-slate-300 hover:bg-white/[0.2]"
                        )}
                        title={node.isCollapsed ? `Expand ${node.childrenCount} subtopics` : "Collapse branch"}
                      >
                        {node.isCollapsed ? `+${node.childrenCount}` : "-"}
                      </button>
                    )}

                    {/* FLOATING ACTION TOOLBAR ON SELECTED NODE */}
                    {isSelected && !isEditing && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute -top-11 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 rounded-lg bg-slate-900/95 border border-white/[0.15] shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-100"
                      >
                        {/* Add Child */}
                        <button
                          onClick={(e) => handleAddChild(node.id, e)}
                          className="p-1 rounded hover:bg-indigo-500/20 text-slate-300 hover:text-indigo-300 transition-colors"
                          title="Add subtopic"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>

                        {/* Add Sibling */}
                        {!isRoot && (
                          <button
                            onClick={(e) => handleAddSibling(node.id, e)}
                            className="p-1 rounded hover:bg-indigo-500/20 text-slate-300 hover:text-indigo-300 transition-colors text-[11px] font-semibold px-1"
                            title="Add sibling topic"
                          >
                            +Sib
                          </button>
                        )}

                        {/* Edit Text */}
                        <button
                          onClick={() => {
                            setEditingNodeId(node.id);
                            setEditingText(node.text);
                          }}
                          className="p-1 rounded hover:bg-white/[0.1] text-slate-300 hover:text-white transition-colors"
                          title="Rename topic"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Color Picker Chips */}
                        <div className="flex items-center gap-0.5 px-1 border-x border-white/[0.1]">
                          {activeTheme.accentColors.slice(0, 5).map((clr) => (
                            <button
                              key={clr}
                              onClick={() => handleSetNodeColor(node.id, clr)}
                              className="w-3 h-3 rounded-full hover:scale-125 transition-transform"
                              style={{ backgroundColor: clr }}
                              title="Set branch color"
                            />
                          ))}
                        </div>

                        {/* Delete Node (Except Root) */}
                        {!isRoot && (
                          <button
                            onClick={(e) => handleDeleteNode(node.id, e)}
                            className="p-1 rounded hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 transition-colors"
                            title="Delete topic"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* FLOATING ZOOM & VIEW CONTROLS (Bottom Right HUD) */}
            <div className="absolute bottom-4 right-4 flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 border border-white/[0.12] shadow-2xl backdrop-blur-xl z-40">
              <button
                onClick={() => setZoom((z) => Math.max(z - 0.15, 0.25))}
                className="p-1.5 rounded-xl hover:bg-white/[0.1] text-slate-300 hover:text-white transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <button
                onClick={() => setZoom(1)}
                className="px-2 py-0.5 text-[11px] font-mono font-semibold text-indigo-300 hover:text-white min-w-[50px] text-center rounded-lg hover:bg-white/[0.08] transition-colors"
                title="Click to reset to 100%"
              >
                {Math.round(zoom * 100)}%
              </button>

              <button
                onClick={() => setZoom((z) => Math.min(z + 0.15, 2.5))}
                className="p-1.5 rounded-xl hover:bg-white/[0.1] text-slate-300 hover:text-white transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <div className="h-4 w-[1px] bg-white/[0.12] mx-0.5" />

              <button
                onClick={handleFitToScreen}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-xs font-semibold text-indigo-200 transition-all active:scale-95"
                title="Fit entire mind map to screen"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Fit Screen</span>
              </button>
            </div>

            {/* FLOATING QUICK HINT (Top Left) */}
            <div className="absolute top-4 left-4 pointer-events-none hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/70 border border-white/[0.06] backdrop-blur-md text-[11px] text-slate-400">
              <Move className="w-3 h-3 text-indigo-400" />
              <span>Drag canvas to pan &bull; Scroll to zoom &bull; Double click node to edit</span>
            </div>
          </div>

          {/* MediaPipelineBar Integration: Send exported artwork to companion tools */}
          {exportedImageUrl && (
            <div className="mt-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <MediaPipelineBar
                imageUrl={exportedImageUrl}
                imageName="mind-map-diagram.png"
                sourceToolId="mind-map"
                sourceToolName="Notes to Mind Map Studio"
                actions={["compressor", "resizer", "converter", "meme"]}
                title="Next Action Pipeline"
                subtitle="Send your mind map directly into other Exismic tools or Exismic Cloud Drive"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
