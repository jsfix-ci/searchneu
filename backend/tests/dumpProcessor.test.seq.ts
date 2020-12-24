/*
 * This file is part of Search NEU and licensed under AGPL3.
 * See the license file in the root folder for details.
 */
import { Course, Section } from '@prisma/client';
import prisma from '../prisma';
import {
  bulkInsertCourses, bulkInsertSections, bulkInsertProfs, bulkInsertSubjects, updateCourseTimes, bulkInsertTermDump, deleteStaleCourses
} from '../dumpProcessor';

const OOD_NAME = 'Object-Oriented Design';
const TH_NAME  = 'Tech & Human Values';
const F1_NAME  = 'Fundamentals of Computer Science 1';

// FIXTURES
const COURSE_ONE: Course = {
  id: 'neu.edu/202030/CS/2500',
  maxCredits: 4,
  minCredits: 4,
  host: 'neu.edu',
  classId: '2500',
  name: F1_NAME,
  termId: '202030',
  subject: 'CS',
  prereqs: { type: 'and', values: [] },
  coreqs: { type: 'and', values: [{ subject: 'CS', classId: '2501' }] },
  prereqsFor: { type: 'and', values: [] },
  optPrereqsFor: { type: 'and', values: [] },
  classAttributes: ['fun intro'],
  lastUpdateTime: new Date(),
  feeAmount: 0,
  feeDescription: null,
  nupath: [],
  description: 'Introduction to Computer Science course at Northeastern',
  prettyUrl: '',
  url: '',
};

const COURSE_TWO: Course = {
  id: 'neu.edu/202030/CS/2510',
  maxCredits: 4,
  minCredits: 4,
  host: 'neu.edu',
  classId: '2510',
  name: 'Fundamentals Of Computer Science 2',
  termId: '202030',
  subject: 'CS',
  prereqs: { type: 'and', values: [] },
  coreqs: { type: 'and', values: [] },
  prereqsFor: { type: 'and', values: [] },
  optPrereqsFor: { type: 'and', values: [] },
  classAttributes: [],
  lastUpdateTime: new Date(),
  feeAmount: 0,
  feeDescription: null,
  nupath: [],
  description: 'Second course in Northestern Computer Science curriculum',
  prettyUrl: '',
  url: '',
};

const COURSE_THREE: Course = {
  id: OOD_NAME,
  maxCredits: 4,
  minCredits: 4,
  host: 'neu.edu',
  classId: '3500',
  name: 'Object-Oriented Design',
  termId: '202030',
  subject: 'CS',
  prereqs: { type: 'and', values: [] },
  coreqs: { type: 'and', values: [] },
  prereqsFor: { type: 'and', values: [] },
  optPrereqsFor: { type: 'and', values: [] },
  classAttributes: [],
  lastUpdateTime: new Date(),
  feeAmount: 0,
  feeDescription: null,
  nupath: [],
  description: 'Third course in Northestern Computer Science curriculum',
  prettyUrl: '',
  url: '',
}

const SECTION_ONE: Section = {
  id: 'neu.edu/202030/CS/3500/12345',
  classHash: 'neu.edu/202030/CS/3500',
  classType: 'Lecture',
  info: '',
  seatsCapacity: 50,
  seatsRemaining: 0,
  waitCapacity: 0,
  waitRemaining: 0,
  campus: 'Boston',
  honors: false,
  crn: '12345',
  meetings: {},
  profs: ['Benjamin Lerner'],
  url: '',
}

const SECTION_TWO: Section = {
  id: 'neu.edu/202030/CS/3500/23456',
  classHash: 'neu.edu/202030/CS/3500',
  classType: 'Lecture',
  info: '',
  seatsCapacity: 40,
  seatsRemaining: 10,
  waitCapacity: 0,
  waitRemaining: 0,
  campus: 'Online',
  honors: false,
  crn: '23456',
  meetings: {},
  profs: ['Jason Hemann'],
  url: '',
};

const SECTION_THREE: Section = {
  id: 'neu.edu/202030/CS/3500/34567',
  classHash: 'neu.edu/202030/CS/3500',
  classType: 'Lecture',
  info: '',
  seatsCapacity: 2,
  seatsRemaining: 2,
  waitCapacity: 0,
  waitRemaining: 0,
  campus: 'Seattle, WA',
  honors: false,
  crn: '34567',
  meetings: {},
  profs: ['Matthias Felleisen'],
  url: '',
};

const SECTION_FOUR: Section = {
  id: 'neu.edu/202030/CS/2500/10000',
  classHash: 'neu.edu/202030/CS/2500',
  classType: 'Lecture',
  info: '',
  seatsCapacity: 2,
  seatsRemaining: 2,
  waitCapacity: 0,
  waitRemaining: 0,
  campus: 'Boston',
  honors: false,
  crn: '10000',
  meetings: {},
  profs: ['Stephen Chang'],
  url: '',
};

const CS_DESC = 'Computer Science';
const CS_OUTDATED_DESC = 'Computer Sciences';

const CS = { abbreviation: 'CS', description: CS_DESC };
const CHEM = { abbreviation: 'CHEM', description: 'Chemistry' };
const PHYS = { abbreviation: 'PHYS', description: 'Physics' };

const OLD_TIME = new Date(2020, 1, 1);
const COURSE_ONE_OLD = {
  ...COURSE_ONE,
  lastUpdateTime: OLD_TIME,
};
const COURSE_TWO_OLD = {
  ...COURSE_TWO,
  lastUpdateTime: OLD_TIME,
};
const COURSE_THREE_OLD = {
  ...COURSE_THREE,
  lastUpdateTime: OLD_TIME,
};

beforeEach(async () => {
  await prisma.professor.deleteMany({});
  await prisma.section.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.subject.deleteMany({});
});

describe('bulkInsertCourses', () => {
  it('inserts one course', async () => {
    await bulkInsertCourses([COURSE_ONE]);
    expect(await prisma.course.count()).toEqual(1);
    expect((await prisma.course.findMany())[0].name).toEqual(F1_NAME);
  });

  it('inserts multiple courses', async () => {
    await bulkInsertCourses([COURSE_ONE, COURSE_TWO, COURSE_THREE]);
    expect(await prisma.course.count()).toEqual(3);
  });

  it('updates a course on conflict', async () => {
    await bulkInsertCourses([{ ...COURSE_THREE, name: TH_NAME }]);

    await bulkInsertCourses([COURSE_ONE, COURSE_TWO, COURSE_THREE]);
    expect(await prisma.course.count()).toEqual(3);
    expect((await prisma.course.findOne({ where: { id: 'neu.edu/202030/CS/3500' } })).name).toEqual(OOD_NAME);
  });
});

describe('bulkInsertSections', () => {
  beforeEach(async () => {
    await bulkInsertCourses([COURSE_ONE, COURSE_THREE]);
  });

  it('inserts a single section', async () => {
    await bulkInsertSections([SECTION_ONE]);
    expect(await prisma.section.count()).toEqual(1);
    expect((await prisma.section.findMany())[0].id).toEqual('neu.edu/202030/CS/3500/12345');
  });

  it('inserts multiple sections', async () => {
    await bulkInsertSections([SECTION_ONE, SECTION_TWO, SECTION_THREE, SECTION_FOUR]);
    expect(await prisma.section.count()).toEqual(4);
  });

  it('updates a section', async () => {
    await bulkInsertSections([{ ...SECTION_FOUR, info: 'Hello World' }]);

    await bulkInsertSections([SECTION_ONE, SECTION_TWO, SECTION_THREE, SECTION_FOUR]);
    expect(await prisma.section.count()).toEqual(4);
    expect((await prisma.section.findOne({ where: { id: 'neu.edu/202030/CS/2500/10000' }})).info).toEqual('');
  });
});

describe('bulkInsertProfs', () => {
  const BLERNER_SHORT = 'Ben Lerner';
  const BLERNER_LONG  = 'Benjamin Lerner';

  const PROF_ONE = {
    id: 'abcdefg',
    name: BLERNER_LONG,
    firstName: 'Benjamin',
    lastName: 'Lerner',
    phone: '6173732462',
    emails: ['be.lerner@northeastern.edu', 'blerner@ccs.neu.edu'],
    primaryRole: 'Assistant Teaching Professor',
    primaryDepartment: 'Khoury',
    url: 'https://www.khoury.northeastern.edu/people/benjamin-lerner/',
    personalSite: 'http://www.ccs.neu.edu/home/blerner/',
    bigPictureUrl: 'https://www.khoury.northeastern.edu/wp-content/uploads/2016/02/Benjamin-Lerner-hero-image.jpg',
    email: null,
    googleScholarId: null,
    link: null,
    officeRoom: null,
    pic: null,
    streetAddress: null,
  };
  const PROF_TWO = {
    id: 'hijklmnop',
    name: 'Neal Lerner',
    firstName: 'Neal',
    lastName: 'Lerner',
    phone: '6173732451',
    emails: ['n.lerner@northeastern.edu'],
    primaryRole: 'Professor & Chair',
    primaryDepartment: 'English',
    url: 'https://www.khoury.northeastern.edu/people/neal-lerner/',
    personalSite: 'http://www.ccs.neu.edu/home/nlerner/',
    bigPictureUrl: null,
    email: null,
    googleScholarId: null,
    link: null,
    officeRoom: null,
    pic: null,
    streetAddress: null,
  };
  const PROF_THREE = {
    id: 'qrstuv',
    name: 'Alan Mislove',
    firstName: 'Alan',
    lastName: 'Mislove',
    phone: '6173737069',
    emails: ['a.mislove@northeastern.edu', 'amislove@ccs.neu.edu'],
    primaryRole: 'Professor',
    primaryDepartment: 'Khoury',
    url: 'https://www.khoury.northeastern.edu/people/alan-mislove/',
    personalSite: 'https://mislove.org',
    googleScholarId: 'oAqKi9MAAAAJ',
    bigPictureUrl: 'https://www.khoury.northeastern.edu/wp-content/uploads/2016/02/Alan-Mislove_cropped-hero-image.jpg',
    email: null,
    link: null,
    officeRoom: null,
    pic: null,
    streetAddress: null,
  };

  it('inserts a single professor', async () => {
    await bulkInsertProfs([PROF_ONE]);
    expect(await prisma.professor.count()).toEqual(1);
    expect((await prisma.professor.findMany())[0].name).toEqual(PROF_ONE.name);
  });

  it('inserts multiple professors', async () => {
    await bulkInsertProfs([PROF_ONE, PROF_TWO, PROF_THREE]);
    expect(await prisma.professor.count()).toEqual(3);
  });

  it('updates a professor on conflict', async () => {
    await bulkInsertProfs([{ ...PROF_ONE, name: BLERNER_SHORT, firstName: 'Ben', emails: null }]);
    expect(await prisma.professor.count()).toEqual(1);

    await bulkInsertProfs([PROF_ONE, PROF_TWO, PROF_THREE]);
    expect(await prisma.professor.count()).toEqual(3);
    expect((await prisma.professor.findOne({ where: { id: PROF_ONE.id } })).name).toEqual(BLERNER_LONG);
  });
});

describe('bulkInsertSubjects', () => {
  it('inserts a single subject', async () => {
    await bulkInsertSubjects([CS]);
    expect(await prisma.subject.count()).toEqual(1);
    expect((await prisma.subject.findMany())[0].abbreviation).toEqual('CS');
  });

  it('inserts multiple subjects', async () => {
    await bulkInsertSubjects([CS, CHEM, PHYS]);
    expect(await prisma.subject.count()).toEqual(3);
  });

  it('updates a subject on conflict', async () => {
    await bulkInsertSubjects([{ abbreviation: 'CS', description: CS_OUTDATED_DESC }]);
    expect(await prisma.subject.count()).toEqual(1);

    await bulkInsertSubjects([CS, CHEM, PHYS]);
    expect(await prisma.subject.count()).toEqual(3);
    expect((await prisma.subject.findOne({ where: { abbreviation: 'CS' } })).description).toEqual(CS_DESC);
  });
});

describe('bulkInsertTermDump', () => {
  it('bulk inserts courses, sections and subjects', async () => {
    bulkInsertTermDump({
      classes: [COURSE_TWO, COURSE_THREE],
      sections: [SECTION_ONE, SECTION_TWO, SECTION_THREE], 
      subjects: [CS, CHEM, PHYS],
    });

    expect(await prisma.course.count()).toEqual(2);
    expect(await prisma.section.count()).toEqual(3);
    expect(await prisma.subject.count()).toEqual(3);
  });

  it('updates courses, subjects and sections on conflict', async () => {
    bulkInsertCourses([{ ...COURSE_THREE, name: TH_NAME }]);
    bulkInsertSections([{ ...SECTION_TWO, info: 'insane' }]);
    bulkInsertSubjects([{ abbreviation: 'CS', description: CS_OUTDATED_DESC }]);

    expect(await prisma.course.count()).toEqual(1);
    expect(await prisma.section.count()).toEqual(1);
    expect(await prisma.subject.count()).toEqual(1);

    bulkInsertTermDump({
      classes: [COURSE_TWO, COURSE_THREE],
      sections: [SECTION_ONE, SECTION_TWO, SECTION_THREE], 
      subjects: [CS, CHEM, PHYS],
    });

    expect(await prisma.course.count()).toEqual(2);
    expect(await prisma.section.count()).toEqual(3);
    expect(await prisma.subject.count()).toEqual(3);

    expect((await prisma.course.findOne({ where: { id: 'neu.edu/202030/CS/3500' }})).name).toEqual(OOD_NAME);
    expect((await prisma.section.findOne({ where: { id: 'neu.edu/202030/CS/3500/12345'}})).info).toEqual('');
    expect((await prisma.subject.findOne({ where: { abbreviation: 'CS' }})).description).toEqual(CS_DESC);
  });
});

describe('updateCourseTimes', () => {
  it('does not update courses with no sections', async () => {
    await bulkInsertCourses([COURSE_ONE_OLD, COURSE_TWO_OLD]);
    expect((await prisma.course.findOne({ where: { id: 'neu.edu/202030/CS/2500' }})).lastUpdateTime).toEqual(OLD_TIME);
    expect((await prisma.course.findOne({ where: { id: 'neu.edu/202030/CS/2510' }})).lastUpdateTime).toEqual(OLD_TIME);

    await updateCourseTimes([COURSE_ONE.termId], new Date());
    expect((await prisma.course.findOne({ where: { id: 'neu.edu/202030/CS/2500' }})).lastUpdateTime).toEqual(OLD_TIME);
    expect((await prisma.course.findOne({ where: { id: 'neu.edu/202030/CS/2510' }})).lastUpdateTime).toEqual(OLD_TIME);
  })

  it('udpates courses with sections', async () => {
    await bulkInsertCourses([COURSE_ONE_OLD, COURSE_TWO_OLD, COURSE_THREE_OLD]);
    await bulkInsertSections([SECTION_ONE, SECTION_FOUR]);

    expect(await prisma.course.count()).toEqual(3);
    expect(await prisma.section.count()).toEqual(2);
    expect((await prisma.course.findOne({ where: { id: 'neu.edu/202030/CS/2500' }})).lastUpdateTime).toEqual(OLD_TIME);
    expect((await prisma.course.findOne({ where: { id: 'neu.edu/202030/CS/2510' }})).lastUpdateTime).toEqual(OLD_TIME);
    expect((await prisma.course.findOne({ where: { id: 'neu.edu/202030/CS/3500' }})).lastUpdateTime).toEqual(OLD_TIME);

    const CURR_TIME = new Date();
    await updateCourseTimes([COURSE_ONE.termId], CURR_TIME);
    expect(await prisma.course.count()).toEqual(3);
    expect((await prisma.course.findOne({ where: { id: 'neu.edu/202030/CS/2500' }})).lastUpdateTime).toEqual(CURR_TIME);
    expect((await prisma.course.findOne({ where: { id: 'neu.edu/202030/CS/2510' }})).lastUpdateTime).toEqual(OLD_TIME);
    expect((await prisma.course.findOne({ where: { id: 'neu.edu/202030/CS/3500' }})).lastUpdateTime).toEqual(CURR_TIME);
  })
});

describe('deleteStaleCourses', () => {
  it('deletes courses more than two days old', async () => {
    bulkInsertCourses([COURSE_ONE_OLD, COURSE_TWO, COURSE_THREE]);
    expect(await prisma.course.count()).toEqual(3);
    
    deleteStaleCourses([COURSE_ONE.termId]);

    expect(await prisma.course.count()).toEqual(2);
  });
});
