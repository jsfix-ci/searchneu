import axios from 'axios';
import { NextApiHandler } from 'next';
import { mocked } from 'ts-jest/utils';
import * as NotifyUsersHandler from '../../../pages/api/notify_users';
import { prisma } from '../../../utils/api/prisma';
import {
  it404sOnInvalidHTTPMethods,
  testHandlerFactory,
} from './utils/dbTestUtils';

jest.mock('axios');
const notifyUsersHandler: NextApiHandler = NotifyUsersHandler.default;
const [testNotifyUsersHandler, _] = testHandlerFactory(notifyUsersHandler);

describe('/api/notify_users', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await prisma.followedSection.deleteMany({});
    await prisma.followedCourse.deleteMany({});
    await prisma.user.deleteMany({});

    await prisma.user.create({
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

    await prisma.user.create({
      data: {
        fbMessengerId: '111111111',
        firstName: 'Da-Jin',
        lastName: 'Chu',
        followedCourses: {
          create: [
            { courseHash: 'neu.edu/202130/CS/2500' },
            { courseHash: 'neu.edu/202030/CS/3650/23456' },
          ],
        },
        followedSections: {
          create: [
            {
              sectionHash: 'neu.edu/202130/CS/2500/12345',
            },
            {
              sectionHash: 'neu.edu/202030/CS/3650/23456',
            },
          ],
        },
      },
    });

    await prisma.user.create({
      data: {
        fbMessengerId: '2222222222',
        firstName: 'Mitchell',
        lastName: 'Gamburg',
        followedCourses: {
          create: [{ courseHash: 'neu.edu/202130/CS/4500' }],
        },
      },
    });

    mocked(axios.get).mockResolvedValue({
      data: {
        first_name: 'Jorge',
        last_name: 'Beans',
      },
    });
    mocked(axios.post).mockResolvedValue({
      data: {
        message_id: '69420',
      },
    });
  });

  it404sOnInvalidHTTPMethods(notifyUsersHandler, ['POST']);

  it('sends messages to everyone subscribed to CS 4500', async () => {
    await testNotifyUsersHandler(async ({ fetch }) => {
      const response = await fetch({
        method: 'POST',
        body: JSON.stringify({
          updatedCourses: {
            'neu.edu/202130/CS/4500': {
              courseCode: 'CS 4500',
              term: '202130',
              count: 0,
              campus: 'NEU',
            },
          },
          updatedSections: {
            'neu.edu/202130/CS/4500/12345': {
              courseCode: 'CS 4500',
              term: '202130',
              crn: '12345',
              seatsRemaining: 2,
              campus: 'NEU',
            },
          },
        }),
      });

      console.log(await response.json());
      expect(response.status).toBe(200);
    });
  });
});
