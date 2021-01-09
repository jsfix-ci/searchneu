import { prisma } from '../../utils/api-middleware/prisma';
import withUser, {
  NextApiHandlerWithUser,
} from '../../utils/api-middleware/withUser';

export default withUser(
  async (req, res): Promise<void> => {
    const { userId } = req;
    if (!userId && (await prisma.user.count({ where: { id: userId } })) > 0) {
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
  if (body.courseHash) {
    await prisma.followedCourse.create({
      data: {
        courseHash: body.courseHash,
        user: { connect: { id: req.userId } },
      },
    });
  }

  if (body.sectionHash) {
    await prisma.followedSection.create({
      data: {
        sectionHash: body.sectionHash,
        user: { connect: { id: req.userId } },
      },
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
    await prisma.followedCourse.delete({
      where: {
        userId_courseHash: {
          userId: req.userId,
          courseHash: body.courseHash,
        },
      },
    });
  }

  if (body.sectionHash) {
    await prisma.followedSection.delete({
      where: {
        userId_sectionHash: {
          userId: req.userId,
          sectionHash: body.sectionHash,
        },
      },
    });
  }
  res.status(200).end();
};
