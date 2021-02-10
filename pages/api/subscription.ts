import { IsNotEmpty, IsString, ValidateIf } from 'class-validator';
import { NextApiHandler } from 'next';
import { prisma } from '../../utils/api/prisma';
import withUser from '../../utils/api/withUser';
import withValidatedBody from '../../utils/api/withValidatedBody';

class SubscriptionBody {
  @ValidateIf((o) => o.sectionHash === undefined)
  @IsString()
  @IsNotEmpty()
  courseHash?: string;

  @ValidateIf((o) => o.courseHash === undefined)
  @IsString()
  @IsNotEmpty()
  sectionHash?: string;
}

export class PostSubscriptionBody extends SubscriptionBody {}
export class DeleteSubscriptionBody extends SubscriptionBody {}

export default async function handler(req, res): Promise<void> {
  if (req.method === 'POST') {
    await post(req, res);
  } else if (req.method === 'DELETE') {
    await del(req, res);
  } else {
    res.status(404).end();
  }
}

/**
 * ========================= POST /api/subscription =======================
 * subscribe to course or section
 */

const post: NextApiHandler = withUser((userId, user) =>
  withValidatedBody(
    PostSubscriptionBody,
    (validatedBody) => async (req, res) => {
      if (!user) {
        res.status(401).end();
        return;
      }
      const { courseHash, sectionHash } = validatedBody;

      if (courseHash) {
        await prisma.followedCourse.upsert({
          create: { courseHash, user: { connect: { id: userId } } },
          update: {},
          where: { userId_courseHash: { courseHash, userId } },
        });

        // TODO: ask backend people to be able to query for a class's class code based on course hash and verify the course hash exists
        //const splitHash = courseHash.split('/');
        //sendFBMessage(
        //      `Successfully signed up for notifications if sections are added to ${classCode}!`
        //  );
        // https://github.com/sandboxnu/searchneu/blob/dba43a7616262040f36552817ed84c03b417073b/backend/routes/webhook.ts
      }

      if (sectionHash) {
        await prisma.followedSection.upsert({
          create: { sectionHash, user: { connect: { id: userId } } },
          update: {},
          where: { userId_sectionHash: { sectionHash, userId } },
        });
      }
      res.status(201).end();
    }
  )
);

/**
 * ========================= DELETE /api/subscription =======================
 * unsubscribe to course or section
 */
const del: NextApiHandler = withUser((userId, user) =>
  withValidatedBody(
    DeleteSubscriptionBody,
    (validatedBody) => async (req, res) => {
      if (!user) {
        res.status(401).end();
        return;
      }
      const body = validatedBody;

      if (body.courseHash) {
        // delete many allows us to continue if there is nothing to delete.
        await prisma.followedCourse.deleteMany({
          where: {
            userId: userId,
            courseHash: body.courseHash,
          },
        });
      }

      if (body.sectionHash) {
        await prisma.followedSection.deleteMany({
          where: {
            userId: userId,
            sectionHash: body.sectionHash,
          },
        });
      }
      res.status(200).end();
    }
  )
);