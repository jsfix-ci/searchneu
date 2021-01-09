import { User } from '@prisma/client';
import { sign } from 'jsonwebtoken';
import { NextApiHandler } from 'next';
import * as UserHandler from '../../../pages/api/user';
import { prisma } from '../../../utils/api-middleware/prisma';
import { testHandlerFactory } from './dbTestUtils';

let mockUser: User;
const userHandler: NextApiHandler = UserHandler.default;
const [testUserHandler, testUserHandlerAsUser] = testHandlerFactory(
  userHandler
);

beforeEach(async () => {
  await prisma.followedSection.deleteMany({});
  await prisma.followedCourse.deleteMany({});
  await prisma.user.deleteMany({});

  mockUser = await prisma.user.create({
    data: {
      fbMessengerId: '0000000000',
      firstName: 'Eddy',
      lastName: 'Li',
      followedCourses: { create: [{ courseHash: 'neu.edu/202130/CS/4500' }] },
      followedSections: {
        create: [
          {
            sectionHash: 'neu.edu/202130/CS/4500/12345',
          },
          {
            sectionHash: 'neu.edu/202130/CS/4500/23456',
          },
        ],
      },
    },
  });
});

describe('GET /api/user', () => {
  it('gets a user with the id given', async () => {
    await testUserHandlerAsUser(
      { method: 'GET', userId: mockUser.id },
      async (response) => {
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.followedCourses).toEqual(['neu.edu/202130/CS/4500']);
        expect(data.followedSections).toEqual([
          'neu.edu/202130/CS/4500/12345',
          'neu.edu/202130/CS/4500/23456',
        ]);
      }
    );
  });

  it("attempts to get a user that doesn't exist", async () => {
    await testUserHandlerAsUser(
      { method: 'GET', userId: mockUser.id + 100000000 },
      async (response) => expect(response.status).toBe(404)
    );
  });
});

describe('withUser', () => {
  it('garbage in garbage out for the user endpoint', async () => {
    await testUserHandler(async ({ fetch }) => {
      const response = await fetch({
        headers: {
          cookie:
            'authToken=' +
            sign({ userId: 'HOLLA HOLLA' }, process.env.JWT_SECRET),
        },
      });
      expect(response.status).toBe(401);

      const response2 = await fetch({
        headers: { cookie: 'wakanda=forever' },
      });
      expect(response2.status).toBe(401);

      const response3 = await fetch({});
      expect(response3.status).toBe(401);
    });
  });
});
