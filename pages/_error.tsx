import Error, { ErrorProps } from 'next/error';
import Macros from '../components/abstractMacros';

Error.getInitialProps = ({ req, res, err }): ErrorProps => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  if (!process.browser && Macros.PROD) {
    console.log('Reporting error to Rollbar...');
    const Rollbar = require('rollbar');
    const rollbar = new Rollbar(process.env.ROLLBAR_SERVER_TOKEN);
    rollbar.error(err, req, (rollbarError) => {
      if (rollbarError) {
        console.error('Rollbar error reporting failed:');
        console.error(rollbarError);
        return;
      }
      console.log('Reported error to Rollbar');
    });
  }
  return { statusCode };
};

export default Error;
