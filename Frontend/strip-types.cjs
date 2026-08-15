const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');
const { globSync } = require('glob');

const srcDir = path.join(__dirname, 'src');

try {
  const files = globSync('src/**/*.{ts,tsx}');
  files.forEach(file => {
    const fullPath = path.join(__dirname, file);
    const isTsx = file.endsWith('.tsx');
    const ext = isTsx ? '.jsx' : '.js';
    const newPath = fullPath.replace(/\.tsx?$/, ext);
    
    try {
      const code = fs.readFileSync(fullPath, 'utf8');
      
      const result = babel.transformSync(code, {
        filename: fullPath,
        presets: [
          ['@babel/preset-typescript', { isTSX: isTsx, allExtensions: true }]
        ],
        plugins: ['@babel/plugin-syntax-jsx'],
        retainLines: true,
        generatorOpts: {
          retainLines: true,
        }
      });
      
      // The babel transform removes types. Since retainLines is true, formatting should mostly be preserved.
      // But it might convert JSX to React.createElement if we don't specify syntax-jsx. Wait, preset-typescript just strips types. 
      // Actually we need to make sure we don't transform JSX. 
      // If we use @babel/plugin-syntax-jsx, it should parse JSX but we need a plugin that JUST strips types.
      // @babel/preset-typescript does exactly this, it strips TS and leaves JSX intact if we don't include preset-react.
      
      fs.writeFileSync(newPath, result.code);
      fs.unlinkSync(fullPath);
      console.log(`Converted ${file} to ${path.basename(newPath)}`);
    } catch (e) {
      console.error(`Error processing ${file}:`, e);
    }
  });

  // Also rename config files
  try {
    if (fs.existsSync('vite.config.ts')) fs.renameSync('vite.config.ts', 'vite.config.js');
    if (fs.existsSync('tailwind.config.ts')) fs.renameSync('tailwind.config.ts', 'tailwind.config.js');
    console.log('Renamed config files.');
  } catch(e) {}
} catch(err) {
  console.error(err);
}
