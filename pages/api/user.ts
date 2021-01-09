import { prisma } from '../../utils/api-middleware/prisma';
import withUser from '../../utils/api-middleware/withUser';

export interface GetUserResponse {
  followedCourses: string[];
  followedSections: string[];
}

/**
 * ========================= GET /api/user =======================
 * Return user subscription info
 */
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
