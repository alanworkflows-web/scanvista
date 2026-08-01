const fs = require('fs');

let code = fs.readFileSync('src/pages/ManagerPublishing.tsx', 'utf8');

// Need to import safeFormatTime if not imported
if (!code.includes('import { safeFormatTime }')) {
  code = code.replace(
    'import { calculateCompletion } from "../lib/completionEngine";',
    'import { calculateCompletion } from "../lib/completionEngine";\nimport { safeFormatTime } from "../lib/dateUtils";'
  );
}

// Add Last Published label
const oldBadge = `<span className={\`text-[10px] uppercase font-semibold px-2.5 py-1 rounded-md border \${
              isPublished 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }\`}>
              {isPublished ? '✓ Live & Published' : '⚠️ Unpublished Draft'}
            </span>`;

const newBadge = `<div className="flex items-center gap-3">
              <span className={\`text-[10px] uppercase font-semibold px-2.5 py-1 rounded-md border \${
                isPublished 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }\`}>
                {isPublished ? '✓ Live & Published' : '⚠️ Unpublished Draft'}
              </span>
              {isPublished && property.snapshots && property.snapshots.length > 0 && (
                <span className="text-xs text-text-muted font-medium bg-surface border border-divider px-2.5 py-1 rounded-md shadow-sm">
                  Last Published: {safeFormatTime(property.snapshots[0].publishedAt || property.snapshots[0].createdAt)}
                </span>
              )}
            </div>`;

code = code.replace(oldBadge, newBadge);

fs.writeFileSync('src/pages/ManagerPublishing.tsx', code);
console.log('ManagerPublishing patched');
