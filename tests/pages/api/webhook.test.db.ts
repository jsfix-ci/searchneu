import axios from 'axios';
import { NextApiHandler } from 'next';
import { mocked } from 'ts-jest/utils';
import * as WebhookHandler from '../../../pages/api/webhook';
import { signAsync } from '../../../utils/api/jwt';
import { prisma } from '../../../utils/api/prisma';
import {
  it404sOnInvalidHTTPMethods,
  testHandlerFactory,
} from './utils/dbTestUtils';

jest.mock('axios');
jest.mock('../../../utils/api/jwt');
const webhookHandler: NextApiHandler = WebhookHandler.default;
const [testWebhookHandler, testWebhookHandlerAsUser] = testHandlerFactory(
  webhookHandler
);

describe('/api/webhook', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await prisma.followedSection.deleteMany({});
    await prisma.followedCourse.deleteMany({});
    await prisma.user.deleteMany({});
    mocked(axios.get).mockResolvedValue({
      data: {
        first_name: 'Jorge',
        last_name: 'Beans',
      },
    });
  });

  it404sOnInvalidHTTPMethods(webhookHandler, ['GET', 'POST']);

  describe('handleMessengerButtonClick', () => {
    it('creates a user on messenger button click when there is none initially', async () => {
      const noUser = await prisma.user.count({
        where: {
          fbMessengerId: '12345',
        },
      });
      expect(noUser).toBe(0);

      const initSession = await prisma.facebookLoginSessions.create({
        data: {},
      });
      await WebhookHandler._private.handleMessengerButtonClick({
        sender: { id: '12345' },
        optin: {
          ref: await signAsync({
            fbSessionId: initSession.id,
          }),
        },
      });

      const user = await prisma.user.findFirst({
        where: {
          fbMessengerId: '12345',
        },
      });
      expect(user.firstName).toBe('Jorge');
      expect(user.lastName).toBe('Beans');
    });
  });

  it('createNewUser', async () => {
    WebhookHandler._private.createNewUser('12345');

    const user = await prisma.user.findUnique({
      where: {
        fbMessengerId: '12345',
      },
    });
    expect(user.firstName).toBe('Jorge');
    expect(user.lastName).toBe('Beans');
    expect(mocked(axios.get).mock.calls[0][0]).toBe(
      'https://graph.facebook.com/v2.6/12345'
    );
  });
});
