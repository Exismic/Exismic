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
  Settings2, 
  Play,
  Hash,
  Laugh,
  PenTool,
  Crown,
  Users,
  MousePointer2,
  Lock,
  Bot,
  Box,
  Calculator,
  Receipt,
  TrendingUp,
  FileSpreadsheet,
  IndianRupee,
  FileCode2,
  Target,
  Mail,
  FileSignature,
  CheckCheck,
  SearchCheck,
  FileCheck,
  Terminal,
  GraduationCap,
  BookOpen,
  Binary,
  Key,
  FileQuestion,
  BookMarked,
  BrainCircuit,
  Share2,
  Code,
  FileCode,
  Eraser,
  Minimize2,
  Crop,
  FileType,
  Sparkle,
  Stamp,
  Spline,
  Gamepad2,
  UserCheck,
  Film,
  Captions,
  Tv2,
  Repeat,
  Combine,
  MicOff,
  Sliders,
  Speech,
  FileAudio,
  Headphones,
  FolderPlus,
  FolderDown,
  FileImage,
  FileUp,
  FileOutput,
  ScanText,
  Feather,
  Laptop,
  MonitorCheck,
  Layout,
  PlaySquare,
  MessageSquarePlus,
  SpellCheck,
  IdCard,
  KeyRound,
  Ruler,
  Braces,
  Keyboard,
  FileUser,
  ScanSearch,
  ListPlus,
  MailCheck,
  MailPlus,
  Wallet,
  Heading,
  AlignLeft,
  Network,
  PieChart,
  Pilcrow,
  Clock,
  Quote,
  ListTree,
  CopyCheck,
  Gauge,
  Clapperboard,
  ScanEye,
  GitCompare
} from 'lucide-react';
import { MinecraftIcon } from '@/components/ui/MinecraftIcon';

export const ICON_MAP = {
  Minecraft: MinecraftIcon,
  MinecraftIcon,
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
  Lock,
  Bot,
  Box,
  Calculator,
  Receipt,
  TrendingUp,
  FileSpreadsheet,
  IndianRupee,
  FileCode2,
  Target,
  Mail,
  FileSignature,
  CheckCheck,
  SearchCheck,
  FileCheck,
  Terminal,
  GraduationCap,
  BookOpen,
  Binary,
  Key,
  FileQuestion,
  BookMarked,
  BrainCircuit,
  Share2,
  Code,
  FileCode,
  Eraser,
  Minimize2,
  Crop,
  FileType,
  Sparkle,
  Stamp,
  Spline,
  Gamepad2,
  UserCheck,
  Film,
  Captions,
  Tv2,
  Repeat,
  Combine,
  MicOff,
  Sliders,
  Speech,
  FileAudio,
  Headphones,
  FolderPlus,
  FolderDown,
  FileImage,
  FileUp,
  FileOutput,
  ScanText,
  Feather,
  Laptop,
  MonitorCheck,
  Layout,
  PlaySquare,
  MessageSquarePlus,
  SpellCheck,
  IdCard,
  KeyRound,
  Ruler,
  Braces,
  Keyboard,
  FileUser,
  ScanSearch,
  ListPlus,
  MailCheck,
  MailPlus,
  Wallet,
  Heading,
  AlignLeft,
  Network,
  PieChart,
  Pilcrow,
  Clock,
  Quote,
  ListTree,
  CopyCheck,
  Gauge,
  Clapperboard,
  ScanEye,
  GitCompare
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
  proPowerPack?: boolean;
  popular?: boolean;
  requiresFileUpload?: boolean;
  acceptedFileTypes?: string[];
  placeholderPrompt?: string;
  suggestions?: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  indexable?: boolean;
  hidden?: boolean;
  // Tool-specific SEO & Guide Information Architecture
  seoIntro?: string;
  features?: string[];
  howToSteps?: string[];
  faqs?: Array<{ question: string; answer: string }>;
  useCases?: string[];
  limitations?: string[];
  examples?: string[];
  terminology?: Array<{ term: string; definition: string }>;
  updatedAt?: string;
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
  { id: 'image', name: 'Image Tools', description: 'Remove backgrounds, crop, compress, and create stunning visual art in seconds.', icon: 'ImageIcon' as IconName, color: 'text-cyan-400', glow: 'rgba(6, 182, 212, 0.5)' },
  { id: 'video', name: 'Video Tools', description: 'Trim clips, auto-generate captions, enhance quality, and export smooth GIFs.', icon: 'Video' as IconName, color: 'text-violet-400', glow: 'rgba(139, 92, 246, 0.5)' },
  { id: 'audio', name: 'Audio & Music Tools', description: 'Isolate vocals, clean noisy recordings, generate sound effects, and produce music.', icon: 'Music' as IconName, color: 'text-pink-400', glow: 'rgba(236, 72, 153, 0.5)' },
  { id: 'pdf', name: 'PDF Tools', description: 'Merge, split, shrink file sizes, extract text, and convert documents effortlessly.', icon: 'FileText' as IconName, color: 'text-red-400', glow: 'rgba(239, 68, 68, 0.5)' },
  { id: 'ai', name: 'AI Tools', description: 'Generate images, write articles, summarize videos, and chat with AI.', icon: 'BrainCircuit' as IconName, color: 'text-amber-400', glow: 'rgba(245, 158, 11, 0.5)' },
  { id: 'productivity', name: 'Productivity Tools', description: 'Build resumes, test typing speed, design color schemes, and streamline your day.', icon: 'Zap' as IconName, color: 'text-emerald-400', glow: 'rgba(16, 185, 129, 0.5)' },
  { id: 'business', name: 'Business & Finance Tools', description: 'Create branded client invoices, calculate profits and taxes, and plan budgets.', icon: 'Receipt' as IconName, color: 'text-orange-400', glow: 'rgba(255, 153, 51, 0.5)' },
  { id: 'seo', name: 'SEO Tools', description: 'Boost search rankings, optimize headlines, preview social links, and grow traffic.', icon: 'SearchCode' as IconName, color: 'text-cyan-400', glow: 'rgba(34, 211, 238, 0.5)' },
  { id: 'developer', name: 'Developer Tools', description: 'Handy utilities to format data, test matching rules, create IDs, and clean graphics.', icon: 'Terminal' as IconName, color: 'text-lime-400', glow: 'rgba(163, 230, 53, 0.5)' },
  { id: 'student', name: 'Student & Study Tools', description: 'Turn lectures into study guides, create flip flashcards, solve math, and cite sources.', icon: 'GraduationCap' as IconName, color: 'text-amber-400', glow: 'rgba(251, 191, 36, 0.5)' },
  { id: 'creator', name: 'Creator & Social Media', description: 'Write viral video hooks, design swipeable carousels, analyze thumbnails, and format posts.', icon: 'Share2' as IconName, color: 'text-indigo-400', glow: 'rgba(99, 102, 241, 0.5)' },
];

export const ALL_TOOLS: Tool[] = [
  // Image Tools
  { 
    id: 'image-eraser', 
    name: 'Background Remover', 
    description: "Instantly remove distracting backgrounds from portraits, product shots, or selfies. Get clean cutouts with smooth edges ready for any design or video.", 
    category: 'image', 
    icon: 'Eraser' as IconName, 
    href: '/tools/image/eraser',
    suggestions: ["How do I get cleaner cutout edges?","What image formats work best for transparent backgrounds?","Can I remove the background of a complex image like hair?"], 
    popular: true, 
    proPowerPack: true,
    requiresFileUpload: true, 
    acceptedFileTypes: ['image/*'],
    seoTitle: "Background Remover Online - Create Transparent PNG Cutouts | Exismic",
    seoDescription: "Remove photo backgrounds, preview your cutout, and download a transparent PNG for product listings, portraits, and designs.",
    seoKeywords: ["background remover","remove background free","ai bg eraser","transparent background","photo background remover","Exismic"],
    seoIntro: "Separate a photo subject from its background and preview the result before downloading a transparent PNG. This tool removes backgrounds; it does not erase individual objects inside your subject.",
    howToSteps: [
      "Upload your photo or drag and drop your image directly onto the workspace above.",
      "Let the AI detect and isolate your foreground subject automatically in real time.",
      "Preview your cutout against light or dark grids and download your clean, transparent PNG."
    ],
    features: [
  "Transparent PNG: Download your cutout with a transparent background.",
  "Cutout preview: Inspect the subject and edges before saving.",
  "Photo backgrounds: Isolate portraits or products for a new design.",
  "Reusable images: Place the cutout in a thumbnail, collage, or product listing."
],
    faqs: [
  {
    "question": "Can this erase an object inside my photo?",
    "answer": "This tool separates the main subject from its background. It is not an object-removal brush."
  },
  {
    "question": "What file do I download?",
    "answer": "The cutout is downloaded as a PNG with a transparent background."
  },
  {
    "question": "Will every edge be perfect?",
    "answer": "Fine hair, transparent objects, shadows, and low contrast can produce imperfect edges. Inspect the preview before using the image."
  }
],
    useCases: [
      "Creating white or transparent backgrounds for e-commerce product listings",
      "Isolating headshots for professional resumes, portfolios, and avatars",
      "Extracting subjects for YouTube thumbnails, marketing flyers, and graphic collages"
    ],
    limitations: [
  "Fine hair, glass, and subjects that blend into the background can need additional editing."
],
    examples: [
  "Try a product photographed against a plain wall, then use the transparent PNG in a listing."
],
    updatedAt: "2026-09-29T00:00:00.000Z"
  },
  { 
    id: 'image-compressor', 
    name: 'Bulk Compressor', 
    description: "Shrink large image files in seconds without losing sharpness or clarity. Perfect for speeding up your website, saving disk space, and sharing photos faster.", 
    category: 'image', 
    icon: 'Minimize2' as IconName, 
    href: '/tools/image/compressor',
    suggestions: ["How do I compress without losing visible quality?","What is the best compression level for websites?","Can I batch compress a whole folder?"], 
    requiresFileUpload: true, 
    acceptedFileTypes: ['image/*'],
    seoTitle: "Bulk Image Compressor Online - Reduce File Size without Quality Loss",
    seoDescription: "Compress multiple images at once. Our AI-driven compressor reduces file sizes while maintaining professional image quality.",
    seoKeywords: ["bulk image compressor","compress image online","reduce image file size","jpeg compressor","png compressor","Exismic"]
  },
  { id: 'image-resizer', name: 'Resizer & Cropper', description: "Crop, zoom, and reshape your photos to the perfect dimensions for Instagram, YouTube, Twitter, and website banners with zero stretching or blurry edges.", category: 'image', icon: 'Crop' as IconName, href: '/tools/image/resizer',
    suggestions: ["What are the best dimensions for Instagram?","How do I crop without ruining the composition?","Will resizing reduce the image quality?"], requiresFileUpload: true, acceptedFileTypes: ['image/*'], seoTitle: "Free Image Resizer & Cropper - Resize Photos for Social Media Online",
    seoDescription: "Free online image resizer and cropper. Resize photos, adjust pixel dimensions, and crop images for Instagram, Twitter, or web.",
    seoKeywords: ["image resizer","crop photo online","resize photo free","social media photo resizer","Exismic"] },
  { id: 'image-converter', name: 'Format Converter', description: "Quickly change your photos between JPG, PNG, WEBP, and other formats in one simple click, keeping colors vibrant and file quality crystal clear.", category: 'image', icon: 'FileType' as IconName, href: '/tools/image/converter',
    suggestions: ["What is the difference between WEBP and PNG?","Which format is best for transparent images?","How do I convert a batch of images?"], requiresFileUpload: true, acceptedFileTypes: ['image/*'], seoTitle: "Online Image Format Converter - Convert JPG, PNG, WEBP & More",
    seoDescription: "Convert images online between JPG, PNG, WEBP, and GIF formats instantly without quality loss.",
    seoKeywords: ["image converter","convert jpg to webp","convert png to jpg","online image format converter","Exismic"] },
  { id: 'watermark-remover', name: 'Watermark Remover', description: "Erase unwanted logos, timestamps, and watermarks from your pictures cleanly. Restore your photos to their original look with seamless blending.", category: 'image', icon: 'Stamp' as IconName, href: '/tools/image/watermark-remover',
    suggestions: ["Can it remove large transparent text?","Will the removed area look blurry?","How does it handle watermarks on complex backgrounds?"], proPowerPack: true, requiresFileUpload: true, acceptedFileTypes: ['image/*'], seoTitle: "Free Watermark Remover Online - Remove Text & Logos from Images",
    seoDescription: "Remove watermarks, logos, and unwanted text from photos using AI inpainting algorithms.",
    seoKeywords: ["watermark remover","remove logo from photo","remove text from image","free watermark remover","Exismic"] },
  {
    id: 'svg-vectorizer',
    name: 'Image Vectorizer',
    description: "Turn low-res logos, sketches, and graphics into infinitely scalable artwork. Zoom in as much as you want without seeing any pixels or jagged edges.",
    category: 'image',
    icon: 'Spline' as IconName,
    href: '/tools/image/vectorizer',
    suggestions: ["How do I vectorize a logo?","Can I download the SVG directly?","What are the best image parameters for tracing?"],
    requiresFileUpload: true,
    acceptedFileTypes: ['image/*'],
    seoTitle: "Free Image to Vector SVG Converter Online | Exismic",
    seoDescription: "Instantly convert JPG, PNG, and WEBP images into editable, scalable vector graphics (SVG). Fast, free, and runs entirely in your browser session.",
    seoKeywords: [
      "image to vector converter",
      "convert png to svg free",
      "convert jpg to svg",
      "vectorize image online",
      "free vectorizer",
      "png to vector svg",
      "raster to vector trace"
    ]
  },
  { id: 'image-collage', name: 'Collage Maker', description: "Combine your favorite photos into beautiful photo grids and multi-picture moodboards. Customize borders, spacing, and layouts for social posts and prints.", category: 'image', icon: 'LayoutGrid' as IconName, href: '/tools/image/collage',
    suggestions: ["What are the best layouts for Instagram stories?","How do I add borders between images?","Can I adjust the spacing between photos?"], requiresFileUpload: true, acceptedFileTypes: ['image/*'], seoTitle: "Free Online Collage Maker - Create Photo Grids & Layouts Instantly",
    seoDescription: "Create beautiful photo collages and grid layouts online for social media or print. Free collage maker.",
    seoKeywords: ["collage maker","photo grid creator","make photo collage online","instagram collage maker","Exismic"] },
  { id: 'image-minecraft-skin', name: 'AI Minecraft Skin Maker', description: "Create unique custom Minecraft character skins just by describing what you want. Spin and inspect your new look in 3D before taking it straight into your game.", category: 'image', icon: 'Minecraft' as IconName, href: '/tools/image/minecraft-skin',
    suggestions: ["Help me write a prompt for a futuristic knight","How do I fix issues with the arms/legs?","Can I upload a reference image?"], popular: true, proPowerPack: true, seoTitle: "AI Minecraft Skin Maker - Create Game-Ready 64x64 Skins", seoDescription: "Create original Minecraft-compatible skins from a prompt or reference image. Preview in 3D, regenerate body parts, and download a valid 64x64 PNG.",
    seoKeywords: ["minecraft skin maker","ai minecraft skin generator","create 64x64 minecraft skin","custom minecraft skin 3d","Exismic"],
    seoIntro: "Describe a Minecraft character, choose the available appearance settings, and generate a skin. Rotate the 3D preview to inspect the front, back, and sides before downloading the skin image.",
    features: [
  "Character prompts: Describe clothing, colors, and the look you want.",
  "Appearance controls: Choose the arm model and available face or style options.",
  "3D preview: Rotate the character to check how the skin wraps around the body.",
  "Skin download: Save the skin image for use with Minecraft."
],
    howToSteps: [
  "Describe your character and choose its arm model and appearance settings.",
  "Generate the skin, then rotate the preview to inspect every side.",
  "Refine the result if needed and download the skin image."
],
    faqs: [
  {
    "question": "Is generation entirely on my device?",
    "answer": "No. Generation and enhancement send the prompt and any supplied reference image to Exismic server endpoints for processing."
  },
  {
    "question": "Is this a general photo editor?",
    "answer": "No. It creates Minecraft character skins rather than ordinary high-resolution photo edits."
  },
  {
    "question": "Why should I inspect the 3D preview?",
    "answer": "A flat skin wraps around the character. Check seams, the back, and the arms before downloading."
  }
],
    limitations: [
  "Generation requires available credits and an internet connection.",
  "Details can change during generation. Check seams and both sides of the character."
],
    examples: [
  "Try a blue explorer jacket with brown boots, then inspect the sleeves in the 3D preview."
],
    updatedAt: "2026-09-29T00:00:00.000Z" },
  { id: 'youtube-thumbnail', name: 'YouTube Thumbnail Maker', description: "Design punchy, high-click video thumbnails that stand out in crowded feeds. Add bold titles, glowing outlines, and sticker accents that grab instant attention.", category: 'image', icon: 'Youtube' as IconName, href: '/tools/youtube/thumbnail',
    suggestions: ["What makes a high-converting thumbnail?","Which fonts are best for readability on mobile?","How do I add a glow effect around my subject?"], popular: true, seoTitle: "Free YouTube Thumbnail Maker - Design High-CTR Thumbnails Fast",
    seoDescription: "Free YouTube Thumbnail Maker. Create high-CTR thumbnails with custom typography, glows, and templates.",
    seoKeywords: ["youtube thumbnail maker","thumbnail creator free","high ctr thumbnail design","youtube thumbnail generator","Exismic"] },
  { id: 'meme-generator', name: 'Meme Generator', description: "Turn funny ideas into viral social memes in seconds. Pick from classic meme templates or upload your own photos, add bold caption text, and share everywhere.", category: 'image', icon: 'Laugh' as IconName, href: '/tools/meme-generator',
    suggestions: ["What are the trending meme formats right now?","How do I change the font to Impact?","Can I upload my own blank template?"], popular: true, seoTitle: "Online Meme Generator - Create Funny Memes with AI Instantly",
    seoDescription: "Create funny memes online with AI meme generator. Choose popular templates or upload your own images watermark-free.",
    seoKeywords: ["meme generator","online meme maker","funny meme creator","meme templates","drake meme maker","Exismic"] },

  // Video Tools
  { id: 'video-trimmer', name: 'Video Trimmer', description: "Cut away awkward pauses, trim the start and end, and keep only the best moments of your footage with an easy, frame-accurate timeline slider.", category: 'video', icon: 'Scissors' as IconName, href: '/tools/video/trimmer',
    suggestions: ["How do I make precise frame-level cuts?","Will trimming re-encode and lose quality?","Can I trim multiple segments at once?"], requiresFileUpload: true, acceptedFileTypes: ['video/*'], seoTitle: "Online Video Trimmer - Cut & Trim Video Clips Free",
    seoDescription: "Trim and cut videos online free. Crop MP4 and WebM videos easily with accurate time slider controls.",
    seoKeywords: ["video trimmer","cut video online","trim mp4 free","online video cutter","Exismic"] },
  { id: 'video-compressor', name: 'Video Compressor', description: "Drastically reduce heavy video file sizes so you can upload faster and share over chat or email, while keeping your video crisp, colorful, and smooth.", category: 'video', icon: 'FileArchive' as IconName, href: '/tools/video/compressor',
    suggestions: ["What is the best bitrate for Discord/Twitter?","How do I keep the audio quality high while compressing?","Which codec is most universally supported?"], requiresFileUpload: true, acceptedFileTypes: ['video/*'], seoTitle: "Free Video Compressor Online - Reduce Video Size Fast",
    seoDescription: "Compress MP4 and WebM video files without losing visual clarity. Reduce video file size fast for web upload.",
    seoKeywords: ["video compressor","compress video online","reduce mp4 file size","video file shrinker","Exismic"] },
  { id: 'video-subtitles', name: 'Subtitle Generator', description: "Automatically generate and sync captions for your videos in seconds. Make your TikToks, Reels, and Shorts easy to follow and enjoy even with the sound off.", category: 'video', icon: 'Captions' as IconName, href: '/tools/video/subtitles',
    suggestions: ["How do I fix misheard words?","Can I translate the subtitles to another language?","How do I style the font and background of the text?"], requiresFileUpload: true, acceptedFileTypes: ['video/*'], seoTitle: "Auto Subtitle Generator Online - Add Subtitles to Video Free",
    seoDescription: "Auto generate subtitles for videos using AI speech recognition. Download SRT files or burn captions into video.",
    seoKeywords: ["auto subtitle generator","video captions maker","ai srt generator","free video subtitles creator","Exismic"] },
  { id: 'video-enhancer', name: 'Video Enhancer', description: "Breathe new life into blurry or low-light clips. Sharpen soft details, smooth out visual grain, and make your videos look like they were shot on a pro camera.", category: 'video', icon: 'Tv2' as IconName, href: '/tools/video/enhancer',
    suggestions: ["Can this upscale 720p to 4K?","Does it remove grain and noise?","How long does upscaling usually take?"], popular: true, proPowerPack: true, requiresFileUpload: true, acceptedFileTypes: ['video/*'], seoTitle: "AI Video Enhancer Online - Upscale & Improve Video Quality Free",
    seoDescription: "Upscale and enhance video quality online with AI vision processing. Improve contrast, resolution, and sharpness.",
    seoKeywords: ["video enhancer","ai video upscaler","enhance video quality","fix low res video","Exismic"] },
  { id: 'video-gif', name: 'Video to GIF', description: "Turn fun video reactions and highlights into smooth, looping animated GIFs ready to drop into Discord, Slack, tweets, and social group chats.", category: 'video', icon: 'Repeat' as IconName, href: '/tools/video/to-gif',
    suggestions: ["How do I make the GIF loop perfectly?","What frame rate is best for a smooth GIF?","How do I reduce the GIF file size?"], requiresFileUpload: true, acceptedFileTypes: ['video/*'], seoTitle: "Video to GIF Converter - Create Moving GIFS from Video Online",
    seoDescription: "Convert video files (MP4, MOV, WEBM) to high quality animated GIFs online with custom frame rate and loop settings.",
    seoKeywords: ["video to gif converter","convert mp4 to gif","make animated gif from video","Exismic"] },
  { id: 'video-merger', name: 'Video Merger', description: "Stitch multiple video clips together into one seamless movie or reel. Arrange your scenes in order and export a finished compilation in minutes.", category: 'video', icon: 'Combine' as IconName, href: '/tools/video/merger',
    suggestions: ["How do I add crossfade transitions between clips?","Do the clips need to have the same resolution?","Can I add background music to the merged video?"], requiresFileUpload: true, acceptedFileTypes: ['video/*'], seoTitle: "Online Video Merger - Join & Combine Video Clips Free",
    seoDescription: "Combine and merge multiple video clips into a single video file online. Free MP4 joiner and combiner.",
    seoKeywords: ["video merger","combine videos online","join mp4 files","video joiner free","Exismic"] },

  // Audio Tools
  { 
    id: 'audio-vocal-remover', 
    name: 'Vocal Remover', 
    description: "Strip out singing from any song to create clean karaoke instrumentals, or isolate vocals to use as an acapella track in your remixes.", 
    category: 'audio', 
    icon: 'MicOff' as IconName, 
    href: '/tools/audio/vocal-remover',
    suggestions: ["How do I isolate the vocals completely?","Does it work well with heavy metal tracks?","What format should I download for mixing?"], 
    popular: true, 
    requiresFileUpload: true, 
    acceptedFileTypes: ['audio/*'],
    seoTitle: "Free Vocal Remover Online - Separate Voice from Music Instantly",
    seoDescription: "The best free AI vocal remover. Separate vocals from instrumentals in any song with professional studio-grade quality.",
    seoKeywords: ["vocal remover","extract vocals from song","acapella maker","karaoke maker online","isolate vocals","Exismic"]
  },
  { id: 'audio-stem-splitter', name: 'Full Stem Splitter', description: "Separate full songs into individual tracks for drums, bass, vocals, and instruments. Perfect for remixing, sampling, or practicing your instrument.", category: 'audio', icon: 'Sliders' as IconName, href: '/tools/audio/stem-splitter',
    suggestions: ["How cleanly does it separate the bass from the drums?","Can I mute specific instruments?","What is the difference between 2-stem and 4-stem split?"], pro: true, requiresFileUpload: true, acceptedFileTypes: ['audio/*'], seoTitle: "AI Stem Splitter Online - Split Songs into Vocals, Drums & Bass",
    seoDescription: "Split audio tracks into separate stems: vocals, drums, bass, instruments, and melody using AI music separation.",
    seoKeywords: ["audio stem splitter","separate music stems","isolate drums bass vocals","ai music stem extractor","Exismic"] },
  { id: 'audio-noise-remover', name: 'Noise Remover', description: "Silence air conditioning hums, microphone hiss, wind rumble, and room echo from your voice recordings so you sound clean and professional.", category: 'audio', icon: 'VolumeX' as IconName, href: '/tools/audio/noise-remover',
    suggestions: ["Will it remove wind noise?","Does it affect the quality of the main voice?","How do I deal with echo or reverb?"], requiresFileUpload: true, acceptedFileTypes: ['audio/*'], seoTitle: "AI Noise Remover Online - Remove Background Noise from Audio Free",
    seoDescription: "Clean background noise from audio recordings. Remove hiss, hum, traffic, and fan noise from voice recordings.",
    seoKeywords: ["audio noise remover","clean voice recording","remove background noise from audio","voice denoiser","Exismic"] },
  { id: 'audio-tts', name: 'Text to Speech', description: "Turn typed scripts and articles into expressive, natural voiceovers for YouTube videos, podcasts, and presentations without needing a microphone.", category: 'audio', icon: 'Type' as IconName, href: '/tools/audio/tts',
    suggestions: ["Which voice sounds the most natural?","How do I add pauses or emphasis?","Can it speak in different accents?"], requiresFileUpload: false, placeholderPrompt: 'Type what you want the voice to say here...', seoTitle: "Free Text to Speech Online - Realistic AI Voice Generator",
    seoDescription: "Generate natural text-to-speech AI voices online. Convert written text to realistic MP3 audio speech.",
    seoKeywords: ["text to speech ai","ai voice generator","tts online free","realistic voice generator","Exismic"],
    seoIntro: "Turn a written script into a spoken voiceover. Choose a voice, adjust the available voice settings, generate the audio, and listen before downloading.",
    features: [
  "Text input: Paste or type the script you want read aloud.",
  "Voice choice: Preview the available voices before generating.",
  "Voice settings: Adjust the available speed and voice controls for your script.",
  "Audio preview: Listen to the generated voiceover before downloading."
],
    howToSteps: [
  "Type or paste your script in the text box.",
  "Choose a voice, review the available settings, and select Generate Voiceover.",
  "Listen to the result, revise difficult words if needed, and download the audio."
],
    faqs: [
  {
    "question": "Do I need to upload a recording?",
    "answer": "No. Text-to-Speech starts with written text. Use Speech-to-Text if you want to transcribe an existing recording."
  },
  {
    "question": "Can I preview voices?",
    "answer": "Use the voice preview controls to compare the available voices before generating your script."
  },
  {
    "question": "How do I improve pronunciation?",
    "answer": "Try clearer punctuation, shorter sentences, or spelling out abbreviations. Listen to the full result before publishing."
  }
],
    useCases: [
  "Narration for a short tutorial",
  "A spoken draft of a presentation",
  "Voiceovers for product walkthroughs"
],
    limitations: [
  "Pronunciation and voice availability can vary. Check names, abbreviations, and numbers in the preview.",
  "Generation uses an online service; avoid submitting confidential scripts."
],
    examples: [
  "Paste a three-sentence introduction, choose a voice, and compare the result after changing punctuation."
],
    updatedAt: "2026-09-29T00:00:00.000Z" },
  { id: 'audio-stt', name: 'Speech to Text', description: "Turn spoken interviews, podcasts, voice memos, and meetings into clean, readable text transcripts you can search, copy, and edit effortlessly.", category: 'audio', icon: 'FileAudio' as IconName, href: '/tools/audio/stt',
    suggestions: ["How accurate is it with heavy accents?","Does it automatically add punctuation?","Can it differentiate between multiple speakers?"], requiresFileUpload: true, acceptedFileTypes: ['audio/*'], seoTitle: "Speech to Text Converter Online - Transcribe Audio to Text Free",
    seoDescription: "Convert audio and voice recordings to accurate text transcripts using automatic speech recognition AI.",
    seoKeywords: ["speech to text online","audio transcription ai","convert voice to text","free audio transcriber","Exismic"],
    howToSteps: [
      "Drop your audio recording or tap Live Mic to capture speech directly in your browser.",
      "Select Transcribe Speech to Text to automatically detect speech, words, and pacing.",
      "Review with the interactive waveform, edit text in place, and download your clean TXT or SRT subtitles."
    ],
    features: [
      "High-Accuracy Voice Recognition: Transcribes spoken speech clearly with natural sentence punctuation and phrasing.",
      "Interactive Audio Waveform: Click any timestamp to jump directly to that exact moment in the recording.",
      "Multi-Format Exports: Download clean text files (.TXT) or timed subtitle tracks (.SRT) for video editors.",
      "Live In-Browser Recording: Speak directly into your microphone for instant voice memos and lecture notes."
    ],
    faqs: [
      {
        question: "Can I record directly from my microphone?",
        answer: "Yes. Switch to the Live Mic tab, click Start Recording, and speak directly into your browser. Your recording loads into the transcriber automatically when you stop."
      },
      {
        question: "What formats can I export my transcript into?",
        answer: "You can download plain text (.TXT) files for notes and documents, or subtitle files (.SRT) with synchronized timecodes for Premiere, Final Cut, and CapCut."
      },
      {
        question: "Does it support background noise reduction?",
        answer: "The speech recognition model automatically isolates spoken voice frequencies from moderate ambient room noise."
      },
      {
        question: "Are my audio recordings kept private?",
        answer: "Yes. Your audio recordings are processed securely in your active session and are never permanently stored or shared."
      }
    ],
    useCases: [
      "Transcribing podcast episodes and video interviews for show notes",
      "Converting lecture recordings and voice memos into study notes",
      "Generating synchronized SRT captions for social media videos and reels"
    ],
    examples: [
      "Drop a 2-minute voice recording to test transcription accuracy and export synchronized subtitles."
    ],
    updatedAt: "2026-09-29T00:00:00.000Z" },
  { id: 'audio-voice-changer', name: 'Voice Changer', description: "Alter your voice to sound like different characters, deep announcers, or robotic effects while keeping your natural tone and speech rhythm intact.", category: 'audio', icon: 'Speech' as IconName, href: '/tools/audio/voice-changer',
    suggestions: ["How do I make my voice sound like a robot?","Will it preserve my original emotion and pitch?","Does it work in real-time?"], requiresFileUpload: true, acceptedFileTypes: ['audio/*'], seoTitle: "AI Voice Changer Online - Change Your Voice Instantly Free",
    seoDescription: "Change and modulate voice audio recordings with AI voice filters. Transform pitch, speed, and character tone.",
    seoKeywords: ["voice changer online","ai voice filter","voice tone modulator","change voice pitch","Exismic"],
    howToSteps: [
      "Drop your audio file or record your voice live using the studio microphone.",
      "Select a character voice like Deep Announcer or Cyber Robot, and fine-tune pitch or warmth.",
      "Listen with the real-time A/B comparison switch and download your transformed voice."
    ],
    features: [
      "8 Character Voice Personas: Switch instantly between deep cinematic narrators, sci-fi robots, cartoon helium, and walkie-talkies.",
      "Real-Time A/B Listening Switch: Compare transformed voice vs original audio with synchronized playback.",
      "Fine-Tuning Controls: Adjust vocal pitch (-12 to +12 semitones), robotic ring modulation, chest bass, and room echo.",
      "Live In-Browser Recording: Record directly from your microphone for instant voice transformation."
    ],
    faqs: [
      {
        question: "Does the voice changer preserve my speech pacing and emotion?",
        answer: "Yes. The voice transformation engine keeps your original rhythm, pauses, and cadence completely natural while altering pitch and resonance."
      },
      {
        question: "Can I record directly from my microphone?",
        answer: "Yes. Switch to the Live Mic tab, tap Start Recording, and speak directly into your browser. Your recording loads into the studio automatically."
      },
      {
        question: "Can I use transformed voices for commercial projects and videos?",
        answer: "Yes, 100%. All transformed audio is royalty-free and ready for YouTube, podcasts, gaming streams, and character voiceovers."
      },
      {
        question: "Are my voice recordings kept private?",
        answer: "Yes. All audio processing runs securely during your active session and files are never stored or shared."
      }
    ],
    useCases: [
      "Creating dramatic movie trailer narrations and podcast intros",
      "Adding robotic or character voiceovers to gaming videos and streams",
      "Protecting personal identity and voice privacy in voice notes and calls"
    ],
    examples: [
      "Upload a voice clip, apply Deep Announcer, and increase chest warmth for a resonant podcast intro."
    ],
    updatedAt: "2026-09-29T00:00:00.000Z" },
  {
    id: 'sfx-generator',
    name: 'AI Sound Effects',
    description: "Type what you want to hear and get custom sound effects for your games, videos, and apps. From laser blasts to cinematic whooshes in seconds.",
    category: 'audio',
    icon: 'AudioWaveform' as IconName,
    href: '/tools/sfx-generator',
    suggestions: ["What description works best for sci-fi laser sound?","Can I specify the echo or reverb length?","How do I make a retro 8-bit jump sound?"],
    popular: true,
    requiresFileUpload: false,
    placeholderPrompt: 'Describe the sound effect you want (e.g., retro 8-bit game jump, sword clash)...',
    seoTitle: "Free AI Sound Effects Generator - Create Audio SFX Online",
    seoDescription: "Instantly generate custom, royalty-free sound effects using AI. Enter any description to create game assets, video effects, and audio clips.",
    seoKeywords: [
      "ai sound effects generator",
      "free sfx generator",
      "text to sound effects",
      "royalty free sound effects ai",
      "game sound effects generator",
      "foley sound effect maker online",
      "free sound effects creator",
      "elevenlabs sound effects generator"
    ],
    howToSteps: [
      "Type what you want to hear (e.g. 'retro 8-bit game jump', 'laser beam blast', or 'heavy metal sword clash').",
      "Choose a sound duration from 0.5s to 12.0s and pick an acoustic environment (Studio, Open Air, or Echo Hall).",
      "Click Generate to synthesize your custom sound effect, listen to the waveform, and download clean WAV audio."
    ],
    features: [
      "Text-to-Foley Generation: Describe any sound effect, weapon clash, or atmospheric environment in plain English.",
      "Interactive Waveform Monitor: 54-bar frequency visualizer with click-to-seek, smooth playhead, and seamless loop toggle.",
      "Custom Acoustic Spaces: Tailor effects to Studio Clean, Open Air, or Cathedral Echo Hall.",
      "100% Royalty-Free Assets: Export studio-quality 16-bit 44.1kHz stereo WAV files ready for games, YouTube, and podcasts."
    ],
    faqs: [
      {
        question: "Can I use generated sound effects in commercial games and monetized YouTube videos?",
        answer: "Yes, 100%. All generated sound effects are completely royalty-free with zero watermarks or licensing fees."
      },
      {
        question: "How do I make looping sound effects like rain or campfire?",
        answer: "Turn on the Loop button in the player to listen to seamless continuous playback before downloading your audio."
      },
      {
        question: "What audio format is downloaded?",
        answer: "You get a pristine, uncompressed 16-bit 44.1kHz stereo WAV audio file that opens directly in any video or game editor."
      },
      {
        question: "How long can each sound effect be?",
        answer: "You can adjust duration from 0.5 seconds (quick button click or impact) up to 12.0 seconds (extended atmospheric ambience)."
      }
    ],
    useCases: [
      "Creating custom game sound effects for indie video games in Unity, Unreal, or Godot",
      "Adding cinematic whooshes, impacts, and laser blasts to YouTube videos and TikTok reels",
      "Designing podcast sound transitions, intro stingers, and ambient background textures"
    ],
    examples: [
      "Type 'laser blaster with echoing power tail', set duration to 2.2s, and click Generate for a sci-fi game weapon effect."
    ],
    updatedAt: "2026-09-29T00:00:00.000Z"

  },

  // PDF Tools
  { id: 'pdf-merger', name: 'PDF Merger', description: "Combine multiple reports, invoices, or scanned documents into one neat, organized PDF package with an easy drag-and-drop page order.", category: 'pdf', icon: 'FolderPlus' as IconName, href: '/tools/pdf/merger',
    suggestions: ["Can I rearrange the order of the files?","Is there a file size limit for merging?","Will it keep the original formatting?"], requiresFileUpload: true, acceptedFileTypes: ['application/pdf'], seoTitle: "Free PDF Merger Online - Join Multiple PDFs into One File",
    seoDescription: "Merge multiple PDF files into one unified PDF document online for free. Reorder pages and combine fast.",
    seoKeywords: ["pdf merger","combine pdf files","merge pdf online free","pdf joiner","Exismic"] },
  { id: 'pdf-splitter', name: 'PDF Splitter', description: "Break apart huge multi-page documents into separate files, or extract only the exact pages you need to email to your team or clients.", category: 'pdf', icon: 'Scissors' as IconName, href: '/tools/pdf/splitter',
    suggestions: ["How do I extract only pages 5 to 10?","Can I split every page into a separate file?","Will the split files retain their text selectability?"], requiresFileUpload: true, acceptedFileTypes: ['application/pdf'], seoTitle: "Online PDF Splitter - Split & Extract PDF Pages Free",
    seoDescription: "Split a large PDF file into separate single pages or custom page ranges online instantly.",
    seoKeywords: ["pdf splitter","split pdf pages","separate pdf file","extract pages from pdf","Exismic"] },
  { id: 'pdf-compressor', name: 'PDF Compressor', description: "Shrink bulky PDF files down to lightweight sizes that glide through email attachments, without turning text or graphics into a blurry mess.", category: 'pdf', icon: 'FolderDown' as IconName, href: '/tools/pdf/compressor',
    suggestions: ["Will compressing make the images blurry?","What is the recommended compression level for email?","Does it remove invisible metadata to save space?"], requiresFileUpload: true, acceptedFileTypes: ['application/pdf'], seoTitle: "PDF Compressor Online - Reduce PDF File Size Free",
    seoDescription: "Compress PDF file size without reducing readability or image quality. Free online PDF file shrinker.",
    seoKeywords: ["pdf compressor","reduce pdf size online","compress pdf file","shrink pdf free","Exismic"] },
  { id: 'pdf-to-img', name: 'PDF to Image', description: "Save any page from your PDF document as high-resolution JPG or PNG pictures so you can easily post them on social media or insert into presentations.", category: 'pdf', icon: 'FileImage' as IconName, href: '/tools/pdf/to-img',
    suggestions: ["Should I choose JPG or PNG?","How do I increase the resolution of the output images?","Can I download all pages as a ZIP file?"], requiresFileUpload: true, acceptedFileTypes: ['application/pdf'], seoTitle: "PDF to Image Converter - Convert PDF Pages to JPG/PNG Online",
    seoDescription: "Convert PDF pages into high-resolution JPG or PNG images online. Extract embedded images from PDFs.",
    seoKeywords: ["pdf to image converter","pdf to jpg","pdf to png free","convert pdf to image online","Exismic"] },
  { id: 'pdf-img-to-pdf', name: 'Image to PDF', description: "Bundle your receipts, scanned pages, and photo collections into a clean, easy-to-read PDF file that anyone can open on phone or desktop.", category: 'pdf', icon: 'FileUp' as IconName, href: '/tools/pdf/img-to-pdf',
    suggestions: ["How do I ensure the images fit the page properly?","Can I add a margin around the images?","Will it preserve the original image quality?"], requiresFileUpload: true, acceptedFileTypes: ['image/*'], seoTitle: "Image to PDF Converter - Convert Photos to PDF Online Free",
    seoDescription: "Convert images (JPG, PNG, WEBP) to PDF documents online. Combine multiple photos into a single PDF file.",
    seoKeywords: ["image to pdf converter","jpg to pdf","convert photo to pdf","images to single pdf","Exismic"] },
  { id: 'pdf-to-word', name: 'PDF to Word', description: "Turn locked PDF documents back into editable documents so you can rewrite text, adjust tables, and make updates without starting from scratch.", category: 'pdf', icon: 'FileOutput' as IconName, href: '/tools/pdf/to-word',
    suggestions: ["Will it preserve complex tables and formatting?","Can I edit the text directly after converting?","How does it handle scanned documents?"], requiresFileUpload: true, acceptedFileTypes: ['application/pdf'], seoTitle: "PDF to Word Converter Online - Convert PDF to Editable Doc Free",
    seoDescription: "Convert PDF documents into editable Word (DOCX) files online while maintaining formatting.",
    seoKeywords: ["pdf to word converter","convert pdf to docx","editable pdf to word","free pdf to docx","Exismic"] },
  { 
    id: 'pdf-ocr', 
    name: 'OCR Extractor', 
    description: "Copy text directly out of book scans, photo receipts, and non-selectable PDFs. Turn printed words into editable text in a single click.", 
    category: 'pdf', 
    icon: 'ScanText' as IconName, 
    href: '/tools/pdf/ocr',
    suggestions: ["How accurate is it with handwritten text?","Does it support multiple languages?","Can it extract text from low-quality scans?"], 
    popular: true, 
    requiresFileUpload: true, 
    acceptedFileTypes: ['application/pdf', 'image/*'],
    seoTitle: "Online OCR Extractor - Convert Images & PDFs to Text Free",
    seoDescription: "The best free online OCR tool. Extract editable text from any image, scan, or PDF document with professional accuracy.",
    seoKeywords: ["pdf ocr extractor","extract text from pdf","scanned pdf text extractor","image ocr online","Exismic"]
  },

  // AI Magic
  { id: 'ai-writer', name: 'AI Writer', description: "Beat writer's block instantly. Draft creative blog posts, persuasive emails, video scripts, and marketing copy with an assistant that matches your tone.", category: 'ai', icon: 'Feather' as IconName, href: '/tools/ai/writer',
    suggestions: ["Write a prompt for a persuasive sales email","How can I change the tone to be more professional?","Can you help me expand on a short bullet point?"], popular: true, pro: true, isProTool: true, requiresFileUpload: false, seoTitle: "Free AI Content Writer - Generate Articles, Scripts & Copy with AI",
    seoDescription: "AI Writing Assistant & Article Generator. Create blog posts, essays, emails, and marketing copy in seconds.",
    seoKeywords: ["ai writer","ai essay generator","article writer online","ai content writer free","Exismic"] },
  { 
    id: 'ai-img-gen', 
    name: 'AI Image Generator', 
    description: "Type any creative prompt and bring it to life as vibrant digital art, photorealistic portraits, or fantasy landscapes with rich lighting.", 
    category: 'ai', 
    icon: 'ImageIcon' as IconName, 
    href: '/tools/ai/img-gen',
    suggestions: ["What are the best keywords for photorealism?","How do I specify the lighting and camera angle?","Help me fix weird hands or faces"], 
    popular: true, 
    pro: true, 
    isProTool: true, 
    proPowerPack: true,
    requiresFileUpload: false,
    seoTitle: "Free AI Image Generator - Create Stunning Art & Photos from Text",
    seoDescription: "The most powerful free AI image generator. Create professional art, photos, and designs simply by typing what you want to see.",
    seoKeywords: ["ai image generator","text to image ai","free ai art generator","flux Schnell image generator","Exismic"]
  },
  { id: 'ai-chat', name: 'AI Chat', description: "Brainstorm new project ideas, break down complicated topics into simple steps, and get instant answers from a friendly, knowledgeable creative partner.", category: 'ai', icon: 'MessagesSquare' as IconName, href: '/chat', indexable: false,
    suggestions: ["What kind of tasks can you help me with?","Can you remember context from earlier in the conversation?","How do I get you to adopt a specific persona?"], pro: true, isProTool: true, requiresFileUpload: false, seoTitle: "AI Chat Assistant - Smart Conversational AI with GPT Power",
    seoDescription: "Chat with smart AI models online. Ask questions, solve complex tasks, code, and brainstorm ideas.",
    seoKeywords: ["ai chat online","talk to ai","ai assistant chat","free ai chat bot","Exismic"] },
  {
    id: 'support-agent',
    name: 'Exismic Support Agent',
    description: "Give your business an always-on assistant that answers customer questions, troubleshoots problems, and guides visitors using your specific FAQs.",
    category: 'ai',
    icon: 'Bot' as IconName,
    href: '/tools/support-agent',
    suggestions: ["How do I upgrade my Exismic account?","Where can I find my billing history?","I found a bug, how do I report it?"],
    popular: false,
    hidden: true,
    indexable: false,
    requiresFileUpload: false,
    seoTitle: "Exismic Support Agent - AI Customer Support Chatbot Builder",
    seoDescription: "Build a premium AI support agent for your business website. Train Exismic with FAQs, documents, policies, and product details, then embed a chatbot in minutes.",
    seoKeywords: ["exismic support agent","ai customer support agent","help desk assistant","Exismic"]
  },
  { id: 'ai-logo', name: 'AI Logo Generator', description: "Create distinctive, modern logo concepts for your new brand, YouTube channel, or side project in seconds with customized colors and visual styles.", category: 'ai', icon: 'Stamp' as IconName, href: '/tools/ai/logo',
    suggestions: ["What styles are best for a tech startup?","How do I ensure the logo is minimalist?","Can I specify exact brand colors?"], pro: true, isProTool: true, requiresFileUpload: false, seoTitle: "Free AI Logo Generator - Create Professional Logos in Seconds",
    seoDescription: "Design professional vector AI logos for your business or brand. Input prompts and generate icon styles fast.",
    seoKeywords: ["ai logo generator","logo design ai","make logo online free","brand logo creator","Exismic"] },
  {
    id: 'landing-page-generator',
    name: 'AI Landing Page',
    description: "Describe your product or service and get a complete, eye-catching website layout with hero sections, benefit lists, and call-to-action buttons.",
    category: 'ai',
    icon: 'Layout' as IconName,
    href: '/tools/landing-page-generator',
    suggestions: ["Dark-themed SaaS dashboard","Fitness tracker app landing page","Creative agency portfolio website"],
    proPowerPack: true,
    requiresFileUpload: false,
    placeholderPrompt: 'Describe the landing page you want to generate (e.g., modern dark themed SaaS dashboard)...',
    seoTitle: "Free AI Landing Page Generator - Create HTML Templates Online",
    seoDescription: "Generate professional, responsive landing page drafts instantly with AI. Customize with prompts, preview in real time, and copy code.",
    seoKeywords: [
      "ai landing page generator",
      "generate html template ai",
      "free website generator",
      "prompt to landing page",
      "free html template maker"
    ]
  },
  {
    id: 'youtube-summarizer',
    name: 'YouTube AI Summarizer',
    description: "Paste any YouTube video link to get the core takeaways, timestamped bullet points, and key quotes without having to sit through an hour-long video.",
    category: 'ai',
    icon: 'PlaySquare' as IconName,
    href: '/tools/youtube-summarizer',
    suggestions: ["How to build a SaaS startup in 2026","Figma to Next.js full design tutorial","Intro to quantum computing"],
    proPowerPack: true,
    requiresFileUpload: false,
    placeholderPrompt: 'Paste your YouTube video link here (e.g. https://www.youtube.com/watch?v=...)',
    seoTitle: "Free YouTube AI Summarizer - Convert Video to Blog Post Online",
    seoDescription: "Transcribe and summarize YouTube videos instantly. Generate SEO-optimized blog posts, summaries, and social threads using AI for free.",
    seoKeywords: [
      "youtube ai summarizer",
      "convert video to blog post",
      "youtube transcript downloader",
      "youtube to blog post generator",
      "summarize youtube video ai"
    ],
    seoIntro: "Transform long YouTube videos, interviews, conference talks, and podcasts into structured summaries, timestamped highlights, and actionable takeaways in seconds.",
    howToSteps: [
      "Paste any public YouTube video link into the URL field above.",
      "Select your summary style (concise bullets, key insights, or timestamped breakdown).",
      "Review the generated overview and copy the summary notes or export to markdown."
    ],
    features: [
      "Timestamped Key Moments: Jumps straight to critical talking points with video timestamps.",
      "Core Takeaway Extraction: Condenses 60-minute presentations into a quick 2-minute digest.",
      "Speaker Quotes & Action Items: Isolates memorable quotes, statistics, and follow-up points.",
      "Direct URL Input: Runs immediately from any web link with zero video download required."
    ],
    faqs: [
      { question: "Do I need to download the video file?", answer: "No, simply paste the public YouTube video URL into the input field to summarize it immediately." },
      { question: "Can it summarize hour-long podcasts and university lectures?", answer: "Yes, our summarizer efficiently processes extended video transcripts into concise, chapter-based summaries." },
      { question: "Can I use the summary for study notes or content drafts?", answer: "Yes, you can copy the markdown or plain text output directly into Notion, Obsidian, or Google Docs." }
    ],
    useCases: [
      "Extracting quick research insights from technical podcasts and conference keynotes",
      "Reviewing lecture recordings and tutorial series before exams",
      "Turning video interviews into readable article summaries and social threads"
    ]
  },
  {
    id: 'qr-generator',
    name: 'Artistic AI QR Code',
    description: "Turn plain black-and-white QR squares into artistic, eye-catching visual art that people love scanning on posters, menus, and business cards.",
    category: 'ai',
    icon: 'QrCode' as IconName,
    href: '/tools/qr-generator',
    suggestions: ["Medieval castle oil painting","Cyberpunk neon street at night","Steampunk clockwork gear pattern"],
    proPowerPack: true,
    requiresFileUpload: false,
    placeholderPrompt: 'Describe the art style you want (e.g. medieval castle on a hill, oil painting)...',
    seoTitle: "Free Artistic AI QR Code Generator - Custom QR Art Online",
    seoDescription: "Generate stunning scannable AI QR codes for free. Blend URLs with Stable Diffusion art using our free QR Code ControlNet generator.",
    seoKeywords: [
      "artistic ai qr code",
      "ai qr code generator",
      "stable diffusion qr code",
      "controlnet qr code monster",
      "custom qr art generator"
    ]
  },
/*  {
    id: 'text-to-3d',
    name: 'Text-to-3D Generator',
    description: "Describe any object or prop and watch it generate as an interactive 3D model that you can spin, inspect, and drop into your creative projects.",
    category: 'ai',
    icon: 'Box' as IconName,
    href: '/tools/text-to-3d',
    suggestions: ["Chibi knight toy with gold shield","Cyberpunk futuristic laser gun","Cute miniature bonsai tree on table"],
    popular: true,
    proPowerPack: true,
    requiresFileUpload: false,
    placeholderPrompt: 'Describe the 3D model you want to generate (e.g. chibi knight toy with sword)...',
    seoTitle: "Free Text-to-3D Model Generator Online | Exismic",
    seoDescription: "Instantly convert text prompts into textured 3D meshes (GLB/OBJ). Use our free AI 3D object generator built on Stable Diffusion and TripoSR.",
    seoKeywords: [
      "text to 3d generator",
      "convert text to 3d mesh",
      "free ai 3d generator",
      "triposr online generator",
      "create glb mesh from text",
      "3d asset generator free"
    ]
  },*/
  {
    id: 'ambient-mixer',
    name: 'Cinematic Ambient Mixer',
    description: "Layer calming rain, crackling fires, soft winds, and synth waves into your ideal background soundscape for deep focus, studying, or winding down.",
    category: 'audio',
    icon: 'Headphones' as IconName,
    href: '/tools/ambient-mixer',
    suggestions: ["Cyberpunk coffee shop in the rain","Lofi beats on a spaceship library","Warm fireplace in a cozy cabin study"],
    popular: true,
    proPowerPack: true,
    requiresFileUpload: false,
    placeholderPrompt: 'Describe the style of background music you want (e.g. relaxing lofi piano, retro synthwave ambient)...',
    seoTitle: "Free Cinematic Ambient Mixer - Custom Audio Soundscapes",
    seoDescription: "Create the perfect audio atmosphere for studying or relaxing. Blend rain, fire, and cafe sounds with custom AI-generated music loops.",
    seoKeywords: [
      "ambient soundscape mixer",
      "relaxing study sounds",
      "ai music generator",
      "custom ambient noise machine",
      "ambient soundboard mixer"
    ],
    howToSteps: [
      "Choose an atmosphere preset like Rainy Coffee Shop, Forest Campfire, or Coastal Serenity.",
      "Fine-tune individual volume faders for Rain, Fireplace, Cafe, Forest, Night, and Ocean Waves.",
      "Set an optional focus or sleep timer, and download your 25-second seamless soundscape loop as a WAV asset."
    ],
    features: [
      "6 Infinite Organic Ambient Layers: Blend heavy rain, cozy fireplace, Parisian cafe, pine forest, night stars, and rolling ocean surf.",
      "Procedural In-Browser Synthesis: 100% reliable, infinite audio playback running locally on your device with zero server latency.",
      "Focus & Sleep Timer: Built-in 15m, 25m Pomodoro, 45m, and 60m focus timers with gentle fade-out.",
      "WAV Soundscape Export: Download your custom ambient mix as a seamless 16-bit 44.1kHz stereo WAV loop ready for study or videos."
    ],
    faqs: [
      {
        question: "Can I use downloaded soundscapes in YouTube videos and podcasts?",
        answer: "Yes, 100%. All soundscapes generated in Exismic are completely royalty-free and safe for commercial use and content creation."
      },
      {
        question: "Does the soundscape stop when my computer screen sleeps?",
        answer: "The in-browser Web Audio engine keeps playing continuously in your active browser tab until you pause or the timer finishes."
      },
      {
        question: "Can I adjust individual sound levels?",
        answer: "Yes! Every layer (Rain, Fire, Cafe, Forest, Night, Ocean) has its own independent fader, Mute, and Solo buttons."
      },
      {
        question: "How does the focus timer work?",
        answer: "Select your desired focus duration (e.g. 25-minute Pomodoro). When the timer counts down to zero, the audio gently fades out to signal your break."
      }
    ],
    useCases: [
      "Deep work, coding, and writing sessions without distracting spoken lyrics",
      "Fall-asleep soundscapes with rain and crackling fireplace on a timed fade-out",
      "Background atmosphere tracks for video games, tabletop RPGs, and relaxing YouTube streams"
    ],
    examples: [
      "Load Rainy Coffee Shop, boost Rain to 85%, and set a 25-minute focus timer for a productive study session."
    ],
    updatedAt: "2026-09-29T00:00:00.000Z"

  },

  // Productivity Tools
  {
    id: 'discord-card',
    name: 'Discord Profile Card Studio',
    description: "Generate an obsidian-styled, live-updating Discord profile website and dynamic GitHub README badge with real-time presence, Spotify player, and custom frames.",
    category: 'productivity',
    icon: 'IdCard' as IconName,
    href: '/tools/discord-card',
    popular: true,
    suggestions: ["How do I find my Discord User ID?", "How do I embed this card into my GitHub README?", "Can I export as a high-res PNG image?"],
    requiresFileUpload: false,
    seoTitle: "Discord Profile Card Generator - Live Presence, Spotify & Badges",
    seoDescription: "Create a live Discord profile website and dynamic GitHub README SVG badge with real-time status, Spotify sync, custom cosmetics, and 1-click PNG/HTML exports.",
    seoKeywords: ["discord profile card", "discord card generator", "discord github badge", "discord presence generator", "Exismic"],
    hidden: true,
    indexable: false,
  },
  { id: 'productivity-qr', name: 'QR Code Generator', description: "Build clean, scannable QR codes for your portfolio links, social profiles, WiFi networks, and shop menus with custom colors and logo inserts.", category: 'productivity', icon: 'QrCode' as IconName, href: '/tools/qr-code',
    suggestions: ["Can I change the color of the QR code?","How do I add my logo to the center?","Will this QR code expire?"], requiresFileUpload: false, seoTitle: "Free QR Code Generator - Create Custom QR Codes for Links & Text",
    seoDescription: "Create customized high-resolution QR codes with custom colors, logos, and styling. Download PNG or SVG instantly for free.",
    seoKeywords: ["qr code generator","custom qr code","qr code with logo","free qr maker","Exismic"],
    seoIntro: "Generate customized, high-contrast QR codes for websites, guest Wi-Fi networks, digital business cards (vCard), emails, and plain text. Download high-resolution PNG or clean vector SVG files ready for printing on flyers, menus, business cards, and digital screens.",
    howToSteps: [
      "Select what your QR code should open: a website URL, guest Wi-Fi network, digital business card, or plain text note.",
      "Enter your destination link, Wi-Fi password, or contact details in the fields provided.",
      "Customize your look: pick a pre-made color vibe or choose your own custom foreground and background colors.",
      "Add a brand logo: choose from popular social and web icons or upload your own transparent brand logo for the center.",
      "Test scan the code right on your screen with your smartphone camera, then download as high-resolution PNG or scalable vector SVG."
    ],
    features: [
      "Multi-Format Generator: Instant QR encoding for website links, automatic Wi-Fi connections, vCard contacts, emails, and phone numbers.",
      "Brand Logo Support: Add your custom company logo or pick from popular built-in icons with automatic center excavating.",
      "Live Presentation Mockups: Preview your QR code on a studio canvas, smartphone camera viewfinder, executive business card, and café table tent.",
      "High-Resolution & Vector Exports: Export up to 2,000px Ultra-HD PNG or scalable vector SVG for crisp printing at any size.",
      "Permanent & Free: Standard static QR codes encode your data directly into the pixel pattern, meaning they never expire and require zero subscriptions."
    ],
    faqs: [
      { question: "Will these QR codes ever expire?", answer: "No. These are static QR codes that directly store your destination URL, Wi-Fi credentials, or contact details directly in the pattern. They will work forever without any expiration dates or fees." },
      { question: "Can I add my business logo to the center?", answer: "Yes! You can choose from popular preset icons (like Wi-Fi, Globe, Instagram, LinkedIn) or drag and drop your own PNG or SVG logo. The generator automatically applies high error correction to keep the code 100% scannable." },
      { question: "What error protection level should I use?", answer: "For simple web links without a logo, Standard (7%) or Medium (15%) is great. If you embed a center logo or plan to print on rough materials, choose High (25%) or Maximum (30%) so the camera can scan the code even if part of it is covered." },
      { question: "Can I print these QR codes on business cards and posters?", answer: "Yes. You can download crisp PNG images up to 2,000px, or download a scalable vector SVG file that can be enlarged to billboard size in Adobe Illustrator, Figma, or Canva without losing quality." },
      { question: "How does the Wi-Fi QR code work?", answer: "When anyone points their iPhone or Android camera at your Wi-Fi QR code, a prompt pops up asking if they want to join your network. Tapping it connects them automatically without needing to type your password." }
    ],
    useCases: [
      "Café & Restaurant Menus: Display table tent QR codes for contactless digital menus and guest Wi-Fi access.",
      "Executive Business Cards: Print digital vCard QR codes on physical business cards for instant contact saving.",
      "Event Posters & Flyers: Direct attendees to ticket links, schedules, and social media hubs.",
      "Product Packaging: Guide customers to setup guides, warranties, and review pages."
    ],
    limitations: [
      "Static Destination: Because data is encoded directly into the pattern, you cannot change the destination URL after printing without reprinting.",
      "Contrast Requirements: Always keep sufficient contrast between code pixels and the background to guarantee fast smartphone detection."
    ] },
  { id: 'productivity-passgen', name: 'Password Generator', description: "Generate random passwords with your chosen length, letters, numbers, and symbols for your accounts.", category: 'developer', icon: 'KeyRound' as IconName, href: '/tools/productivity/passgen',
    suggestions: ["What makes a password truly secure?","How many characters should I use?","Can I exclude ambiguous characters like I and l?"], requiresFileUpload: false, seoTitle: "Secure Password Generator - Create Strong & Unique Passwords Free",
    seoDescription: "Generate strong, cryptographically secure passwords online with customizable length and symbol parameters.",
    seoKeywords: ["password generator","strong password maker","secure password generator","random password tool","Exismic"],
    seoIntro: "Generate cryptographically secure passwords with custom character lengths, numeric sets, and special punctuation. Generated entirely within local browser memory with zero server telemetry.",
    howToSteps: [
      "Select your desired password length using the slider (12 to 64 characters recommended).",
      "Toggle your character rule preferences: uppercase letters, lowercase, numbers, or symbols.",
      "Click 'Generate Password' to create a high-entropy string, then click 'Copy' to use it securely."
    ],
    features: [
      "Cryptographically Secure Entropy: Uses browser crypto.getRandomValues for true statistical randomness.",
      "Client-Side In-Memory Generation: Passwords never touch an external server or database.",
      "Ambiguous Character Filter: Easily exclude visually identical characters like O and 0 or l and 1.",
      "Instant Strength Meter: Visual feedback showing estimated crack time and entropy rating."
    ],
    faqs: [
      { question: "Are my generated passwords transmitted or saved anywhere?", answer: "Never. Passwords are generated exclusively on your local device using the browser Web Crypto API and are never stored or logged." },
      { question: "What password length does Exismic recommend?", answer: "For general web accounts, at least 16 characters with mixed symbols and digits is recommended to prevent brute-force cracking." },
      { question: "Can I use this password generator offline or on my phone?", answer: "Yes, the tool works completely client-side across all modern desktop, tablet, and mobile browsers." }
    ],
    useCases: [
      "Creating strong master passwords for password managers",
      "Securing database credentials, SSH keys, and cloud API tokens",
      "Generating unique, unguessable passwords for social and business accounts"
    ],
    limitations: [
  "No password is unhackable. Use a different password for each account and save it in a password manager."
],
    examples: [
  "Generate a long password with letters, numbers, and symbols for a new account; do not reuse it elsewhere."
],
    updatedAt: "2026-09-29T00:00:00.000Z"
  },
  { id: 'productivity-units', name: 'Unit Converter', description: "Easily convert between inches, meters, kilograms, cups, Fahrenheit, and dozens of everyday measurements with instant, error-free results.", category: 'student', icon: 'Ruler' as IconName, href: '/tools/productivity/units',
    suggestions: ["How do I convert complex derived units?","Does it support metric to imperial conversions?","Can I save my most used conversions?"], requiresFileUpload: false, seoTitle: "Online Unit Converter - Convert Length, Weight, Temp & More Free",
    seoDescription: "Convert length, weight, temperature, data speed, and currency units online instantly.",
    seoKeywords: ["unit converter","convert measurement units","length converter","weight unit converter","Exismic"],
    seoIntro: "Convert length, mass, temperature, area, volume, and digital storage units accurately with real-time bidirectional calculations and exact formula breakdowns.",
    howToSteps: [
      "Choose your unit category (such as length, weight, temperature, or data storage).",
      "Type the numerical value you want to convert into the input box.",
      "Select your target unit to see the instant converted result and mathematical formula."
    ],
    features: [
      "Instant Bidirectional Conversion: Results update in real time as you adjust numbers.",
      "Metric and Imperial Support: Seamlessly switch between inches, centimeters, pounds, kilograms, and Celsius/Fahrenheit.",
      "High Decimal Precision: Exact scientific precision with zero rounding distortions.",
      "Formula Reference Display: Displays the exact conversion multiplier and formula used."
    ],
    faqs: [
      { question: "Which measurement systems are supported?", answer: "Both the Metric System (SI) and Imperial / US Customary systems are fully supported across all categories." },
      { question: "How are temperature conversions calculated?", answer: "Temperature conversions apply official offset formulas: °F = (°C × 9/5) + 32 and K = °C + 273.15." },
      { question: "Does the unit converter work on smartphones?", answer: "Yes, the interface is completely responsive and operates instantly on all phones and tablets." }
    ],
    useCases: [
      "Converting international cooking recipes between grams, ounces, and cups",
      "Switching engineering drawings between inches and millimeters",
      "Converting international travel weather forecasts between Celsius and Fahrenheit"
    ],
    limitations: [
  "Check the selected units and rounding before using a result in precision work."
],
    examples: [
  "Convert 10 inches to centimeters, then reverse the units to check the conversion."
],
    updatedAt: "2026-09-29T00:00:00.000Z"
  },
  { id: 'productivity-palette', name: 'Color Palette Studio', description: "Discover beautiful color combinations and harmonious themes for your next design, brand identity, or website mockup with one-click hex copies.", category: 'productivity', icon: 'Palette' as IconName, href: '/tools/productivity/palette',
    suggestions: ["Help me generate a cyberpunk color scheme","What are the rules of color harmony?","How do I export this palette to Tailwind?"], requiresFileUpload: false, seoTitle: "AI Color Palette Generator - Create Beautiful Color Schemes Online",
    seoDescription: "Generate harmonious color palettes, extract dominant colors from images, and export HEX/RGB color codes.",
    seoKeywords: ["color palette generator","hex color picker","color scheme creator","palette from image","Exismic"],
    popular: true,
    seoIntro: "Create balanced, accessible color schemes for digital products, brand identities, slide decks, and creative art. Roll random harmonious combinations with the spacebar, lock your favorite tones, extract color palettes directly from uploaded photos, and export clean CSS, Tailwind config, vector SVG, or studio-ready 1600x900 PNG graphics.",
    howToSteps: [
      "Roll new palettes: click 'Shuffle Colors' or press your keyboard Spacebar to instantly explore fresh, balanced color combinations.",
      "Lock your favorite colors: tap the Lock icon on any swatch to keep that tone frozen while continuing to roll complementary colors around it.",
      "Fine-tune your shades: click the color pipette to pick an exact custom tone, or open 'Shades' to view 5 lighter and darker tonal steps.",
      "Preview in real interfaces: switch between Website, Mobile App, and Brand Kit preview tabs to see how your colors perform together in practical layouts.",
      "Export code or assets: copy CSS custom properties, Tailwind theme configs, or download high-resolution PNG cards and vector SVGs ready for production."
    ],
    features: [
      "Instant Spacebar Shuffling: Fast, fluid keyboard-driven palette exploration with undo and redo history support.",
      "Smart Color Harmony Modes: Switch between Balanced, Analogous, High Contrast, Monochrome, Triadic, Soft Pastel, and Dark Mode themes.",
      "Automatic Accessibility Ratings: Built-in WCAG contrast calculations show whether white or dark text offers AAA readability on every swatch.",
      "Photo Palette Extractor: Drag and drop any image or design screenshot to pull its 5 most prominent colors in-browser with zero server wait.",
      "Live Product Mockups: Interactive website hero card, mobile notification widget, and brand token previews show real-world application."
    ],
    faqs: [
      { question: "How do I lock a color while shuffling the rest?", answer: "Click the 'Lock' button at the top of any color swatch. Once locked, that color stays fixed in place while the other swatches continue to shuffle when you click Shuffle or press Spacebar." },
      { question: "Can I extract a palette from a photo or logo?", answer: "Yes! Drag and drop any PNG, JPG, or WebP photo into the 'Extract Palette from Image' dropzone. The tool analyzes the image pixels directly in your browser and extracts 5 dominant colors instantly." },
      { question: "How do I export this palette to my code?", answer: "Choose your preferred format in the Export section: CSS Custom Properties, Tailwind CSS theme colors, SCSS variables, or clean JSON. You can copy the code snippet with one click." },
      { question: "Are these color combinations accessible for reading?", answer: "Every color swatch includes an automatic contrast indicator that measures brightness and tells you whether dark or white text passes standard readability guidelines (such as AAA or AA standards)." },
      { question: "Can I share my palette with a teammate or client?", answer: "Yes. Click 'Share Link' in the top bar to copy a direct URL containing your exact color codes. Anyone who opens the link will see your exact palette loaded in the studio." }
    ],
    useCases: [
      "Web & Mobile App Design: Generate accessible background, text, primary CTA, and accent colors for responsive interfaces.",
      "Brand Identity & Logo Styling: Establish cohesive 5-color brand identity guidelines with primary, secondary, and neutral swatches.",
      "Marketing Graphics & Social Media: Pick eye-catching, high-contrast color pairs for YouTube thumbnails, Instagram carousels, and presentation decks.",
      "Interior & Event Moodboards: Extract real-world colors from photos and moodboard images for physical and digital creative projects."
    ],
    updatedAt: "2026-09-29T00:00:00.000Z"
  },
  { id: 'productivity-json', name: 'JSON Formatter', description: "Clean up jumbled, one-line data feeds into tidy, colorful, well-spaced layouts that are effortless to read, inspect, and copy into your projects.", category: 'developer', icon: 'Braces' as IconName, href: '/tools/productivity/json',
    suggestions: ["How do I fix a trailing comma error?","Can it minify the JSON instead of formatting it?","Does it support sorting the keys alphabetically?"], requiresFileUpload: false, seoTitle: "Online JSON Formatter & Validator - Pretty Print JSON Free",
    seoDescription: "Validate, format, prettify, and minify JSON data online with syntax error highlighting.",
    seoKeywords: ["json formatter","prettify json","json validator","json minifier","Exismic"] },

  {
    id: 'typing-test',
    name: 'Typing Speed Tester',
    description: "Put your fingers to the test with fun typing drills. Track your words per minute, beat your personal records, and sharpen your keyboard speed.",
    category: 'productivity',
    icon: 'Keyboard' as IconName,
    href: '/tools/typing-test',
    suggestions: ["What is considered a good WPM score?","How can I improve my accuracy?","Should I focus on speed or avoiding mistakes?"],
    popular: true,
    proPowerPack: true,
    requiresFileUpload: false,
    seoTitle: "Free Typing Speed Test - WPM, Accuracy & Keystroke Heatmap | Exismic",
    seoDescription: "Test your typing speed (WPM), accuracy, and consistency online for free. Real-time feedback, mechanical keyboard sounds, ghost pace, and mistake heatmap.",
    seoKeywords: ["typing speed test", "wpm test online", "typing accuracy trainer", "keyboard speed test", "typing test 60 seconds", "typing heatmap", "Exismic"],
    seoIntro: "Measure your real-world typing velocity, accuracy, and typing cadence with interactive text prompts across technology, coding, storytelling, and motivation. Includes optional mechanical keyboard sound feedback and an illuminated keystroke mistake heatmap.",
    howToSteps: [
      "Select your preferred test duration (30s Sprint, 60s Classic, 120s Endurance, or Endless Flow) and topic.",
      "Click into the text arena or immediately start typing the text in front of you.",
      "Monitor your live words per minute (WPM), accuracy, and rhythm in the real-time telemetry HUD.",
      "Review your celebratory scorecard, keystroke heatmap, and download your verified share card."
    ],
    features: [
      "Real-Time Telemetry HUD: Instant live measurement of net WPM, accuracy %, typing rhythm %, and remaining time.",
      "Synthesized Mechanical Switch Audio: Optional tactile click and thock sound effects with zero latency ($0 audio files).",
      "Interactive Keystroke Mistake Heatmap: Visual QWERTY keyboard matrix highlighting keys with frequent mistypes.",
      "Ghost Pace Challenge: Race against a simulated 125 WPM top typist to push your speed limits.",
      "Daily Practice Drills & Streak Counter: Daily challenges to build permanent keyboard muscle memory.",
      "1-Click Verification Card Export: Download high-resolution 1200x700 PNG share cards with your verified test results."
    ],
    faqs: [
      {
        question: "What is considered a good typing speed (WPM)?",
        answer: "The average global typing speed is around 40 WPM. Speeds between 50 to 70 WPM are considered fast and productive for office work. Speeds above 80 to 100+ WPM place you in the top 5% of elite typists worldwide."
      },
      {
        question: "How is net WPM calculated?",
        answer: "Net WPM is calculated using the standard formula: (Total Correct Characters / 5) / Elapsed Minutes. Only accurately typed characters count toward your net speed."
      },
      {
        question: "Should I focus on typing speed or accuracy first?",
        answer: "Always focus on maintaining 96%+ accuracy first. When you minimize backspacing and hesitation, your speed naturally accelerates through smooth muscle memory."
      }
    ],
    useCases: [
      "Professional Productivity: Increase email, document, and report drafting speed.",
      "Software Development: Practice fluid symbol and coding syntax transitions.",
      "Student Exam Prep: Build speed for timed essays and academic assignments.",
      "Keyboard Enthusiasts: Test different switches and keycap profiles with tactile audio feedback."
    ],
    limitations: [
      "WPM scores on mobile devices or tablets with touch screens will differ from physical desktop keyboards."
    ],
    examples: [
      "30-Second Sprint: High-intensity burst to measure maximum raw velocity.",
      "60-Second Classic: Standard benchmark for balanced speed and endurance.",
      "Coding Snippets: Practice real programming statements with brackets and operators."
    ]
  },
  {
    id: 'resume-builder',
    name: 'Resume / CV Builder',
    description: "Build a polished, modern resume that hiring managers love reading. Pick a clean layout, organize your experience, and download a ready-to-send PDF.",
    category: 'productivity',
    icon: 'FileUser' as IconName,
    href: '/tools/resume-builder',
    suggestions: ["What keywords will get past the ATS?","How do I summarize a 10-year career?","Should I include a photo on my resume?"],
    popular: true,
    pro: true,
    isProTool: true,
    seoTitle: "AI Resume Builder - Create Professional ATS Resumes Online",
    seoDescription: "The most powerful AI resume builder. Create professional, ATS-friendly resumes in minutes with AI content suggestions and modern templates.",
    seoKeywords: ["resume builder","cv maker free","ai resume builder","professional cv template","Exismic"]
  },
  {
    id: 'resume-analyzer',
    name: 'AI Resume Scanner',
    description: "See how well your resume matches your dream job opening. Get friendly suggestions on missing skills and keyword improvements before you apply.",
    category: 'productivity',
    icon: 'ScanSearch' as IconName,
    href: '/tools/resume-analyzer',
    suggestions: ["How do I improve my resume's ATS match score?","Which keywords am I missing for this job description?","Is my resume format standard and readable?"],
    popular: true,
    proPowerPack: true,
    requiresFileUpload: true,
    acceptedFileTypes: ['application/pdf'],
    seoTitle: "Free AI Resume Scanner & ATS Checker Online | Exismic",
    seoDescription: "Upload your PDF resume and target job description to get a free ATS compatibility score. Match key terms, find missing keywords, and optimize your resume to pass corporate filters.",
    seoKeywords: [
      "ats resume checker",
      "free ats scanner",
      "resume optimizer for job description",
      "ats compatibility check",
      "resume ats score online",
      "how to make resume ats friendly",
      "free resume scanner",
      "ats resume analyzer",
      "job match resume checker"
    ],
    seoIntro: "Benchmark your resume against target job postings. Exismic AI checks your document formatting, scans for critical role keywords, and scores your experience alignment so you stand out to hiring managers.",
    features: [
      "Dual Input: Upload PDF resumes or paste resume text directly",
      "Instant 1-Click Career Blueprints for Engineering, Design, Product, and Marketing",
      "Comprehensive Match Scoring: Format Readability, Measurable Impact, and Skill Alignment",
      "Skills & Keywords: See matched role terms and recommended missing skills",
      "Direct Bridge to AI Resume Builder to apply fixes in one click",
      "Private and Secure: In-memory analysis with 0% data retention"
    ],
    howToSteps: [
      "Upload your PDF resume or paste your resume text into the editor.",
      "Paste the job description of the position you want to apply for, or click 'Auto-Draft With AI'.",
      "Click 'Run Job Match Scan' to receive an instant compatibility breakdown, missing keywords, and actionable recommendations."
    ],
    faqs: [
      {
        question: "How does the AI Resume Scanner evaluate my resume?",
        answer: "The scanner compares your resume text against the requirements in the job description. It analyzes whether you have the necessary keywords, evaluates whether your work experience bullets contain measurable outcomes, and checks standard layout readability."
      },
      {
        question: "Can I use the scanner without uploading a PDF file?",
        answer: "Yes! You can toggle to 'Paste Text' to paste raw resume text directly, or click any of the 4 instant career blueprints to test the scan immediately."
      },
      {
        question: "Is my resume kept private and secure?",
        answer: "Yes. All resumes and job postings are processed securely in memory and are never saved to public databases or shared with third parties."
      },
      {
        question: "How can I fix the missing keywords identified in the report?",
        answer: "You can click 'Fix in Builder' to immediately open our AI Resume Builder where you can add missing skills, rewrite experience bullets, and export a polished A4 PDF."
      }
    ],
    useCases: [
      "Job Seekers: Tailor resumes for specific company openings to increase interview callbacks.",
      "Career Switchers: Identify transferable skill gaps when moving into a new industry or role.",
      "College Grads: Verify that student resumes meet industry standards and corporate hiring criteria."
    ],
  },
  { 
    id: 'invoice-generator', 
    name: 'Invoice Generator', 
    description: "Create beautiful, branded invoices for your freelance clients in minutes. Add your logo, list your deliverables, calculate totals, and save as PDF.", 
    category: 'productivity', 
    icon: 'Receipt' as IconName, 
    href: '/tools/invoice-generator',
    suggestions: ["What essential details must an invoice have?","How do I add tax and discounts?","Can I save my company details for next time?"], 
    popular: true,
    seoTitle: "Free Professional Invoice Generator - Create & Download Invoices Online",
    seoDescription: "The best free invoice generator for freelancers and small businesses. Create professional, branded invoices with tax calculations and custom templates.",
    seoKeywords: ["invoice generator free","online invoice maker","pdf invoice generator","freelance billing template","Exismic"],
    seoIntro: "Draft, calculate, and download professional client invoices in seconds. Includes multi-currency support, custom tax rates, discount deductions, brand logo uploads, and 1-click A4 PDF export with zero server delays.",
    features: [
      "6 Instant 1-Click Blueprints for Design, Web Development, Marketing, Consulting, Video, and E-Commerce",
      "Multi-Currency Support: USD ($), EUR (€), GBP (£), INR (₹), JPY (¥), AUD (A$), and CAD (C$)",
      "Accurate Line-Item Math: Auto-calculated item quantities, prices, subtotals, taxes, and discounts",
      "4 Designer Templates: Modern Minimalist, Executive Enterprise, Studio Bold, and Clean Compact",
      "Custom Brand Identity: Upload company logos and customize invoice accent colors with 1-click presets",
      "AI Fast Draft: Describe project deliverables in plain English to auto-populate invoices instantly",
      "100% Client-Side Privacy: Invoice calculations and PDF rendering happen locally in your browser"
    ],
    howToSteps: [
      "Select an instant invoice blueprint or enter your company and client billing information.",
      "Add your deliverables, quantities, and rates. Configure sales tax, payment terms, or discounts if needed.",
      "Upload your brand logo, choose an invoice template, and pick an accent color matching your brand.",
      "Preview your invoice in real-time, then click 'Download PDF' to export an official print-ready A4 invoice."
    ],
    faqs: [
      {
        question: "Are the generated invoices free to download?",
        answer: "Yes! Creating, editing, and exporting high-resolution PDF invoices is 100% free with no watermarks."
      },
      {
        question: "Is my business and financial data kept secure?",
        answer: "Yes. All invoice calculations and PDF compilations are performed directly inside your web browser. Your client data, prices, and tax numbers are never sold or stored on public servers."
      },
      {
        question: "Can I customize the payment terms and currency?",
        answer: "Absolutely. You can select from 7 major international currencies (USD, EUR, GBP, INR, JPY, AUD, CAD) and specify payment terms such as Net 14, Net 30, Due on Receipt, or custom milestones."
      },
      {
        question: "How do I save my invoice to edit later?",
        answer: "Click 'Save Draft' at the top of the studio. Your invoice draft is saved securely to your device so you can return and make adjustments anytime."
      }
    ],
    useCases: [
      "Freelancers & Contractors: Bill clients for hourly consulting, creative design sprints, or dev milestones with zero hassle.",
      "Agencies & Studios: Issue branded, multi-item invoices with custom tax rates, payment terms, and direct bank transfer instructions.",
      "Small Businesses & Merchants: Generate instant receipts and itemized invoices for physical merchandise or service packages."
    ]
  },
  {
    id: 'social-caption-generator',
    name: 'Social Caption Gen',
    description: "Upload any photo and get catchy, ready-to-post captions with great hooks, emojis, and hashtags tailored for Instagram, TikTok, and LinkedIn.",
    category: 'ai',
    icon: 'MessageSquarePlus' as IconName,
    href: '/tools/social-caption-generator',
    suggestions: ["Write an engaging hook for a lifestyle post","How long should an Instagram caption be?","Should I put hashtags in the caption or comments?"],
    pro: true,
    isProTool: true,
    requiresFileUpload: true,
    acceptedFileTypes: ['image/*'],
    seoTitle: "AI Social Media Caption Generator - Create Viral Captions with AI",
    seoDescription: "Generate engaging, platform-optimized social media captions using AI. Support for Instagram, Twitter, LinkedIn, and more with vision-aware context analysis.",
    seoKeywords: ["social caption generator","instagram caption writer","ai caption maker","Exismic"]
  },
  // 🔥 AI & Writing
  {
    id: 'ai-humanizer',
    name: 'AI Humanizer',
    description: "Turn stiff, robotic writing into warm, natural, and engaging sentences that sound genuinely human and connect with your real-world readers.",
    category: 'ai',
    icon: 'UserCheck' as IconName,
    href: '/tools/ai-humanizer',
    popular: true,
    suggestions: ["Make this essay sound natural and conversational", "Humanize AI generated article for a blog", "Adjust perplexity to pass AI detectors"],
    seoTitle: "Free AI Text Humanizer - Convert AI Content to Natural Human Writing",
    seoDescription: "Bypass AI detectors with our AI Text Humanizer. Rewrite ChatGPT, Claude, and Gemini text into authentic, natural-sounding human writing.",
    seoKeywords: ["ai humanizer","humanize ai text","bypass ai detection","make ai text sound human","Exismic"],
    seoIntro: "Transform formulaic, repetitive AI drafts into warm, authentic, and naturally flowing prose. Improves sentence variety, rhythm, and vocabulary while preserving your core meaning.",
    howToSteps: [
      "Paste your AI-generated text or draft into the input workspace above.",
      "Select your desired writing tone, conversational style, and humanization strength.",
      "Click 'Humanize Text' and copy your polished, authentic writing with 1 click."
    ],
    features: [
      "Natural Rhythm & Cadence: Breaks up robotic sentence structure with varied lengths and clauses.",
      "Nuanced Vocabulary Replacement: Swaps repetitive AI cliches with conversational expressions.",
      "Preserves Core Meaning: Keeps your underlying facts, statistics, and arguments completely intact.",
      "Detector-Bypassing Quality: Rewrites syntax to read naturally to both human reviewers and AI classifiers."
    ],
    faqs: [
      { question: "How does the AI Humanizer make text sound genuinely human?", answer: "It introduces varied sentence pacing, organic transitions, and context-appropriate vocabulary while removing typical repetitive AI patterns." },
      { question: "Will humanizing change my key facts or data?", answer: "No. The humanizer preserves your message, technical accuracy, and key arguments while rephrasing the sentence flow." },
      { question: "Are my documents kept private?", answer: "Yes, all processing is private and temporary. Your writing is never saved, shared, or used for model training." }
    ],
    useCases: [
      "Refining AI-drafted blog articles and newsletters to sound relatable",
      "Polishing academic drafts, personal essays, and cover letters",
      "Humanizing corporate announcements and social media copy"
    ]
  },
  {
    id: 'ai-detector',
    name: 'AI Content Detector',
    description: "Check your writing to spot sentences that feel generic or computer-generated, with highlighted areas you can tweak for a more authentic voice.",
    category: 'ai',
    icon: 'ShieldCheck' as IconName,
    href: '/tools/ai-detector',
    suggestions: ["Is this essay written by ChatGPT?", "Scan article for AI text", "Check paragraph authenticity"],
    seoTitle: "Free AI Content Detector - Scan Text for ChatGPT & AI Writing",
    seoDescription: "Accurately check if text was generated by AI models like ChatGPT, GPT-4, or Claude. Get sentence-by-sentence analysis and confidence scores.",
    seoKeywords: ["ai detector","ai content checker","gpt detector free","check ai text","Exismic"],
    seoIntro: "Inspect essays, articles, and copy for markers of computer-generated text. Analyzes perplexity, sentence uniformity, and linguistic patterns across major AI models.",
    howToSteps: [
      "Paste your text, essay, or article into the detector input field above.",
      "Click 'Scan Text' to initiate the deep linguistic pattern analysis.",
      "Review the overall probability score and sentence-by-sentence authenticity highlights."
    ],
    features: [
      "Multi-Model Analysis: Evaluates linguistic markers from ChatGPT, GPT-4o, Claude 3.5, and Gemini.",
      "Sentence-Level Highlighting: Identifies specific robotic passages that need human refinement.",
      "Perplexity & Burstiness Scoring: Measures word predictability and sentence length distribution.",
      "Zero Data Retention: Your submitted text is never stored, indexed, or used to train models."
    ],
    faqs: [
      { question: "How does the AI detector identify computer-generated text?", answer: "It evaluates perplexity (word predictability) and burstiness (variation in sentence structure). AI text tends to be mathematically uniform, while human writing features natural rhythm and varied vocabulary." },
      { question: "Can it detect writing from ChatGPT, Claude, and Gemini?", answer: "Yes, it analyzes characteristic probabilistic patterns common to all modern Large Language Models." },
      { question: "Is my text kept confidential when scanned?", answer: "Yes. All analysis is performed transiently in memory; your content is never stored or added to any public database." }
    ],
    useCases: [
      "Verifying student essays and assignments for authentic human authorship",
      "Screening freelance articles and client deliverables for originality",
      "Checking your own drafts before submission to avoid false-positive AI flags"
    ],
    limitations: [
  "Detection is an estimate and can misclassify both human and AI writing. Do not use the result alone to accuse someone of misconduct."
],
    examples: [
  "Compare a short draft with a revised version and treat the score as one signal, not proof of authorship."
],
    updatedAt: "2026-09-29T00:00:00.000Z"
  },
  {
    id: 'grammar-checker',
    name: 'Grammar & Style Checker',
    description: "Catch awkward phrasing, typos, and punctuation slips before you hit send. Polish your writing with friendly suggestions that keep your natural voice.",
    category: 'ai',
    icon: 'SpellCheck' as IconName,
    href: '/tools/grammar-checker',
    suggestions: ["Fix grammar and spelling in this paragraph", "Improve vocabulary and tone", "Check for passive voice"],
    seoTitle: "Free AI Grammar Checker & Style Editor Online",
    seoDescription: "Check grammar, spelling, punctuation, and writing style online. Improve sentence clarity and tone with AI-powered corrections.",
    seoKeywords: ["grammar checker online","spell checker free","writing style checker","Exismic"]
  },
  {
    id: 'resume-bullet-generator',
    name: 'Resume Bullet Generator',
    description: "Turn your daily job tasks into powerful, achievement-driven bullet points that show the real impact and results you delivered to your past teams.",
    category: 'productivity',
    icon: 'ListPlus' as IconName,
    href: '/tools/resume-bullet-generator',
    popular: true,
    suggestions: ["Create resume bullets for a Senior Software Engineer", "Write metric-driven bullets for a Marketing Manager", "Turn simple tasks into high-impact STAR achievements"],
    seoTitle: "Free AI Resume Bullet Point Generator - Action-Oriented Resume Bullets | Exismic",
    seoDescription: "Generate metric-driven, ATS-optimized resume bullet points using the STAR method for any job title. Transform everyday tasks into high-impact career achievements.",
    seoKeywords: ["resume bullet point generator", "action verbs for resume", "ai resume points maker", "star method resume bullets", "quantified resume achievements", "Exismic"],
    seoIntro: "Craft impactful, achievement-driven resume bullet points that grab hiring managers' attention. Transform routine responsibilities into quantified accomplishments using proven frameworks like the STAR method and the Google XYZ formula.",
    howToSteps: [
      "Select an instant career blueprint or enter your target job title and seniority level.",
      "Add your core skills, tools, and a brief description of the project or responsibility you handled.",
      "Choose your preferred formula (STAR Method, Google XYZ Formula, or Executive High-Yield).",
      "Click Generate to synthesize 5 high-impact, metric-driven accomplishment bullet points.",
      "Review the highlighted action verbs and quantified metrics, edit in-place, and copy or transfer directly to your resume."
    ],
    features: [
      "STAR Framework Structure: Automatically organizes achievements into clear Situation, Task, Action, and Result components.",
      "Action Verb Highlighting: Identifies and elevates passive wording into persuasive, high-impact career power verbs.",
      "Quantified Metrics Detection: Ensures every bullet point features measurable numbers, percentages, or saved resources.",
      "1-Click Role Blueprints: Instant access to pre-tested career profiles across engineering, design, marketing, and management.",
      "Resume Builder Transfer: Seamlessly pipe generated accomplishments directly into the Exismic Resume Builder with one click."
    ],
    faqs: [
      {
        question: "What is the STAR method for resume bullet points?",
        answer: "STAR stands for Situation, Task, Action, and Result. It is the gold standard framework used by recruiters to understand the context of your work, what you personally executed, and the measurable outcome you produced for your team or organization."
      },
      {
        question: "What is the Google XYZ formula for resume writing?",
        answer: "Developed by Google recruiters, the formula follows: 'Accomplished [X] as measured by [Y], by doing [Z]'. It forces you to lead with your achievement and immediately back it up with quantifiable proof."
      },
      {
        question: "How many bullet points should I put under each job on my resume?",
        answer: "Aim for 3 to 5 concise bullet points for your most recent or relevant roles, and 2 to 3 bullet points for earlier positions. Each bullet should be 1 to 2 lines long and showcase a distinct achievement."
      },
      {
        question: "Can I transfer these bullets directly to my resume?",
        answer: "Yes. You can copy individual bullets, copy the complete set formatted with standard resume dots, or click 'Transfer to Resume Builder' to open your bullet points inside our free resume studio."
      }
    ],
    useCases: [
      "Job Applications & Career Pivots: Tailor your accomplishments to match exact keywords in target job descriptions.",
      "Annual Performance Reviews: Document your key wins, project milestones, and quantifiable business contributions.",
      "LinkedIn Experience Updates: Refresh your profile headline and job descriptions with punchy, metric-backed summary points.",
      "Executive & Freelance Portfolios: Present high-level deliverables and client revenue impacts in a clean, professional format."
    ],
    limitations: [
      "The tool generates realistic metric estimates based on your input; always ensure the final numbers accurately reflect your true achievements."
    ],
    examples: [
      "Engineering: 'Architected high-throughput Next.js and Node.js microservices, decreasing API latency by 42% and supporting 250,000 daily active users.'",
      "Product Design: 'Revamped onboarding user flow across mobile and web platforms, lifting free-to-paid conversion rates by 28% in 60 days.'",
      "Marketing & Growth: 'Spearheaded paid acquisition and organic SEO campaigns, generating $1.2M in annual recurring revenue at a 35% lower cost-per-lead.'"
    ],
    updatedAt: "2026-09-30T00:00:00.000Z"
  },
  {
    id: 'email-reply-generator',
    name: 'Email Reply Generator',
    description: "Never stress over a tricky email again. Draft polite, professional, and persuasive replies in seconds whether you are saying yes, negotiating, or declining.",
    category: 'ai',
    icon: 'MailCheck' as IconName,
    href: '/tools/email-reply-generator',
    suggestions: ["Reply politely declining a meeting invitation", "Draft a professional follow-up on a job interview", "Write a confident salary negotiation reply"],
    seoTitle: "Free AI Email Reply Generator - Smart Quick Responses",
    seoDescription: "Generate professional email replies instantly. Choose tone, response intent, and key details for flawless email communication.",
    seoKeywords: ["email reply generator","ai email writer","professional email responder","Exismic"]
  },
  {
    id: 'cover-letter-generator',
    name: 'Cover Letter Generator',
    description: "Draft a personalized, enthusiastic cover letter that highlights why you're a great fit for the company, without sounding like a boring template.",
    category: 'productivity',
    icon: 'MailPlus' as IconName,
    href: '/tools/cover-letter-generator',
    popular: true,
    suggestions: ["Write a cover letter for Product Manager role", "Tailor cover letter to tech startup company", "Highlight 5 years of leadership experience"],
    seoTitle: "Free AI Cover Letter Generator - Tailored Job Applications | Exismic",
    seoDescription: "Create personalized, professional cover letters tailored to any job opening in minutes with AI. Pick your tone, highlight key accomplishments, and impress hiring teams.",
    seoKeywords: ["cover letter generator", "ai cover letter writer", "job application letter maker", "custom cover letter", "tailored cover letter tool", "Exismic"],
    seoIntro: "Generate customized, persuasive cover letters that connect your authentic career background directly to a company's specific job requirements. Choose your desired tone, highlight quantifiable wins, and preview a clean, formal letterhead ready to copy or download.",
    howToSteps: [
      "Select an instant role blueprint or enter your target job title, target company, and applicant name.",
      "Paste the job description or key responsibilities from the target listing.",
      "Summarize your relevant career experience, key accomplishments, or core technical skills.",
      "Select your preferred tone (Confident, Professional Executive, Enthusiastic, or Concise) and format length.",
      "Click Generate to synthesize your tailored cover letter, edit directly on the live document preview, and download or copy with 1 click."
    ],
    features: [
      "Targeted Company Alignment: Seamlessly weaves the company's specific mission, product challenges, and values into your narrative.",
      "Tone & Voice Customization: Choose between Confident, Professional Executive, Enthusiastic, and Concise fast-read styles.",
      "Live Formal Letterhead View: Previews your letter with standard business date, candidate address, company info, and formal salutation.",
      "In-Place Document Editing: Refine phrases, add personal touches, or customize paragraphs directly on the live document.",
      "1-Click Blueprint Gallery: Instant access to pre-tested cover letters for engineering, design, product, marketing, AI, and operations."
    ],
    faqs: [
      {
        question: "Do employers still read cover letters in 2026?",
        answer: "Yes. While automated applicant tracking systems scan resumes for keywords, hiring managers and team leads frequently read cover letters to evaluate communication skills, authentic enthusiasm, and culture alignment when deciding between top finalists."
      },
      {
        question: "How long should a standard cover letter be?",
        answer: "A standard cover letter should be between 250 and 400 words (3 to 4 paragraphs) and easily fit onto a single page. It should be concise enough to be read in under 90 seconds."
      },
      {
        question: "Can I customize the generated letter before sending?",
        answer: "Absolutely. You can toggle inline edit mode to modify any sentence, adjust specific company anecdotes, or tweak your sign-off details directly on the live letterhead before copying or downloading."
      },
      {
        question: "How can I export or print my cover letter?",
        answer: "You can copy the formatted text to your clipboard with 1 click, download a clean .txt file for your records, or use the Print button to print or save a formal PDF directly from your browser."
      }
    ],
    useCases: [
      "Job Applications & Career Transitions: Bridge your past experience to a new industry or more senior leadership role.",
      "Cold Outreach to Founders & Recruiters: Draft punchy, high-impact introductory notes expressing interest in unlisted opportunities.",
      "Internal Company Promotions: Articulate your track record of business impact when applying for senior lateral or upward roles.",
      "Freelance & Consulting Proposals: Present a formal, persuasive pitch highlighting your past client deliverables and methodologies."
    ],
    limitations: [
      "Always verify that company names, job titles, and specific factual dates accurately represent your real career history before submitting."
    ],
    examples: [
      "Engineering: Tailored letter for Senior Full-Stack Engineer applying to Stripe, highlighting API latency reductions and CI/CD pipelines.",
      "Product Design: Persuasive letter for Lead Product Designer applying to Airbnb, emphasizing human-centered research and design system velocity.",
      "Growth Marketing: Data-driven letter for Head of Growth applying to Notion, spotlighting ARR expansion and programmatic SEO."
    ],
    updatedAt: "2026-09-30T00:00:00.000Z"
  },
  // 💼 Business & Finance
  {
    id: 'gst-calculator',
    name: 'GST Calculator (India)',
    description: "Calculate the exact tax amount and final price for any bill or product price in India with standard rates, whether tax is already included or added on.",
    category: 'business',
    icon: 'IndianRupee' as IconName,
    href: '/tools/gst-calculator',
    popular: true,
    suggestions: ["Calculate 18% GST inclusive on ₹10,000", "Find CGST and SGST for inter-state sale", "Exclusive 12% GST calculation for services"],
    seoTitle: "Free Indian GST Calculator Online - Inclusive & Exclusive Tax Calculator | Exismic",
    seoDescription: "Calculate GST amount, CGST, SGST, and IGST instantly for all standard tax slabs in India (0%, 5%, 12%, 18%, 28%). Calculate both tax-inclusive and tax-exclusive amounts with detailed ledger breakdowns.",
    seoKeywords: ["gst calculator india", "inclusive gst calculator", "exclusive gst calculator", "cgst sgst igst calculator", "gst tax rate slabs", "free gst tool", "Exismic"],
    seoIntro: "Calculate accurate Goods and Services Tax (GST) for products and services across India. Easily toggle between tax-exclusive (tax added to price) and tax-inclusive (tax already inside total price) modes, with automatic split into Central GST (CGST), State GST (SGST), and Integrated GST (IGST).",
    howToSteps: [
      "Select whether your transaction is GST Exclusive (adding tax to price) or GST Inclusive (removing tax from price).",
      "Enter your bill amount in Rupees (₹) or click one of the quick preset amounts.",
      "Choose your applicable GST tax slab (0%, 5%, 12%, 18%, 28%, or enter a custom percentage).",
      "Select your transaction supply type: Intra-State (within same state) or Inter-State (across state borders).",
      "Inspect the real-time tax ledger breakdown and copy the calculation summary or export for your invoice."
    ],
    features: [
      "Dual Calculation Modes: Instantly compute GST Exclusive (+ Tax added) or GST Inclusive (- Tax backed out).",
      "State Supply Auto-Split: Automatically calculates CGST (50%) + SGST (50%) for intra-state sales, or IGST (100%) for inter-state sales.",
      "Official Indian Tax Slabs: 1-click selectors for all official slabs (0%, 5%, 12%, 18%, 28%) plus custom rate support.",
      "Visual Tax Ratio Meter: Real-time visual comparison showing base product price versus total government tax share.",
      "1-Click Blueprint Presets: Realistic pre-configured templates for IT consulting, electronics, dining, and luxury items."
    ],
    faqs: [
      {
        question: "What is the difference between GST Inclusive and GST Exclusive?",
        answer: "GST Exclusive means the tax is added on top of your base price (e.g. ₹1,000 base + 18% GST = ₹1,180 final total). GST Inclusive means the listed retail price already includes the tax (e.g. ₹1,180 total contains ₹1,000 base price and ₹180 GST)."
      },
      {
        question: "When is CGST + SGST applied versus IGST?",
        answer: "When buyer and seller are located in the same Indian state (Intra-State), the GST is split equally into Central GST (CGST) and State GST (SGST). When goods or services cross state boundaries (Inter-State), Integrated GST (IGST) is collected by the Central Government."
      },
      {
        question: "Which GST slab applies to freelance and IT services in India?",
        answer: "Most professional consulting, software development, SaaS, and freelance creative services in India fall under the standard 18% GST slab."
      },
      {
        question: "How is GST calculated mathematically?",
        answer: "For exclusive GST: Tax = (Base Amount × Rate) / 100. For inclusive GST: Base Amount = (Total Amount × 100) / (100 + Rate), and Tax = Total Amount - Base Amount."
      }
    ],
    useCases: [
      "E-Commerce & Retail Sellers: Determine product list prices with tax included to display transparent pricing on Amazon, Flipkart, or Shopify.",
      "Freelancers & Agencies: Generate client invoices with exact CGST/SGST or IGST breakdowns for compliance with Indian tax regulations.",
      "B2B Procurement Teams: Verify vendor tax invoices and calculate eligible Input Tax Credit (ITC) amounts.",
      "Consumers & Shoppers: Check the true base cost of products and dining bills before tax was added."
    ],
    limitations: [
      "Certain exempt goods, special composition schemes, or additional compensation cess (e.g., on luxury tobacco or cars) may require custom percentage adjustments."
    ],
    examples: [
      "Tech Freelance Services: ₹50,000 billing at 18% Intra-State = ₹4,500 CGST (9%) + ₹4,500 SGST (9%), Total ₹59,000.",
      "Electronics Purchase: ₹34,999 inclusive at 18% Inter-State = Base ₹29,660.17 + IGST ₹5,338.83.",
      "Restaurant Bill: ₹2,400 exclusive at 5% Intra-State = ₹60 CGST (2.5%) + ₹60 SGST (2.5%), Total ₹2,520."
    ],
    updatedAt: "2026-09-30T00:00:00.000Z"
  },
  {
    id: 'profit-margin-calculator',
    name: 'Profit Margin Calculator',
    description: "Figure out your exact profits, markup prices, and break-even sales so you can price your products and services with total financial confidence.",
    category: 'business',
    icon: 'TrendingUp' as IconName,
    href: '/tools/profit-margin-calculator',
    popular: true,
    suggestions: [
      "Calculate gross margin given cost $25 and retail price $68",
      "Find required markup to achieve 45% target margin",
      "Calculate SaaS gross margin with $8 hosting and $49 monthly fee",
      "Evaluate physical retail profit after shipping and payment fees"
    ],
    seoTitle: "Free Profit Margin & Markup Calculator - Business Financial Tool | Exismic",
    seoDescription: "Calculate gross profit margin, net profit percentage, and markup for products and services with real-time breakdown and target pricing.",
    seoKeywords: [
      "profit margin calculator",
      "gross margin calculator",
      "markup calculator",
      "net profit calculator",
      "selling price calculator",
      "break even calculator",
      "business financial tools",
      "Exismic"
    ],
    seoIntro: "Evaluate commercial pricing profitability, calculate gross and net margins, find exact markups, and discover what price to charge to achieve your target return.",
    howToSteps: [
      "Choose a preloaded commercial blueprint or select your preferred currency (USD, INR, EUR, GBP, CAD, AUD, JPY).",
      "Enter your direct item unit cost (materials, manufacturing, or wholesale buy price).",
      "Enter your retail customer selling price to instantly see your Gross Margin, Markup percentage, and Net Profit cash.",
      "Switch to the Target Price Calculator tab to input your dream profit margin and let the tool calculate your required selling price."
    ],
    features: [
      "Dual Financial Modes: Analyze existing prices or reverse-calculate target pricing for desired margins.",
      "Visual Revenue Waterfall: Interactive multi-segment progress bar showing direct costs, overhead expenses, and retained net profit.",
      "6 Commercial Blueprints: Pre-configured scenarios for E-commerce DTC, SaaS subscriptions, bakeries, wholesale supply, consulting agencies, and consumer electronics.",
      "Quick Price Adjustments: Rapidly experiment with +5%, +10%, +25% price bumps, charm pricing (.99), and round numbers.",
      "Export & Retention: Download structured financial price sheets (.txt) and copy formatted executive summaries with one click."
    ],
    faqs: [
      {
        question: "What is the key difference between Profit Margin and Markup?",
        answer: "Profit Margin is profit divided by the selling price (the percentage of sales revenue you keep as profit). Markup is profit divided by the original cost (the percentage you add onto your cost to determine the price). A product bought for $50 and sold for $100 has a 50% profit margin and a 100% markup."
      },
      {
        question: "What is considered a healthy profit margin?",
        answer: "In physical retail and e-commerce, gross margins typically range from 30% to 55%. In software and digital services, gross margins often exceed 70% to 85%. Wholesale and hardware distribution usually operates on leaner margins between 15% and 30%."
      },
      {
        question: "How does the Target Price Calculator work?",
        answer: "It uses the formula: Required Price = Total Unit Cost / (1 - Desired Margin %). For instance, if an item costs $60 total and you want a 40% margin, your selling price must be $60 / 0.60 = $100."
      },
      {
        question: "Can I include shipping and payment processing fees?",
        answer: "Yes, enter them into the Operating & Overhead Expenses field. The calculator automatically separates direct gross profit from final net retained profit."
      }
    ],
    useCases: [
      "E-commerce merchants setting catalog prices to cover ad acquisition costs and shipping.",
      "Freelancers and agencies quoting client projects with healthy target margins.",
      "Retail shop owners and restaurants pricing menu items and physical goods.",
      "Wholesale manufacturers calculating distributor tiers and volume discounts."
    ],
    limitations: [
      "Does not automatically account for regional corporate income tax deductions or tax depreciation.",
      "Fixed overhead breakeven assumes uniform sales mix across all products."
    ],
    examples: [
      "E-commerce DTC Apparel: Cost $25, Price $68, Expenses $14 = 63.2% Gross Margin, 172% Markup, $29 Net Profit (42.6% Net Margin).",
      "SaaS Digital Subscription: Cost $8, Price $49, Expenses $12 = 83.7% Gross Margin, 512.5% Markup, $29 Net Profit (59.2% Net Margin).",
      "Retail Food Item: Cost $3.50, Price $9.00, Expenses $2.00 = 61.1% Gross Margin, 157.1% Markup, $3.50 Net Profit (38.9% Net Margin)."
    ],
    terminology: [
      {
        term: "Gross Profit",
        definition: "The money left over after subtracting direct unit production costs from total selling price."
      },
      {
        term: "Gross Margin",
        definition: "The percentage of selling price that remains as profit after paying direct production costs."
      },
      {
        term: "Markup Rate",
        definition: "The percentage added to direct cost to arrive at the customer selling price."
      },
      {
        term: "Net Profit",
        definition: "The actual cash retained after paying both direct production costs and operating delivery overhead."
      }
    ],
    updatedAt: "2026-09-30T00:00:00.000Z"
  },
  {
    id: 'emi-calculator',
    name: 'Loan EMI Calculator',
    description: "Calculate monthly EMI payments, total interest costs, and full year-by-year amortization schedules for home, car, personal, and business loans.",
    category: 'business',
    icon: 'Calculator' as IconName,
    href: '/tools/emi-calculator',
    popular: true,
    suggestions: [
      "Calculate EMI for ₹30 Lakh home loan at 8.5% for 20 years",
      "Car loan EMI for ₹12 Lakhs at 9.0% for 5 years",
      "Personal loan repayment for ₹5 Lakhs at 12.5% for 3 years",
      "See how extra ₹5,000 monthly prepayment saves loan interest"
    ],
    seoTitle: "Free Loan EMI Calculator - Home, Car, Personal & Business Loan Calculator | Exismic",
    seoDescription: "Calculate monthly EMI, total interest payable, prepayment savings, and detailed loan amortization schedules with real-time visual breakdown.",
    seoKeywords: [
      "emi calculator",
      "loan emi calculator",
      "home loan emi calculator",
      "car loan emi calculator",
      "personal loan emi calculator",
      "loan amortization schedule",
      "prepayment calculator",
      "Exismic"
    ],
    seoIntro: "Plan and optimize loan borrowings with real-time monthly EMI calculations, interest-to-principal proportions, prepayment savings simulations, and full year-by-year amortization tables.",
    howToSteps: [
      "Select a pre-configured loan blueprint (Home Loan, Car Loan, Personal Loan, Education, Business Equipment) or choose your preferred currency.",
      "Enter your total loan principal borrowing amount or tap the quick select chips.",
      "Adjust the annual interest rate (% p.a.) using the high-precision slider or quick rate buttons.",
      "Select your loan tenure in years or months to instantly review your fixed monthly EMI and total repayment cost.",
      "Expand the Prepayment Simulator to see how extra monthly contributions save interest and close your loan years earlier."
    ],
    features: [
      "6 Real-World Loan Blueprints: Pre-configured rates and tenures for home mortgages, EV/sedan cars, personal financing, education, business machinery, and two-wheelers.",
      "Prepayment & Early Payoff Simulator: Test extra monthly contributions and discover exact interest savings and shortened tenure.",
      "Year-by-Year Amortization Schedule: Detailed table showing annual opening balance, principal paid, interest paid, closing balance, and percentage repaid.",
      "Visual Payment Proportion Split: Proportional progress bar comparing borrowed principal against cumulative interest payable.",
      "Multi-Currency Support: Seamlessly switch between INR (₹), USD ($), EUR (€), GBP (£), CAD (CA$), and AUD (AU$)."
    ],
    faqs: [
      {
        question: "How is Equated Monthly Installment (EMI) calculated?",
        answer: "EMI is computed using the standard reducing balance formula: EMI = [P x r x (1 + r)^n] / [(1 + r)^n - 1], where P is principal loan amount, r is monthly interest rate (annual rate / 12 / 100), and n is total tenure in months."
      },
      {
        question: "Does prepayment reduce EMI or tenure?",
        answer: "Most banks allow you to choose: you can keep your monthly EMI the same and shorten your total loan tenure (which maximizes your total interest savings), or reduce your monthly EMI while keeping the original tenure."
      },
      {
        question: "Why is the interest portion higher in early loan years?",
        answer: "Because the interest is computed on the outstanding principal balance. In early years, the principal is at its maximum, so most of your monthly EMI goes toward servicing interest. As principal reduces over time, a larger portion of each EMI repays principal."
      }
    ],
    useCases: [
      "Prospective home buyers planning mortgage affordability before applying to banks.",
      "Car and motorcycle shoppers comparing dealership financing offers against bank personal loans.",
      "Borrowers evaluating early loan foreclosure or prepayment strategies to save interest."
    ],
    limitations: [
      "Does not automatically include one-time bank processing fees, stamp duty, or mandatory property insurance premiums.",
      "Assumes a fixed interest rate throughout the selected loan tenure."
    ],
    examples: [
      "Home Loan: ₹30,00,000 at 8.5% for 20 years = Monthly EMI ₹26,035, Total Interest ₹32,48,327, Total Payable ₹62,48,327.",
      "Car Loan: ₹12,00,000 at 9.0% for 5 years = Monthly EMI ₹24,910, Total Interest ₹2,94,603, Total Payable ₹14,94,603.",
      "Personal Loan: ₹5,00,000 at 12.5% for 3 years = Monthly EMI ₹16,727, Total Interest ₹1,02,166, Total Payable ₹6,02,166."
    ],
    terminology: [
      {
        term: "EMI (Equated Monthly Installment)",
        definition: "A fixed payment amount made by a borrower to a lender at a specified date each calendar month."
      },
      {
        term: "Principal",
        definition: "The original sum of money borrowed in a loan before interest is applied."
      },
      {
        term: "Amortization",
        definition: "The gradual reduction of a debt through regular monthly payments of principal and interest over time."
      }
    ],
    updatedAt: "2026-09-30T00:00:00.000Z"
  },
  {
    id: 'salary-calculator',
    name: 'Salary & Take-Home Calculator',
    description: "Calculate your net monthly in-hand take-home salary from total annual CTC package with New vs Old Tax Regime comparison and EPF breakdown.",
    category: 'business',
    icon: 'Wallet' as IconName,
    href: '/tools/salary-calculator',
    popular: true,
    suggestions: [
      "Calculate in-hand monthly salary for 12 LPA CTC under Budget 2024 New Regime",
      "Compare New Tax Regime vs Old Tax Regime savings for 18 LPA",
      "Check take-home pay for 25 LPA Senior SDE after EPF and TDS",
      "Evaluate Section 87A tax rebate for 6 LPA entry-level salary"
    ],
    seoTitle: "Free CTC to In-Hand Salary Calculator India - Budget 2024 New vs Old Tax Regime | Exismic",
    seoDescription: "Calculate your actual monthly take-home salary from annual CTC package with revised Budget 2024 New Tax Regime slabs, ₹75,000 standard deduction, and EPF deductions.",
    seoKeywords: [
      "salary calculator",
      "ctc to in hand calculator",
      "take home pay calculator",
      "in hand salary calculator india",
      "new tax regime salary calculator",
      "budget 2024 salary calculator",
      "net salary calculator",
      "Exismic"
    ],
    seoIntro: "Decode your official corporate CTC offer letter and see your true monthly cash-in-bank take-home salary, accounting for revised Budget 2024-25 tax slabs, ₹75,000 standard deduction, and EPF.",
    howToSteps: [
      "Select a career compensation blueprint (6 LPA to 45 LPA) or type your exact annual CTC package.",
      "Toggle between the New Tax Regime (Budget 2024 revised slabs with ₹75,000 standard deduction) and the Old Tax Regime.",
      "If comparing the Old Regime, enter your annual Section 80C investments, 80D health insurance, and HRA exemption.",
      "Choose your Employee Provident Fund (EPF) preference: statutory standard cap (₹1,800/mo) or full 12% of basic.",
      "Inspect your itemized Monthly Payslip Ledger showing Basic, HRA, Special Allowance, EPF, Professional Tax, TDS, and final In-Hand Take-Home."
    ],
    features: [
      "Budget 2024-25 Revised Slabs: Fully updated with ₹75,000 standard deduction and Section 87A rebate (zero tax up to ₹7.75 Lakhs CTC).",
      "New vs Old Tax Regime Comparison: Automatic dynamic banner comparing annual tax savings between both regimes.",
      "6 Real-World Career Blueprints: Pre-configured packages for 6 LPA Freshers, 8.5 LPA Marketers, 12 LPA Mid SDEs, 18 LPA PMs, 25 LPA Senior SDEs, and 45 LPA Tech Execs.",
      "Standard Indian Payslip Ledger: Detailed breakdown into Basic Salary (50%), HRA (20%), Special Allowance, EPF (12%), Professional Tax, and Income Tax TDS.",
      "Visual CTC Allocation Waterfall: Multi-segment proportion bar dividing CTC into In-Hand Pay, EPF Retirement Savings, and Government Taxes."
    ],
    faqs: [
      {
        question: "What is the difference between CTC and In-Hand Salary?",
        answer: "Cost to Company (CTC) is the total annual expense a company spends on an employee, including basic salary, allowances, employer's PF contribution, gratuity, and insurance. In-Hand Salary is the actual net cash deposited into your bank account after subtracting statutory employee deductions like EPF, Professional Tax, and Income Tax (TDS)."
      },
      {
        question: "Is income up to ₹7.75 Lakhs completely tax-free under the New Tax Regime?",
        answer: "Yes! In Budget 2024, the standard deduction for salaried individuals was raised to ₹75,000. Under the New Tax Regime, taxable income up to ₹7,00,000 receives a full tax rebate under Section 87A. Therefore, a salaried employee earning up to ₹7,75,000 pays ₹0 income tax."
      },
      {
        question: "How is Employee Provident Fund (EPF) deducted?",
        answer: "By default under the EPFO rules, the employee contribution is 12% of Basic Salary. Many companies cap the statutory monthly EPF deduction at ₹1,800 per month (12% of statutory minimum basic ₹15,000), while other companies deduct 12% of actual basic salary."
      }
    ],
    useCases: [
      "Job seekers evaluating new corporate offer letters to determine real monthly disposable income.",
      "Salaried professionals choosing between the New Tax Regime and Old Tax Regime for annual tax filing.",
      "HR managers and founders structuring competitive, transparent employee compensation packages."
    ],
    limitations: [
      "Does not automatically account for variable performance bonuses paid on an irregular quarterly or annual basis.",
      "Professional Tax rates can vary slightly across individual Indian states (e.g. Maharashtra vs Karnataka)."
    ],
    examples: [
      "12 LPA CTC (New Regime): Monthly Gross ₹1,00,000 -> Monthly EPF ₹1,800, PT ₹200, TDS ₹5,889 = Net Monthly In-Hand ₹92,111.",
      "25 LPA CTC (New Regime): Monthly Gross ₹2,08,333 -> Monthly EPF ₹1,800, PT ₹200, TDS ₹29,883 = Net Monthly In-Hand ₹1,76,450.",
      "6 LPA CTC (New Regime): Monthly Gross ₹50,000 -> Monthly EPF ₹1,800, PT ₹200, TDS ₹0 = Net Monthly In-Hand ₹48,000 (100% Tax-Free!)."
    ],
    terminology: [
      {
        term: "CTC (Cost to Company)",
        definition: "The total annual gross amount an employer spends on an employee before any deductions."
      },
      {
        term: "Standard Deduction",
        definition: "A flat deduction allowed from gross salary before computing taxable income (₹75,000 in Budget 2024 New Regime)."
      },
      {
        term: "TDS (Tax Deducted at Source)",
        definition: "The estimated monthly income tax deducted by your employer and remitted directly to the government on your behalf."
      }
    ],
    updatedAt: "2026-09-30T00:00:00.000Z"
  },
  // 🌐 SEO & Webmaster Suite
  {
    id: 'meta-title-generator',
    name: 'Meta Title Generator',
    description: "Craft catchy, high-click page titles that fit search result previews perfectly and entice visitors to click through to your website instead of rivals.",
    category: 'seo',
    icon: 'FileSearch' as IconName,
    href: '/tools/meta-title-generator',
    popular: true,
    suggestions: ["Generate SEO titles for e-commerce shoe store", "Create catchy title tag for tech blog post", "Optimize meta title under 60 characters"],
    seoTitle: "Free AI Meta Title Generator - SEO Title Tag Optimizer",
    seoDescription: "Generate click-worthy, SEO-optimized title tags under 60 characters with live Google SERP preview.",
    seoKeywords: ["meta title generator","seo title tag generator","high ctr title maker","Exismic"],
    seoIntro: "Generate click-worthy, search-optimized meta title tags that fit Google's 60-character and 580-pixel SERP display limits to boost click-through rates without getting cut off.",
    howToSteps: [
      "Enter your target primary keyword and optional page topic or audience context into the generator.",
      "Pick your search intent (commercial, informational, or transactional) and brand suffix.",
      "Preview generated headline variations in real time against the live Google desktop and mobile SERP simulator.",
      "Copy your favorite title or download the full title tag list with character counts in one click."
    ],
    features: [
      "Live Google SERP Simulator: Test both desktop and mobile snippet appearance before publishing.",
      "Pixel & Character Width Meter: Accurately monitor the 60-character and 580px truncation limit.",
      "Instant SEO Blueprints: Preloaded with SaaS, DTC e-commerce, local agency, and tutorial templates.",
      "Intent Alignment: Generate titles tailored to commercial shopping, informational guides, and B2B services."
    ],
    faqs: [
      {
        question: "What is the optimal length for an SEO meta title?",
        answer: "Google typically displays the first 50 to 60 characters (or roughly 580 pixels) of a title tag. Keeping your titles under 60 characters ensures they won't be truncated with an ellipsis (...)."
      },
      {
        question: "Does Google always use my meta title in search results?",
        answer: "Google uses your title tag in roughly 70-80% of searches. If Google determines that a different heading (such as your H1) is more relevant to a user's query, it may rewrite the title tag in results."
      },
      {
        question: "Where should I place my primary keyword in the title?",
        answer: "Place your primary keyword as close to the beginning of the title tag as possible to maximize relevance signals and catch searchers' eyes immediately."
      }
    ],
    useCases: [
      "SaaS Landing Pages: Optimize software homepage and pricing headlines for high-conversion searches.",
      "E-Commerce Products: Craft high-CTR titles featuring product brand, model, and key benefits.",
      "Blog & Content Articles: Generate compelling editorial headlines that stand out in crowded search results."
    ],
    limitations: [
      "Title length limits are based on pixel width rather than a rigid character count; wide capital letters take up more room.",
      "Title optimization alone does not guarantee a top ranking without quality content and crawlable site structure."
    ],
    examples: [
      "Primary Keyword: 'Wireless Headphones' -> Output: 'Best Wireless Headphones of 2026 - Tested & Ranked | AudioNova' (58 chars)",
      "Primary Keyword: 'AI Video Editor' -> Output: 'AI Video Editor: Create Viral Shorts in 60 Seconds | ClipCraft' (59 chars)"
    ],
    terminology: [
      {
        term: "SERP",
        definition: "Search Engine Results Page — the list of web links, snippets, and ads returned by Google for a search query."
      },
      {
        term: "Truncation",
        definition: "The cut-off effect when a title exceeds Google's display width, showing three dots (...) at the end."
      },
      {
        term: "CTR (Click-Through Rate)",
        definition: "The percentage of searchers who see your snippet in Google results and click on it."
      }
    ],
    updatedAt: "2026-09-30T00:00:00.000Z"
  },
  {
    id: 'meta-description-generator',
    name: 'Meta Description Generator',
    description: "Write short, punchy summary snippets for your web pages that clearly explain what you offer and encourage more clicks from search engines.",
    category: 'seo',
    icon: 'AlignLeft' as IconName,
    href: '/tools/meta-description-generator',
    popular: true,
    suggestions: ["Write meta description for digital marketing agency", "Create meta description with CTA for SaaS landing page", "Optimize page summary under 155 characters"],
    seoTitle: "Free AI Meta Description Generator - SERP Description Tool",
    seoDescription: "Create high-converting, keyword-optimized meta descriptions under 160 characters for maximum search clicks.",
    seoKeywords: ["meta description generator","seo description generator","meta tag creator","Exismic"],
    seoIntro: "Craft punchy, high-converting meta descriptions under 160 characters that summarize your content and encourage higher click-through rates from search engines.",
    howToSteps: [
      "Enter your target keyword, key benefits, and brand name in the generator.",
      "Select your preferred tone of voice and action-oriented call to action (e.g. Try Free, Shop Now, Learn More).",
      "Check character counts against the live 155-160 character limit meter.",
      "Copy the HTML meta description tag or export all generated variations."
    ],
    features: [
      "Live Character Meter: Stays within Google's 155–160 desktop and 120 mobile character limits.",
      "SERP Snippet Preview: See your description beneath your title tag and URL.",
      "Action-Oriented CTAs: Injects high-performing verbs to motivate searchers to click.",
      "Instant Blueprints: Includes preloaded DTC, B2B, tutorial, and local business snippets."
    ],
    faqs: [
      {
        question: "Do meta descriptions directly impact Google search rankings?",
        answer: "Meta descriptions are not a direct Google ranking factor, but they heavily influence click-through rate (CTR), which drives traffic and user engagement signals."
      },
      {
        question: "How long should a meta description be?",
        answer: "Between 140 and 160 characters. Descriptions longer than 160 characters are usually truncated by Google on desktop, and mobile displays may cut off around 120 characters."
      }
    ],
    useCases: [
      "Service Pages: Drive consultations with clear value propositions and contact calls to action.",
      "Product Pages: Highlight pricing, free shipping, and top features to drive qualified buyers."
    ],
    limitations: [
      "Google may occasionally generate its own snippet from on-page text if it feels it answers the searcher's query better."
    ],
    examples: [
      "Input: 'AudioNova wireless headphones' -> Output: 'Discover AudioNova wireless headphones with active noise cancellation and 40h battery. Shop now for free fast shipping and 30-day trials.' (158 chars)"
    ],
    terminology: [
      {
        term: "Call to Action (CTA)",
        definition: "A clear phrase prompting the user to take a specific step (e.g. 'Explore now', 'Shop today')."
      },
      {
        term: "Snippet",
        definition: "The short description text displayed under a blue link in search results."
      }
    ],
    updatedAt: "2026-09-30T00:00:00.000Z"
  },
  {
    id: 'robots-txt-generator',
    name: 'Robots.txt Generator',
    description: "Set up simple instructions for search engines to tell them which parts of your site to display publicly and which private folders to skip.",
    category: 'seo',
    icon: 'Lock' as IconName,
    href: '/tools/robots-txt-generator',
    suggestions: ["Block web crawlers from /admin and /private routes", "Add Sitemap URL directive to robots.txt", "Generate standard WordPress robots.txt"],
    seoTitle: "Free Robots.txt Generator - Create Search Engine Robot Instructions",
    seoDescription: "Generate valid robots.txt files for Googlebot, Bingbot, and web crawlers with Disallow rules and Sitemap integration.",
    seoKeywords: ["robots txt generator","make robots txt online","seo robots txt creator","Exismic"],
    seoIntro: "Create and validate instructions for web crawlers like Googlebot and Bingbot to guide search engine indexing and keep private folders secure.",
    howToSteps: [
      "Choose a preloaded blueprint (WordPress, Next.js, E-Commerce, or Block AI Scrapers) or start fresh.",
      "Specify User-agent directives (e.g., Googlebot, Bingbot, or * for all bots).",
      "Add Allow and Disallow paths to control which folders should be crawled.",
      "Link your XML Sitemap URL and download the validated robots.txt file to place in your website root."
    ],
    features: [
      "Instant Blueprints: One-click setup for Next.js, WordPress, Shopify, and AI scraper blocks.",
      "AI Crawler Controls: Easily disallow GPTBot, CCBot, and ClaudeBot if desired.",
      "Sitemap Directive: Automatically link your XML sitemap URL for fast bot discovery.",
      "Syntax Validation: Prevents syntax errors that could accidentally de-index your entire site."
    ],
    faqs: [
      {
        question: "Where do I upload the robots.txt file?",
        answer: "Place robots.txt in the root directory of your domain (e.g., https://example.com/robots.txt). Search engine bots check this exact location first."
      },
      {
        question: "Does Disallow in robots.txt hide pages from Google completely?",
        answer: "Disallow stops search engine bots from crawling a page, but if external sites link to it, Google may still index the URL. To prevent indexing entirely, use a noindex meta tag."
      }
    ],
    useCases: [
      "Staging Environments: Block all bots from crawling work-in-progress websites.",
      "E-Commerce: Disallow internal search query URLs, checkout pages, and shopping cart sessions."
    ],
    limitations: [
      "robots.txt is a polite guideline; malicious bots and scrapers may ignore it unless blocked at the firewall or server level."
    ],
    examples: [
      "Standard WordPress: User-agent: * Disallow: /wp-admin/ Allow: /wp-admin/admin-ajax.php Sitemap: https://example.com/sitemap.xml"
    ],
    terminology: [
      {
        term: "User-agent",
        definition: "The name of the automated crawler or search engine bot (e.g., Googlebot)."
      },
      {
        term: "Disallow",
        definition: "A directive telling the crawler not to visit a specific folder or URL path."
      }
    ],
    updatedAt: "2026-09-30T00:00:00.000Z"
  },
  {
    id: 'sitemap-generator',
    name: 'XML Sitemap Generator',
    description: "Create a clean map of all your website pages so search engines like Google can easily discover, crawl, and index your latest content.",
    category: 'seo',
    icon: 'Network' as IconName,
    href: '/tools/sitemap-generator',
    suggestions: ["Generate XML sitemap for 10 website pages", "Set priority 1.0 for homepage and 0.8 for category pages", "Format valid sitemap.xml for Google Search Console"],
    seoTitle: "Free XML Sitemap Generator - Build Search Engine Sitemaps Online",
    seoDescription: "Create valid XML sitemaps for Google Search Console and search engines with customizable update frequency and page priority.",
    seoKeywords: ["sitemap generator","xml sitemap generator","generate sitemap xml online","Exismic"],
    seoIntro: "Generate a Google-compliant XML sitemap listing your website URLs with update frequency and priority metadata for fast discovery.",
    howToSteps: [
      "Add your domain URL and customize primary navigation routes (e.g. /, /about, /pricing, /blog).",
      "Set change frequency (e.g. daily, weekly, monthly) and priority weighting for key landing pages.",
      "Validate the XML syntax and schema compliance.",
      "Download your sitemap.xml file and submit the URL to Google Search Console."
    ],
    features: [
      "Quick Route Adders: One-click shortcuts for standard web pages.",
      "Automated lastmod Timestamps: Formats dates into standard ISO-8601 format.",
      "XML Syntax Highlighting: Clean, error-free Google-compliant XML structure.",
      "Instant Blueprints: Pre-configured sitemaps for SaaS, blogs, DTC shops, and portfolios."
    ],
    faqs: [
      {
        question: "Why is an XML sitemap important for SEO?",
        answer: "An XML sitemap acts as a roadmap for search engines, helping Google find all your important pages quickly—especially on new websites or sites with complex navigation."
      },
      {
        question: "How do I submit my sitemap to Google?",
        answer: "Open Google Search Console, navigate to the 'Sitemaps' tab under Indexing, enter sitemap.xml, and click Submit."
      }
    ],
    useCases: [
      "New Websites: Speed up first-time indexing of all domain pages on Google and Bing.",
      "Content Sites: Ensure new articles and updated pages are crawled within hours of publishing."
    ],
    limitations: [
      "A single sitemap file is limited to 50,000 URLs and 50MB uncompressed by Google standards; larger sites require a sitemap index file."
    ],
    examples: [
      "<url><loc>https://example.com/</loc><lastmod>2026-09-30</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>"
    ],
    terminology: [
      {
        term: "XML (Extensible Markup Language)",
        definition: "The standard structured data format required by search engines for sitemaps."
      },
      {
        term: "Priority",
        definition: "A score from 0.0 to 1.0 indicating the relative importance of a page compared to other pages on your site."
      }
    ],
    updatedAt: "2026-09-30T00:00:00.000Z"
  },
  {
    id: 'keyword-density-checker',
    name: 'Keyword Density Checker',
    description: "Make sure your articles sound natural to human readers while mentioning your key topics often enough to help search engines understand your content.",
    category: 'seo',
    icon: 'PieChart' as IconName,
    href: '/tools/keyword-density-checker',
    popular: true,
    suggestions: ["Check keyword density of blog post draft", "Scan for keyword stuffing over 3%", "Find top 2-word and 3-word key phrases"],
    seoTitle: "Free Keyword Density Checker - Analyze Text Keyword Frequency",
    seoDescription: "Analyze text content for keyword frequency percentages, phrase density, and stop-word filtered metrics to optimize search rankings.",
    seoKeywords: ["keyword density checker","seo keyword analyzer","word frequency analyzer","Exismic"],
    seoIntro: "Analyze word and phrase frequency in your articles and landing pages to ensure optimal keyword coverage while preventing keyword stuffing penalties.",
    howToSteps: [
      "Paste your draft text, blog post, or article content into the editor.",
      "Review the 1-word, 2-word, and 3-word phrase density tables.",
      "Check the density alert: maintain target keywords between 1.0% and 2.5% for natural reading flow.",
      "Filter out common stop words to focus purely on topic-relevant keywords."
    ],
    features: [
      "Multi-Word Phrase Analysis: Detects recurring 2-word and 3-word phrases in addition to single words.",
      "Keyword Stuffing Warning: Flags any phrase exceeding 3.5% density that could trigger search penalties.",
      "Stop Word Filter: Automatically excludes common filler words (the, is, and, of) for clear analysis.",
      "Live Reading Time & Metrics: Displays total word count, unique words, and estimated reading time."
    ],
    faqs: [
      {
        question: "What is an ideal keyword density for SEO?",
        answer: "A keyword density between 1% and 2.5% is widely considered optimal. It signals the topic clearly to search engines without feeling repetitive or unnatural to human readers."
      },
      {
        question: "What is keyword stuffing?",
        answer: "Keyword stuffing is the practice of loading a webpage with keywords in an attempt to manipulate rankings. Google actively penalizes stuffed content under Helpful Content updates."
      }
    ],
    useCases: [
      "Blog Editorial: Audit article drafts before publishing to ensure primary topics are covered naturally.",
      "Competitor Copy Audit: Paste high-ranking competitor articles to see what phrases they emphasize."
    ],
    limitations: [
      "Modern search engines use semantic understanding and entity recognition; exact keyword counts should always take a backseat to reader clarity."
    ],
    examples: [
      "A 1,000-word article mentioning 'coffee beans' 15 times has a 1.5% keyword density (optimal range)."
    ],
    terminology: [
      {
        term: "Keyword Density",
        definition: "The percentage of times a keyword or phrase appears compared to the total word count of the text."
      },
      {
        term: "Stop Words",
        definition: "Frequently used words (like 'in', 'at', 'that') that search engines usually ignore when analyzing core topics."
      }
    ],
    updatedAt: "2026-09-30T00:00:00.000Z"
  },
  {
    id: 'schema-markup-generator',
    name: 'Schema Markup Generator',
    description: "Help search engines understand your articles, products, and FAQs so they can display eye-catching star ratings and question snippets directly in results.",
    category: 'seo',
    icon: 'Code2' as IconName,
    href: '/tools/schema-markup-generator',
    popular: true,
    suggestions: ["Generate FAQ Page schema markup JSON-LD", "Create Article schema for blog post", "Generate Product review schema for e-commerce"],
    seoTitle: "Free Schema Markup Generator - JSON-LD Structured Data Builder",
    seoDescription: "Generate Google-compliant JSON-LD schema markup for Articles, FAQs, Products, Local Businesses, and How-To guides.",
    seoKeywords: ["schema markup generator","json ld generator","structured data maker","Exismic"],
    seoIntro: "Generate Google-compliant JSON-LD structured data markup for Articles, FAQs, Products, and Local Businesses to unlock rich snippets in search results.",
    howToSteps: [
      "Select your schema type: FAQ Page, Product, Article, Local Business, or Organization.",
      "Fill in the required properties (e.g. questions & answers, product price, star rating, author name).",
      "Review the live JSON-LD code block and check Google Rich Result eligibility badges.",
      "Copy the script tag code and paste it into your page head or body."
    ],
    features: [
      "Interactive FAQ Builder: Add multiple question and answer pairs with instant schema generation.",
      "E-Commerce Product Markup: Includes price, currency, availability, and rating properties.",
      "Google Compliance Checks: Verifies all mandatory Schema.org properties are present.",
      "One-Click Copy & Export: Download validated JSON-LD or copy ready-to-use HTML script tags."
    ],
    faqs: [
      {
        question: "What is JSON-LD schema markup?",
        answer: "JSON-LD (JavaScript Object Notation for Linked Data) is a structured format that helps search engines understand the exact meaning of your page content, enabling rich search features."
      },
      {
        question: "Do rich snippets improve SEO rankings?",
        answer: "While schema markup itself is not a direct ranking factor, rich snippets (like star ratings and FAQ accordions) dramatically increase click-through rates (CTR)."
      }
    ],
    useCases: [
      "FAQ Accordions: Display expandable questions directly under your search result snippet.",
      "Product Catalog: Show stock status, price, and customer review stars on Google Search."
    ],
    limitations: [
      "Adding schema markup makes your page eligible for rich snippets, but Google decides whether to display them based on page quality and relevance."
    ],
    examples: [
      "FAQ Schema: {\"@context\": \"https://schema.org\", \"@type\": \"FAQPage\", \"mainEntity\": [{\"@type\": \"Question\", \"name\": \"What is Exismic?\", ...}]}"
    ],
    terminology: [
      {
        term: "JSON-LD",
        definition: "The recommended structured data format by Google for implementing Schema.org tags."
      },
      {
        term: "Rich Snippet",
        definition: "Enhanced search result displaying stars, prices, FAQ accordions, or cooking times."
      }
    ],
    updatedAt: "2026-09-30T00:00:00.000Z"
  },
  // 💻 Developer Suite
  {
    id: 'base64-encoder',
    name: 'Base64 Encoder / Decoder',
    description: "Convert text, logos, or files into shareable code strings and decode them back to their original form with instant side-by-side previews.",
    category: 'developer',
    icon: 'Binary' as IconName,
    href: '/tools/base64-encoder',
    popular: true,
    suggestions: ["Encode text string to Base64 UTF-8", "Decode Base64 string to plain text", "Convert API authorization header"],
    seoTitle: "Free Base64 Encoder & Decoder Online - Convert Text & Files",
    seoDescription: "Quickly encode and decode text, strings, and files to Base64 format online with instant live preview.",
    seoKeywords: ["base64 encoder","base64 decoder","base64 to image","convert string to base64","Exismic"]
  },
  {
    id: 'uuid-generator',
    name: 'UUID / GUID Generator',
    description: "Create batches of unique random identification tags with one click, perfect for testing apps, organizing database records, and software projects.",
    category: 'developer',
    icon: 'Key' as IconName,
    href: '/tools/uuid-generator',
    suggestions: ["Generate 10 random Version-4 UUIDs", "Format UUIDs with hyphens and uppercase", "Copy UUID array for database seed script"],
    seoTitle: "Free UUID Generator - Generate Random v4 UUIDs Online",
    seoDescription: "Generate random, unique RFC 4122 Version-4 UUIDs and GUIDs instantly in bulk for databases and APIs.",
    seoKeywords: ["uuid generator","guid generator","v4 uuid generator online","bulk uuid generator","Exismic"]
  },
  {
    id: 'hash-generator',
    name: 'Hash Generator (MD5 / SHA-256)',
    description: "Create one-way digital fingerprints for your text and files to verify integrity, compare checksums, or secure passwords with instant outputs.",
    category: 'developer',
    icon: 'Fingerprint' as IconName,
    href: '/tools/hash-generator',
    popular: true,
    suggestions: ["Generate SHA-256 hash for password verification", "Calculate MD5 checksum for string", "Generate SHA-512 cryptographic hash"],
    seoTitle: "Free Online Hash Generator - MD5, SHA-1, SHA-256, SHA-512",
    seoDescription: "Compute MD5, SHA-1, SHA-256, and SHA-512 cryptographic hashes online instantly with real-time updates.",
    seoKeywords: ["hash generator","md5 hash generator","sha256 generator online","hash string","Exismic"]
  },
  {
    id: 'regex-tester',
    name: 'Regex Tester & Debugger',
    description: "Easily test and fine-tune your text-matching rules with colorful live highlights, sample test cases, and a handy quick-reference guide.",
    category: 'developer',
    icon: 'SearchCode' as IconName,
    popular: true,
    href: '/tools/regex-tester',
    suggestions: ["Validate email address regex pattern", "Extract URLs from text paragraph", "Test phone number regex match groups"],
    seoTitle: "Free Regex Tester & Debugger Online - JavaScript Regular Expressions",
    seoDescription: "Test regular expressions online with live match highlights, capture group breakdown, and regex cheat sheets.",
    seoKeywords: ["regex tester","regex debugger","regular expression tester online","Exismic"]
  },
  {
    id: 'lorem-ipsum-generator',
    name: 'Lorem Ipsum Generator',
    description: "Generate neat placeholder paragraphs, sentences, or bullet points to mock up your web designs and layouts before the real copy is ready.",
    category: 'developer',
    icon: 'Pilcrow' as IconName,
    href: '/tools/lorem-ipsum-generator',
    suggestions: ["Generate 5 paragraphs of Lorem Ipsum placeholder text", "Wrap generated text in HTML <p> tags", "Generate 50 dummy words for UI design"],
    seoTitle: "Free Lorem Ipsum Generator - Create Custom Dummy Text",
    seoDescription: "Generate dummy Lorem Ipsum placeholder text for web design, mockups, and layout prototypes.",
    seoKeywords: ["lorem ipsum generator","dummy text generator","filler text maker","Exismic"]
  },
  // 📚 Student & Academic Suite
  {
    id: 'pdf-to-notes',
    name: 'PDF to AI Study Notes',
    description: "Turn dense textbook chapters and lecture slides into easy-to-read study summaries, core concept bullet points, and practice questions for your exams.",
    category: 'student',
    icon: 'BookOpen' as IconName,
    href: '/tools/pdf-to-notes',
    popular: true,
    suggestions: ["Summarize biology chapter PDF into key concepts", "Extract exam study notes from lecture PDF", "Create Q&A practice list from textbook text"],
    seoTitle: "Free AI PDF to Notes Converter - Summarize Study Material",
    seoDescription: "Convert textbook PDFs and lecture notes into organized AI study guides, summaries, and revision notes.",
    seoKeywords: ["pdf to study notes","ai notes generator from pdf","summarize pdf into notes","Exismic"]
  },
  {
    id: 'flashcard-generator',
    name: 'AI Flashcard Generator',
    description: "Transform your class notes and reading assignments into digital flip cards with a fun study quiz mode to help you ace your next test.",
    category: 'student',
    icon: 'Layers' as IconName,
    href: '/tools/flashcard-generator',
    popular: true,
    suggestions: ["Create medical terminology flashcards", "Generate 10 vocabulary flashcards for Spanish", "Build history exam flashcard deck"],
    seoTitle: "Free AI Flashcard Generator - Create Digital Study Decks Online",
    seoDescription: "Instantly create interactive digital flashcards from notes or topics for revision and exam prep.",
    seoKeywords: ["flashcard generator","ai flashcard maker","pdf to flashcards","Exismic"]
  },
  {
    id: 'citation-generator',
    name: 'Academic Citation Generator',
    description: "Create perfectly formatted bibliographies and source references for books, articles, and websites in all major academic styles in one click.",
    category: 'student',
    icon: 'Quote' as IconName,
    href: '/tools/citation-generator',
    suggestions: ["Generate APA 7 citation for website article", "Create MLA 9 book reference with DOI", "Format Chicago style journal citation"],
    seoTitle: "Free Academic Citation Generator - APA 7, MLA 9, Chicago & Harvard",
    seoDescription: "Generate accurate academic citations and bibliographies in APA 7, MLA 9, Chicago, and Harvard formats instantly.",
    seoKeywords: ["citation generator","apa citation generator","mla citation builder","chicago style generator","Exismic"],
    seoIntro: "Generate accurate bibliographies, reference lists, and in-text citations in APA 7th, MLA 9th, Chicago, and Harvard formats with official academic styling rules.",
    howToSteps: [
      "Select your target citation style: APA 7, MLA 9, Chicago 17, or Harvard.",
      "Enter your source details such as authors, publication year, article title, and journal/website URL.",
      "Click 'Generate Citation' and copy your formatted in-text and bibliographic entries with 1 click."
    ],
    features: [
      "Official Academic Standards: Aligned with the latest APA 7th, MLA 9th, Chicago, and Harvard guidelines.",
      "Dual Citation Formats: Generates both in-text parenthetical citations and complete bibliography entries.",
      "Multi-Source Media Support: Formats journal papers, book chapters, news articles, websites, and videos.",
      "1-Click Clipboard Export: Copy clean italicized references directly into Microsoft Word or Google Docs."
    ],
    faqs: [
      { question: "Which academic citation styles are supported?", answer: "We support APA 7th edition, MLA 9th edition, Chicago 17th edition (Author-Date & Notes), and standard Harvard referencing." },
      { question: "Does the generator format italics and punctuation properly?", answer: "Yes, titles, journal names, volume numbers, and punctuation strictly match the official style manuals." },
      { question: "Can I cite online web pages and digital articles?", answer: "Yes. Simply input the URL, author, article title, website title, and access date to generate a complete citation." }
    ],
    useCases: [
      "Building bibliography and works-cited pages for term papers and dissertations",
      "Formatting parenthetical citations for research proposals and essays",
      "Organizing source references for academic literature reviews"
    ],
    limitations: [
  "Check names, dates, titles, and the required citation style against the original source before submitting."
],
    examples: [
  "Enter a book title, author, and publication year, then verify the formatted reference against your course style guide."
],
    updatedAt: "2026-09-29T00:00:00.000Z"
  },
  {
    id: 'math-solver',
    name: 'AI Step-by-Step Math Solver',
    description: "Get clear, step-by-step explanations for tough algebra, calculus, and geometry problems so you understand how to solve them on your own.",
    category: 'student',
    icon: 'BrainCircuit' as IconName,
    href: '/tools/math-solver',
    popular: true,
    suggestions: ["Solve quadratic equation 2x^2 + 5x - 3 = 0 step-by-step", "Calculate derivative of f(x) = x^3 * sin(x)", "Solve linear algebra system of equations"],
    seoTitle: "Free AI Math Solver - Step-by-Step Algebra & Calculus Solutions",
    seoDescription: "Solve math equations, calculus problems, and word problems step-by-step with clear explanations and LaTeX formatting.",
    seoKeywords: ["ai math solver","step by step math solver","algebra solver online","Exismic"],
    seoIntro: "Solve complex algebraic, calculus, and geometry equations with sequential step-by-step mathematical reasoning, intermediate operations, and clear LaTeX notation.",
    howToSteps: [
      "Type or paste your math equation, polynomial, or calculus problem into the solver above.",
      "Select your solving goal (e.g. solve for x, compute derivative, find roots, or simplify).",
      "Study the sequential working steps, underlying formulas, and verified final answer."
    ],
    features: [
      "Step-by-Step Working: Clearly displays every intermediate step from factoring to substitution.",
      "Clean LaTeX Typography: Renders complex fractions, radicals, integrals, and matrices crisply.",
      "Comprehensive Math Coverage: Solves algebra, polynomials, trigonometry, limits, and derivatives.",
      "Conceptual Explanations: Explains the underlying mathematical theorems behind each calculation."
    ],
    faqs: [
      { question: "What branches of mathematics can this solver solve?", answer: "It supports pre-algebra, quadratic equations, systems of linear equations, trigonometry, limits, derivatives, and basic integrals." },
      { question: "Does it provide the step-by-step working or only the answer?", answer: "It provides the complete sequential solution showing intermediate operations, formula applications, and the final solution." },
      { question: "Is the math solver completely free for students?", answer: "Yes, it is 100% free with no subscription, paywall, or login required." }
    ],
    useCases: [
      "Checking homework assignments and locating where an arithmetic or factoring error occurred",
      "Studying calculus derivatives and polynomial roots step-by-step",
      "Preparing for math exams by practicing problem-solving techniques"
    ]
  },
  // Option 1: Creator & Social Tools
  {
    id: 'hook-script-generator',
    name: 'AI Video Hook & Script Generator',
    description: "Generate viral opening hooks, fast-paced script outlines, and clear calls-to-action that keep viewers watching your TikToks, Reels, and Shorts.",
    category: 'creator',
    icon: 'Clapperboard' as IconName,
    href: '/tools/creator/hook-script-generator',
    popular: true,
    suggestions: ["Create a 30s TikTok script for an AI photo editing tool", "Generate 5 viral hooks for a fitness app launch", "Write a YouTube Shorts outline for productivity tips"],
    seoTitle: "Free AI Video Hook & Script Generator for Shorts, TikTok & Reels",
    seoDescription: "Generate high-converting video hooks, timestamped script outlines, and CTAs for YouTube Shorts, TikTok, and Reels.",
    seoKeywords: ["video hook generator","script generator for tiktok","reels hook writer","Exismic"]
  },
  {
    id: 'linkedin-formatter',
    name: 'LinkedIn Post Formatter & Hook Creator',
    description: "Format long thoughts into easy-to-read LinkedIn posts with clean line breaks, bold headers, bullet lists, and a test score for your opening hook.",
    category: 'creator',
    icon: 'FileText' as IconName,
    href: '/tools/creator/linkedin-formatter',
    popular: true,
    suggestions: ["Format a story about quitting 9-5 job into a viral LinkedIn post", "Add bold unicode highlights and clean line breaks", "Analyze hook strength for B2B marketing post"],
    seoTitle: "Free LinkedIn Post Formatter & Viral Hook Score Analyzer",
    seoDescription: "Format LinkedIn posts with clean line breaks, custom typography, bullet points, and hook strength evaluation.",
    seoKeywords: ["linkedin post formatter","bold text for linkedin","linkedin hook creator","Exismic"]
  },
  {
    id: 'thumbnail-analyzer',
    name: 'YouTube Thumbnail CTR & Contrast Analyzer',
    description: "Upload your video thumbnail to check color contrast, face visibility, and text readability so your videos get clicked more often in browse feeds.",
    category: 'creator',
    icon: 'ScanEye' as IconName,
    href: '/tools/creator/thumbnail-analyzer',
    requiresFileUpload: true,
    acceptedFileTypes: ['image/png', 'image/jpeg', 'image/webp'],
    suggestions: ["Analyze contrast and text legibility of my YouTube thumbnail", "Predict CTR score for tech review thumbnail", "Check mobile vs desktop thumbnail visibility"],
    seoTitle: "Free YouTube Thumbnail CTR Analyzer & Visual Checker",
    seoDescription: "Analyze YouTube thumbnail contrast, focal points, and text legibility to maximize click-through rate.",
    seoKeywords: ["youtube thumbnail analyzer","thumbnail ctr analyzer","thumbnail contrast checker","Exismic"]
  },
  {
    id: 'carousel-generator',
    name: 'AI Social Carousel Generator',
    description: "Turn rough notes and articles into stylish multi-slide swipe carousels for Instagram and LinkedIn with customizable colors and sleek dark themes.",
    category: 'creator',
    icon: 'Presentation' as IconName,
    href: '/tools/creator/carousel-generator',
    suggestions: ["Create a 5-slide carousel on 10 AI tools every creator needs", "Generate a design carousel for startup advice", "Build a slide deck outline for LinkedIn"],
    seoTitle: "Free AI Social Carousel Generator for LinkedIn & Instagram",
    seoDescription: "Build multi-slide image carousels and PDF decks for Instagram and LinkedIn with customizable visual themes.",
    seoKeywords: ["social carousel generator","instagram carousel maker","linkedin carousel pdf generator","Exismic"]
  },
  {
    id: 'device-mockup',
    name: '3D Device & App Mockup Studio',
    description: "Wrap your screenshots, app designs, and website previews into photorealistic 3D iPhones, MacBooks, and glass browser frames with custom angles and studio lighting.",
    category: 'creator',
    icon: 'Laptop' as IconName,
    href: '/tools/creator/device-mockup',
    popular: false,
    hidden: true,
    indexable: false,
    suggestions: [
      "Wrap mobile app screenshot in iPhone 16 Pro",
      "Create 3D isometric MacBook mockup for SaaS website",
      "Export transparent PNG mockup for Figma design"
    ],
    requiresFileUpload: true,
    acceptedFileTypes: ['image/*'],
    seoTitle: "Free 3D Device Mockup Generator - iPhone, MacBook & Browser Frames",
    seoDescription: "Create stunning 3D device mockups online for free. Wrap your app and website screenshots in photorealistic iPhone 16 Pro, MacBook, iPad, and browser frames with 4K export.",
    seoKeywords: [
      "device mockup generator",
      "3d mockup generator",
      "iphone mockup online",
      "macbook mockup free",
      "app screenshot mockup",
      "website mockup creator",
      "Exismic"
    ]
  },

  // Option 2: SEO & Webmaster Suite
  {
    id: 'serp-simulator',
    name: 'Google SERP Snippet Simulator',
    description: "Preview how your headline and summary will look on mobile and desktop Google searches before you publish, ensuring nothing gets cut off.",
    category: 'seo',
    icon: 'Eye' as IconName,
    href: '/tools/seo/serp-simulator',
    suggestions: ["Preview Google search snippet for Exismic AI tools", "Check pixel width limit for 60-character title", "Test mobile Google SERP snippet preview"],
    seoTitle: "Free Google SERP Snippet Simulator - Live Title & Meta Preview",
    seoDescription: "Preview title tags and meta descriptions in real-time desktop and mobile Google SERP simulators with pixel width verification.",
    seoKeywords: ["google serp simulator","serp snippet previewer","google search result preview","Exismic"],
    seoIntro: "Preview your website's search title, meta description, and URL breadcrumbs in realistic desktop and mobile Google search mockups with real-time character and pixel width meters.",
    howToSteps: [
      "Type your page title, meta description, and target web address into the simulator.",
      "Toggle between Desktop and Mobile preview modes to check responsiveness.",
      "Switch between Google Dark Mode and Light Mode to test visual contrast.",
      "Optionally add rich snippet star ratings and publication date stamps.",
      "Copy the generated HTML title and meta description tags."
    ],
    features: [
      "Pixel-Accurate Google Preview: Authentic desktop (580px) and mobile search snippet cards.",
      "Dual Theme Simulator: Test appearance against both Google Dark and Light themes.",
      "Rich Snippet Add-Ons: Add star ratings, review counts, and publication date markers.",
      "Truncation Alerter: Flags text exceeding 60 characters or 580px with immediate feedback."
    ],
    faqs: [
      {
        question: "Why does Google truncate search titles?",
        answer: "Google sets a maximum pixel width (~580px on desktop) for title tags. If your title exceeds this threshold, Google replaces the excess words with an ellipsis (...)."
      },
      {
        question: "Does desktop SERP differ from mobile SERP?",
        answer: "Yes. Mobile Google searches feature narrower width constraints, distinct favicon placements, and often render slightly shorter descriptions."
      }
    ],
    useCases: [
      "Pre-Launch Testing: Verify headline visibility before publishing new landing pages.",
      "Client Pitching: Export realistic Google SERP mockups for marketing client presentations."
    ],
    limitations: [
      "Google dynamically adjusts snippet formats and may bold search query terms matching user intent."
    ],
    examples: [
      "Page Title: 'Exismic Studio' -> Desktop SERP: 'Exismic - All-in-One AI Studio for Audio, Video & Photo Editing' (Under 60 chars)"
    ],
    terminology: [
      {
        term: "SERP Simulator",
        definition: "An interactive visual tool that mirrors Google's exact search results layout."
      },
      {
        term: "Pixel Width",
        definition: "The physical horizontal space a font occupies on the search engine results screen."
      }
    ],
    updatedAt: "2026-09-30T00:00:00.000Z"
  },
  {
    id: 'og-previewer',
    name: 'Open Graph (OG) Social Link Previewer',
    description: "See exactly how your link title, banner image, and summary card will look when shared on Twitter, LinkedIn, Facebook, and Discord chats.",
    category: 'seo',
    icon: 'Share2' as IconName,
    href: '/tools/seo/og-previewer',
    suggestions: ["Preview Open Graph social card for blog post", "Check Twitter Summary Large Image card tags", "Validate og:image dimensions and description"],
    seoTitle: "Free Open Graph (OG) Social Card Previewer & Meta Tag Validator",
    seoDescription: "Preview social media card embeds for Twitter, LinkedIn, Facebook, and Discord before publishing your link.",
    seoKeywords: ["open graph previewer","og tag checker","social card previewer","Exismic"],
    seoIntro: "Preview how your links appear across Twitter/X, LinkedIn, Facebook, and Discord with accurate aspect ratio checks and 1-click HTML meta tag generation.",
    howToSteps: [
      "Input your link title, description, banner image URL, and target webpage link.",
      "Switch between Twitter, LinkedIn, Facebook, and Discord preview tabs.",
      "Verify image dimensions follow the optimal 1200x630 (1.91:1) standard.",
      "Copy the complete OpenGraph and Twitter Card meta tag block directly into your HTML head."
    ],
    features: [
      "Multi-Network Emulation: Real-time cards for Twitter Summary Large Image, LinkedIn, Facebook, and Discord.",
      "Image Aspect Ratio Validation: Ensures banners won't be awkwardly cropped or letterboxed.",
      "Instant Blueprints: Includes preloaded templates for SaaS launches, dev tools, and articles.",
      "Comprehensive Tag Generator: Produces both standard OpenGraph and Twitter-specific meta tags."
    ],
    faqs: [
      {
        question: "What size should an Open Graph (OG) image be?",
        answer: "The standard recommended size is 1200 x 630 pixels, which corresponds to a 1.91:1 aspect ratio. This ensures sharp display on high-DPI smartphone and desktop screens."
      },
      {
        question: "Why aren't my social cards updating on Twitter or Facebook?",
        answer: "Social networks cache link previews for days or weeks. Use the platform's official debugger (e.g. Facebook Sharing Debugger) to force a cache refresh."
      }
    ],
    useCases: [
      "Product Launches: Test social media link cards before announcing on Twitter or LinkedIn.",
      "Blog Promotion: Ensure featured images and headlines look engaging in chat app shares."
    ],
    limitations: [
      "The preview simulates standard platform rendering; dark and light mode appearances on user devices may vary."
    ],
    examples: [
      "og:title: 'Exismic Studio' + og:image: 1200x630 -> Twitter Summary Large Image Card"
    ],
    terminology: [
      {
        term: "Open Graph (OG)",
        definition: "A protocol introduced by Facebook that allows web pages to become rich objects in social networks."
      },
      {
        term: "Twitter Card",
        definition: "Twitter's proprietary metadata standard for rich tweets with media summaries."
      }
    ],
    updatedAt: "2026-09-30T00:00:00.000Z"
  },
  {
    id: 'canonical-generator',
    name: 'Canonical & Hreflang Tag Generator',
    description: "Tell search engines which version of your page is the main one to prevent duplicate content issues and help international readers find the right language.",
    category: 'seo',
    icon: 'Link' as IconName,
    href: '/tools/seo/canonical-generator',
    suggestions: ["Generate canonical tag for https://www.exismic.xyz", "Create multi-language hreflang tags for EN, ES, and FR", "Format self-referential link tags"],
    seoTitle: "Free Canonical & Hreflang Tag Generator for International SEO",
    seoDescription: "Generate valid canonical and hreflang HTML tags to prevent duplicate content penalties and target international search audiences.",
    seoKeywords: ["canonical tag generator","hreflang tag generator","seo canonical url creator","Exismic"],
    seoIntro: "Generate canonical master link tags and multi-language hreflang HTML meta directives to prevent duplicate content indexing penalties and guide international searchers.",
    howToSteps: [
      "Enter your authoritative master URL into the canonical input field.",
      "Toggle formatting rules: force HTTPS, trailing slash enforcement, or strip tracking parameters.",
      "Add regional and translated language variations using quick presets or custom language codes.",
      "Copy the generated HTML canonical and hreflang tags."
    ],
    features: [
      "Instant Sanitization: Automatically strips UTM tracking tags and standardizes protocol.",
      "Hreflang Manager: Quick-add buttons for US, UK, Spanish, French, German, Japanese, and x-default.",
      "Duplicate Prevention: Prevents search engines from penalizing identical content across multiple URLs.",
      "Compliance Checklist: Verifies self-referential links, HTTPS completeness, and fallback defaults."
    ],
    faqs: [
      {
        question: "What happens if I don't use a canonical tag?",
        answer: "Without a canonical tag, search engines may treat URL variations (like http://, https://, www., non-www, trailing slashes, or query strings) as separate duplicate pages, splitting your ranking power."
      },
      {
        question: "What is the purpose of the x-default hreflang tag?",
        answer: "The x-default directive tells search engines which page to show visitors when their language or region doesn't match any of your specified translated pages."
      }
    ],
    useCases: [
      "E-Commerce Filter Pages: Point sorted product lists (e.g. ?sort=price) back to the clean master category URL.",
      "Multi-Language Portals: Direct Spanish speakers to /es and English speakers to /en seamlessly."
    ],
    limitations: [
      "Canonical tags are a strong hint rather than an absolute directive; Google will evaluate whether the canonical URL truly represents the content."
    ],
    examples: [
      "<link rel=\"canonical\" href=\"https://cloudspark.io/pricing\" />",
      "<link rel=\"alternate\" hreflang=\"es-ES\" href=\"https://cloudspark.io/es/pricing\" />"
    ],
    terminology: [
      {
        term: "Canonical URL",
        definition: "The single primary, authoritative web address chosen by a webmaster for a page."
      },
      {
        term: "Hreflang",
        definition: "An HTML attribute specifying the language and geographical targeting of a webpage."
      }
    ],
    updatedAt: "2026-09-30T00:00:00.000Z"
  },

  // Option 3: Developer & Data Suite
  {
    id: 'json-to-types',
    name: 'JSON to TypeScript & Zod Converter',
    description: "Paste any sample data snippet and automatically generate clean, structured code definitions ready to drop directly into your modern web apps.",
    category: 'developer',
    icon: 'FileCode2' as IconName,
    href: '/tools/developer/json-to-types',
    popular: true,
    suggestions: ["Convert API response JSON to TypeScript interfaces", "Generate Zod schema from user profile JSON", "Format nested JSON object into TypeScript type"],
    seoTitle: "Free JSON to TypeScript & Zod Schema Converter Online",
    seoDescription: "Convert JSON objects into type-safe TypeScript interfaces, types, and Zod validator schemas instantly.",
    seoKeywords: ["json to typescript","json to zod schema","convert json to type definitions","Exismic"]
  },
  {
    id: 'svg-optimizer',
    name: 'SVG Optimizer & File Cleaner (SVGO)',
    description: "Clean up messy graphic files by stripping hidden bloat and extra tags, cutting file size in half while keeping the visual quality 100% sharp.",
    category: 'developer',
    icon: 'FileCheck' as IconName,
    href: '/tools/developer/svg-optimizer',
    suggestions: ["Clean SVG code exported from Figma", "Compress SVG file size for web fast loading", "Remove inline width/height and XML namespaces"],
    seoTitle: "Free SVG Optimizer & File Cleaner - Reduce SVG File Size Online",
    seoDescription: "Optimize and clean SVG files online to shrink file sizes, strip metadata, and format code for web production.",
    seoKeywords: ["svg optimizer","svgo online cleaner","minify svg file","Exismic"]
  },
  {
    id: 'cron-generator',
    name: 'Cron Expression Generator & Explainer',
    description: "Set up recurring schedules for background jobs and reminders using a simple visual picker, with plain-English explanations of when it runs.",
    category: 'developer',
    icon: 'Clock' as IconName,
    href: '/tools/developer/cron-generator',
    suggestions: ["Generate cron job for every 5 minutes on weekdays", "Translate cron expression 0 0 * * 0 to plain English", "Build cron schedule for daily midnight task"],
    seoTitle: "Free Cron Expression Generator & Human Reader - Visual Cron Builder",
    seoDescription: "Build, parse, and explain 5-part cron expressions visually with human-readable descriptions and next execution times.",
    seoKeywords: ["cron generator","cron expression explainer","crontab generator online","Exismic"]
  },
  {
    id: 'sql-builder',
    name: 'Visual SQL Query Builder & AI Assistant',
    description: "Write database lookups just by explaining what records you want to find in plain English, or build queries visually without memorizing commands.",
    category: 'developer',
    icon: 'Database' as IconName,
    href: '/tools/sql-builder',
    suggestions: ["Build SQL query to find active users with > $100 spent", "Convert 'Show top 5 selling products this month' to SQL", "Generate PostgreSQL query with JOIN and GROUP BY"],
    seoTitle: "Free Visual SQL Query Builder & Natural Language to SQL Assistant",
    seoDescription: "Build complex SQL queries visually or convert plain text prompts into clean PostgreSQL, MySQL, and SQLite queries.",
    seoKeywords: ["sql query builder","ai sql generator","visual sql query builder","Exismic"]
  },
  {
    id: 'code-snippet',
    name: 'Aesthetic Code Snippet Studio',
    description: "Turn your code into beautiful, glowing images for social media, blogs, presentations, and docs. Pick themes, window frames, and gradient backdrops, then copy or download in one click.",
    category: 'developer',
    icon: 'Code2' as IconName,
    href: '/tools/developer/code-snippet',
    popular: true,
    proPowerPack: true,
    suggestions: ["Create a glowing code screenshot for Twitter and LinkedIn", "Make code images with macOS window style and Dracula theme", "Save code snippet with clean transparent background"],
    seoTitle: "Free Aesthetic Code Snippet Studio - Create Beautiful Code Images Online",
    seoDescription: "Turn code into beautiful, glowing images with custom themes, macOS window frames, and vibrant gradients. Download PNG, SVG, or copy instantly.",
    seoKeywords: ["code snippet image generator", "code to image", "carbon alternative", "ray so alternative", "beautify code screenshot", "code image maker", "Exismic"]
  },
  {
    id: 'favicon-studio',
    name: 'Favicon & App Icon Studio',
    description: "Generate complete favicon and app icon kits for websites, iPhone, Android, and web apps. Create from images, emojis, or letters, and download a ready-to-use icon pack.",
    category: 'developer',
    icon: 'Globe' as IconName,
    href: '/tools/developer/favicon-studio',
    popular: true,
    proPowerPack: true,
    suggestions: ["Create a favicon from an emoji", "Generate iPhone and Android app icons from image", "Make a clean letter monogram favicon"],
    seoTitle: "Free Favicon & App Icon Studio - Generate Web & Mobile Icons Online",
    seoDescription: "Create favicons, Apple touch icons, and Android app icons from images, emojis, or letters. Preview on browser tabs and phones, then download the complete icon pack.",
    seoKeywords: ["favicon generator", "app icon maker", "generate favicon pack", "apple touch icon generator", "android app icon creator", "pwa icon builder", "Exismic"]
  },
  {
    id: 'mesh-gradient',
    name: 'CSS Mesh Gradient & Glass Studio',
    description: "Create flowing, organic multi-color background gradients and frosted glass cards in real time. Drag color points, adjust blur and shine, and copy website code or download 4K wallpapers.",
    category: 'developer',
    icon: 'Palette' as IconName,
    href: '/tools/developer/mesh-gradient',
    popular: true,
    proPowerPack: true,
    suggestions: ["Make a dark obsidian flowing gradient for a website hero", "Style a frosted glass card with blur and glowing border", "Download 4K gradient wallpaper for phone and desktop"],
    seoTitle: "Free CSS Mesh Gradient & Glassmorphism Studio - Flowing Gradients & Glass Cards",
    seoDescription: "Design beautiful flowing mesh gradients and frosted glass cards online for free. Drag color points, customize glass blur and border shine, then copy CSS, Tailwind, or download 4K images.",
    seoKeywords: ["css mesh gradient generator", "mesh gradient maker", "glassmorphism generator", "frosted glass css", "gradient wallpaper 4k", "tailwind glass card", "Exismic"]
  },
  {
    id: 'post-mockup',
    name: 'Fake Social Post & Tweet Studio',
    description: "Design photorealistic Twitter / X posts, Threads, and Instagram comment cards in seconds. Customize names, handles, verified badges, numbers, and themes for viral videos and presentations.",
    category: 'creator',
    icon: 'Share2' as IconName,
    href: '/tools/creator/post-mockup',
    popular: true,
    proPowerPack: true,
    suggestions: ["Create a viral Twitter hook for a YouTube Short", "Mockup a Threads post with custom engagement metrics", "Design a verified Instagram comment screenshot"],
    seoTitle: "Free Fake Tweet & Social Post Mockup Generator - Twitter, Threads & Instagram",
    seoDescription: "Create realistic fake tweets, Threads posts, and Instagram comment mockups online for free. Customize verified badges, avatars, likes, and themes with 1-click image copy and download.",
    seoKeywords: ["fake tweet generator", "tweet mockup maker", "fake twitter post generator", "threads post generator", "fake instagram comment generator", "social post mockup", "Exismic"]
  },
  {
    id: 'og-banner',
    name: 'Social Share Banner Studio (OG Maker)',
    description: "Design custom 1200x630 social preview banners, Open Graph cards, and blog hero graphics in real time. Choose from 5 layouts, customize glowing themes, preview on Twitter and Discord, and download in 1 click.",
    category: 'seo',
    icon: 'ImageIcon' as IconName,
    href: '/tools/seo/og-banner',
    popular: true,
    proPowerPack: true,
    suggestions: ["Design a 1200x630 Open Graph banner for a blog article", "Create a GitHub repository social preview card", "Make a high-converting product launch social banner"],
    seoTitle: "Free Open Graph (OG) Banner Studio - Create 1200x630 Social Share Images",
    seoDescription: "Design custom Open Graph (OG) social share banner images (1200x630) for Twitter, Discord, LinkedIn, and Facebook. Customize titles, branding, and gradients with 1-click download.",
    seoKeywords: ["og image generator", "social share banner maker", "open graph image creator", "twitter card banner maker", "1200x630 banner generator", "social preview generator", "Exismic"],
    seoIntro: "Design custom 1200x630 social preview banners, Open Graph cards, and blog hero graphics in real time with customizable glowing themes and 1-click PNG export.",
    howToSteps: [
      "Choose from 5 responsive banner layouts (SaaS Launch, Tech Blog, GitHub Repo, Minimalist, Split Showcase).",
      "Select a radiant cyber color theme (Obsidian, Cyber, Sunset, Emerald, Carbon, Solaris).",
      "Customize your headline, subtitle, author name, domain, and verified badge.",
      "Preview on Twitter, Discord, and LinkedIn, then download a high-resolution 1200x630 PNG."
    ],
    features: [
      "5 Production Layouts: Tailored for SaaS launches, developer repos, and editorial blog posts.",
      "Radiant Cyber Themes: Premium obsidian, cyber cyan, and emerald glowing gradients.",
      "Real-Time Canvas: High-DPI export powered by client-side rendering with zero watermarks.",
      "Social Simulator Previews: See how the banner looks inside Twitter, Discord, and LinkedIn feeds."
    ],
    faqs: [
      {
        question: "What resolution are the downloaded OG banners?",
        answer: "Banners are exported at exactly 1200 x 630 pixels at 2x retina clarity, conforming perfectly to Facebook, Twitter, and LinkedIn image standards."
      },
      {
        question: "Can I use custom avatars or logos?",
        answer: "Yes, you can upload your own PNG or SVG logo or choose from high-end geometric monogram presets."
      }
    ],
    useCases: [
      "Product Hunt & Launch Day: Create eye-catching teaser cards for social media announcements.",
      "Technical Blog Headers: Standardize editorial post previews across engineering publications."
    ],
    limitations: [
      "Downloaded images should be hosted on a public CDN or website server so social crawlers can fetch them via og:image."
    ],
    examples: [
      "Headline: 'Exismic Studio' -> Layout: SaaS Launch -> Theme: Cyber -> Export 1200x630 PNG"
    ],
    terminology: [
      {
        term: "Social Share Banner",
        definition: "The rich banner image that unfurls automatically when a URL is shared online."
      },
      {
        term: "Retina Scaling",
        definition: "Rendering at double pixel density so graphics appear crisp on high-DPI displays."
      }
    ],
    updatedAt: "2026-09-30T00:00:00.000Z"
  },
  {
    id: 'slowed-reverb',
    name: 'Slowed + Reverb & Sped-Up Music Studio',
    description: "Transform songs into aesthetic Slowed + Reverb or Sped-Up Nightcore tracks in seconds. Customize speed, cathedral reverb, and bass rumble with live visualizer and instant audio download.",
    category: 'audio',
    icon: 'Headphones' as IconName,
    href: '/tools/audio/slowed-reverb',
    popular: true,
    proPowerPack: true,
    suggestions: ["Create a 0.85x slowed + reverb track for a TikTok video", "Make an energetic sped-up nightcore version of a song", "Add giant cathedral echo and deep bass to audio"],
    seoTitle: "Free Slowed + Reverb & Sped-Up Music Generator - TikTok & Reels Audio",
    seoDescription: "Transform any song into Slowed + Reverb, Sped-Up Nightcore, or Lo-Fi audio online for free. Adjust tempo, room echo, and bass boost with live visualizer and 1-click audio download.",
    seoKeywords: ["slowed and reverb generator", "slowed reverb maker", "sped up audio maker", "nightcore generator", "reverb audio online", "tiktok audio editor", "Exismic"]
  },
  {
    id: 'redact-blur',
    name: 'Private Photo & Screen Blur Studio',
    description: "Blur, pixelate, or black out passwords, faces, credit cards, and private text from screenshots and photos. 100% on-device client privacy with instant clipboard copy and clean image download.",
    category: 'image',
    icon: 'ShieldCheck' as IconName,
    href: '/tools/image/redact-blur',
    popular: true,
    proPowerPack: true,
    suggestions: ["Blur out passwords and sensitive keys on a screenshot", "Pixelate faces or phone numbers on a photo", "Black out credit card numbers before sharing online"],
    seoTitle: "Free Private Photo & Screen Blur Studio - Redact Sensitive Data Online",
    seoDescription: "Blur, pixelate, or black out sensitive text, passwords, faces, and documents online. 100% private in-browser processing with 1-click copy and download.",
    seoKeywords: ["blur image online", "redact screenshot", "pixelate photo free", "hide sensitive info online", "blur face in photo", "black out text in image", "Exismic"]
  },
  {
    id: 'teleprompter',
    name: 'Live Studio Teleprompter',
    description: "Distraction-free auto-scrolling script reader for video creators, presentations, and speeches. Features mirror mode for teleprompter glass, speed controls, and camera selfie preview.",
    category: 'creator',
    icon: 'Tv2' as IconName,
    href: '/tools/creator/teleprompter',
    popular: true,
    proPowerPack: true,
    suggestions: ["Record a smooth YouTube video with auto-scrolling script", "Use mirror mode on physical teleprompter glass", "Practice a presentation speech with camera preview"],
    seoTitle: "Free Online Teleprompter Studio - Mirror Mode & Camera Preview",
    seoDescription: "Free full-screen teleprompter for YouTubers, video creators, and presentations. Smooth auto-scroll, mirror mode for teleprompter glass, speed controls, and camera preview.",
    seoKeywords: ["online teleprompter", "free teleprompter software", "teleprompter mirror mode", "video script prompter", "youtube teleprompter online", "Exismic"]
  },
  {
    id: 'mind-map',
    name: 'Notes to Mind Map Studio',
    description: "Turn outlines, bullet points, and notes into interactive visual mind maps and concept trees. 100% private in-browser processing with 1-click high-res PNG and vector SVG downloads.",
    category: 'student',
    icon: 'Network' as IconName,
    href: '/tools/student/mind-map',
    popular: true,
    proPowerPack: true,
    suggestions: ["Turn lecture notes into an interactive concept tree", "Create a visual roadmap for studying exams", "Design a project launch plan with expandable branches"],
    seoTitle: "Free Notes to Mind Map Studio - Create Visual Concept Trees Online",
    seoDescription: "Turn notes, bullet points, and markdown outlines into interactive mind maps online. 100% free client-side processing, customizable themes, and 1-click PNG/SVG export.",
    seoKeywords: ["notes to mind map", "outline to mind map", "free online mind map maker", "concept tree generator", "markdown to mindmap", "student study map", "Exismic"]
  },
  {
    id: 'diff-checker',
    name: 'Text & Code Comparison Studio (Diff Checker)',
    description: "Compare two versions of code, contracts, or text side by side. Highlights added, removed, and modified lines with word-level precision. 100% private, zero server cost.",
    category: 'developer',
    icon: 'GitCompare' as IconName,
    href: '/tools/developer/diff-checker',
    popular: true,
    proPowerPack: true,
    suggestions: ["Compare two versions of a code file side by side", "Check changes between two drafts of a contract", "Generate a unified git patch for review"],
    seoTitle: "Free Text & Code Comparison Studio - Online Diff Checker",
    seoDescription: "Compare text and code side-by-side online. Highlights added, removed, and modified lines with word-level precision. Free client-side diff tool with unified and split view.",
    seoKeywords: ["diff checker online", "compare text online", "code diff tool", "side by side text comparison", "git diff online", "find differences between two texts", "Exismic"]
  },
  {
    id: 'audiogram',
    name: 'Audio Waveform Video Maker (Podcast Reels)',
    description: "Turn voice clips, podcast soundbites, and music into animated waveform videos for Instagram Reels, TikTok, and YouTube Shorts. 100% free client-side HD video export.",
    category: 'audio',
    icon: 'AudioWaveform' as IconName,
    href: '/tools/audio/audiogram',
    popular: true,
    proPowerPack: true,
    suggestions: ["Create an Instagram Reel with animated audio waveform bars", "Turn a podcast audio clip into a vertical TikTok video", "Generate a YouTube Shorts audiogram from voice recording"],
    seoTitle: "Free Audio Waveform Video Maker - Create Podcast Audiograms Online",
    seoDescription: "Free online audiogram maker. Convert audio and podcast clips into animated waveform videos for Instagram Reels, TikTok, and YouTube Shorts with $0 server cost.",
    seoKeywords: ["audiogram generator", "audio waveform video maker", "podcast video generator", "turn audio into video", "instagram reel waveform", "tiktok audio visualizer", "Exismic"]
  },
  {
    id: 'prompt-builder',
    name: 'AI Prompt Builder',
    description: "Turn simple 1-line ideas into clear, detailed prompts for ChatGPT, Claude, Gemini, and DeepSeek to get much better answers on your first try.",
    category: 'ai',
    icon: 'BrainCircuit' as IconName,
    href: '/tools/ai/prompt-builder',
    proPowerPack: true,
    suggestions: ["Turn a basic coding task into a detailed prompt", "Generate a structured Claude prompt with clear guidelines", "Build a high-converting marketing copywriting prompt"],
    seoTitle: "Free AI Mega-Prompt Builder - Master Prompt Engineering Online",
    seoDescription: "Engineer master prompts for ChatGPT, Claude, Gemini, and DeepSeek. Features CREATE and Chain-of-Thought frameworks, role personas, XML tags, and 1-click clipboard copy.",
    seoKeywords: ["ai prompt generator", "mega prompt builder", "prompt engineering tool", "claude prompt generator", "chatgpt prompt builder", "chain of thought prompt", "Exismic"]
  },
  {
    id: 'essay-outline-builder',
    name: 'AI Essay & Thesis Outline Builder',
    description: "Organize your paper from introduction to conclusion with strong arguments, thesis statements, and topic sentences that flow logically.",
    category: 'student',
    icon: 'ListTree' as IconName,
    href: '/tools/student/essay-outline-builder',
    suggestions: ["Build research paper outline on AI impact on education", "Generate thesis statement for climate change essay", "Create 5-paragraph essay structure for history paper"],
    seoTitle: "Free AI Essay & Thesis Outline Builder - Structured Academic Outlines",
    seoDescription: "Generate well-structured essay outlines, thesis statements, and topic sentences for academic research papers.",
    seoKeywords: ["essay outline generator","thesis outline builder","ai paper outline generator","Exismic"]
  },
  {
    id: 'plagiarism-checker',
    name: 'Text Similarity & Plagiarism Diff Checker',
    description: "Compare two drafts side-by-side to highlight identical sentences, matching phrases, and paraphrased sections with an exact overlap score.",
    category: 'student',
    icon: 'CopyCheck' as IconName,
    href: '/tools/student/plagiarism-checker',
    suggestions: ["Compare original essay draft with revised version", "Check similarity percentage between two articles", "Highlight exact matching phrases in two documents"],
    seoTitle: "Free Text Similarity & Plagiarism Diff Checker - Side-by-Side Comparison",
    seoDescription: "Compare two texts side-by-side with diff engine highlighting exact word matches, overlap percentage, and similarity metrics.",
    seoKeywords: ["text similarity checker","plagiarism diff checker","compare text differences","Exismic"]
  },
  {
    id: 'readability-assessor',
    name: 'Text Readability & Grade Level Assessor',
    description: "Check how clear and accessible your writing is, see the recommended reading grade level, and get tips to simplify overly complex sentences.",
    category: 'student',
    icon: 'Gauge' as IconName,
    href: '/tools/student/readability-assessor',
    suggestions: ["Check reading grade level of blog post", "Calculate Flesch-Kincaid Reading Ease score for article", "Find long complex sentences to simplify"],
    seoTitle: "Free Text Readability & Flesch-Kincaid Grade Level Assessor",
    seoDescription: "Assess text readability scores including Flesch-Kincaid Grade Level, Flesch Reading Ease, and Gunning Fog index.",
    seoKeywords: ["readability checker","flesch kincaid score calculator","grade level text assessor","Exismic"]
  },
  {
    id: 'hashtag-generator',
    name: 'AI Hashtag Generator',
    description: "Build balanced, platform-aware hashtag sets for Instagram, TikTok, YouTube Shorts, and X. Uses real AI to balance broad viral reach with engaged community tags.",
    category: 'creator',
    icon: 'Hash' as IconName,
    href: '/tools/hashtag-generator',
    popular: true,
    proPowerPack: true,
    suggestions: ["Generate Instagram Reels hashtags for coffee lovers", "Create TikTok FYP tags for streetwear fits", "Find YouTube Shorts tags for indie game dev"],
    seoTitle: "Free AI Hashtag Generator - Instagram, TikTok & YouTube Tags | Exismic",
    seoDescription: "Generate authentic, high-reach hashtag sets for Instagram, TikTok, YouTube Shorts, and X. Balanced viral reach, community tags, and long-tail search tags.",
    seoKeywords: ["hashtag generator", "instagram hashtags", "tiktok hashtags", "viral hashtags", "free hashtag tool", "youtube shorts tags", "Exismic"],
    seoIntro: "Generate tailored hashtag sets using artificial intelligence that balances broad viral discoverability, engaged subculture tags, and high-converting search keywords. Includes a live post caption simulator for Instagram, TikTok, and YouTube.",
    howToSteps: [
      "Select an instant niche blueprint or type your custom topics and keywords.",
      "Choose your target platform (Instagram, TikTok, YouTube, or X) and customize your tag count.",
      "Click Generate to synthesize your 3-tiered hashtag set and AI-crafted post caption.",
      "Preview the post in the live platform feed simulator and copy with 1 click."
    ],
    features: [
      "3-Tier Strategy Buckets: Balances broad viral reach, medium-volume community tags, and specific long-tail tags.",
      "Live Feed Caption Simulator: Preview your caption and tags inside realistic Instagram, TikTok, and YouTube Shorts UI.",
      "1-Click Multi-Format Export: Copy as inline tags, clean Instagram spacing dots, or YouTube comma lists.",
      "AI Post Caption Generation: Generates an engaging hook and caption tailored to your exact niche."
    ],
    faqs: [
      {
        question: "How many hashtags should I use on Instagram in 2026?",
        answer: "Instagram's official recommendation is between 3 to 5 hyper-relevant niche hashtags in your main caption rather than dumping 30 generic tags. This helps the AI categorization model accurately index your post."
      },
      {
        question: "How are the 3 hashtag tiers determined?",
        answer: "Broad Viral Reach tags have 500k+ to millions of posts for wide discovery. Targeted Community tags have 50k to 500k posts for engaged followers. Specific Long-Tail tags have high search intent for top ranking."
      },
      {
        question: "Does this tool work for TikTok and YouTube Shorts?",
        answer: "Yes, you can toggle between Instagram, TikTok, YouTube, and X / Twitter to generate platform-specific tags formatted for each platform's recommendation."
      },
      {
        question: "How do I format hashtags so they don't clutter my Instagram caption?",
        answer: "Use the 'Instagram Clean Dots' export format. It adds clean line-breaks with dots (. . .) above your hashtags, hiding them behind the '...more' button so your caption remains clean and readable."
      },
      {
        question: "Are these hashtags free to copy and use?",
        answer: "Yes. All hashtag generation, blueprints, and multi-format exports run in-browser and are 100% free with zero limits."
      }
    ],
    useCases: [
      "Instagram Reels & Carousels: Boost discoverability on the Explore page and feed recommendations.",
      "TikTok For You Page (FYP): Help TikTok's search insights and recommendation algorithm classify your video content.",
      "YouTube Shorts: Target specific search queries and appear on official YouTube hashtag shelf pages.",
      "X / Twitter Conversations: Engage in trending tech, business, and community discussions."
    ],
    limitations: [
      "Hashtags alone do not guarantee viral reach without engaging content, watch time, and retention.",
      "Banned or restricted hashtags by platforms should always be avoided."
    ],
    examples: [
      "Fitness & Gym: #fitnessmotivation #gymlife #progressiveoverload #pushdayworkout",
      "Travel & Nomad: #travelgram #wanderlust #slowtravel #bucketlistadventures",
      "Food & Recipes: #foodiegram #delicious #fromscratch #quickdinnerideas",
      "Cyberpunk Street Photography: #streetphotography #cyberpunk #neonstreets #rainydystopia"
    ]
  }
];

export const TOOLS: Tool[] = ALL_TOOLS.filter((t) => !t.hidden);
