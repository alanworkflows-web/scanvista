const fs = require('fs');
const file = 'src/pages/ManagerOnboarding.tsx';
let content = fs.readFileSync(file, 'utf8');

// We will inject a checklist into Step 5
const newStep5 = `      case 5:
        const guestUrl = createdSlug ? buildGuestUrl(createdSlug) : "";
        return (
          <div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto animate-in zoom-in-[0.95] duration-700 w-full mt-10">
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 mb-4 leading-tight">
              {formData.name} is now live!
            </h1>
            <p className="text-lg md:text-xl text-gray-500 font-light mb-12">
              Your property has been successfully created. Here is your launch checklist:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-12">
              {/* Left Column: The QR Code */}
              <Card className="p-8 flex flex-col items-center border-emerald-100 shadow-xl shadow-emerald-500/10 bg-gradient-to-b from-white to-emerald-50/20 h-full justify-center">
                <div className="mb-6 bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                   <QRCodeSVG value={guestUrl} size={180} level="H" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">{formData.name}</h2>
                <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium mb-6">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Demo URL
                </div>
                <div className="flex gap-4">
                  <Button size="sm" onClick={() => window.open(guestUrl, '_blank')} className="rounded-full flex items-center gap-2">
                    <Smartphone size={16} /> Preview
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    const svg = document.querySelector('svg');
                    if (svg) {
                      const printWin = window.open('', '', 'width=800,height=800');
                      if (printWin) {
                         printWin.document.write(\`<html><body><div style="display:flex;flex-direction:column;align-items:center;margin-top:100px;">\${svg.outerHTML}<h1>\${formData.name}</h1></div></body></html>\`);
                         printWin.document.close();
                         printWin.print();
                      }
                    }
                  }} className="rounded-full flex items-center gap-2">
                    <Printer size={16} /> Print
                  </Button>
                </div>
              </Card>

              {/* Right Column: The Checklist */}
              <div className="flex flex-col gap-4 text-left">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-1"><CheckCircle2 size={18} /></div>
                  <div>
                    <h3 className="font-medium text-gray-900">1. Property Created</h3>
                    <p className="text-sm text-gray-500">Your core property shell is ready.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center shrink-0 mt-1">2</div>
                  <div>
                    <h3 className="font-medium text-gray-900">2. Create your first Menu</h3>
                    <p className="text-sm text-gray-500 mb-3">Add categories and dishes so guests have something to browse.</p>
                    <Button size="sm" variant="outline" onClick={() => navigate("/manager/menu")} className="rounded-full">Go to Menu Editor</Button>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center shrink-0 mt-1">3</div>
                  <div>
                    <h3 className="font-medium text-gray-900">3. Invite your Team</h3>
                    <p className="text-sm text-gray-500 mb-3">Add staff to help manage orders and guests.</p>
                    <Button size="sm" variant="outline" onClick={() => navigate("/manager/home")} className="rounded-full">Go to Settings</Button>
                  </div>
                </div>
              </div>
            </div>

            <Button size="lg" onClick={() => navigate("/manager/home")} className="px-10 py-6 text-lg rounded-full w-full sm:w-auto shadow-xl hover:shadow-2xl transition-all">
              Complete Onboarding <ArrowRight className="ml-2" size={20} />
            </Button>
          </div>
        );`;

// Find the case 5 block and replace it
content = content.replace(/case 5:[\s\S]*?default:/, newStep5 + '\n\n      default:');

fs.writeFileSync(file, content);
console.log("Updated ManagerOnboarding checklist.");
