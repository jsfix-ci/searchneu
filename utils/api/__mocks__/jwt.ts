/* eslint-disable @typescript-eslint/ban-types */
const jwt = jest.createMockFromModule('../jwt');

export async function verifyAsync(
  payload: string
): Promise<object | undefined> {
  return JSON.parse(payload);
}

export async function signAsync(payload: object): Promise<string> {
  return JSON.stringify(payload);
}
