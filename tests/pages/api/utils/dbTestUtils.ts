import { NextApiHandler } from 'next';
import { testApiHandler } from 'next-test-api-route-handler';
import { signAuthToken } from '../../../../utils/api/jwt';

type TestApiHandlerTestType = Parameters<typeof testApiHandler>[0]['test'];

type RequestOptions = {
  userId: number;
  method: string;
  body?: Record<string, any>;
};
type TestWithHandlerType = (test: TestApiHandlerTestType) => Promise<void>;
type TestWithHandlerAsUserType = (
  options: RequestOptions,
  test: (response: Response) => Promise<void>
) => Promise<void>;
const HTTPMethods = ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'];

/**
 * Generate test utility for a Next API handler
 */
export function testHandlerFactory(
  handler: NextApiHandler
): [
  testWithHandler: TestWithHandlerType,
  testWithHandlerAsUser: TestWithHandlerAsUserType
] {
  /**
   * Raw tester just gives you an instance of fetch. Make the API call and expect stuff.
   */
  const testWithHandler: TestWithHandlerType = async (test) => {
    await testApiHandler({
      handler: handler as any,
      test,
    });
  };

  /**
   * Nicer tester logs you in as a user, sends an API call with the given method/body options.
   * Expect stuff of the response in the test.
   */
  const testWithHandlerAsUser: TestWithHandlerAsUserType = async (
    options,
    test
  ) => {
    await testWithHandler(async ({ fetch }) => {
      const response = await fetch({
        headers: {
          cookie: 'authToken=' + (await signAuthToken(options.userId)),
        },
        method: options?.method,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });
      await test(response);
    });
  };
  return [testWithHandler, testWithHandlerAsUser];
}

export function it404sOnInvalidHTTPMethods(
  handler: NextApiHandler,
  acceptedMethods: string[]
): void {
  it("404's on invalid methods", async () => {
    await testApiHandler({
      handler: handler as any,
      test: async ({ fetch }) => {
        for (const method of HTTPMethods) {
          if (!acceptedMethods.includes(method)) {
            const response = await fetch({ method });
            expect(response.status).toBe(404);
          }
        }
      },
    });
  });
}
