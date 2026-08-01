const fs = require('fs');
let code = fs.readFileSync('src/pages/ManagerProperty.tsx', 'utf8');

const validation = `
    const checkPhone = (p) => !p || p.replace(/\\D/g, '').length >= 10;
    if (formData.phone && !checkPhone(formData.phone)) { toast.error("Invalid phone number (must be at least 10 digits)"); setSaving(false); return; }
    if (formData.whatsapp && !checkPhone(formData.whatsapp)) { toast.error("Invalid WhatsApp number"); setSaving(false); return; }
    if (formData.receptionPhone && !checkPhone(formData.receptionPhone)) { toast.error("Invalid reception phone"); setSaving(false); return; }
    if (formData.emergencyPhone && !checkPhone(formData.emergencyPhone)) { toast.error("Invalid emergency phone"); setSaving(false); return; }
    
    if (formData.email && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(formData.email)) { toast.error("Invalid email address"); setSaving(false); return; }
    if (formData.website && !/^https?:\\/\\/.+/.test(formData.website)) { toast.error("Invalid website URL (must start with http:// or https://)"); setSaving(false); return; }
`;

code = code.replace(
  '  const handleSave = async () => {\n    if (!property) return;\n    setSaving(true);\n    \n    try {',
  `  const handleSave = async () => {\n    if (!property) return;\n    setSaving(true);\n    ${validation}\n    try {`
);

fs.writeFileSync('src/pages/ManagerProperty.tsx', code);
console.log("Patched ManagerProperty validation");
