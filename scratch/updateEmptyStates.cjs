const fs = require('fs');
const file = 'src/components/OpsDashboardSheet.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace empty dishes state
content = content.replace(
  '{dishes.map(dish => (',
  `{dishes.length === 0 && !isReadOnly && (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                        <Utensils size={32} />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Create your first dish</h3>
                      <p className="text-sm text-gray-500 mb-6">Your menu is empty. Start adding dishes so guests can view them on the QR menu.</p>
                      <button onClick={addDish} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded-full inline-flex items-center gap-2 transition-colors shadow-sm">
                        <Plus size={18} /> Add Dish
                      </button>
                    </div>
                  </td>
                </tr>
              )}
              {dishes.map(dish => (`
);

// Replace empty amenities state
content = content.replace(
  '{amenities.map(am => {',
  `{amenities.length === 0 && !isReadOnly && (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                        <Wifi size={32} />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Add an Amenity</h3>
                      <p className="text-sm text-gray-500 mb-6">List your pool, spa, or gym hours so guests know when they can visit.</p>
                      <button onClick={addAmenity} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded-full inline-flex items-center gap-2 transition-colors shadow-sm">
                        <Plus size={18} /> Add Amenity
                      </button>
                    </div>
                  </td>
                </tr>
              )}
              {amenities.map(am => {`
);

fs.writeFileSync(file, content);
console.log("Updated OpsDashboardSheet empty states.");
