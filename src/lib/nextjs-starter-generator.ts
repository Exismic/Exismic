import JSZip from "jszip";

interface GenerateNextjsProjectOptions {
  projectName?: string;
  htmlContent: string;
}

/**
 * Generates a complete, ready-to-run Next.js 15 + Tailwind CSS project .zip bundle.
 * Plain English file structure, zero tech jargon, ready to launch locally or deploy.
 */
export async function generateNextjsProjectZip({
  projectName = "my-landing-page",
  htmlContent,
}: GenerateNextjsProjectOptions): Promise<Blob> {
  const zip = new JSZip();

  // Normalize project folder name
  const cleanSlug = projectName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "my-landing-page";

  // Extract body content from HTML if present
  let bodyContent = htmlContent;
  const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch && bodyMatch[1]) {
    bodyContent = bodyMatch[1].trim();
  }

  // 1. package.json
  const packageJson = {
    name: cleanSlug,
    version: "0.1.0",
    private: true,
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
      lint: "next lint",
    },
    dependencies: {
      next: "^15.1.0",
      react: "^19.0.0",
      "react-dom": "^19.0.0",
      "lucide-react": "^0.475.0",
    },
    devDependencies: {
      "@types/node": "^22.0.0",
      "@types/react": "^19.0.0",
      "@types/react-dom": "^19.0.0",
      postcss: "^8.4.38",
      tailwindcss: "^3.4.4",
      typescript: "^5.5.0",
    },
  };
  zip.file("package.json", JSON.stringify(packageJson, null, 2));

  // 2. tsconfig.json
  const tsConfig = {
    compilerOptions: {
      target: "ES2017",
      lib: ["dom", "dom.iterable", "esnext"],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      module: "esnext",
      moduleResolution: "bundler",
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: "preserve",
      incremental: true,
      plugins: [
        {
          name: "next",
        },
      ],
      paths: {
        "@/*": ["./*"],
      },
    },
    include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
    exclude: ["node_modules"],
  };
  zip.file("tsconfig.json", JSON.stringify(tsConfig, null, 2));

  // 3. next.config.mjs
  const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
`;
  zip.file("next.config.mjs", nextConfig);

  // 4. tailwind.config.ts
  const tailwindConfig = `import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};
export default config;
`;
  zip.file("tailwind.config.ts", tailwindConfig);

  // 5. postcss.config.mjs
  const postcssConfig = `const config = {
  plugins: {
    tailwindcss: {},
  },
};

export default config;
`;
  zip.file("postcss.config.mjs", postcssConfig);

  // 6. .gitignore
  const gitignore = `# Dependencies
/node_modules
/.pnp
.pnp.js

# Testing
/coverage

# Next.js build
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Local env files
.env*.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts
`;
  zip.file(".gitignore", gitignore);

  // 7. app/globals.css
  const globalsCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #090a0f;
  --foreground: #ededed;
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

/* Smooth Scrolling */
html {
  scroll-behavior: smooth;
}

/* Glassmorphism helpers */
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
`;
  zip.folder("app")?.file("globals.css", globalsCss);

  // 8. app/layout.tsx
  const appLayout = `import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "${cleanSlug.replace(/-/g, " ").replace(/\\b\\w/g, (c) => c.toUpperCase())} | Built with Exismic",
  description: "A fast, modern responsive landing page generated with Exismic Studio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#090a0f] text-[#ededed] antialiased">
        {children}
      </body>
    </html>
  );
}
`;
  zip.folder("app")?.file("layout.tsx", appLayout);

  // 9. app/page.tsx
  // We embed the HTML safely and provide an organized component layout
  const appPage = `"use client";

import React from "react";

// Generated Landing Page HTML Payload
const PAGE_MARKUP = ${JSON.stringify(bodyContent)};

export default function Home() {
  return (
    <main className="w-full min-h-screen">
      {/* 
        Exismic Landing Page:
        This markup has been packaged directly into this component.
        You can customize, replace, or split sections into dedicated React components.
      */}
      <div 
        className="w-full"
        dangerouslySetInnerHTML={{ __html: PAGE_MARKUP }} 
      />
    </main>
  );
}
`;
  zip.folder("app")?.file("page.tsx", appPage);

  // 10. public/index.html (standalone offline file)
  zip.folder("public")?.file("index.html", htmlContent);

  // 11. README.md
  const readme = `# ${cleanSlug.replace(/-/g, " ").replace(/\\b\\w/g, (c) => c.toUpperCase())}

Modern, high-converting responsive landing page generated with **Exismic Studio**.

---

## What is in this starter kit?

- **Next.js 15** with App Router architecture
- **Tailwind CSS** pre-configured with typography and glass styling
- **TypeScript** enabled for type safety and auto-completion
- **Standalone Offline Backup** located in \`public/index.html\` (double-click anytime to view without installing anything)

---

## 3-Step Quick Start

1. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

2. **Start the local preview**:
   \`\`\`bash
   npm run dev
   \`\`\`

3. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## Publish Online (1-Click)

You can publish this website immediately for free on Vercel:
1. Create a free account at [vercel.com](https://vercel.com)
2. Drag and drop this folder, or connect your GitHub repository
3. Your landing page will be live on a custom URL in under 60 seconds

---

Created with Exismic — High-performance creative tools for modern founders and creators.
`;
  zip.file("README.md", readme);

  // Generate the zip binary blob
  const zipBlob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  return zipBlob;
}
