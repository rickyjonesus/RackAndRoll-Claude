import { defineConfig, env } from 'prisma/config';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  schema: 'apps/api/prisma/schema.prisma',
  datasource: {
    // DIRECT_URL bypasses the connection pooler so migrations work correctly.
    url: env('DIRECT_URL'),
  },
});
