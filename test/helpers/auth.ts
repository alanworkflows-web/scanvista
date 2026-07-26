import { PrismaClient } from "@prisma/client";
import signature from "cookie-signature";
import crypto from "crypto";
import type { Express } from "express";
import request from "supertest";

const prisma = new PrismaClient();

export interface TestSession {
  agent: request.SuperAgentTest;
  userId: string;
  orgId: string;
  propertySlug?: string;
}

export async function loginAs(
  app: Express,
  role: "OWNER" | "ADMIN" | "MEMBER",
  options?: { createProperty?: boolean }
): Promise<TestSession> {
  const suffix = crypto.randomBytes(4).toString("hex");
  const email = `test-${role.toLowerCase()}-${suffix}@example.com`;

  const user = await prisma.user.create({
    data: {
      email,
      name: `Test ${role}`,
    },
  });

  const org = await prisma.organization.create({
    data: {
      name: `Test Org ${suffix}`,
      slug: `org-${suffix}`,
      memberships: {
        create: {
          userId: user.id,
          role,
        },
      },
    },
  });

  let propertySlug;
  if (options?.createProperty) {
    propertySlug = `prop-${suffix}`;
    await prisma.property.create({
      data: {
        name: `Test Property ${suffix}`,
        slug: propertySlug,
        ownerId: user.id,
        orgId: org.id,
      },
    });
  }

  // Generate a realistic express-session cookie
  const sid = crypto.randomBytes(16).toString("hex");
  const secret = process.env.SESSION_SECRET || "test_secret";
  const signedSid = "s:" + signature.sign(sid, secret);

  const expires = new Date(Date.now() + 86400000);
  await prisma.session.create({
    data: {
      id: sid,
      sid: sid,
      data: JSON.stringify({
        cookie: { originalMaxAge: 86400000, expires: expires.toISOString(), secure: false, httpOnly: true, path: "/" },
        userId: user.id,
        passport: { user: user.id }
      }),
      expiresAt: expires,
    },
  });

  const agent = request.agent(app);
  // inject the cookie directly into the agent jar
  // we do this by hooking into the underlying request builder or setting it manually
  // The simplest way to mock an agent session reliably in supertest is to just append the cookie
  
  // Wait, supertest agent actually remembers cookies if it receives a Set-Cookie header. 
  // We can just construct a wrapper agent that sends it manually, or we can use a custom request setup.
  
  // Actually, we can return a Proxy to the agent that automatically attaches the cookie!
  const proxyAgent = new Proxy(agent, {
    get(target, prop) {
      if (['get', 'post', 'put', 'patch', 'delete'].includes(prop as string)) {
        return (url: string) => {
          return (target[prop as keyof typeof agent] as Function)(url).set('Cookie', `connect.sid=${encodeURIComponent(signedSid)}`);
        };
      }
      return target[prop as keyof typeof agent];
    }
  });

  return {
    agent: proxyAgent as any,
    userId: user.id,
    orgId: org.id,
    propertySlug,
  };
}
