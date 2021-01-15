import { IsNumber, IsString, ValidateNested } from 'class-validator';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import sendFBMessage from '../../utils/api/notifyer';
import { prisma } from '../../utils/api/prisma';
import withValidatedBody from '../../utils/api/withValidatedBody';

// messages are at
// https://github.com/sandboxnu/searchneu/blob/4bd3c470d5221ab9eaafb418951d1b6d4326ed25/backend/updater.ts

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  // TODO: validate from course catalog api

  if (req.method === 'POST') {
    post(req, res);
  } else {
    res.status(404).end();
  }
}

// records of hash -> search query info
class NotifyUserType {
  @ValidateNested({ each: true })
  updatedCourses: Record<string, CourseNotificationInfo>;

  @ValidateNested({ each: true })
  updatedSections: Record<string, SectionNotificationInfo>;
}

class CourseNotificationInfo {
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
  updatedCourses: Record<string, CourseNotificationInfo>
): Promise<void> {
  const coursesToSendMessagesFor = await prisma.followedCourse.findMany({
    where: {
      courseHash: {
        in: Object.keys(updatedCourses),
      },
    },
    include: { user: true },
  });

  coursesToSendMessagesFor.forEach(async (prismaCourse) => {
    const course = Object.keys(updatedCourses)[
      prismaCourse.courseHash
    ] as CourseNotificationInfo;
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
  updatedSections: Record<string, SectionNotificationInfo>
): Promise<void> {
  const sectionsToSendMessagesFor = await prisma.followedSection.findMany({
    where: {
      sectionHash: {
        in: Object.keys(updatedSections),
      },
    },
    include: { user: true },
  });

  sectionsToSendMessagesFor.forEach(async (prismaSection) => {
    const section = Object.keys(updatedSections)[
      prismaSection.sectionHash
    ] as SectionNotificationInfo;
    let message = '';
    if (section.seatsRemaining > 0) {
      message = `A seat opened up in ${section.courseCode} (CRN: ${section.crn}). Check it out at https://searchneu.com/${section.campus}/${section.term}/search/${section.courseCode} !`;
    } else {
      message = `A waitlist seat has opened up in ${section.courseCode} (CRN: ${section.crn}). Check it out at https://searchneu.com/${section.campus}/${section.term}/search/${section.courseCode} !`;
    }
    await sendFBMessage(prismaSection.user.fbMessengerId, message);
  });
}
