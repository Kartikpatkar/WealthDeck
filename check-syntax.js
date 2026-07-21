const fs = require('fs');
const path = require('path');

function checkSyntax(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      checkSyntax(fullPath);
    } else if (fullPath.endsWith('.js')) {
      let code = fs.readFileSync(fullPath, 'utf8');
      
      // Strip import and export statements to allow basic syntax checking
      code = code.replace(/^import\s+.*$/gm, '');
      code = code.replace(/^export\s+/gm, '');
      
      try {
        new Function(code);
      } catch (e) {
        if (e instanceof SyntaxError) {
          console.error(`Syntax Error in ${fullPath}: ${e.message}`);
        }
      }
    }
  }
}

checkSyntax(path.join(__dirname, 'js'));
