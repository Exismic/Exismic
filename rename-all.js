const fs = require('fs');
const path = require('path');

const DIRECTORIES_TO_SCAN = ['src', 'public', 'prisma', 'server', 'python-api', 'docs', '.'];
const IGNORE_DIRS = ['node_modules', '.next', '.git', '.gemini', 'brain'];
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.css', '.html', '.json', '.prisma', '.md'];

// 1. Text Replacements
function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Ordered specific to general to avoid collisions
  content = content.replace(/Exismic Ai/g, "Exismic Ai");
  content = content.replace(/Exismic Ai/gi, "Exismic Ai"); // Catch any case variations of AI
  content = content.replace(/Exismic/g, "Exismic");
  content = content.replace(/exismic/g, "exismic");
  content = content.replace(/EXISMIC/g, "EXISMIC");

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated text in: ${filePath}`);
  }
}

// Traverse and collect files
let filesToProcess = [];
function collectFiles(dir) {
  if (!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!IGNORE_DIRS.includes(item)) {
        collectFiles(fullPath);
      }
    } else {
      if (EXTENSIONS.includes(path.extname(item)) || item === 'package.json' || item === 'README.md') {
        filesToProcess.push(fullPath);
      }
    }
  }
}

DIRECTORIES_TO_SCAN.forEach(dir => {
  if (dir === '.') {
    // Only collect files in root
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      if (!fs.statSync(fullPath).isDirectory()) {
        if (EXTENSIONS.includes(path.extname(item)) || item === 'package.json' || item === 'README.md') {
          filesToProcess.push(fullPath);
        }
      }
    }
  } else {
    collectFiles(dir);
  }
});

// Remove duplicates
filesToProcess = [...new Set(filesToProcess)];

// Perform text replacement
filesToProcess.forEach(replaceInFile);

// 2. Rename Files
// We do this after text replacement so the contents pointing to these files are already updated
let filesToRename = [];
function collectFilesToRename(dir) {
  if (!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!IGNORE_DIRS.includes(item)) {
        collectFilesToRename(fullPath);
      }
    } else {
      if (item.toLowerCase().includes('exismic')) {
        filesToRename.push(fullPath);
      }
    }
  }
}

DIRECTORIES_TO_SCAN.forEach(dir => {
  if (dir === '.') {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      if (!fs.statSync(path.join(dir, item)).isDirectory() && item.toLowerCase().includes('exismic')) {
        filesToRename.push(path.join(dir, item));
      }
    }
  } else {
    collectFilesToRename(dir);
  }
});

filesToRename.forEach(oldPath => {
  const dir = path.dirname(oldPath);
  const oldName = path.basename(oldPath);
  let newName = oldName;
  newName = newName.replace(/Exismic/g, "Exismic");
  newName = newName.replace(/exismic/g, "exismic");
  newName = newName.replace(/EXISMIC/g, "EXISMIC");

  if (oldName !== newName) {
    const newPath = path.join(dir, newName);
    fs.renameSync(oldPath, newPath);
    console.log(`Renamed file: ${oldPath} -> ${newPath}`);
  }
});

console.log("Renaming complete.");
