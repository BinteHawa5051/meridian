/**
 * Role-Based Access Control helpers.
 * Roles: admin > user > viewer
 */

export type Role = "admin" | "user" | "viewer";

const ROLE_RANK: Record<Role, number> = { admin: 3, user: 2, viewer: 1 };

export function hasRole(userRole: Role | undefined, required: Role): boolean {
  if (!userRole) return false;
  return ROLE_RANK[userRole] >= ROLE_RANK[required];
}

// Which pages each role can access
export const ROUTE_ACCESS: Record<string, Role> = {
  "/dashboard":    "viewer",
  "/user-dashboard": "user",
  "/usage":        "viewer",
  "/models":       "viewer",
  "/customers":    "user",
  "/budgets":      "user",
  "/alerts":       "user",
  "/policies":     "user",
  "/reports":      "user",
  "/team":         "user",
  "/billing":      "admin",
  "/api-keys":     "admin",
  "/integrations": "admin",
  "/settings":     "admin",
  "/admin":        "admin",
};

export function canAccess(userRole: Role | undefined, path: string): boolean {
  const required = ROUTE_ACCESS[path] ?? "viewer";
  return hasRole(userRole, required);
}
