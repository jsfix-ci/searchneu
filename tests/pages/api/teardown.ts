import { prisma } from '../../../utils/api-middleware/prisma';

afterAll(async () => {
  await prisma.$disconnect();
});
