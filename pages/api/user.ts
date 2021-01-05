import { PrismaClient } from '@prisma/client';
import withUser from '../../utils/api-middleware/withUser';

const prisma = new PrismaClient();

export interface GetUserResponse {
  followedCourses: string[];
  followedSections: string[];
}

export default withUser(
  async (req, res): Promise<void> => {
    const { userId } = req;
    if (!userId) {
      res.status(401).end();
      return;
    }
    if (req.method === 'GET') {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { followedCourses: true, followedSections: true },
      });
      if (user) {
        const data: GetUserResponse = {
          followedCourses: user.followedCourses.map((c) => c.courseHash),
          followedSections: user.followedSections.map((s) => s.sectionHash),
        };
        res.json(data);
        return;
      }
    }
    res.status(404).end();
  }
);
