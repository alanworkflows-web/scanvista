const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/OpsDashboardSheet.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add import
content = content.replace(
  'import { createPortal } from "react-dom";',
  'import { createPortal } from "react-dom";\nimport { MenuStudio } from "./manager/menu/MenuStudio";'
);

// 2. Fix TABS
content = content.replace(
  '{ id: "categories", label: "Categories", icon: <List size={16} /> },\n  { id: "menu", label: "Menu Management", icon: <Utensils size={16} /> },',
  '{ id: "menu", label: "Menu Studio", icon: <Utensils size={16} /> },'
);

// 3. Replace the categories and menu tables
const startStr = '{activeTab === "categories" && (';
const endStr = '{activeTab === "amenities" && (';

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `{activeTab === "menu" && (
          <div className="p-4 bg-gray-50/30">
            <MenuStudio propertySlug={propertySlug} propertyName={propertySlug} />
          </div>
        )}

        `;
  
  content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Successfully replaced content!");
} else {
  console.error("Could not find start/end strings");
}
