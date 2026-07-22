/**
 * Idempotent admin bootstrap. Runs once on server startup so the admin
 * dashboard login ALWAYS works after a deploy, without needing to manually
 * run a seed script against production.
 *
 * - Ensures an `admin-system` couple exists (satisfies the User.coupleId FK).
 * - Upserts a user with role='admin' using ADMIN_EMAIL / ADMIN_PASSWORD.
 * - The password is re-hashed and updated every boot so it always matches env.
 *
 * Safe to run concurrently (PM2 cluster) — upsert + caught P2002 handle races.
 */
export declare function bootstrapAdmin(): Promise<void>;
//# sourceMappingURL=bootstrapAdmin%202.d.ts.map