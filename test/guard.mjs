// Navigation guard: the homepage code may only touch its own container.
// Catches mistakes, not sabotage: the sealed container (contain) is what stops overlap.
// Covers the known ways to reach the Squarespace header, menu or page.
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const CSS = [
  [/position\s*:\s*(fixed|sticky)/i, 'fixed or sticky position'],
  [/z-index/i, 'z-index'],
  [/!\s*important/i, '!important'],
  [/(margin[\w-]*|top|inset[\w-]*)\s*:[^;}]*-\s*[\d.]/i, 'negative offset'],
  // A lift of up to 16px is fine: the sealed container clips it.
  [/translate\w*\((?!-(?:\d|1[0-6])px\))[^)]*-\s*[\d.]|translate(?!Y)\w*\([^)]*-\s*[\d.]/i, 'negative translate'],
  [/:host[^{]*\{[^}]*(?<![-\w])(transform|translate|rotate|scale)\s*:/i, 'moves the container'],
  [/translate\s*:[^;}]*-\s*[\d.]/i, 'negative translate'],
  [/contain\s*:(?!\s*layout paint)/i, 'changes the seal'],
  [/:host-context|@import/i, 'reaches outside the container'],
];
const JS = [
  [/\bdocument\b/, 'document'],
  [/\b(window|globalThis|self|top|parent|location|history|eval|Function)\b/, 'page-wide access'],
  [/\b(ownerDocument|getRootNode|parentElement|parentNode|assignedSlot)\b/, 'climbs out of the container'],
  [/closest\(/, 'climbs out of the container'],
  [/cssText|offsetParent|showModal|requestFullscreen|showPopover|popover/, 'escapes the container'],
  [/import\s*\(|from\s*['"](?!\.\/)/, 'loads code from elsewhere'],
  [/<style>(?!\$\{css\})/, 'styles outside site.css'],
  [/section\s*\.\s*hidden|section\s*\.\s*(style|class|append|prepend|remove|inner|outer|set|insert|replace|query)/, 'changes the section'],
];
const ALLOWED = [/const section = host\.closest\('section'\);/g, /typeof (document|location)\b/g, /document\.fonts\.add\(/g, /\blocation\.hash\b(?!\s*[-+*\/|&?%^<>]*=(?!=))/g, /document\.getElementById\('s353-portfolio'\)/g];

export function violations(files) {
  const found = [];
  for (const [name, raw] of Object.entries(files)) {
    const text = raw.replace(/\/\*[\s\S]*?\*\//g, '');
    if (name.endsWith('.css')) {
      for (const [re, why] of CSS) if (re.test(text)) found.push(`${name}: ${why}`);
      if (!/:host\s*\{[^}]*contain:\s*layout paint/.test(text)) found.push(`${name}: container is not sealed`);
    } else if (name.endsWith('.js')) {
      const code = ALLOWED.reduce((s, re) => s.replace(re, ''), text);
      for (const [re, why] of JS) if (re.test(code)) found.push(`${name}: ${why}`);
    } else if (!name.endsWith('.html')) found.push(`${name}: file type not checked`);
  }
  return found;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dir = process.argv[2];
  const bad = violations(Object.fromEntries(readdirSync(dir).map(f => [f, readFileSync(`${dir}/${f}`, 'utf8')])));
  bad.forEach(b => console.error('NAV GUARD', b));
  process.exit(bad.length ? 1 : 0);
}
