import { IconName } from "@/data/tools";

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: IconName;
  href: string;
  popular?: boolean;
  pro?: boolean;
}

export type ToolCategory = 'image' | 'video' | 'audio' | 'pdf' | 'ai' | 'productivity';

export interface Category {
  id: ToolCategory;
  name: string;
  description: string;
  icon: IconName;
  color: string;
  glow: string;
}
