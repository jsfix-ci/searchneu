import { NextApiRequest, NextApiResponse } from 'next';
import sendFBMessage from '../../utils/api/notifyer';
import { prisma } from '../../utils/api/prisma';

// messages are at
// https://github.com/sandboxnu/searchneu/blob/4bd3c470d5221ab9eaafb418951d1b6d4326ed25/backend/updater.ts

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  // TODO: validate from course catalog api

  if (req.method !== 'POST') {
    res.status(404).end();
    return;
  }

  const body = req.body;
  const updatedSections = body.updatedSections;
  const updatedCourses = body.updatedCourses;

  const users = await prisma.user.findMany({
    include: {
      followedSections: true,
      followedCourses: true,
    },
  });

  for (const user of users) {
    user.followedCourses
      .filter((fc) => updatedCourses.includes(fc))
      .forEach(
        async (course) =>
          await sendFBMessage(user.fbMessengerId, 'TODO: follow course message')
      );

    user.followedSections
      .filter((fs) => updatedSections.includes(fs))
      .forEach(
        async (section) =>
          await sendFBMessage(
            user.fbMessengerId,
            'TODO: follow section message'
          )
      );
  }

  res.status(200).end();
  return;
}
