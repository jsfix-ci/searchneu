import prisma from '../../tests/pages/api/prisma';
import withUser from '../../utils/api-middleware/withUser';

export default withUser(
  async (req, res): Promise<void> => {
    const { userId } = req;
    if (!userId) {
      res.status(401).end();
    }

    if (req.method === 'POST') {
      if (req.body.courseHash) {
        await prisma.followedCourse.create({
          data: {
            courseHash: req.body.courseHash,
            user: { connect: { id: userId } },
          },
        });
      }

      if (req.body.sectionHash) {
        await prisma.followedSection.create({
          data: {
            sectionHash: req.body.sectionHash,
            user: { connect: { id: userId } },
          },
        });
      }
    }
    if (req.method === 'DELETE') {
      if (req.body.courseHash) {
        await prisma.followedCourse.delete({
          where: {
            userId_courseHash: {
              userId,
              courseHash: req.body.courseHash,
            },
          },
        });
      }
      if (req.body.sectionHash) {
        await prisma.followedSection.delete({
          where: {
            userId_sectionHash: {
              sectionHash: req.body.sectionHash,
              userId,
            },
          },
        });
      }
    }
  }
);
