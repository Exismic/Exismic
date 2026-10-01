// Category summaries describe the collection, without assigning every member
// the same formats, processing location, access requirements, or output rights.
export const CATEGORY_GUIDE_CONTENT_UPDATED_AT = "2026-10-01";

export const CATEGORY_GUIDES: Record<string, {
  title: string;
  intro: string;
  cards: Array<{ title: string; desc: string; badge: string }>;
  features: string[];
  faqs: Array<{ question: string; answer: string }>;
}> = {
  productivity: {
    title: "Everyday Work & Writing Utilities",
    intro: "Create QR codes, explore color palettes, test your typing, prepare a resume, review it against a job description, or draft application text and invoices. Choose a workspace for the task you need; local utilities and online AI workflows have different access and processing requirements.",
    cards: [
      { title: "QR codes", desc: "Prepare a code for the information you want to share.", badge: "Sharing" },
      { title: "Colors and typing", desc: "Explore a palette or practice typing with feedback.", badge: "Utilities" },
      { title: "Resume work", desc: "Draft a resume or review it against a target job description.", badge: "Applications" },
      { title: "Application and invoice drafts", desc: "Prepare cover letters, resume bullets, or invoice details for review.", badge: "Documents" },
    ],
    features: ["Separate tasks: Choose a utility rather than expecting one workspace to perform every operation.", "Processing varies: Some utilities run locally and AI requests use online services.", "Check access: Account, credit, and Pro requirements depend on the selected tool.", "Review output: Check links, wording, and personal details before sharing."],
    faqs: [{ question: "Do all productivity tools work offline?", answer: "No. Some utilities work in the browser, while AI writing and analysis need an online service." }, { question: "Does a resume score guarantee an interview?", answer: "No. A score or suggested wording is guidance for review, not a guarantee of an employer's decision." }, { question: "Will a downloaded QR code always lead to a working page?", answer: "The code can retain the encoded address, but the destination page can change or disappear. Test the link and the printed code." }],
  },
  creator: {
    title: "Creator Scripts, Posts & Visual Workspaces",
    intro: "Prepare hooks and scripts, format LinkedIn posts, design carousels or social mockups, inspect thumbnails, and read a script with the teleprompter. Outputs vary from text to pictures; these tools do not guarantee views, clicks, or audience growth.",
    cards: [
      { title: "Hooks and scripts", desc: "Draft a video opening or structure for review.", badge: "Writing" },
      { title: "Posts and carousels", desc: "Format text or build a sequence of shareable slides.", badge: "Social" },
      { title: "Visual previews", desc: "Inspect a thumbnail or create an illustrative post mockup.", badge: "Pictures" },
      { title: "Script reading", desc: "Scroll a script with reading and mirror controls.", badge: "Teleprompter" },
    ],
    features: ["Task-specific controls: Text formatters, picture tools, and the script reader serve different purposes.", "Draft review: Check generated scripts, names, and claims before publication.", "Illustrative previews: Mockups and thumbnail checks do not reproduce an actual platform's ranking decisions.", "Access and export vary: Use the options shown in the selected workspace."],
    faqs: [{ question: "Can these tools guarantee a viral post?", answer: "No. They can help prepare and inspect content, but audience response and platform distribution depend on many factors." }, { question: "Does the teleprompter record a video?", answer: "No. It displays and scrolls a script. Its camera option is a preview, subject to browser and site permissions." }, { question: "Are social mockups real posts or evidence of engagement?", answer: "No. They are illustrative images. Do not present mockup likes, comments, or identities as real activity." }],
  },
  student: {
    title: "Study Notes, Text Review & Learning Tools",
    intro: "Prepare study notes and flashcards, draft an essay outline, explore a math solution, create citations, compare two texts, or check readability. Some tools use online AI services; others calculate or compare the input in your browser. Review results against your source material.",
    cards: [
      { title: "Notes and recall", desc: "Turn supplied material into notes, flashcards, or a mind map.", badge: "Study" },
      { title: "Writing structure", desc: "Draft an outline or inspect text readability.", badge: "Text" },
      { title: "Math and units", desc: "Explore a solution or convert supported measurements.", badge: "Problems" },
      { title: "References and comparison", desc: "Prepare citations or compare two supplied texts.", badge: "Sources" },
    ],
    features: ["Source-based review: Check generated notes and answers against the original material.", "Different processing: Uploaded PDFs and AI prompts may be sent to online services.", "Text comparison: Similarity checks compare supplied texts rather than searching every published source.", "Access varies: Follow the account and credit requirements displayed by the selected tool."],
    faqs: [{ question: "Do papers and notes always stay on my device?", answer: "No. PDF-to-notes and other AI workflows can send your material to online processing. Read the selected guide before supplying sensitive material." }, { question: "Does text comparison certify that work is plagiarism-free?", answer: "No. Comparing two supplied texts cannot establish originality against all websites, books, or unpublished work." }, { question: "Can I trust a generated solution or citation without checking it?", answer: "Review the reasoning, facts, and source details. Generated content can contain errors, and citation fields need to match the actual source." }],
  },
  business: {
    title: "Business & Finance Calculators",
    intro: "Estimate GST, profit margin, loan payments, and take-home salary using the selected calculator's inputs. Results depend on the supplied figures and the formulas implemented by that tool. Check the assumptions and applicable rates before relying on an estimate.",
    cards: [
      { title: "Profit and markup", desc: "Compare cost, selling price, and the resulting margin.", badge: "Pricing" },
      { title: "GST and margins", desc: "Explore tax calculations or the relationship between cost and selling price.", badge: "Calculations" },
      { title: "Loan estimates", desc: "Compare payment estimates using principal, rate, and term inputs.", badge: "Payments" },
      { title: "Salary estimates", desc: "Review take-home figures against the calculator's stated assumptions.", badge: "Income" },
    ],
    features: ["Input-based calculations: A result is only as useful as the figures and assumptions supplied.", "Separate workspaces: Each financial calculator offers its own controls and breakdown.", "Rate review: Confirm that the implemented tax or loan assumptions apply to your case.", "Record checking: Review document details and estimates against your actual records."],
    faqs: [{ question: "Do these estimates replace a lender's or accountant's figures?", answer: "No. Actual charges, repayment terms, deductions, and tax rules may differ from the calculator's assumptions." }, { question: "Does a margin calculation include every business expense?", answer: "Only the inputs and costs handled by the selected calculator are included. Check its fields against the expenses you need to account for." }, { question: "Can I assume every tax rate is current for my situation?", answer: "No. Check the tool's stated rules, dates, and available rates against the rules that apply to your location and tax year." }],
  },
  seo: {
    title: "Search Metadata, Link Previews & Site Files",
    intro: "Draft titles and descriptions, preview search or social snippets, create site-file text, and prepare canonical, language, or structured-data markup. These tools help you prepare content and configuration; they do not control crawling, ranking, or indexing decisions.",
    cards: [
      { title: "Search snippets", desc: "Draft or preview a page title and description.", badge: "Metadata" },
      { title: "Social previews", desc: "Inspect a link card or create a share banner.", badge: "Sharing" },
      { title: "Site files", desc: "Prepare sitemap XML and robots.txt directives.", badge: "Discovery" },
      { title: "Page markup", desc: "Draft canonical, language, or structured-data tags for review.", badge: "Tags" },
    ],
    features: ["Content matching: Metadata and structured data should describe the page they belong to.", "Illustrative previews: Search engines and social platforms can render or rewrite snippets differently.", "Configuration review: Check generated directives before publishing them to your site.", "Independent decisions: A sitemap or schema file does not guarantee indexing or a special search display."],
    faqs: [{ question: "Will generating a sitemap make every page index?", answer: "No. A sitemap helps discovery, but a search engine decides whether to crawl and index a page." }, { question: "Does a preview show exactly what Google will display?", answer: "No. It is an illustration based on your inputs. The actual title, snippet, or layout can differ." }, { question: "Can I add review stars or FAQ markup without matching visible content?", answer: "Structured data must accurately describe the page's real content. A generator does not justify inventing reviews, ratings, or answers." }],
  },
  video: {
    title: "Video Editing, Conversion & Subtitle Tools",
    intro: "Trim and combine clips, reduce video size, generate subtitles, convert a clip to GIF, or apply enhancement filters. Each workspace has its own controls and limits. Preview takes place in your browser; these tools upload videos for online processing.",
    cards: [
      { title: "Trim and join", desc: "Keep a selected time range or arrange several clips into one video.", badge: "Clip tools" },
      { title: "Compress video", desc: "Choose a quality setting and MP4 or WebM output.", badge: "File size" },
      { title: "Generate subtitles", desc: "Transcribe speech into timed SRT subtitles, with captioned video when rendering succeeds.", badge: "Captions" },
      { title: "GIFs and filters", desc: "Make a short GIF or try sharpening, noise reduction, and color filters.", badge: "Conversion" },
    ],
    features: ["Separate workspaces: Pick the tool for trimming, merging, compression, subtitles, GIF conversion, or enhancement.", "Online processing: Video files are uploaded after you choose your settings.", "Tool-specific outputs: Downloads include MP4, WebM, GIF, or SRT depending on the operation.", "Preview and review: Check the processed result before sharing it."],
    faqs: [{ question: "Do videos stay entirely on my device?", answer: "No. These video workflows send the selected files to online processors. Browser previews do not mean conversion happens locally." }, { question: "Does every tool export 4K or every video format?", answer: "No. Outputs differ: GIF conversion offers 320/480/640-pixel widths, the merger normalizes clips to 1280x720, and the compressor offers MP4 or WebM. Check the individual guide." }, { question: "Do editing tools give me permission to publish any video?", answer: "No. You still need the necessary rights to source footage, music, and other content." }],
  },
  pdf: {
    title: "Merge, Split, Optimize & Convert PDFs",
    intro: "Combine PDFs, extract pages, try file-size optimization, render pages as images, or recover editable text. Choose the workspace that matches your task. Processing varies: some tools upload documents, PDF to Image renders locally, and OCR can use a server fallback.",
    cards: [
      { title: "Merge or split", desc: "Combine whole files or extract selected pages into separate documents.", badge: "Pages" },
      { title: "Optimize size", desc: "Rewrite PDF structure and compare file sizes without promising a fixed reduction.", badge: "Compression" },
      { title: "Convert pictures", desc: "Render PDF pages as JPG/PNG or combine photos into a PDF.", badge: "Images" },
      { title: "Recover text", desc: "Extract a PDF text layer to DOCX or recognize printed text with OCR.", badge: "Text" },
    ],
    features: ["Processing differences: Merge, split, compression, image-to-PDF, and Word conversion normally upload files.", "Local page rendering: PDF to Image draws full pages in the browser.", "Text conversion: PDF to Word produces a text-based DOCX rather than recreating the page design.", "Published limits: File size, page count, and server rate limits vary by tool."],
    faqs: [{ question: "Do all PDF tools run without uploads?", answer: "No. Several workflows upload documents first, even when a browser fallback is available. PDF to Image renders locally; OCR may upload if its local attempt fails." }, { question: "How much smaller will a compressed PDF be?", answer: "There is no guaranteed reduction. The compressor rewrites document structure and selected metadata; it does not downsample embedded pictures and returns the original bytes if optimization would be larger." }, { question: "Does PDF to Word recreate scanned pages?", answer: "No. It extracts an existing text layer. Use OCR to recognize scanned text, and review the result. Original layouts, tables, and images are not reconstructed." }, { question: "Are there file or page limits?", answer: "Yes. Server PDF inputs are limited to 80 MB each. PDF to Image supports up to 100 pages, and the server all-page splitter supports up to 500. Collection limits also apply to merging and image uploads." }],
  },
  audio: {
    title: "Audio Separation, Voice & Playback Tools",
    intro: "Separate vocals or grouped stems, reduce background noise, generate speech, transcribe recordings, add playback effects, or make waveform videos. Different workspaces use online services or browser processing and have different account and export requirements.",
    cards: [
      { title: "Separate tracks", desc: "Try vocal/instrumental separation or Pro four-stem separation.", badge: "Stems" },
      { title: "Speech and voice", desc: "Generate speech, transcribe audio, or explore voice and sound effects.", badge: "Voice" },
      { title: "Playback effects", desc: "Change speed, reverb, and bass, then export WAV in Slowed + Reverb.", badge: "Effects" },
      { title: "Waveform videos", desc: "Combine audio with titles and animated visuals for a WebM download.", badge: "Audiograms" },
    ],
    features: ["Online audio workflows: Separation and noise removal upload recordings to processing services.", "Browser effects: Slowed + Reverb uses browser audio playback and WAV rendering.", "Different exports: File formats depend on the selected tool and processing provider.", "Listen before publishing: Separation and noise reduction can change detail or leave artifacts."],
    faqs: [{ question: "Does processing make a song royalty-free?", answer: "No. You still need permission to use the recording and composition. Separating, remixing, or visualizing audio does not change its ownership." }, { question: "Are recordings always processed locally?", answer: "No. Several audio tools upload files to online providers. Check the individual guide for the workflow you choose." }, { question: "Can every tool export both WAV and MP3?", answer: "No. Slowed + Reverb exports WAV, audiograms export WebM video, and online separation formats depend on the returned tracks." }],
  },
  ai: {
    title: "AI Writing, Visual Concepts & Prompt Tools",
    intro: "Explore tools for writing drafts, generating image and logo concepts, building landing-page drafts, and preparing prompts. Each workspace serves a different task. Online generation may require account access, Pro, and credits as shown by the tool.",
    cards: [
      { title: "Writing drafts", desc: "Start a text draft with the AI Writer and review it before publication.", badge: "Writing" },
      { title: "Image concepts", desc: "Describe a scene and choose visual style and dimensions.", badge: "Images" },
      { title: "Logo concepts", desc: "Generate a brand image; SVG export wraps the image rather than tracing paths.", badge: "Branding" },
      { title: "Prompt building", desc: "Prepare structured instructions to use with an AI application.", badge: "Prompts" },
    ],
    features: ["Task-specific inputs: Image style controls differ from writing and prompt-building options.", "Online generation: Prompts for generated content are sent to processing services.", "Review required: Check facts, spelling, image details, and source rights before publication.", "Access varies: Some generation tools require Pro and credits; check the current workspace."],
    faqs: [{ question: "Is every tool available with free daily credits?", answer: "No. Access varies by tool. Image and logo generation currently require Pro, while other workspaces have their own account and credit requirements." }, { question: "Is a generated logo automatically an editable vector?", answer: "No. The current logo SVG export embeds the generated image. It does not trace that image into editable vector paths." }, { question: "Can I assume generated content is accurate or exclusive?", answer: "No. Review factual claims, lettering, visual details, and any rights needed for your intended use. Generation does not guarantee accuracy, uniqueness, or trademark clearance." }],
  },
  image: {
    title: "Photo Editing, Conversion & Design Tools",
    intro: "Choose a tool to remove backgrounds, compress or resize pictures, change formats, create collages, trace images, or design Minecraft skins. Available formats, quality controls, processing location, and access requirements depend on the workspace.",
    cards: [
      { title: "Resize and convert", desc: "Prepare dimensions and formats for the place you plan to use the picture.", badge: "Picture files" },
      { title: "Cutouts and cleanup", desc: "Try background removal or cleanup tools and review fine edges.", badge: "Editing" },
      { title: "Design workspaces", desc: "Create collages, thumbnails, memes, or a Minecraft skin.", badge: "Design" },
      { title: "Vector tracing", desc: "Use Image Vectorizer for tracing, rather than treating every SVG export as vector artwork.", badge: "SVG" },
    ],
    features: ["Different operations: Pick the workspace for editing, compression, conversion, or design.", "Quality choices: Compression and resizing can change picture detail; inspect the result.", "Processing varies: Some tools run locally while others use online endpoints.", "Check source rights: Editing a picture does not change permission to use it."],
    faqs: [{ question: "Are all images processed without uploads?", answer: "No. Processing differs by tool. For example, Minecraft skin generation uses server endpoints. Check the guide for the tool you select." }, { question: "Can every edit keep the original quality?", answer: "No. Resizing, compression, format conversion, and generation can change detail or appearance. Keep the source and review the output." }, { question: "Does removing a watermark grant permission to use an image?", answer: "No. You need the appropriate rights to the original image regardless of the edits applied." }],
  },
  developer: {
    title: "Text, Data, Code & Design Utilities",
    intro: "Format JSON, test JavaScript patterns, compare text, generate identifiers and checksums, draft SQL or cron text, and create code images or web design assets. These are separate utilities; formatting or highlighting does not automatically validate your application.",
    cards: [
      { title: "Text and data", desc: "Format JSON, encode Base64, and compare two text versions.", badge: "Data" },
      { title: "Patterns and IDs", desc: "Test JavaScript regex, generate UUIDs, or calculate hashes.", badge: "Utilities" },
      { title: "Query and schedule drafts", desc: "Build SQL text and five-field cron expressions for separate review.", badge: "Drafts" },
      { title: "Visual assets", desc: "Design snippet images, icons, gradients, and cleaned SVG markup.", badge: "Design" },
    ],
    features: ["Purpose-specific controls: Each utility has its own inputs, options, and output.", "Different checks: JSON parsing and regex compilation check their own syntax; hashing and visual tools do not.", "Review code: Generated SQL and types need checking against your actual application.", "Separate execution: Query and schedule builders generate text without running jobs or database commands."],
    faqs: [{ question: "Does every utility detect syntax errors?", answer: "No. JSON and regex workspaces perform specific parsing checks. Hashing, UUID generation, text comparison, and visual design do not validate source-code syntax." }, { question: "Does the SQL builder execute queries or use AI?", answer: "No. Its current implementation constructs SQL text from form fields locally and does not connect to a database or call an AI model." }, { question: "Are cron next-run previews exact for every expression?", answer: "No. The current preview supports some simple presets and uses illustrative times for other patterns. Verify the expression and time zone in your actual scheduler." }],
  },
};
