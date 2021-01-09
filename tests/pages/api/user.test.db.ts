import { User } from '@prisma/client';
import { sign } from 'jsonwebtoken';
import { NextApiHandler } from 'next';
import { testApiHandler } from 'next-test-api-route-handler';
import * as SubscriptionHandler from '../../../pages/api/subscription';
import * as UserHandler from '../../../pages/api/user';
import prisma from './prisma';

let mockUser: User;
const userHandler: NextApiHandler = UserHandler.default;
const subscriptionHandler: NextApiHandler = SubscriptionHandler.default;

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

type TestApiHandlerTestType = Parameters<typeof testApiHandler>[0]['test'];

function generateMockUserJWTToken(userId?: number): string {
  return sign(
    { userId: userId ? userId : mockUser.id },
    process.env.JWT_SECRET
  );
}

type TempNameCAuseBrainBroke = {
  userId?: number;
  method?: string;
  body?: Record<string, any>;
};

function testHandlerFactory(
  handler: NextApiHandler
): [
  testWithHandler: (test: TestApiHandlerTestType) => Promise<void>,
  testWithHandlerAsUser: (
    test: (response: Response) => Promise<void>,
    options?: TempNameCAuseBrainBroke
  ) => Promise<void>
] {
  async function testWithHandler(test: TestApiHandlerTestType): Promise<void> {
    await testApiHandler({
      handler: handler as any,
      test,
    });
  }

  async function testWithHandlerAsUser(
    test,
    options?: TempNameCAuseBrainBroke
  ): Promise<void> {
    await testWithHandler(async ({ fetch }) => {
      if (!options?.method || options?.method === 'GET') {
        const response = await fetch({
          headers: {
            cookie: 'authToken=' + generateMockUserJWTToken(options?.userId),
          },
        });
        await test(response);
      } else {
        const response = await fetch({
          headers: {
            cookie: 'authToken=' + generateMockUserJWTToken(options?.userId),
          },
          method: options?.method,
          body: JSON.stringify(options?.body),
        });
        await test(response);
      }
    });
  }
  return [testWithHandler, testWithHandlerAsUser];
}

const [testUserHandler, testUserHandlerAsUser] = testHandlerFactory(
  userHandler
);
const [
  testSubscriptionHandler,
  testSubscriptionHandlerAsUser,
] = testHandlerFactory(subscriptionHandler);

describe('user endpoint', () => {
  it('gets a user with the id given', async () => {
    await testUserHandlerAsUser(async (response) => {
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.followedCourses).toEqual(['neu.edu/202130/CS/4500']);
      expect(data.followedSections).toEqual([
        'neu.edu/202130/CS/4500/12345',
        'neu.edu/202130/CS/4500/23456',
      ]);
    });
  });

  it("attempts to get a user that doesn't exist", async () => {
    await testUserHandlerAsUser(
      async (response) => expect(response.status).toBe(404),
      { userId: mockUser.id + 100000000 }
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

describe('subscribing to courses and sections', () => {
  it('posts a course to follow', async () => {
    await testSubscriptionHandlerAsUser(
      async (response) => {
        expect(response.status).toBe(200);

        const newUser = await prisma.user.findFirst({
          where: { id: mockUser.id },
          include: { followedCourses: true },
        });

        expect(newUser.followedCourses.length).toBe(2);
        expect(newUser.followedCourses).toContainEqual({
          courseHash: 'neu.edu/202130/CS/2500',
          userId: mockUser.id,
        });
      },
      {
        method: 'POST',
        body: {
          courseHash: 'neu.edu/202130/CS/2500',
        },
      }
    );
  });

  it('posts a section to follow', async () => {
    await testApiHandler({
      handler: subscriptionHandler as any,
      test: async ({ fetch }) => {
        const response = await fetch({
          headers: { cookie: 'authToken=' + generateMockUserJWTToken() },
          body: JSON.stringify({
            sectionHash: 'neu.edu/202130/CS/2500/12393',
          }),
          method: 'POST',
        });
        expect(response.status).toBe(200);

        const newUser = await prisma.user.findFirst({
          where: { id: mockUser.id },
          include: { followedSections: true },
        });

        expect(newUser.followedSections.length).toBe(3);
        expect(newUser.followedSections).toContainEqual({
          sectionHash: 'neu.edu/202130/CS/2500/12393',
          userId: mockUser.id,
        });
      },
    });
  });

  it('deletes a course from user', async () => {
    await testApiHandler({
      handler: subscriptionHandler as any,
      test: async ({ fetch }) => {
        const response = await fetch({
          headers: { cookie: 'authToken=' + generateMockUserJWTToken() },
          body: JSON.stringify({
            courseHash: 'neu.edu/202130/CS/4500',
          }),
          method: 'DELETE',
        });
        expect(response.status).toBe(200);

        const newUser = await prisma.user.findFirst({
          where: { id: mockUser.id },
          include: { followedCourses: true },
        });

        expect(newUser.followedCourses.length).toBe(0);
      },
    });
  });

  it('deletes a section from following', async () => {
    await testApiHandler({
      handler: subscriptionHandler as any,
      test: async ({ fetch }) => {
        const response = await fetch({
          headers: { cookie: 'authToken=' + generateMockUserJWTToken() },
          body: JSON.stringify({
            sectionHash: 'neu.edu/202130/CS/4500/12345',
          }),
          method: 'DELETE',
        });
        expect(response.status).toBe(200);

        const newUser = await prisma.user.findFirst({
          where: { id: mockUser.id },
          include: { followedSections: true },
        });

        expect(newUser.followedSections.length).toBe(1);
        expect(newUser.followedSections).toEqual([
          {
            sectionHash: 'neu.edu/202130/CS/4500/23456',
            userId: mockUser.id,
          },
        ]);
      },
    });
  });
});
