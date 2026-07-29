const fs = require('fs');
let c = fs.readFileSync('walkthrough.md', 'utf8');

const addition = `

## Hotfix: Google OAuth Authentication
- **User Provisioning:** The OAuth callback (\`/auth/google/callback\`) now correctly provisions an \`Organization\` and \`OrganizationMembership\` for brand new users. This resolves the 403 error during automatic property creation.
- **Double Request Immunity:** Added a pre-flight session check. If the browser makes a double request (common with Safari or Strict policies), the callback now gracefully intercepts the already-authenticated session and redirects to \`/manager/setup\` instead of throwing a "Session Expired" error.
- **Dashboard Fallback:** \`ManagerHome.tsx\` now correctly handles cases where a property hasn't finished provisioning. Instead of a blank white screen, it displays a proper empty state with a "Welcome to ScanVista" message and an "Initialize Dashboard" button to manually trigger a reload/setup if auto-provisioning pauses.
`;

c += addition;
fs.writeFileSync('walkthrough.md', c);
console.log('Updated walkthrough.md');
