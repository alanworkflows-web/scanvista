const fs = require('fs');

['src/pages/ManagerProperty.tsx', 'src/pages/ManagerAmenities.tsx', 'src/pages/ManagerHouseRules.tsx'].forEach(f => {
  let code = fs.readFileSync(f, 'utf8');
  if (!code.includes('import { CheckCircle2')) {
    code = code.replace(/import \{ ([^}]+) \} from "lucide-react";/, 'import { CheckCircle2, $1 } from "lucide-react";');
    fs.writeFileSync(f, code);
    console.log('Fixed imports in', f);
  }
});
