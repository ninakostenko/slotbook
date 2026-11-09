import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Migrations need the direct connection; the app itself uses the pooled DATABASE_URL.
    // Not required here so that `prisma generate` also works in CI, where there is no .env.
    url: process.env.DIRECT_URL,
  },
});
