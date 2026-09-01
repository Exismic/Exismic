const fs = require('fs');
let content = fs.readFileSync('src/components/tool/Dashboard.tsx', 'utf-8');
content = content.split('/bg-\\\\[/g').join('/bg-\\[/g');
content = content.split('/drop-shadow-\\\\[/g').join('/drop-shadow-\\[/g');
fs.writeFileSync('src/components/tool/Dashboard.tsx', content, 'utf-8');
console.log('Fixed regex in Dashboard.tsx');
