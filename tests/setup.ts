import { execSync } from 'child_process';
import prisma from '../src/config/prisma';
import { beforeAll, afterAll } from 'vitest';

beforeAll(async () => {
  execSync('npx prisma migrate reset --force', { stdio: 'inherit' });
});

afterAll(async () => {
  await prisma.$disconnect();
});
