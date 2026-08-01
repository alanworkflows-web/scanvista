const fs = require('fs');

function fix(file) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('import { CheckCircle2')) {
    content = content.replace(/import \{([^}]+)\} from 'lucide-react';|import \{([^}]+)\} from "lucide-react";/, (match, p1, p2) => {
      const inner = p1 || p2;
      return `import { CheckCircle2, ${inner} } from "lucide-react";`;
    });
    fs.writeFileSync(file, content);
  }
}

fix('src/pages/ManagerProperty.tsx');
fix('src/pages/ManagerAmenities.tsx');
fix('src/pages/ManagerHouseRules.tsx');
