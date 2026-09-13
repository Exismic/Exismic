const fs = require('fs');
const path = 'C:\\Users\\rayan\\.gemini\\antigravity-ide\\brain\\1ad62957-6038-41d6-b4dd-dbb74225679a\\.system_generated\\logs\\transcript.jsonl';
const lines = fs.readFileSync(path, 'utf8').split('\n');
[471, 517, 683, 772, 994, 1038, 1096, 1119].forEach(idx => {
  if (idx < lines.length && lines[idx]) {
    try {
      const d = JSON.parse(lines[idx]);
      console.log(`=== STEP ${idx} (${d.type}) ===`);
      console.log(d.content);
    } catch(e) {}
  }
});
