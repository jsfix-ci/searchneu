import { IsOptional, IsString } from 'class-validator';
import { prisma } from '../../utils/api/prisma';
import { validateObject } from '../../utils/api/validate';
import withUser, { NextApiHandlerWithUser } from '../../utils/api/withUser';
import withValidatedBody from '../../utils/api/withValidatedBody';

class SubscriptionBody {
  @IsString()
  @IsOptional()
  courseHash: string;

  @IsString()
  @IsOptional()
  sectionHash: string;
}

export class PostSubscriptionBody extends SubscriptionBody {}
export class DeleteSubscriptionBody extends SubscriptionBody {}

export default withUser(
  async (req, res): Promise<void> => {
    if (req.method === 'POST') {
      await withValidatedBody(PostSubscriptionBody, post)(req, res);
    } else if (req.method === 'DELETE') {
      await del(req, res);
    } else {
      res.status(404).end();
    }
  }
);

/**
 * ========================= POST /api/subscription =======================
 * subscribe to course or section
 */
const post: NextApiHandlerWithUser = async (req, res) => {
  if (!req.user) {
    res.status(401).end();
    return;
  }
  const { userId } = req;
  const { courseHash, sectionHash } = req.body;

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
};

/**
 * ========================= DELETE /api/subscription =======================
 * unsubscribe to course or section
 */
const del: NextApiHandlerWithUser = async (req, res) => {
  if (!req.user) {
    res.status(401).end();
    return;
  }
  const body = JSON.parse(req.body);
  const [isBodyValid, validationError] = await validateObject(
    DeleteSubscriptionBody,
    body
  );
  if (!isBodyValid) {
    res.status(400).json(validationError);
    return;
  }
  if (body.courseHash) {
    // delete many allows us to continue if there is nothing to delete.
    await prisma.followedCourse.deleteMany({
      where: {
        userId: req.userId,
        courseHash: body.courseHash,
      },
    });
  }

  if (body.sectionHash) {
    await prisma.followedSection.deleteMany({
      where: {
        userId: req.userId,
        sectionHash: body.sectionHash,
      },
    });
  }
  res.status(200).end();
};
