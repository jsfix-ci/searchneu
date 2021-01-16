import * as MessengerTokenHandler from '../../../../pages/api/user/messenger_token';
import { signLoginToken, signMessengerToken } from '../../../../utils/api/jwt';
import { prisma } from '../../../../utils/api/prisma';
import {
  it404sOnInvalidHTTPMethods,
  testHandlerFactory,
} from '../utils/dbTestUtils';

const messengerTokenHandler = MessengerTokenHandler.default;
const [testWithMessengerHandler, _] = testHandlerFactory(messengerTokenHandler);

describe('/api/user/messenger_token', () => {
  it404sOnInvalidHTTPMethods(messengerTokenHandler, ['GET']);

  describe('GET', () => {
    it("previous session doesn't exist yet", async () => {
      await testWithMessengerHandler(async ({ fetch }) => {
        const response = await fetch();

        const fbSession = await prisma.facebookLoginSessions.findFirst();

        expect(response.status).toBe(200);
        expect(response.headers.get('set-cookie')).toContain('loginToken=');
        expect(await response.json()).toStrictEqual({
          messengerToken: await signMessengerToken(fbSession.id),
        });
      });
    });

    it('previous login token exists', async () => {
      await testWithMessengerHandler(async ({ fetch }) => {
        const fbSession = await prisma.facebookLoginSessions.create({
          data: {},
        });
        const response = await fetch({
          headers: {
            cookie: 'loginToken=' + (await signLoginToken(fbSession.id)),
          },
        });

        expect(response.status).toBe(200);
        expect(response.headers.get('set-cookie')).toBeFalsy();
        expect(await response.json()).toStrictEqual({
          messengerToken: await signMessengerToken(fbSession.id),
        });
      });
    });
  });
});
