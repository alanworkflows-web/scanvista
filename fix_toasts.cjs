const fs = require('fs');

function addDraftMessage(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    // Replace generic save messages
    content = content.replace(/toast\.success\("(.+?)(saved|updated) successfully(.+?)"\)/gi, 'toast.success("$1saved successfully. Publish to make it visible to guests.")');
    content = content.replace(/toast\.success\("Amenities saved successfully"\)/gi, 'toast.success("Amenities saved as Draft. Publish to make it visible to guests.")');
    content = content.replace(/toast\.success\("Property updated successfully"\)/gi, 'toast.success("Property saved as Draft. Publish to make it visible to guests.")');
    content = content.replace(/toast\.success\("House rules saved successfully"\)/gi, 'toast.success("House rules saved as Draft. Publish to make it visible to guests.")');
    content = content.replace(/toast\.success\("Menu category created!"\)/gi, 'toast.success("Category saved as Draft. Publish to make it visible to guests.")');
    content = content.replace(/toast\.success\("Menu category updated!"\)/gi, 'toast.success("Category saved as Draft. Publish to make it visible to guests.")');
    content = content.replace(/toast\.success\("Dish updated successfully"\)/gi, 'toast.success("Dish saved as Draft. Publish to make it visible to guests.")');
    content = content.replace(/toast\.success\("Dish created successfully"\)/gi, 'toast.success("Dish saved as Draft. Publish to make it visible to guests.")');
    fs.writeFileSync(filePath, content);
  } catch(e) {}
}

addDraftMessage('src/pages/ManagerAmenities.tsx');
addDraftMessage('src/pages/ManagerProperty.tsx');
addDraftMessage('src/pages/PropertyPage.tsx');
addDraftMessage('src/components/manager/menu/MenuStudio.tsx');
addDraftMessage('src/components/manager/menu/useMenuStudio.ts');
addDraftMessage('src/pages/ManagerHouseRules.tsx');

console.log('Added Draft Messaging');
