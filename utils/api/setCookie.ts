import { CookieSerializeOptions, serialize } from 'cookie';
import { NextApiResponse } from 'next';

const baseOptions = {
  path: '/',
  httpOnly: true,
  sameSite: true,
};

export default function setCookie(
  res: NextApiResponse,
  name: string,
  value: unknown,
  optionsOverrides: CookieSerializeOptions = {}
): void {
  const stringValue =
    typeof value === 'object' ? 'j:' + JSON.stringify(value) : String(value);

  const options = Object.assign(baseOptions, optionsOverrides);

  if ('maxAge' in options) {
    options.expires = new Date(Date.now() + options.maxAge);
    options.maxAge /= 1000;
  }

  res.setHeader('Set-Cookie', serialize(name, String(stringValue), options));
}
