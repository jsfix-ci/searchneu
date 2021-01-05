import { sign } from 'jsonwebtoken';
import { NextApiHandler } from 'next';
import { testApiHandler } from 'next-test-api-route-handler';
import * as UserHandler from '../../../pages/api/user';
import prisma from './prisma';

let mockUser;

beforeEach(async () => {
  await prisma.followedSection.deleteMany({});
  await prisma.followedCourse.deleteMany({});
  await prisma.user.deleteMany({});

  mockUser = await prisma.user.create({
    data: {
      fbMessengerId: '0000000000',
      firstName: 'Eddy',
      lastName: 'Li',
    },
  });

  await prisma.followedCourse.create({
    data: {
      user: { connect: { id: mockUser.id } },
      courseHash: 'neu.edu/202130/CS/4500',
    },
  });

  await prisma.followedSection.create({
    data: {
      user: { connect: { id: mockUser.id } },
      sectionHash: 'neu.edu/202130/CS/4500/12345',
    },
  });

  await prisma.followedSection.create({
    data: {
      user: { connect: { id: mockUser.id } },
      sectionHash: 'neu.edu/202130/CS/4500/23456',
    },
  });
});

it('gets a user with the id given', async () => {
  const userHandler: NextApiHandler = UserHandler.default;

  await testApiHandler({
    handler: userHandler as any,
    test: async ({ fetch }) => {
      const mockUserIdSigned = sign(
        { userId: mockUser.id },
        process.env.JWT_SECRET
      );

      const response = await fetch({
        headers: { cookie: 'authToken=' + mockUserIdSigned },
      });

      const responseData = await response.json();
      expect(responseData.followedCourses).toEqual(['neu.edu/202130/CS/4500']);
      expect(responseData.followedSections).toEqual([
        'neu.edu/202130/CS/4500/12345',
        'neu.edu/202130/CS/4500/23456',
      ]);
    },
  });
});

it("attemps to get a user that doesn't exist", async () => {
  const userHandler: NextApiHandler = UserHandler.default;

  await testApiHandler({
    handler: userHandler as any,
    test: async ({ fetch }) => {
      const mockUserIdSigned = sign(
        { userId: mockUser.id + 10000 },
        process.env.JWT_SECRET
      );

      const response = await fetch({
        headers: { cookie: 'authToken=' + mockUserIdSigned },
      });
      expect(response.status).toBe(404);
    },
  });
});

it('garbage in garbage out for the user endpoint', async () => {
  const userHandler: NextApiHandler = UserHandler.default;

  await testApiHandler({
    handler: userHandler as any,
    test: async ({ fetch }) => {
      const mockUserIdSigned = sign(
        { userId: 'HOLLA HOLLA' },
        process.env.JWT_SECRET
      );

      const response = await fetch({
        headers: { cookie: 'authToken=' + mockUserIdSigned },
      });
      expect(response.status).toBe(401);

      const response2 = await fetch({
        headers: { cookie: 'wakanda=forever' },
      });
      expect(response2.status).toBe(401);

      const response3 = await fetch({});
      expect(response3.status).toBe(401);
    },
  });
});
