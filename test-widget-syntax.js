const fs = require('fs');
const path = require('path');

// Read the widget route file
const widgetRouteFile = fs.readFileSync('./src/app/api/widget/route.ts', 'utf8');

// Extract the widget script from the template literal
const scriptMatch = widgetRouteFile.match(/const widgetScript = `([\s\S]*?)`;/);

if (scriptMatch) {
  const widgetScript = scriptMatch[1];
  
  // Try to parse the JavaScript to check for syntax errors
  try {
    // Use Function constructor to validate syntax without executing
    new Function(widgetScript);
    console.log('✅ Widget script syntax is valid!');
  } catch (error) {
    console.error('❌ Widget script syntax error:', error.message);
    console.error('Error line might be around:', error.line || 'unknown');
    
    // Try to find the problematic line
    const lines = widgetScript.split('\n');
    lines.forEach((line, index) => {
      if (line.includes('try') && !line.includes('catch') && !line.includes('{')) {
        console.error(`Potential issue at line ${index + 1}: ${line}`);
      }
    });
  }
} else {
  console.error('❌ Could not extract widget script from route file');
}
