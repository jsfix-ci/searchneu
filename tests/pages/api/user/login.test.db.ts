import { mocked } from 'ts-jest/utils';
import * as LoginHandler from '../../../../pages/api/user/login';
import { signLoginToken } from '../../../../utils/api/jwt';
import { prisma } from '../../../../utils/api/prisma';
import { serverRollbar } from '../../../../utils/api/rollbar';
import {
  it404sOnInvalidHTTPMethods,
  testHandlerFactory,
} from '../utils/dbTestUtils';

jest.mock('jsonwebtoken');
jest.mock('rollbar');
const loginHandler = LoginHandler.default;

const [testWithLoginHandler, _] = testHandlerFactory(loginHandler);

beforeEach(() => {
  mocked(serverRollbar.error).mockImplementation(jest.fn());
});

describe('/api/login', () => {
  it404sOnInvalidHTTPMethods(loginHandler, ['POST']);

  describe('POST', () => {
    it('sends without login token', async () => {
      await testWithLoginHandler(async ({ fetch }) => {
        const response = await fetch({
          method: 'POST',
          body: '{}',
        });

        expect(response.status).toBe(401);
      });
    });

    it('sends with an invalid login token', async () => {
      await testWithLoginHandler(async ({ fetch }) => {
        const response = await fetch({
          method: 'POST',
          headers: {
            cookie: 'loginToken=ligma',
          },
        });

        expect(response.status).toBe(401);
      });
    });

    it("Facebook hasn't done its job yet o7", async () => {
      const fbSession = await prisma.facebookLoginSessions.create({
        data: {},
      });

      await testWithLoginHandler(async ({ fetch }) => {
        const response = await fetch({
          method: 'POST',
          headers: {
            cookie: 'loginToken=' + (await signLoginToken(fbSession.id)),
          },
        });

        expect(response.status).toBe(400);
        expect(await response.text()).toBe(
          "Facebook validation hasn't come yet :aaaaaaaaaaaa:"
        );
      });
    });

    it("session doesn't exist in database but sent valid jwt", async () => {
      await testWithLoginHandler(async ({ fetch }) => {
        const response = await fetch({
          method: 'POST',
          headers: {
            cookie: 'loginToken=' + (await signLoginToken(300)),
          },
        });

        expect(response.status).toBe(401);
        expect(mocked(serverRollbar.error).mock.calls[0][0]).toBe(
          'Invalid login session fbSessionId sent signed by valid JWT key -- is the key compromised?'
        );
      });
    });

    it('session exists in database, valid jwt, facebook has done its thing, user already exists', async () => {
      const user = await prisma.user.create({
        data: {
          firstName: 'Eddy',
          lastName: 'Li',
        },
      });
      const fbSession = await prisma.facebookLoginSessions.create({
        data: {
          user: { connect: { id: user.id } },
        },
      });
      await testWithLoginHandler(async ({ fetch }) => {
        const response = await fetch({
          method: 'POST',
          headers: {
            cookie: 'loginToken=' + (await signLoginToken(fbSession.id)),
          },
        });

        expect(response.status).toBe(200);
        expect(response.headers.get('set-cookie')).toContain('authToken=');
      });
    });
  });
});
