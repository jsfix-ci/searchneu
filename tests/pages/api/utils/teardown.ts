import { prisma } from '../../../../utils/api/prisma';

afterAll(async () => {
  await prisma.$disconnect();
});
