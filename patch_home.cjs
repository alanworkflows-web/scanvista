const fs = require('fs');
let c = fs.readFileSync('src/pages/ManagerHome.tsx', 'utf8');

const fallback = `  if (!property) {
    return (
      <ManagerLayout>
        <div className="flex flex-col items-center justify-center h-[70vh] max-w-md mx-auto text-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-2">
            <Hotel size={40} />
          </div>
          <h2 className="text-3xl font-serif font-medium text-text-primary">Welcome to ScanVista</h2>
          <p className="text-text-secondary text-lg">Your account is ready. Let's create your first property to get started.</p>
          <Button 
            size="lg" 
            className="w-full text-lg h-14 mt-4 shadow-premium hover:shadow-premium-hover transition-all"
            onClick={() => {
              // Direct them to setup or manually trigger creation if needed
              // Given auto-provisioning is fixed, they might just need a reload
              window.location.reload();
            }}
          >
            <Plus className="mr-2" /> Initialize Dashboard
          </Button>
        </div>
      </ManagerLayout>
    );
  }

  const completion = calculateCompletion(property);`;

if (!c.includes('<Hotel size={40} />')) {
  // We need to make sure Hotel is imported
  if (!c.includes('Hotel,')) {
    c = c.replace('LayoutDashboard,', 'Hotel, LayoutDashboard,');
  }
  c = c.replace('  if (!property) return null;\n\n  const completion = calculateCompletion(property);', fallback);
  fs.writeFileSync('src/pages/ManagerHome.tsx', c);
  console.log('Patched ManagerHome.tsx');
} else {
  console.log('Already patched');
}
