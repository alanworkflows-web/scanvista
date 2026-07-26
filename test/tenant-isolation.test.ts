import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { PrismaClient } from "@prisma/client";
import { startServer } from "../server";
import { loginAs } from "./helpers/auth";

const prisma = new PrismaClient();
let app: any;
let agentA: any;
let agentB: any;
let unauthAgent: any;

let orgAId: string;
let orgBId: string;
let propAId: string;
let propBId: string;
let propBSlug: string;
let propASlug: string;
let userAId: string;
let userBId: string;

beforeAll(async () => {
  app = await startServer();
  unauthAgent = request.agent(app);

  const sessionA = await loginAs(app, "OWNER", { createProperty: true });
  agentA = sessionA.agent;
  userAId = sessionA.userId;
  orgAId = sessionA.orgId;
  propASlug = sessionA.propertySlug!;
  
  const propA = await prisma.property.findUnique({ where: { slug: propASlug }});
  propAId = propA!.id;

  const sessionB = await loginAs(app, "OWNER", { createProperty: true });
  agentB = sessionB.agent;
  userBId = sessionB.userId;
  orgBId = sessionB.orgId;
  propBSlug = sessionB.propertySlug!;
  
  const propB = await prisma.property.findUnique({ where: { slug: propBSlug }});
  propBId = propB!.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Tenant Isolation", () => {
  it("Agent A cannot read Property B", async () => {
    const res = await agentA.get(`/api/manager/properties/${propBSlug}`);
    expect(res.status).toBe(403);
  });

  it("Agent A cannot update Property B", async () => {
    const res = await agentA.put(`/api/manager/properties/${propBSlug}`).send({ name: "Hacked Name" });
    expect(res.status).toBe(403);
  });

  it("Agent A cannot fetch guests of Property B", async () => {
    const res = await agentA.get(`/api/manager/properties/${propBSlug}/guests`);
    expect(res.status).toBe(403);
  });

  it("API Fuzzing: Random invalid property slugs do not crash but return 404 or 403", async () => {
    const res = await agentA.get(`/api/manager/properties/random-fake-slug-1234`);
    // Based on middleware, if property doesn't exist, it returns 404 before 403
    expect(res.status).toBe(404);
  });

  it("Authentication: Missing session rejects with 401", async () => {
    const res = await unauthAgent.get(`/api/manager/properties`);
    expect(res.status).toBe(401);
  });
});

