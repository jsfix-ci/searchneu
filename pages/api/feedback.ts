import { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import axios from 'axios';

export default async function handler(req, res): Promise<void> {
  if (req.method === 'POST') {
    await post(req, res);
  } else {
    res.status(404).end();
  }
}

const post: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { text } = req.body;
  console.log('text', text);
  const slackRes = await axios.post(
    'https://hooks.slack.com/services/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',
    req.body
  );
  console.log('slackRes', slackRes);
};
