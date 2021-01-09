import { prisma } from '../../utils/api/prisma';
import withUser, { NextApiHandlerWithUser } from '../../utils/api/withUser';

export default withUser(
  async (req, res): Promise<void> => {
    const { userId } = req;
    if (!userId || (await prisma.user.count({ where: { id: userId } })) === 0) {
      res.status(401).end();
      return;
    }

    if (req.method === 'POST') {
      await post(req, res);
      return;
    }

    if (req.method === 'DELETE') {
      await del(req, res);
      return;
    }
    res.status(200).end();
  }
);

/**
 * ========================= POST /api/subscription =======================
 * subscribe to course or section
 */
const post: NextApiHandlerWithUser = async (req, res) => {
  const body = JSON.parse(req.body);
  const { userId } = req;
  const { courseHash, sectionHash } = body;
  if (courseHash) {
    await prisma.followedCourse.upsert({
      create: { courseHash, user: { connect: { id: userId } } },
      update: {},
      where: { userId_courseHash: { courseHash, userId } },
    });
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
  const body = JSON.parse(req.body);
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
