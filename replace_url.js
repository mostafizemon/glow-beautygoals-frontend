const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== 'node_modules' && f !== '.next') {
        walkDir(dirPath, callback);
      }
    } else {
      if (dirPath.endsWith('.ts') || dirPath.endsWith('.tsx')) {
        callback(dirPath);
      }
    }
  });
}

walkDir(__dirname, (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace single quotes
  content = content.replace(/'http:\/\/localhost:8080(\/[^']*)'/g, "`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}$1`");
  
  // Replace double quotes
  content = content.replace(/"http:\/\/localhost:8080(\/[^"]*)"/g, "`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}$1`");

  // Replace template literals (backticks)
  content = content.replace(/`http:\/\/localhost:8080(\/[^`]*)`/g, "`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}$1`");

  // Replace anywhere it is just process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080' inside a string if it got messed up (cleanup)
  // But the above regexes should be safe.

  // Also replace plain http://localhost:8080 if not at start of string? No, let's keep it simple.

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
});
