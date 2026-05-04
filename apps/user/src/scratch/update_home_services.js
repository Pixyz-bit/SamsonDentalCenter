const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'components', 'home', 'HomeServices.jsx');

let content = fs.readFileSync(targetFile, 'utf8');

// Replace slate with stone
content = content.replace(/slate-/g, 'stone-');

// Replace blue with red
content = content.replace(/blue-/g, 'red-');

// Force isDark to false
content = content.replace(/const isDark = variant === 'dark';/, 'const isDark = false; // forced light mode');

fs.writeFileSync(targetFile, content);
console.log('Updated HomeServices.jsx successfully.');
