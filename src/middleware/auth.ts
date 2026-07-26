import express from "express";
import { prisma } from "../lib/db";

// Extend express request
declare global {
  namespace Express {
    interface Request {
      userContext?: {
        userId: string;
        orgId: string;
        orgRole: string;
      };
      propertyContext?: {
        propertyId: string;
        propertySlug: string;
        orgId: string;
      };
    }
  }
}

// 1. Authentication Layer
export const requireAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {

  // @ts-ignore
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "Unauthorized: Missing valid session" });
  }
  next();
};

// 2. Organization Access Layer
export const requireOrgAccess = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // @ts-ignore
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const targetOrgId = req.headers["x-organization-id"] as string | undefined;
    
    const membership = await prisma.organizationMembership.findFirst({
      where: {
        userId,
        ...(targetOrgId ? { orgId: targetOrgId } : {})
      },
      include: {
        org: true
      }
    });

    if (!membership) {
      return res.status(403).json({ error: "Forbidden: No organization membership found" });
    }

    req.userContext = {
      userId,
      orgId: membership.orgId,
      orgRole: membership.role
    };

    next();
  } catch (error) {
    console.error("Org access error:", error);
    res.status(500).json({ error: "Internal Server Error during org validation" });
  }
};

// 3. Property Access Layer
export const requirePropertyAccess = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.userContext) {
    return res.status(500).json({ error: "Server Error: Org validation missing before property validation" });
  }

  const { slug, id, propertyId } = req.params;
  const bodyPropertyId = req.body?.propertyId;
  
  // Find which identifier we're using
  const searchSlug = slug;
  const searchId = id || propertyId || bodyPropertyId;

  if (!searchSlug && !searchId) {
    // If no property identifier in route/body, skip property validation.
    // E.g., for creating a new property
    return next();
  }

  try {
    const property = await prisma.property.findFirst({
      where: {
        ...(searchSlug ? { slug: searchSlug } : {}),
        ...(searchId ? { id: searchId } : {})
      }
    });

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    if (property.orgId !== req.userContext.orgId) {
      return res.status(403).json({ error: "Forbidden: Cross-tenant access denied" });
    }

    req.propertyContext = {
      propertyId: property.id,
      propertySlug: property.slug,
      orgId: property.orgId
    };

    next();
  } catch (error) {
    console.error("Property access error:", error);
    res.status(500).json({ error: "Internal Server Error during property validation" });
  }
};

// 4. Resource Access Layer
export const requireRole = (allowedRoles: string[]) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!req.userContext) {
      return res.status(500).json({ error: "Server Error: Org validation missing before role validation" });
    }
    
    if (!allowedRoles.includes(req.userContext.orgRole)) {
      return res.status(403).json({ error: `Forbidden: Requires one of ${allowedRoles.join(", ")}` });
    }
    next();
  };
};
