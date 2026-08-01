const fs = require('fs');

const path = 'src/pages/ManagerHome.tsx';
let code = fs.readFileSync(path, 'utf8');

const oldOnClick = `            onClick={() => {
              // Direct them to setup or manually trigger creation if needed
              // Given auto-provisioning is fixed, they might just need a reload
              window.location.reload();
            }}`;

const newOnClick = `            onClick={async () => {
              try {
                await fetch("/api/manager/properties", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name: "My Property" })
                });
                window.location.reload();
              } catch (e) {
                console.error("Initialization failed", e);
                window.location.reload();
              }
            }}`;

code = code.replace(oldOnClick, newOnClick);
fs.writeFileSync(path, code);
console.log("Patched ManagerHome.tsx");
