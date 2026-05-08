
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function buildUrl() {
  const base = process.env.DATABASE_URL ?? "";
  if (base.includes("pgbouncer=true")) return base;
  return base + (base.includes("?") ? "&" : "?") + "pgbouncer=true";
}

function createPrismaClient() {
  return new PrismaClient({
    datasources: { db: { url: buildUrl() } },
    log: [
      { level: "error", emit: "stdout" },
      { level: "warn", emit: "stdout" },
    ],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

globalForPrisma.prisma = prisma;
