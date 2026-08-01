const fs = require('fs');

function patchComponent(path) {
  let code = fs.readFileSync(path, 'utf8');
  
  // Add state for dirty and saveStatus
  if (!code.includes('const [isDirty, setIsDirty]')) {
    code = code.replace(
      'const [saving, setSaving] = useState(false);',
      'const [saving, setSaving] = useState(false);\n  const [isDirty, setIsDirty] = useState(false);\n  const [saveStatus, setSaveStatus] = useState<"idle" | "saved">("idle");'
    );
  }

  // Update handleChange (or equivalent) to set isDirty
  if (path.includes('ManagerProperty.tsx')) {
    code = code.replace(
      'setFormData(prev => ({ ...prev, [field]: value }));',
      'setFormData(prev => ({ ...prev, [field]: value }));\n    setIsDirty(true);\n    setSaveStatus("idle");'
    );
  } else if (path.includes('ManagerAmenities.tsx')) {
    // Amenities doesn't use formData, it sets amenities array. 
    // It's probably easier to just find the setter
    code = code.replace(
      'const handleAdd = () => {',
      'const handleAdd = () => {\n    setIsDirty(true);\n    setSaveStatus("idle");'
    );
    code = code.replace(
      'const handleUpdate = (id: string, updates: any) => {',
      'const handleUpdate = (id: string, updates: any) => {\n    setIsDirty(true);\n    setSaveStatus("idle");'
    );
    code = code.replace(
      'const handleDelete = (id: string) => {',
      'const handleDelete = (id: string) => {\n    setIsDirty(true);\n    setSaveStatus("idle");'
    );
    code = code.replace(
      'const handleDragEnd = (result: any) => {',
      'const handleDragEnd = (result: any) => {\n    setIsDirty(true);\n    setSaveStatus("idle");'
    );
  } else if (path.includes('ManagerHouseRules.tsx')) {
    code = code.replace(
      'setFormData(prev => ({ ...prev, [field]: value }));',
      'setFormData(prev => ({ ...prev, [field]: value }));\n    setIsDirty(true);\n    setSaveStatus("idle");'
    );
  }

  // Update handleSave to clear dirty state and set saved
  if (code.includes('toast.success("Property saved as Draft')) {
    code = code.replace(
      'toast.success("Property saved as Draft. Publish to make it visible to guests.");\n      refreshProperty();',
      'setIsDirty(false);\n      setSaveStatus("saved");\n      toast.success("Property saved as Draft. Publish to make it visible to guests.");\n      refreshProperty();\n      setTimeout(() => setSaveStatus("idle"), 3000);'
    );
  } else if (code.includes('toast.success("Amenities saved as Draft')) {
    code = code.replace(
      'toast.success("Amenities saved as Draft. Publish to make them visible to guests.");\n      refreshProperty();',
      'setIsDirty(false);\n      setSaveStatus("saved");\n      toast.success("Amenities saved as Draft. Publish to make them visible to guests.");\n      refreshProperty();\n      setTimeout(() => setSaveStatus("idle"), 3000);'
    );
  } else if (code.includes('toast.success("House rules saved as Draft')) {
    code = code.replace(
      'toast.success("House rules saved as Draft. Publish to make them visible to guests.");\n      refreshProperty();',
      'setIsDirty(false);\n      setSaveStatus("saved");\n      toast.success("House rules saved as Draft. Publish to make them visible to guests.");\n      refreshProperty();\n      setTimeout(() => setSaveStatus("idle"), 3000);'
    );
  }

  // Update the button UI
  const oldBtn = '{saving ? <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div> : <><Save size={18} className="mr-2"/> Save Changes</>}';
  const newBtn = '{saving ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin mr-2"></div> Saving...</> : saveStatus === "saved" ? <><CheckCircle2 size={18} className="mr-2 text-emerald-400"/> Saved</> : <><Save size={18} className="mr-2"/> Save Changes</>}';
  
  if (code.includes(oldBtn)) {
    code = code.replace(oldBtn, newBtn);
  }

  // Disable button if not dirty
  const oldBtnTag = '<Button onClick={handleSave} disabled={saving} className="min-w-[120px]">';
  const newBtnTag = '<Button onClick={handleSave} disabled={saving || (!isDirty && saveStatus !== "saved")} className="min-w-[120px] transition-all">';
  
  if (code.includes(oldBtnTag)) {
    code = code.replace(oldBtnTag, newBtnTag);
  }

  // Ensure CheckCircle2 is imported if we are using it in the button
  if (!code.includes('CheckCircle2')) {
    code = code.replace('import { Save, ', 'import { Save, CheckCircle2, ');
  }

  fs.writeFileSync(path, code);
  console.log('Patched', path);
}

patchComponent('src/pages/ManagerProperty.tsx');
patchComponent('src/pages/ManagerAmenities.tsx');
patchComponent('src/pages/ManagerHouseRules.tsx');
