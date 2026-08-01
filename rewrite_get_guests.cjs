const fs = require('fs');

const code = fs.readFileSync('server.ts', 'utf8');

const startIdx = code.indexOf('app.get("/api/guests/:token"');
const endIdx = code.indexOf('app.get("/api/preview/:token"');

if (startIdx === -1 || endIdx === -1) {
  console.log("Could not find boundaries");
  process.exit(1);
}

const oldRoute = code.substring(startIdx, endIdx);

const newRoute = `app.get("/api/guests/:token", async (req, res) => {
    try {
      const { token } = req.params;

      // 1. Try finding a registered guest by their unique token
      const guest = await prisma.guest.findUnique({
        where: { token },
        include: {
          property: {
            include: {
              amenities: true,
              categories: { include: { dishes: true } },
            }
          }
        }
      });

      if (guest) {
        await prisma.guest.update({
          where: { id: guest.id },
          data: { linkViewedAt: new Date() }
        });

        // Analytics
        await prisma.activityEvent.create({
          data: {
            organizationId: guest.property.orgId,
            propertyId: guest.property.id,
            action: 'VIEWED',
            resourceType: 'PROPERTY',
            source: 'WEB',
            metadata: { guestId: guest.id }
          }
        }).catch(() => {});

        const safeGuest = {
          token: guest.token,
          name: guest.name,
          roomNumber: guest.roomNumber,
          language: guest.language,
          arrivalDate: guest.arrivalDate,
          departureDate: guest.departureDate,
          arrivalTime: guest.arrivalTime,
          preferences: guest.preferences,
          communication: guest.communication,
          status: guest.status,
          property: {
            ...guest.property,
            heroImage: guest.property.heroImage || guest.property.bannerUrl,
            bannerUrl: guest.property.bannerUrl || guest.property.heroImage
          }
        };

        return res.json(safeGuest);
      }

      // 2. Not a guest token. Check if it's a property slug (Public QR access)
      const publishedProperty = await prisma.property.findUnique({
        where: { slug: token },
        include: {
          snapshots: {
            orderBy: { publishedAt: 'desc' },
            take: 1
          }
        }
      });

      if (publishedProperty && publishedProperty.snapshots.length > 0) {
        console.log(\`[GuestAPI] Found published snapshot for slug: \${token}\`);
        
        // Analytics
        await prisma.activityEvent.create({
          data: {
            organizationId: publishedProperty.orgId,
            propertyId: publishedProperty.id,
            action: 'VIEWED',
            resourceType: 'PROPERTY',
            source: 'WEB'
          }
        }).catch(() => {});

        const snapshotData = publishedProperty.snapshots[0].data;

        const safeGuest = {
          token: 'public-guest',
          name: 'Guest',
          status: 'CHECKED_IN',
          property: {
            ...snapshotData.property,
            heroImage: snapshotData.property.heroImage || snapshotData.property.bannerUrl,
            bannerUrl: snapshotData.property.bannerUrl || snapshotData.property.heroImage,
            categories: snapshotData.categories || [],
            amenities: snapshotData.amenities || []
          }
        };

        return res.json(safeGuest);
      }

      // 3. Fallback for Preview Token (Legacy / Draft access)
      // This is still here for backwards compatibility if Guest app uses /api/guests/:previewToken
      // However, we recommend /api/preview/:previewToken for previews.
      const previewProperty = await prisma.property.findUnique({
        where: { previewToken: token },
        include: {
          amenities: true,
          categories: { include: { dishes: true } },
        }
      });

      if (previewProperty) {
        console.log(\`[GuestAPI] Preview Token fallback hit: \${token}\`);
        const safeGuest = {
          token: 'public-guest',
          name: 'Guest',
          status: 'CHECKED_IN',
          property: {
            ...previewProperty,
            heroImage: previewProperty.heroImage || previewProperty.bannerUrl,
            bannerUrl: previewProperty.bannerUrl || previewProperty.heroImage
          }
        };
        return res.json(safeGuest);
      }

      // 4. Nothing found, return 404 (Guest URL Isolation)
      return res.status(404).json({ error: "Guest journey not found" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch guest journey" });
    }
  });

  `;

fs.writeFileSync('server.ts', code.replace(oldRoute, newRoute));
console.log("Rewrote server.ts GET /api/guests/:token");
