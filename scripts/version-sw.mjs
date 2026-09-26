import fs from 'fs';
const swPath = 'dist/sw.js';
if (fs.existsSync(swPath)) {
  let content = fs.readFileSync(swPath, 'utf8');
  content = content.replace('VERSION_PLACEHOLDER', Date.now().toString());
  fs.writeFileSync(swPath, content);
  console.log('Service Worker version updated.');
}
