const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const source = path.resolve(__dirname, '../../early-bird-api/src');
const output = path.resolve(__dirname, '../generated/early-bird');
fs.mkdirSync(output, { recursive: true });
// Compile shared ESM into the existing backend's CommonJS runtime.
for (const file of ['app.js', 'storage.js', 'validation.js']) {
  const result = ts.transpileModule(fs.readFileSync(path.join(source, file), 'utf8'), {
    fileName: file,
    compilerOptions: { allowJs: true, target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  });
  fs.writeFileSync(path.join(output, file), result.outputText);
}
fs.writeFileSync(path.join(output, 'package.json'), '{"type":"commonjs"}\n');
console.log('Built shared Early Bird API');
