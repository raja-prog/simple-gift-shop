import { PrismaClient } from '@prisma/client'

// ---- DATABASE_URL validation & Prisma singleton ----
// We proactively validate to surface misconfiguration early (e.g. placeholder HOST:PORT).
function validateDatabaseUrl(raw: string | undefined): string {
	if (!raw) {
		throw new Error(
			'DATABASE_URL is missing. Set a valid Postgres connection string in your .env.local or Vercel project settings.'
		)
	}
	// Common placeholder patterns to detect
	const placeholderPatterns = [
		'USER:PASS@HOST:PORT/DB',
		'USER:PASS@HOST:PORT',
		'localhost:PORT/DB'
	]
	if (placeholderPatterns.some(p => raw.includes(p))) {
		throw new Error(
			'DATABASE_URL appears to contain placeholder segments (USER:PASS@HOST:PORT). Replace with real credentials.'
		)
	}
	// Basic structural parse using URL; prepend protocol if missing (should start with postgres or postgresql)
	if (!/^postgres(ql)?:\/\//.test(raw)) {
		throw new Error('DATABASE_URL must start with postgresql:// or postgres://')
	}
		try {
			// URL constructor can throw on malformed strings
			new URL(raw)
	} catch (e) {
		throw new Error(
			`DATABASE_URL is invalid or malformed: ${(e as Error).message}. Review https://www.prisma.io/docs/reference/database-reference/connection-urls`);
	}
	return raw
}

const dbUrl = validateDatabaseUrl(process.env.DATABASE_URL)

// Prevent multiple instances in dev (Next.js hot reload)
const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined }

export const prisma =
	globalForPrisma.prisma ?? new PrismaClient({ datasources: { db: { url: dbUrl } } })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

