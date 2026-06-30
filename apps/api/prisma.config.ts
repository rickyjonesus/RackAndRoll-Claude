import path from 'node:path';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  datasource: {
    // DIRECT_URL bypasses the connection pooler so migrations work correctly.
    // Falls back to DATABASE_URL for local Postgres where pooling isn't used.
    url: env('DIRECT_URL'),
  },
});
