const fs = require('fs');

function replaceFile(f, replacer) {
  let content = fs.readFileSync(f, 'utf8');
  let newContent = replacer(content);
  if (content !== newContent) {
    fs.writeFileSync(f, newContent);
    console.log('Fixed', f);
  }
}

replaceFile('src/pages/ManagerHome.tsx', c => {
  if (!c.includes('import { Button }')) {
    return c.replace('import { Link, useNavigate } from "react-router-dom";', 'import { Link, useNavigate } from "react-router-dom";\nimport { Button } from "../components/ui/Button";');
  }
  return c;
});

replaceFile('src/pages/ManagerOnboarding.tsx', c => {
  if (!c.includes('ImageUploader')) {
    return c.replace('import { QRCodeSVG } from "qrcode.react";', 'import { QRCodeSVG } from "qrcode.react";\nimport { ImageUploader } from "../components/ImageUploader";');
  }
  return c;
});

replaceFile('src/pages/ManagerProperty.tsx', c => {
  return c.replace(/buildGuestUrl\(property\.previewToken, true\)/g, 'buildGuestUrl(property.previewToken)').replace(/placeholder="[^"]*"/g, '');
});

replaceFile('src/components/MenuStudio.tsx', c => {
  return c.replace(/status="(success|idle|loading)"/g, '');
});

replaceFile('src/pages/ManagerHelp.tsx', c => {
  return c.replace(/status="(success|idle|loading)"/g, '');
});
