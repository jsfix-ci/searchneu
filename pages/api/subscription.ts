import prisma from '../../tests/pages/api/prisma';
import withUser from '../../utils/api-middleware/withUser';

export default withUser(
  async (req, res): Promise<void> => {
    const { userId } = req;
    if (!userId) {
      res.status(401).end();
      return;
    }
    const body = JSON.parse(req.body);
    if (req.method === 'POST') {
      if (body.courseHash) {
        await prisma.followedCourse.create({
          data: {
            courseHash: body.courseHash,
            user: { connect: { id: userId } },
          },
        });
      }

      if (body.sectionHash) {
        await prisma.followedSection.create({
          data: {
            sectionHash: body.sectionHash,
            user: { connect: { id: userId } },
          },
        });
      }
    }

    if (req.method === 'DELETE') {
      if (body.courseHash) {
        await prisma.followedCourse.delete({
          where: {
            userId_courseHash: {
              userId,
              courseHash: body.courseHash,
            },
          },
        });
      }

      if (body.sectionHash) {
        await prisma.followedSection.delete({
          where: {
            userId_sectionHash: {
              sectionHash: body.sectionHash,
              userId,
            },
          },
        });
      }
    }
    res.status(200).end();
  }
);
