const fs = require('fs');

let code = fs.readFileSync('src/pages/ManagerAmenities.tsx', 'utf8');

// Replace {amenity.status === 'ACTIVE' ? 'Published' : amenity.status === 'UNSAVED' ? 'Unsaved Draft' : 'Draft'}
code = code.replace(
  "{amenity.status === 'ACTIVE' ? 'Published' : amenity.status === 'UNSAVED' ? 'Unsaved Draft' : 'Draft'}",
  "{amenity.status === 'ACTIVE' ? 'Published' : 'Draft pending'}"
);

fs.writeFileSync('src/pages/ManagerAmenities.tsx', code);
console.log("Patched ManagerAmenities");
