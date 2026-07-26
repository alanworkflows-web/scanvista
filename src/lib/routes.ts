import { RequestHandler, Express } from "express";

export interface RouteDefinition {
  method: "get" | "post" | "put" | "patch" | "delete";
  path: string;
  middlewares: RequestHandler[];
  requiredRole: "OWNER" | "ADMIN" | "MEMBER";
}

export const registeredRoutes: RouteDefinition[] = [];

// App instance injection
let currentApp: Express;

export function initRoutes(app: Express) {
  currentApp = app;
}

export function defineRoute(method: RouteDefinition["method"], path: string, middlewares: RequestHandler[] | RequestHandler, requiredRole: RouteDefinition["requiredRole"], handler: RequestHandler) {
  const mwArray = Array.isArray(middlewares) ? middlewares : [middlewares];
  registeredRoutes.push({ method, path, middlewares: mwArray, requiredRole });
  if (currentApp) {
    currentApp[method](path, ...mwArray, handler);
  } else {
    throw new Error("Call initRoutes(app) before defining routes");
  }
}

export function managerGet(path: string, middlewares: RequestHandler[] | RequestHandler, requiredRole: RouteDefinition["requiredRole"], handler: RequestHandler) {
  defineRoute("get", path, middlewares, requiredRole, handler);
}

export function managerPost(path: string, middlewares: RequestHandler[] | RequestHandler, requiredRole: RouteDefinition["requiredRole"], handler: RequestHandler) {
  defineRoute("post", path, middlewares, requiredRole, handler);
}

export function managerPut(path: string, middlewares: RequestHandler[] | RequestHandler, requiredRole: RouteDefinition["requiredRole"], handler: RequestHandler) {
  defineRoute("put", path, middlewares, requiredRole, handler);
}

export function managerDelete(path: string, middlewares: RequestHandler[] | RequestHandler, requiredRole: RouteDefinition["requiredRole"], handler: RequestHandler) {
  defineRoute("delete", path, middlewares, requiredRole, handler);
}
