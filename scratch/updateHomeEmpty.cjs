const fs = require('fs');
const file = 'src/pages/ManagerHome.tsx';
let content = fs.readFileSync(file, 'utf8');

const bannerHtml = `
      {categories?.length === 0 && amenities?.length === 0 && (
        <div className="mb-8 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-3xl shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm text-emerald-600 text-xl">
              🚀
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome to your Dashboard</h2>
              <p className="text-gray-600 mb-4">You've successfully created your property. Let's get it ready for guests.</p>
              <div className="flex gap-4">
                <a href="/manager/menu" className="px-4 py-2 bg-emerald-600 text-white rounded-full text-sm font-medium hover:bg-emerald-700 transition-colors">
                  Create a Menu
                </a>
                <a href="/manager/restaurant" className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors">
                  Add Amenities
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
`;

content = content.replace(
  'const { property } = useManagerProperty();',
  'const { property, categories, amenities } = useManagerProperty();'
);

content = content.replace(
  '<div className="mb-8">',
  bannerHtml + '\n      <div className="mb-8">'
);

fs.writeFileSync(file, content);
console.log("Updated ManagerHome empty states.");
