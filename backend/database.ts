/*
 * This file is part of Search NEU and licensed under AGPL3.
 * See the license file in the root folder for details.
 */

import _ from 'lodash';
import prisma from './prisma';


class Database {
  // key is the primaryKey (id, facebookMessengerId) of the user
  // value is any updated columns plus all watchingSections and watchingClasses
  async set(key, value) {
    // TODO probably broken . . . need a `set` somewhere? --> login keys?
    const updatedUser = _.omit({ ...value, loginKeys: { set: value.loginKeys || [] } }, ['watchingClasses', 'watchingSections', 'facebookMessengerId']);
    await prisma.user.upsert({
      where: { id: key },
      create: { id: key, ...updatedUser },
      update: updatedUser,
    });

    await Promise.all([prisma.followedSection.deleteMany({ where: { userId: key } }), prisma.followedCourse.deleteMany({ where: { userId: key } })]);

    if (value.watchingSections) {
      await Promise.all(value.watchingSections.map((section) => this.createFollowedSection(key, section)));
    }

    if (value.watchingClasses) {
      await Promise.all(value.watchingClasses.map((course) => this.createFollowedCourse(key, course)));
    }
  }

  async createFollowedCourse(userId: string, courseId: string) {
    return prisma.followedCourse.upsert({
      where: { userId_courseId: { userId, courseId } },
      create: {
        user: { connect: { id: userId } },
        course: { connect: { id: courseId } },
      },
      update: {},
    });
  }

  async createFollowedSection(userId: string, sectionId: string) {
    return prisma.followedSection.upsert({
      where: { userId_sectionId: { userId, sectionId } },
      create: {
        user: { connect: { id: userId } },
        section: { connect: { id: sectionId } },
      },
      update: {},
    });
  }

  // Get the value at this key.
  // Key follows the same form in the set method
  async get(key) {
    const user = await prisma.user.findOne({ where: { id: key } });

    if (!user) {
      await prisma.$disconnect();
      return null;
    }

    const watchingSections = (await prisma.followedSection.findMany({ where: { userId: user.id }, select: { sectionId: true } })).map((section) => section.sectionId);
    const watchingClasses = (await prisma.followedCourse.findMany({ where: { userId: user.id }, select: { courseId: true } })).map((course) => course.courseId);

    return {
      facebookMessengerId: user.id,
      facebookPageId: user.facebookPageId,
      firstName: user.firstName,
      lastName: user.lastName,
      loginKeys: user.loginKeys,
      watchingSections: watchingSections,
      watchingClasses: watchingClasses,
    };
  }

  async getByLoginKey(requestLoginKey) {
    const user = (await prisma.$queryRaw(`SELECT * FROM users WHERE '${requestLoginKey}'=ANY(login_keys)`))[0];

    if (!user) {
      return null;
    }

    return this.get(user.id);
  }
}


export default new Database();
