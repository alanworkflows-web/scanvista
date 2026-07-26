import { OrganizationMembership, Property, User } from "@prisma/client";

export type Action = "create" | "read" | "update" | "delete" | "publish";
export type Resource = "property" | "menu" | "amenity" | "guest" | "billing" | "organization";

export interface PermissionContext {
  user: User;
  membership: OrganizationMembership;
  action: Action;
  resource: Resource;
  property?: Property;
}

export function can(ctx: PermissionContext): boolean {
  const { membership, action, resource } = ctx;
  const role = membership.role; // "OWNER", "ADMIN", "MEMBER"

  // Owners can do anything across the board
  if (role === "OWNER") {
    return true;
  }

  // Admins can do anything except billing and organization settings
  if (role === "ADMIN") {
    if (resource === "billing" || resource === "organization") {
      return false;
    }
    return true;
  }

  // Members (Staff) can read, but generally cannot mutate except for specific workflows
  if (role === "MEMBER") {
    if (action === "read") {
      return true;
    }
    // Staff can update guests (e.g., check them in)
    if (resource === "guest" && action === "update") {
      return true;
    }
    // All other mutations are forbidden
    return false;
  }

  return false;
}
