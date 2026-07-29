const fs = require('fs');
let c = fs.readFileSync('src/pages/ManagerBilling.tsx', 'utf8');

if (!c.includes('import { toast }')) {
  c = c.replace("import React", "import React\nimport { toast } from 'react-hot-toast';");
}

c = c.replace(/onClick=\{ \(\) => handleManageSubscription\(p.id\) \}/g, 'onClick={() => { if (p.id !== subscription?.plan) { toast.info("Plan switching coming soon.", { duration: 3000 }); } else { handleManageSubscription(p.id); } }}');

fs.writeFileSync('src/pages/ManagerBilling.tsx', c);
console.log('Fixed ManagerBilling.tsx');
