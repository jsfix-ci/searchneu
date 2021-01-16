import { NextApiHandler } from 'next';
import { mocked } from 'ts-jest/utils';
import * as NotifyUsersHandler from '../../../pages/api/notify_users';
import sendFBMessage from '../../../utils/api/notifyer';
import { prisma } from '../../../utils/api/prisma';
import {
  it404sOnInvalidHTTPMethods,
  testHandlerFactory,
} from './utils/dbTestUtils';

jest.mock('../../../utils/api/notifyer');
const notifyUsersHandler: NextApiHandler = NotifyUsersHandler.default;
const [testNotifyUsersHandler, _] = testHandlerFactory(notifyUsersHandler);
// TODO: write tests
/**
 * .########..#######..########...#######.
 * ....##....##.....##.##.....##.##.....##
 * ....##....##.....##.##.....##.##.....##
 * ....##....##.....##.##.....##.##.....##
 * ....##....##.....##.##.....##.##.....##
 * ....##....##.....##.##.....##.##.....##
 * ....##.....#######..########...#######.
 */
// TODO: write tests with bad data
// TODO: some form of mocking to make sure that we're validating we're getting info from course catalog
// TODO: edge cases edge cases edge cases

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
            { courseHash: 'neu.edu/202030/CS/3650' },
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

    mocked(sendFBMessage).mockResolvedValue();
  });

  it404sOnInvalidHTTPMethods(notifyUsersHandler, ['POST']);

  it('sends messages to everyone subscribed to CS 4500', async () => {
    await testNotifyUsersHandler(async ({ fetch }) => {
      const response = await fetch({
        method: 'POST',
        body: JSON.stringify({
          updatedCourses: [
            {
              courseCode: 'CS 4500',
              term: '202130',
              count: 1,
              campus: 'NEU',
              courseHash: 'neu.edu/202130/CS/4500',
            },
          ],
          updatedSections: [
            {
              courseCode: 'CS 4500',
              term: '202130',
              crn: '12345',
              seatsRemaining: 2,
              campus: 'NEU',
              sectionHash: 'neu.edu/202130/CS/4500/12345',
            },
          ],
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(200);

      expect(mocked(sendFBMessage).mock.calls).toEqual([
        [
          '0000000000',
          'A section was added to CS 4500! Check it out at https://searchneu.com/NEU/202130/search/CS 4500 !',
        ],
        [
          '2222222222',
          'A section was added to CS 4500! Check it out at https://searchneu.com/NEU/202130/search/CS 4500 !',
        ],
        [
          '0000000000',
          'A seat opened up in CS 4500 (CRN: 12345). Check it out at https://searchneu.com/NEU/202130/search/CS 4500 !',
        ],
      ]);
    });
  });
});
