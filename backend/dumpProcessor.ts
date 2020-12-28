/*
 * This file is part of Search NEU and licensed under AGPL3.
 * See the license file in the root folder for details.  */

import _ from 'lodash';
import { Professor, Course, Section, Subject, BatchPayload } from '@prisma/client';
import prisma from './prisma';
import knex from './knex';
import { populateES } from './scripts/populateES';

const CHUNK_SIZE = 2000;

interface TermDump {
  classes: Course[];
  sections: Section[];
  subjects: Subject[];
}

// TODO
// 1. special-case JSON fields
// 2. should `DATABASE_URL` be in the environment? and how so?
// 3. create and teardown knex
// 4. pre-process scraper output to match expectations
// 5. add types for the private bulkInserter functions

// FIXME should we use a string or use the Promise interface?
function bulkInsertCourseChunk(courses: Course[]): string {
  return knex('courses').insert(courses).onConflict('id').merge().toString();
}

function bulkInsertSectionChunk(sections: Section[]): string {
  return knex('sections').insert(sections).onConflict('id').merge().toString();
}

function bulkInsertProfChunk(profs: Professor[]): string {
  return knex('professors').insert(profs).onConflict('id').merge().toString();
}

function bulkInsertSubjectChunk(subjects: Subject[]): string {
  return knex('subjects').insert(subjects).onConflict('abbreviation').ignore().toString();
}

export async function bulkInsertCourses(courses: Course[]): Promise<void> {
  _.chunk(courses, CHUNK_SIZE).forEach(async (chunk: Course[]) => {
    await prisma.$executeRaw(bulkInsertCourseChunk(chunk.map((c: Course) => _.mapKeys(processCourse(c), toSnakeCase) as Course)));
  });
}

export async function bulkInsertSections(sections: Section[]): Promise<void> {
  return _.chunk(sections, CHUNK_SIZE).forEach(async (chunk: Section[]) => {
    await prisma.$executeRaw(bulkInsertSectionChunk(chunk.map((s: Section) => _.mapKeys(s, toSnakeCase) as Section)));
  });
}

export async function bulkInsertProfs(profs: Professor[]): Promise<void> {
  return _.chunk(profs, CHUNK_SIZE).forEach(async (chunk: Professor[]) => {
    await prisma.$executeRaw(bulkInsertProfChunk(chunk.map((p: Professor) => _.mapKeys(p, toSnakeCase) as Professor)));
  });
}

export async function bulkInsertSubjects(subjects: Subject[]): Promise<void> {
  return _.chunk(subjects, CHUNK_SIZE).forEach(async (chunk: Subject[]) => {
    await prisma.$executeRaw(bulkInsertSubjectChunk(chunk));
  });
}

export async function bulkInsertTermDump({ classes, sections, subjects }: TermDump): Promise<void> {
  await bulkInsertCourses(classes);
  await bulkInsertSections(sections);
  await bulkInsertSubjects(subjects);
}

export async function updateCourseTimes(terms: string[], time: Date): Promise<number> {
  return knex('courses')
    .update({ last_update_time: time })
    .whereIn('term_id', terms)
    .whereIn('id', () => this.select('class_hash').from('sections'));
}

export async function deleteStaleCourses(terms: string[]): Promise<BatchPayload> {
  return prisma.course.deleteMany({
    where: {
      termId: { in: Array.from(terms) },
      // delete all courses that haven't been updated in the past 2 days (in milliseconds)
      lastUpdateTime: { lt: new Date(new Date().getTime() - 48 * 60 * 60 * 1000) },
    },
  });
}

function toSnakeCase(_value: any, key: string): string {
  return key.replace(/[A-Z]/g, (group) => '_' + group.toLowerCase());
}

function processCourse(c: Course): Course {
  return {
    ...c,
    prereqs: JSON.stringify(c.prereqs),
    coreqs: JSON.stringify(c.coreqs),
    prereqsFor: JSON.stringify(c.prereqsFor),
    optPrereqsFor: JSON.stringify(c.optPrereqsFor),
  };
}

// class DumpProcessor {
//   CHUNK_SIZE: number;

//   constructor() {
//     this.CHUNK_SIZE = 5;
//   }

//   /**
//    * @param {Object} termDump object containing all class and section data, normally acquired from scrapers
//    * @param {Object} profDump object containing all professor data, normally acquired from scrapers
//    * @param {boolean} destroy determines if courses that haven't been updated for the last two days will be removed from the database
//    */
//   async main({
//     termDump = { classes: {}, sections: {}, subjects: {} },
//     profDump = {},
//     destroy = false,
//   }) {
//     const coveredTerms: Set<string> = new Set();

//     await Promise.all(_.chunk(Object.values(profDump), 2000).map(async (profs) => {
//       await prisma.$executeRaw(bulkInsertProfs(profs));
//     }));

//     macros.log('finished with profs');

//     await Promise.all(_.chunk(Object.values(termDump.classes), 2000).map(async (courses) => {
//       await prisma.$executeRaw(bulkInsertCourses(courses));
//     }));

//     macros.log('finished with courses');

//     // FIXME this is a bad hack that will work
//     const courseIds = new Set((await prisma.course.findMany({ select: { id: true } })).map((elem) => elem.id));
//     const processedSections = Object.values(termDump.sections).map((section) => this.constituteSection(section)).filter((s) => courseIds.has(s.classHash));

//     await Promise.all(_.chunk(processedSections, 2000).map(async (sections) => {
//       await prisma.$executeRaw(bulkInsertSections(sections));
//     }));

//     macros.log('finished with sections');

//     const courseUpdateTimes: Record<string, Date> = processedSections.reduce((acc: Record<string, Date>, section) => {
//       return { ...acc, [section.classHash]: new Date() };
//     }, {});

//     await Promise.all(Object.entries(courseUpdateTimes).map(async ([id, updateTime]) => {
//       return prisma.course.update({
//         where: { id },
//         data: { lastUpdateTime: updateTime },
//       });
//     }));

//     macros.log('finished updating times');

//     await Promise.all(Object.entries(termDump.subjects).map(([key, value]) => {
//       return prisma.subject.upsert({
//         where: {
//           abbreviation: key,
//         },
//         create: {
//           abbreviation: key,
//           description: value as string,
//         },
//         update: {
//           description: value,
//         },
//       });
//     }));

//     macros.log('finished with subjects');

//     if (destroy) {
//       await prisma.course.deleteMany({
//         where: {
//           termId: { in: Array.from(coveredTerms) },
//           // delete all courses that haven't been updated in the past 2 days (in milliseconds)
//           lastUpdateTime: { lt: new Date(new Date().getTime() - 48 * 60 * 60 * 1000) },
//         },
//       });
//     }

//     macros.log('finished cleaning up');

//     await populateES();
//   }

//   processProf(profInfo: any): ProfessorCreateInput {
//     const correctedQuery = { ...profInfo, emails: { set: profInfo.emails } };
//     return _.omit(correctedQuery, ['title', 'interests', 'officeStreetAddress']) as ProfessorCreateInput;
//   }

//   processCourse(classInfo: any, coveredTerms: Set<string> = new Set()): CourseCreateInput {
//     coveredTerms.add(classInfo.termId);

//     const additionalProps = {
//       id: `${Keys.getClassHash(classInfo)}`,
//       description: classInfo.desc,
//       minCredits: Math.floor(classInfo.minCredits),
//       maxCredits: Math.floor(classInfo.maxCredits),
//       lastUpdateTime: new Date(classInfo.lastUpdateTime),
//     };

//     const correctedQuery = {
//       ...classInfo,
//       ...additionalProps,
//       classAttributes: { set: classInfo.classAttributes || [] },
//       nupath: { set: classInfo.nupath || [] },
//     };

//     const { desc, ...finalCourse } = correctedQuery;

//     return finalCourse;
//   }

//   constituteCourse(classInfo: any, coveredTerms: Set<string> = new Set()): CourseCreateInput {
//     coveredTerms.add(classInfo.termId);

//     const additionalProps = {
//       id: `${Keys.getClassHash(classInfo)}`,
//       description: classInfo.desc,
//       minCredits: Math.floor(classInfo.minCredits),
//       maxCredits: Math.floor(classInfo.maxCredits),
//     };

//     const correctedQuery = {
//       ...classInfo,
//       ...additionalProps,
//       classAttributes: classInfo.classAttributes || [],
//       nupath: classInfo.nupath || [],
//     };

//     const { desc, ...finalCourse } = correctedQuery;

//     return finalCourse;
//   }

//   processSection(secInfo: any): SectionCreateInput {
//     const additionalProps = { id: `${Keys.getSectionHash(secInfo)}`, classHash: Keys.getClassHash(secInfo), profs: { set: secInfo.profs || [] } };
//     return _.omit({ ...secInfo, ...additionalProps }, ['classId', 'termId', 'subject', 'host']) as SectionCreateInput;
//   }

//   constituteSection(secInfo: any): SectionCreateInput {
//     const additionalProps = { id: `${Keys.getSectionHash(secInfo)}`, classHash: Keys.getClassHash(secInfo) };
//     return _.omit({ ...secInfo, ...additionalProps }, ['classId', 'termId', 'subject', 'host']) as SectionCreateInput;
//   }
// }

// const instance = new DumpProcessor();

// async function fromFile(termFilePath, empFilePath) {
//   const termExists = await fs.pathExists(termFilePath);
//   const empExists = await fs.pathExists(empFilePath);

//   if (!termExists || !empExists) {
//     macros.error('need to run scrape before indexing');
//     return;
//   }

//   const termDump = await fs.readJson(termFilePath);
//   const profDump = await fs.readJson(empFilePath);
//   await instance.main({ termDump: termDump, profDump: profDump });
// }

// if (require.main === module) {
//   // If called directly, attempt to index the dump in public dir
//   const termFilePath = path.join(macros.PUBLIC_DIR, 'getTermDump', 'allTerms.json');
//   const empFilePath = path.join(macros.PUBLIC_DIR, 'employeeDump.json');
//   fromFile(termFilePath, empFilePath).catch(macros.error);
// }

// export default instance;
