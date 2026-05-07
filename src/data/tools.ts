import { 
  Wand2, 
  Trash2, 
  Maximize, 
  RefreshCw, 
  History, 
  LayoutGrid, 
  UserCircle2, 
  Video, 
  Scissors, 
  FileArchive, 
  Type, 
  Layers, 
  Mic2, 
  VolumeX, 
  AudioWaveform, 
  Volume2, 
  Music, 
  FileDigit, 
  FileText, 
  Search, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  QrCode, 
  Scale, 
  Palette, 
  Code2, 
  MessageSquare,
  MessagesSquare, 
  FileSearch, 
  Presentation, 
  Fingerprint, 
  SearchCode, 
  Brush, 
  Compass, 
  Zap, 
  ImageIcon, 
  Plus, 
  Cpu, 
  Globe, 
  Eye, 
  Link, 
  Cloud, 
  Star, 
  Settings, 
  Activity, 
  Monitor, 
  Database, 
  Zap as ZapIcon, 
  Layers as LayersIcon, 
  Settings2, 
  Wand2 as WandIcon,
  Play,
  Hash,
  Laugh,
  PenTool,
  Crown,
  Users,
  MousePointer2,
  Lock
} from 'lucide-react';

export const ICON_MAP = {
  Wand2, 
  Trash2, 
  Maximize, 
  RefreshCw, 
  History, 
  LayoutGrid, 
  UserCircle2, 
  Video, 
  Scissors, 
  FileArchive, 
  Type, 
  Layers, 
  Mic2, 
  VolumeX, 
  AudioWaveform, 
  Volume2, 
  Music, 
  FileDigit, 
  FileText, 
  Search, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  QrCode, 
  Scale, 
  Palette, 
  Code2, 
  MessageSquare,
  MessagesSquare, 
  FileSearch, 
  Presentation, 
  Fingerprint, 
  SearchCode, 
  Brush, 
  Compass, 
  Zap, 
  ImageIcon, 
  Plus, 
  Cpu, 
  Globe, 
  Eye, 
  Link, 
  Cloud, 
  Star, 
  Settings, 
  Activity, 
  Monitor, 
  Database,
  SearchIcon: Search,
  SettingsIcon: Settings2,
  WandIcon: Wand2,
  Youtube: Play,
  Hash,
  Laugh,
  PenTool,
  Crown,
  Users,
  MousePointer2,
  Lock
};

export type IconName = keyof typeof ICON_MAP;

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: IconName;
  href: string;
  pro?: boolean;
  isProTool?: boolean;
  popular?: boolean;
  requiresFileUpload?: boolean;
  acceptedFileTypes?: string[];
  placeholderPrompt?: string;
  suggestions?: string[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: IconName;
  color: string;
  glow: string;
}

export const CATEGORIES: Category[] = [
  { id: 'image', name: 'Image Tools', description: 'Make and edit great photos with AI.', icon: 'ImageIcon' as IconName, color: 'text-accent-purple', glow: 'rgba(168, 85, 247, 0.5)' },
  { id: 'video', name: 'Video Tools', description: 'Edit videos and remove backgrounds easily.', icon: 'Video' as IconName, color: 'text-accent-blue', glow: 'rgba(59, 130, 246, 0.5)' },
  { id: 'audio', name: 'Audio & Music', description: 'Separate voice from music and make new songs.', icon: 'Music' as IconName, color: 'text-accent-cyan', glow: 'rgba(6, 182, 212, 0.5)' },
  { id: 'pdf', name: 'PDF Tools', description: 'Put PDFs together, split them, or change their type.', icon: 'FileText' as IconName, color: 'text-emerald-500', glow: 'rgba(16, 185, 129, 0.5)' },
  { id: 'ai', name: 'AI Magic', description: 'Write, code, and chat with a smart AI friend.', icon: 'Sparkles' as IconName, color: 'text-amber-500', glow: 'rgba(245, 158, 11, 0.5)' },
  { id: 'productivity', name: 'Productivity', description: 'Useful tools for your everyday work.', icon: 'Zap' as IconName, color: 'text-accent-blue', glow: 'rgba(59, 130, 246, 0.5)' },
];

export const TOOLS: Tool[] = [
  // Image Tools
  { id: 'image-eraser', name: 'Magic Eraser', description: "Remove things or people you don't want in your photos.", category: 'image', icon: 'Trash2' as IconName, href: '/tools/image/eraser', popular: true, requiresFileUpload: true, acceptedFileTypes: ['image/*'] },
  { id: 'image-compressor', name: 'Bulk Compressor', description: 'Make images smaller without making them look bad.', category: 'image', icon: 'FileArchive' as IconName, href: '/tools/image/compressor', requiresFileUpload: true, acceptedFileTypes: ['image/*'] },
  { id: 'image-resizer', name: 'Resizer & Cropper', description: 'Change the size and shape of your photos.', category: 'image', icon: 'Maximize' as IconName, href: '/tools/image/resizer', requiresFileUpload: true, acceptedFileTypes: ['image/*'] },
  { id: 'image-converter', name: 'Format Converter', description: 'Change your photos into different types like JPG or PNG.', category: 'image', icon: 'RefreshCw' as IconName, href: '/tools/image/converter', requiresFileUpload: true, acceptedFileTypes: ['image/*'] },
  { id: 'image-restorer', name: 'Photo Restorer', description: 'Fix old or broken photos using smart AI.', category: 'image', icon: 'History' as IconName, href: '/tools/image/restorer', requiresFileUpload: true, acceptedFileTypes: ['image/*'] },
  { id: 'watermark-remover', name: 'Watermark Remover', description: "Remove watermarks from your photos easily.", category: 'image', icon: 'Wand2' as IconName, href: '/tools/image/watermark-remover', requiresFileUpload: true, acceptedFileTypes: ['image/*'] },
  { id: 'image-collage', name: 'Collage Maker', description: 'Put your photos together into pretty layouts.', category: 'image', icon: 'LayoutGrid' as IconName, href: '/tools/image/collage', requiresFileUpload: true, acceptedFileTypes: ['image/*'] },
  { id: 'face-swap', name: 'Face Swap', description: 'Swap faces in photos so they look real.', category: 'image', icon: 'UserCircle2' as IconName, href: '/tools/image/face-swap', pro: true, isProTool: true, requiresFileUpload: true, acceptedFileTypes: ['image/*'] },
  { id: 'youtube-thumbnail', name: 'YouTube Thumbnail Maker', description: 'Create beautiful YouTube thumbnails quickly.', category: 'image', icon: 'Youtube' as IconName, href: '/tools/youtube/thumbnail', popular: true },
  { id: 'meme-generator', name: 'Meme Generator', description: 'Create funny memes in seconds.', category: 'image', icon: 'Laugh' as IconName, href: '/tools/meme-generator', popular: true },

  // Video Tools
  { id: 'video-bg-remover', name: 'AI Video BG Remover', description: 'Remove backgrounds from videos easily.', category: 'video', icon: 'Video' as IconName, href: '/tools/video/bg-remover', pro: true, isProTool: true, requiresFileUpload: true, acceptedFileTypes: ['video/*'] },
  { id: 'video-trimmer', name: 'Video Trimmer', description: 'Cut and trim parts of your videos.', category: 'video', icon: 'Scissors' as IconName, href: '/tools/video/trimmer', requiresFileUpload: true, acceptedFileTypes: ['video/*'] },
  { id: 'video-compressor', name: 'Video Compressor', description: 'Make videos smaller while keeping them clear.', category: 'video', icon: 'FileArchive' as IconName, href: '/tools/video/compressor', requiresFileUpload: true, acceptedFileTypes: ['video/*'] },
  { id: 'video-subtitles', name: 'Subtitle Generator', description: 'Add subtitles to your videos automatically.', category: 'video', icon: 'Type' as IconName, href: '/tools/video/subtitles', requiresFileUpload: true, acceptedFileTypes: ['video/*'] },
  { id: 'video-enhancer', name: 'Video Enhancer', description: 'Make your videos look better and clearer.', category: 'video', icon: 'Maximize' as IconName, href: '/tools/video/enhancer', popular: true, requiresFileUpload: true, acceptedFileTypes: ['video/*'] },
  { id: 'video-gif', name: 'Video to GIF', description: "Change parts of your video into a moving photo.", category: 'video', icon: 'ImageIcon' as IconName, href: '/tools/video/to-gif', requiresFileUpload: true, acceptedFileTypes: ['video/*'] },
  { id: 'video-merger', name: 'Video Merger', description: 'Join multiple video clips into one.', category: 'video', icon: 'Layers' as IconName, href: '/tools/video/merger', requiresFileUpload: true, acceptedFileTypes: ['video/*'] },

  // Audio Tools
  { id: 'audio-vocal-remover', name: 'Vocal Remover', description: 'Separate voice from music.', category: 'audio', icon: 'Mic2' as IconName, href: '/tools/audio/vocal-remover', popular: true, requiresFileUpload: true, acceptedFileTypes: ['audio/*'] },
  { id: 'audio-stem-splitter', name: 'Full Stem Splitter', description: 'Split songs into voice, drums, and other parts.', category: 'audio', icon: 'AudioWaveform' as IconName, href: '/tools/audio/stem-splitter', pro: true, isProTool: true, requiresFileUpload: true, acceptedFileTypes: ['audio/*'] },
  { id: 'audio-noise-remover', name: 'Noise Remover', description: 'Remove background noise from your recordings.', category: 'audio', icon: 'Volume2' as IconName, href: '/tools/audio/noise-remover', requiresFileUpload: true, acceptedFileTypes: ['audio/*'] },
  { id: 'audio-tts', name: 'Text to Speech', description: 'Turn text into human-sounding voices.', category: 'audio', icon: 'Type' as IconName, href: '/tools/audio/tts', requiresFileUpload: false, placeholderPrompt: 'Type what you want the voice to say here...' },
  { id: 'audio-stt', name: 'Speech to Text', description: 'Turn audio recordings into text.', category: 'audio', icon: 'Mic2' as IconName, href: '/tools/audio/stt', requiresFileUpload: true, acceptedFileTypes: ['audio/*'] },
  { id: 'audio-voice-changer', name: 'Voice Changer', description: 'Change your voice to sound like someone else.', category: 'audio', icon: 'Mic2' as IconName, href: '/tools/audio/voice-changer', requiresFileUpload: true, acceptedFileTypes: ['audio/*'] },
  { id: 'audio-music-gen', name: 'AI Music Generator', description: 'Make new music by just typing what you want.', category: 'audio', icon: 'Music' as IconName, href: '/tools/audio/music-gen', popular: true, pro: true, isProTool: true, requiresFileUpload: false, placeholderPrompt: 'Describe what kind of music you want...' },

  // PDF Tools
  { id: 'pdf-merger', name: 'PDF Merger', description: 'Join many PDF files into one.', category: 'pdf', icon: 'Layers' as IconName, href: '/tools/pdf/merger', requiresFileUpload: true, acceptedFileTypes: ['application/pdf'] },
  { id: 'pdf-splitter', name: 'PDF Splitter', description: 'Split a big PDF into single pages.', category: 'pdf', icon: 'Scissors' as IconName, href: '/tools/pdf/splitter', requiresFileUpload: true, acceptedFileTypes: ['application/pdf'] },
  { id: 'pdf-compressor', name: 'PDF Compressor', description: 'Make PDF files smaller so they are easier to send.', category: 'pdf', icon: 'FileArchive' as IconName, href: '/tools/pdf/compressor', requiresFileUpload: true, acceptedFileTypes: ['application/pdf'] },
  { id: 'pdf-to-img', name: 'PDF to Image', description: 'Turn PDF pages into good quality images.', category: 'pdf', icon: 'ImageIcon' as IconName, href: '/tools/pdf/to-img', requiresFileUpload: true, acceptedFileTypes: ['application/pdf'] },
  { id: 'pdf-img-to-pdf', name: 'Image to PDF', description: 'Turn your photos into a PDF.', category: 'pdf', icon: 'FileDigit' as IconName, href: '/tools/pdf/img-to-pdf', requiresFileUpload: true, acceptedFileTypes: ['image/*'] },
  { id: 'pdf-to-word', name: 'PDF to Word', description: 'Turn PDF files into documents you can edit.', category: 'pdf', icon: 'FileText' as IconName, href: '/tools/pdf/to-word', requiresFileUpload: true, acceptedFileTypes: ['application/pdf'] },
  { id: 'pdf-ocr', name: 'OCR Extractor', description: 'Get text from scanned PDFs and photos.', category: 'pdf', icon: 'Search' as IconName, href: '/tools/pdf/ocr', popular: true, requiresFileUpload: true, acceptedFileTypes: ['application/pdf', 'image/*'] },

  // AI Magic
  { id: 'ai-writer', name: 'AI Writer', description: "Write anything you need with a smart AI friend.", category: 'ai', icon: 'PenTool' as IconName, href: '/tools/ai/writer', popular: true, pro: true, isProTool: true, requiresFileUpload: false },
  { id: 'ai-img-gen', name: 'AI Image Generator', description: 'Make beautiful art and photos from text.', category: 'ai', icon: 'Sparkles' as IconName, href: '/tools/ai/img-gen', popular: true, pro: true, isProTool: true, requiresFileUpload: false },
  { id: 'ai-chat', name: 'AI Chat', description: "Talk to a smart AI that knows everything.", category: 'ai', icon: 'MessageSquare' as IconName, href: '/tools/ai/chat', pro: true, isProTool: true, requiresFileUpload: false },
  { id: 'ai-code', name: 'Lumora Code Studio', description: 'Next-gen AI code editor and autonomous agent.', category: 'ai', icon: 'Code2' as IconName, href: '/tools/ai/code', popular: true, pro: true, isProTool: true, requiresFileUpload: false },
  { id: 'ai-logo', name: 'AI Logo Generator', description: 'Design professional logos in seconds.', category: 'ai', icon: 'Palette' as IconName, href: '/tools/ai/logo', pro: true, isProTool: true, requiresFileUpload: false },

  // Productivity Tools
  { id: 'productivity-qr', name: 'QR Code Generator', description: 'Make QR codes for any link or text.', category: 'productivity', icon: 'QrCode' as IconName, href: '/tools/qr-code', requiresFileUpload: false },
  { id: 'productivity-passgen', name: 'Password Generator', description: 'Make strong passwords to keep you safe.', category: 'productivity', icon: 'ShieldCheck' as IconName, href: '/tools/productivity/passgen', requiresFileUpload: false },
  { id: 'productivity-units', name: 'Unit Converter', description: 'Change between many different units easily.', category: 'productivity', icon: 'Scale' as IconName, href: '/tools/productivity/units', requiresFileUpload: false },
  { id: 'productivity-palette', name: 'Palette Generator', description: 'Make pretty color sets for your designs.', category: 'productivity', icon: 'Palette' as IconName, href: '/tools/productivity/palette', requiresFileUpload: false },
  { id: 'productivity-json', name: 'JSON Formatter', description: 'Fix and make your JSON data look good.', category: 'productivity', icon: 'Code2' as IconName, href: '/tools/productivity/json', requiresFileUpload: false },
  { id: 'hashtag-generator', name: 'Hashtag Generator', description: 'Generate trending and relevant hashtags for your content.', category: 'productivity', icon: 'Hash' as IconName, href: '/tools/hashtag-generator', popular: true },
];
