const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const jsDir = path.join(__dirname, 'js');
const cssPath = path.join(__dirname, 'css', 'inline.css');
const indexHtmlPath = path.join(__dirname, 'index.html');

let cssContent = '';
if (fs.existsSync(cssPath)) {
  cssContent = fs.readFileSync(cssPath, 'utf8');
} else {
  cssContent = '/* Auto-generated from inline styles */\n';
}

const styleCache = new Map();

function hashStyle(styleStr) {
  const hash = crypto.createHash('md5').update(styleStr).digest('hex').substring(0, 6);
  return `mod-style-${hash}`;
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Regex to match style="..." or style='...'
  // Be careful not to match nested quotes incorrectly, but standard regex should work for most cases.
  const styleRegex = /style=["']([^"']+)["']/g;

  content = content.replace(styleRegex, (match, styleContent) => {
    // some styles might have template literals inside, which breaks simple extraction if it contains variables.
    if (styleContent.includes('${')) {
      return match; // skip template literal styles
    }

    const trimmedStyle = styleContent.trim();
    if (!trimmedStyle) return match;

    let className = styleCache.get(trimmedStyle);
    if (!className) {
      className = hashStyle(trimmedStyle);
      styleCache.set(trimmedStyle, className);
      cssContent += `.${className} { ${trimmedStyle}${trimmedStyle.endsWith(';') ? '' : ';'} }\n`;
    }

    changed = true;
    return `class="${className}"`;
  });

  // Now we have replaced style="..." with class="...". 
  // Wait, if the element already has a class attribute, we need to merge them.
  // Actually, a simpler regex replace for style="..." to class="..." might create two class attributes, which is invalid HTML.
  // Let's refine the replacement logic to merge classes if one exists.
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Processed: ${filePath}`);
  }
}

function refineClasses(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Regex to find multiple class attributes and merge them
  // e.g., class="btn" class="mod-style-123"
  // This is tricky with regex. Let's do a pass where we find <... class="..." ... class="..." ...>
  // A safer approach:
  const tagRegex = /<[a-zA-Z0-9\-]+([^>]+)>/g;
  content = content.replace(tagRegex, (match, attrs) => {
    const classRegex = /class=["']([^"']+)["']/g;
    let classes = [];
    let matchClass;
    let originalAttrs = attrs;
    while ((matchClass = classRegex.exec(attrs)) !== null) {
      classes.push(...matchClass[1].split(' '));
    }
    if (classes.length > 0) {
      // remove all class="..." from attrs
      let newAttrs = attrs.replace(classRegex, '').trim();
      // add a single combined class
      const uniqueClasses = [...new Set(classes.filter(Boolean))].join(' ');
      newAttrs = `class="${uniqueClasses}"${newAttrs.length > 0 ? ' ' + newAttrs : ''}`;
      // reconstruct tag
      return match.replace(attrs, ' ' + newAttrs + (attrs.endsWith('/') ? '/' : '')); // handle self-closing
    }
    return match;
  });
  
  if (content !== fs.readFileSync(filePath, 'utf8')) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.html')) {
      processFile(fullPath);
      refineClasses(fullPath);
    }
  }
}

walkDir(jsDir);
processFile(indexHtmlPath);
refineClasses(indexHtmlPath);

fs.writeFileSync(cssPath, cssContent, 'utf8');
console.log('Done mapping styles to CSS classes.');

// Also we need to inject the CSS file into index.html if it's not there.
let indexContent = fs.readFileSync(indexHtmlPath, 'utf8');
if (!indexContent.includes('inline.css')) {
  indexContent = indexContent.replace('</head>', '  <link rel="stylesheet" href="./css/inline.css">\n</head>');
  fs.writeFileSync(indexHtmlPath, indexContent, 'utf8');
  console.log('Injected inline.css into index.html');
}
