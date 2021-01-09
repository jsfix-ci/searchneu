import { User } from '@prisma/client';
import axios from 'axios';
import crypto from 'crypto';
import { NextApiRequest, NextApiResponse } from 'next';
import { MessengerTokenPayload, verifyAsync } from '../../utils/api/jwt';
import { prisma } from '../../utils/api/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method === 'GET') {
    get(req, res);
  } else if (req.method === 'POST') {
    await post(req, res);
  } else {
    res.status(404).end();
  }
}

/**
 * ========================= GET /api/webhook =======================
 * Let FB verify this endpoint (just once)
 * https://developers.facebook.com/docs/messenger-platform/getting-started/webhook-setup/
 */
function get(req: NextApiRequest, res: NextApiResponse): void {
  const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      res.status(200).send(challenge);
    } else {
      res.status(403).end();
    }
  }
  res.status(400).end();
}

/**
 * ========================= POST /api/webhook =======================
 * Handle facebook events from optin button and messenger texts
 */
async function post(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const [rawBody, body] = await parseBody(req);
  const isValid = isSignatureValid(
    rawBody,
    req.headers['x-hub-signature'] as string
  );
  console.log(body);
  if (isValid) {
    try {
      body.entry[0].messaging.map((event) => {
        if (event.optin) {
          handleMessengerButtonClick(event);
        }
      });
    } finally {
      res.status(200).end();
    }
  } else {
    res.status(403).end();
  }
}

interface FBOptinEvent {
  sender: { id: string };
  optin: { ref: string };
}

// Handle logging in via messenger button
async function handleMessengerButtonClick(event: FBOptinEvent): Promise<void> {
  // TODO: Validate userobject with class-validator
  const token = (await verifyAsync(event.optin.ref)) as MessengerTokenPayload;
  const session = await prisma.facebookLoginSessions.findUnique({
    where: { id: token.fbSessionId },
  });
  if (session) {
    const fbMessengerId = event.sender.id;
    //find or create user by fbmessengerid
    let user = await prisma.user.findUnique({
      where: { fbMessengerId },
    });
    if (!user) {
      //make new user
      user = await createNewUser(fbMessengerId);
    }
    session.userId = user.id;
    await prisma.facebookLoginSessions.update({
      where: { id: session.id },
      data: { user: { connect: { id: user.id } } },
    });
    console.log(user);
  }
}

// Create new user from their fb messenger id
async function createNewUser(fbMessengerId: string): Promise<User> {
  const res = await axios.get(
    `https://graph.facebook.com/v2.6/${fbMessengerId}`,
    {
      params: {
        fields: 'first_name,last_name',
        access_token: process.env.FB_ACCESS_TOKEN,
      },
    }
  );
  return await prisma.user.create({
    data: {
      fbMessengerId,
      firstName: res.data.first_name,
      lastName: res.data.last_name,
    },
  });
}

// =============  Helpers to validate webhook is from Facebook  ============= //

// Given unparsed request, get the raw body buffer and the parsed request body
async function parseBody(
  req: NextApiRequest
): Promise<[string, Record<string, any>]> {
  return new Promise((resolve, reject) => {
    if (!req.body) {
      let buffer = '';
      req.on('data', (chunk) => {
        buffer += chunk;
      });

      req.on('end', () => {
        const body = JSON.parse(Buffer.from(buffer).toString());
        resolve([buffer, body]);
      });
      req.on('error', (e) => reject(e));
    }
  });
}

// Check if the checksum from the rawBody matches the signature given in the header
function isSignatureValid(rawBody: string, headerSignature: string): boolean {
  const calculatedSig =
    'sha1=' +
    crypto
      .createHmac('sha1', process.env.FB_APP_SECRET)
      .update(rawBody, 'utf-8')
      .digest('hex');
  const headerSig = headerSignature;
  return (
    headerSig &&
    headerSig.length === 45 &&
    headerSig.substr(0, 5) === 'sha1=' &&
    calculatedSig === headerSig
  );
}

// Disable body parser so that we can get the rawbody
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Mitch recommended th is for unit testing private functions.
 * Please don't use these in other modules
 */
export const _private = {
  handleMessengerButtonClick,
  createNewUser,
};
