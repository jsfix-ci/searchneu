import { Type } from 'class-transformer';
import { IsDefined, IsNumber, IsString, ValidateNested } from 'class-validator';
import { keyBy } from 'lodash';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import 'reflect-metadata';
import sendFBMessage from '../../utils/api/notifyer';
import { prisma } from '../../utils/api/prisma';
import withValidatedBody from '../../utils/api/withValidatedBody';

// messages are at
// https://github.com/sandboxnu/searchneu/blob/4bd3c470d5221ab9eaafb418951d1b6d4326ed25/backend/updater.ts

// Maps of hash -> search query info
class NotifyUserType {
  @ValidateNested({ each: true })
  @IsDefined()
  @Type(() => CourseNotificationInfo)
  updatedCourses: CourseNotificationInfo[];

  @ValidateNested({ each: true })
  @IsDefined()
  @Type(() => SectionNotificationInfo)
  updatedSections: SectionNotificationInfo[];
}

class CourseNotificationInfo {
  @IsString()
  courseHash: string;

  @IsString()
  courseCode: string;

  @IsString()
  campus: string;

  @IsString()
  term: string;

  @IsNumber()
  count: number;
}

class SectionNotificationInfo {
  @IsString()
  sectionHash: string;

  @IsString()
  courseCode: string;

  @IsString()
  campus: string;

  @IsString()
  term: string;

  @IsNumber()
  seatsRemaining: number;

  @IsString()
  crn: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  // TODO: validate from course catalog api

  if (req.method === 'POST') {
    await post(req, res);
  } else {
    res.status(404).end();
  }
}

/**
 * ========================= POST /api/notify_users =======================
 * notify users with subscribed courses and sections
 */
const post: NextApiHandler = withValidatedBody(
  NotifyUserType,
  (body) => async (req, res) => {
    const updatedSections = body.updatedSections;
    const updatedCourses = body.updatedCourses;

    await sendCourseNotification(updatedCourses);
    await sendSectionNotifications(updatedSections);

    res.status(200).end();
  }
);

async function sendCourseNotification(
  updatedCourses: CourseNotificationInfo[]
): Promise<void> {
  const updatedCourseHashes = updatedCourses.map((uc) => uc.courseHash);
  const coursesKeyedByHash = keyBy(updatedCourses, (uc) => uc.courseHash);

  const coursesToSendMessagesFor = await prisma.followedCourse.findMany({
    where: {
      courseHash: {
        in: updatedCourseHashes,
      },
    },
    include: { user: true },
  });

  coursesToSendMessagesFor.forEach(async (prismaCourse) => {
    const course = coursesKeyedByHash[prismaCourse.courseHash];
    let message = '';
    if (course.count === 1) {
      message += `A section was added to ${course.courseCode}!`;
    } else {
      message += `${course.count} sections were added to ${course.courseCode}!`;
    }
    message += ` Check it out at https://searchneu.com/${course.campus}/${course.term}/search/${course.courseCode} !`;
    await sendFBMessage(prismaCourse.user.fbMessengerId, message);
  });
}

async function sendSectionNotifications(
  updatedSections: SectionNotificationInfo[]
): Promise<void> {
  const updatedSectionHashes = updatedSections.map((us) => us.sectionHash);
  const sectionsKeyedByHash = keyBy(updatedSections, (us) => us.sectionHash);

  const sectionsToSendMessagesFor = await prisma.followedSection.findMany({
    where: {
      sectionHash: {
        in: updatedSectionHashes,
      },
    },
    include: { user: true },
  });

  sectionsToSendMessagesFor.forEach(async (prismaSection) => {
    const section = sectionsKeyedByHash[prismaSection.sectionHash];
    let message = '';
    if (section.seatsRemaining > 0) {
      message = `A seat opened up in ${section.courseCode} (CRN: ${section.crn}). Check it out at https://searchneu.com/${section.campus}/${section.term}/search/${section.courseCode} !`;
    } else {
      message = `A waitlist seat has opened up in ${section.courseCode} (CRN: ${section.crn}). Check it out at https://searchneu.com/${section.campus}/${section.term}/search/${section.courseCode} !`;
    }
    await sendFBMessage(prismaSection.user.fbMessengerId, message);
  });
}
