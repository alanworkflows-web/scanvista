const fs = require('fs');

const file = 'server.ts';
let content = fs.readFileSync(file, 'utf8');

// Fix POST properties
content = content.replace(
  /managerPost\("\/api\/manager\/properties", \[requireAuth, requireOrgAccess, requirePropertyAccess\], "OWNER", async \(req, res\) => \{\s*try \{\s*const name = String\(req\.body\.name \|\| 'New Property'\);\s*const slug = await generateUniqueSlug\(name\);\s*\/\/\s*@ts-ignore\s*const property = await prisma\.property\.create\(\{\s*data: \{\s*name,\s*slug,\s*\/\/\s*@ts-ignore\s*ownerId: req\.session\.userId,\s*orgId: req\.userContext\.orgId\s*\}\s*\}\);/,
  `managerPost("/api/manager/properties", [requireAuth, requireOrgAccess, requirePropertyAccess], "OWNER", async (req, res) => {
    try {
      const validatedData = PropertySchema.parse(req.body);
      const name = String(validatedData.name || 'New Property');
      const slug = await generateUniqueSlug(name);
      
      const property = await prisma.property.create({
        data: {
          ...validatedData,
          name,
          slug,
          // @ts-ignore
          ownerId: req.session.userId,
          // @ts-ignore
          orgId: req.userContext.orgId
        },
        include: { subscription: true }
      });`
);

// Fix PUT amenities
content = content.replace(
  /managerPut\("\/api\/manager\/amenities\/:id", \[requireAuth, requireOrgAccess, requirePropertyAccess\], "ADMIN", async \(req, res\) => \{\s*\/\/\s*@ts-ignore\s*const \{ userId \} = req\.session;\s*const \{ id \} = req\.params;\s*const amenity = await prisma\.amenity\.findUnique\(\{ where: \{ id \}, include: \{ property: \{ include: \{ subscription: true \} \} \} \}\);\s*if \(\!amenity \|\| amenity\.property\.ownerId !== userId\) return res\.status\(403\)\.json\(\{ error: "Access denied" \}\);\s*const entitlement = resolveEntitlement\(amenity\.property\.subscription\);\s*if \(\!entitlement\.canEdit\) return res\.status\(403\)\.json\(\{ error: "Account is read-only\." \}\);\s*const updated = await prisma\.amenity\.update\(\{ where: \{ id \}, data: req\.body \}\);\s*res\.json\(updated\);\s*\}\);/,
  `managerPut("/api/manager/amenities/:id", [requireAuth, requireOrgAccess, requirePropertyAccess], "ADMIN", async (req, res) => {
    try {
      const validatedData = AmenitySchema.partial().parse(req.body);
      // @ts-ignore
      const { userId } = req.session;
      const { id } = req.params;

      const amenity = await prisma.amenity.findUnique({ where: { id }, include: { property: { include: { subscription: true } } } });
      if (!amenity || amenity.property.ownerId !== userId) return res.status(403).json({ error: "Access denied" });

      const entitlement = resolveEntitlement(amenity.property.subscription);
      if (!entitlement.canEdit) return res.status(403).json({ error: "Account is read-only." });

      const updated = await prisma.amenity.update({ where: { id }, data: validatedData });
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input provided.",
            details: err.issues
          }
        });
      }
      res.status(500).json({ error: "Failed to update amenity" });
    }
  });`
);

// Fix PUT dishes
content = content.replace(
  /managerPut\("\/api\/manager\/dishes\/:id", \[requireAuth, requireOrgAccess, requirePropertyAccess\], "ADMIN", async \(req, res\) => \{\s*\/\/\s*@ts-ignore\s*const \{ userId \} = req\.session;\s*const \{ id \} = req\.params;\s*const dish = await prisma\.dish\.findUnique\(\{\s*where: \{ id \},\s*include: \{ category: \{ include: \{ property: \{ include: \{ subscription: true \} \} \} \} \}\s*\}\);\s*if \(\!dish \|\| dish\.category\.property\.ownerId !== userId\) return res\.status\(403\)\.json\(\{ error: "Access denied" \}\);\s*const entitlement = resolveEntitlement\(dish\.category\.property\.subscription\);\s*if \(\!entitlement\.canEdit\) return res\.status\(403\)\.json\(\{ error: "Account is read-only\." \}\);\s*const updated = await prisma\.dish\.update\(\{ where: \{ id \}, data: req\.body \}\);\s*res\.json\(updated\);\s*\}\);/,
  `managerPut("/api/manager/dishes/:id", [requireAuth, requireOrgAccess, requirePropertyAccess], "ADMIN", async (req, res) => {
    try {
      const validatedData = DishSchema.partial().parse(req.body);
      // @ts-ignore
      const { userId } = req.session;
      const { id } = req.params;

      const dish = await prisma.dish.findUnique({
        where: { id },
        include: { category: { include: { property: { include: { subscription: true } } } } }
      });
      if (!dish || dish.category.property.ownerId !== userId) return res.status(403).json({ error: "Access denied" });

      const entitlement = resolveEntitlement(dish.category.property.subscription);
      if (!entitlement.canEdit) return res.status(403).json({ error: "Account is read-only." });

      const updated = await prisma.dish.update({ where: { id }, data: validatedData });
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input provided.",
            details: err.issues
          }
        });
      }
      res.status(500).json({ error: "Failed to update dish" });
    }
  });`
);

fs.writeFileSync(file, content);
console.log('Fixed PUTs and POST properties');
