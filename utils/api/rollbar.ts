// eslint-disable-next-line @typescript-eslint/no-var-requires

import Rollbar from 'rollbar';

export const serverRollbar = new Rollbar({
  accessToken: process.env.ROLLBAR_SERVER_TOKEN,
});
