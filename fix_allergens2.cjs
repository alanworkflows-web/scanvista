const fs = require('fs');
let code = fs.readFileSync('src/pages/GuestWelcome.tsx', 'utf8');

const target = '{dish.description && <p className="text-[#7A7A7A] text-[14px] leading-relaxed font-light">{dish.description}</p>}';

const replacement = `{dish.description && <p className="text-[#7A7A7A] text-[14px] leading-relaxed font-light">{dish.description}</p>}
                          {dish.allergens && dish.allergens !== "[]" && (
                            <p className="text-[#D4AF37] text-[12px] font-medium mt-1">
                              Contains: {(() => { try { const a = JSON.parse(dish.allergens); return Array.isArray(a) ? a.join(", ") : dish.allergens; } catch { return dish.allergens; } })()}
                            </p>
                          )}`;

code = code.replace(target, replacement);

fs.writeFileSync('src/pages/GuestWelcome.tsx', code);
console.log("Patched GuestWelcome allergens");
