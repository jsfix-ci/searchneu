import { FacebookLoginSessions } from '@prisma/client';
import axios from 'axios';
import { NextApiHandler } from 'next';
import { mocked } from 'ts-jest/utils';
import * as WebhookHandler from '../../../pages/api/webhook';
import { signLoginToken, signMessengerToken } from '../../../utils/api/jwt';
import { prisma } from '../../../utils/api/prisma';
import {
  it404sOnInvalidHTTPMethods,
  testHandlerFactory,
} from './utils/dbTestUtils';

jest.mock('axios');
jest.mock('jsonwebtoken');
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

  describe('private methods', () => {
    const {
      handleMessengerButtonClick,
      createNewUser,
    } = WebhookHandler._private;
    describe('handleMessengerButtonClick', () => {
      let session: FacebookLoginSessions;
      beforeEach(async () => {
        session = await prisma.facebookLoginSessions.create({ data: {} });
      });

      it('creates a user on messenger button click when there is none initially', async () => {
        expect(
          await prisma.user.count({
            where: {
              fbMessengerId: '12345',
            },
          })
        ).toBe(0);

        await handleMessengerButtonClick({
          sender: { id: '12345' },
          optin: {
            ref: await signMessengerToken(session.id),
          },
        });

        const user = await prisma.user.findUnique({
          where: {
            fbMessengerId: '12345',
          },
          include: { FacebookLoginSessions: true },
        });
        expect(user).toMatchObject({
          firstName: 'Jorge',
          lastName: 'Beans',
          FacebookLoginSessions: [{ id: session.id, userId: user.id }],
        });
      });

      it('associates login session with existing user', async () => {
        const user = await prisma.user.create({
          data: { fbMessengerId: '12345' },
        });

        await handleMessengerButtonClick({
          sender: { id: '12345' },
          optin: {
            ref: await signMessengerToken(session.id),
          },
        });
        session = await prisma.facebookLoginSessions.findUnique({
          where: { id: session.id },
        });
        expect(session.userId).toBe(user.id);
      });

      it('does nothing if session id does not exist', async () => {
        await handleMessengerButtonClick({
          sender: { id: '12345' },
          optin: { ref: await signMessengerToken(session.id + 1000) },
        });
        session = await prisma.facebookLoginSessions.findUnique({
          where: { id: session.id },
        });
        expect(session.userId).toBeNull();
      });

      it('does nothing if given a logintoken instead of messengertoken', async () => {
        await handleMessengerButtonClick({
          sender: { id: '12345' },
          optin: {
            ref: await signLoginToken(session.id),
          },
        });
        session = await prisma.facebookLoginSessions.findUnique({
          where: { id: session.id },
        });
        expect(session.userId).toBeNull();
      });
    });

    describe('createNewUser', () => {
      it('creates user with id', async () => {
        await createNewUser('12345');

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
  });
});
