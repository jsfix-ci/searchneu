/*
 * This file is part of Search NEU and licensed under AGPL3.
 * See the license file in the root folder for details.  */

import fs from 'fs-extra';
import _ from 'lodash';
import path from 'path';
import { Professor, Course, Section } from '@prisma/client';
import prisma from './prisma';
import knex from './knex';
import Keys from '../common/Keys';
import macros from './macros';
import { populateES } from './scripts/populateES';

type Maybe<T> = T | null | undefined;

// FIXME should we use a string or use the Promise interface?
export function bulkInsertCourses(courses: Course[]): string {
  return knex('courses').insert(courses).onConflict('id').merge().toString();
}

export function bulkInsertSections(sections: Section[]): string {
  return knex('sections').insert(sections).onConflict('id').merge().toString();
}

export function bulkInsertProfs(profs: Professor[]): string {
  return knex('professors').insert(profs).onConflict('id').merge().toString();
}


class DumpProcessor {
  CHUNK_SIZE: number;

  constructor() {
    this.CHUNK_SIZE = 5;
  }

  /**
   * @param {Object} termDump object containing all class and section data, normally acquired from scrapers
   * @param {Object} profDump object containing all professor data, normally acquired from scrapers
   * @param {boolean} destroy determines if courses that haven't been updated for the last two days will be removed from the database
   */
  async main({
    termDump = { classes: {}, sections: {}, subjects: {} },
    profDump = {},
    destroy = false,
  }) {
    const coveredTerms: Set<string> = new Set();

    await Promise.all(_.chunk(Object.values(profDump), 2000).map(async (profs) => {
      await prisma.$executeRaw(bulkInsertProfs(profs));
    }));

    macros.log('finished with profs');

    await Promise.all(_.chunk(Object.values(termDump.classes), 2000).map(async (courses) => {
      await prisma.$executeRaw(bulkInsertCourses(courses));
    }));

    macros.log('finished with courses');

    // FIXME this is a bad hack that will work
    const courseIds = new Set((await prisma.course.findMany({ select: { id: true } })).map((elem) => elem.id));
    const processedSections = Object.values(termDump.sections).map((section) => this.constituteSection(section)).filter((s) => courseIds.has(s.classHash));

    await Promise.all(_.chunk(processedSections, 2000).map(async (sections) => {
      await prisma.$executeRaw(bulkInsertSections(sections));
    }));

    macros.log('finished with sections');

    const courseUpdateTimes: Record<string, Date> = processedSections.reduce((acc: Record<string, Date>, section) => {
      return { ...acc, [section.classHash]: new Date() };
    }, {});

    await Promise.all(Object.entries(courseUpdateTimes).map(async ([id, updateTime]) => {
      return prisma.course.update({
        where: { id },
        data: { lastUpdateTime: updateTime },
      });
    }));

    macros.log('finished updating times');

    await Promise.all(Object.entries(termDump.subjects).map(([key, value]) => {
      return prisma.subject.upsert({
        where: {
          abbreviation: key,
        },
        create: {
          abbreviation: key,
          description: value as string,
        },
        update: {
          description: value,
        },
      });
    }));

    macros.log('finished with subjects');

    if (destroy) {
      await prisma.course.deleteMany({
        where: {
          termId: { in: Array.from(coveredTerms) },
          // delete all courses that haven't been updated in the past 2 days (in milliseconds)
          lastUpdateTime: { lt: new Date(new Date().getTime() - 48 * 60 * 60 * 1000) },
        },
      });
    }

    macros.log('finished cleaning up');

    await populateES();
  }

  processProf(profInfo: any): ProfessorCreateInput {
    const correctedQuery = { ...profInfo, emails: { set: profInfo.emails } };
    return _.omit(correctedQuery, ['title', 'interests', 'officeStreetAddress']) as ProfessorCreateInput;
  }

  processCourse(classInfo: any, coveredTerms: Set<string> = new Set()): CourseCreateInput {
    coveredTerms.add(classInfo.termId);

    const additionalProps = {
      id: `${Keys.getClassHash(classInfo)}`,
      description: classInfo.desc,
      minCredits: Math.floor(classInfo.minCredits),
      maxCredits: Math.floor(classInfo.maxCredits),
      lastUpdateTime: new Date(classInfo.lastUpdateTime),
    };

    const correctedQuery = {
      ...classInfo,
      ...additionalProps,
      classAttributes: { set: classInfo.classAttributes || [] },
      nupath: { set: classInfo.nupath || [] },
    };

    const { desc, ...finalCourse } = correctedQuery;

    return finalCourse;
  }

  constituteCourse(classInfo: any, coveredTerms: Set<string> = new Set()): CourseCreateInput {
    coveredTerms.add(classInfo.termId);

    const additionalProps = {
      id: `${Keys.getClassHash(classInfo)}`,
      description: classInfo.desc,
      minCredits: Math.floor(classInfo.minCredits),
      maxCredits: Math.floor(classInfo.maxCredits),
    };

    const correctedQuery = {
      ...classInfo,
      ...additionalProps,
      classAttributes: classInfo.classAttributes || [],
      nupath: classInfo.nupath || [],
    };

    const { desc, ...finalCourse } = correctedQuery;

    return finalCourse;
  }

  processSection(secInfo: any): SectionCreateInput {
    const additionalProps = { id: `${Keys.getSectionHash(secInfo)}`, classHash: Keys.getClassHash(secInfo), profs: { set: secInfo.profs || [] } };
    return _.omit({ ...secInfo, ...additionalProps }, ['classId', 'termId', 'subject', 'host']) as SectionCreateInput;
  }

  constituteSection(secInfo: any): SectionCreateInput {
    const additionalProps = { id: `${Keys.getSectionHash(secInfo)}`, classHash: Keys.getClassHash(secInfo) };
    return _.omit({ ...secInfo, ...additionalProps }, ['classId', 'termId', 'subject', 'host']) as SectionCreateInput;
  }
}

const instance = new DumpProcessor();

async function fromFile(termFilePath, empFilePath) {
  const termExists = await fs.pathExists(termFilePath);
  const empExists = await fs.pathExists(empFilePath);

  if (!termExists || !empExists) {
    macros.error('need to run scrape before indexing');
    return;
  }

  const termDump = await fs.readJson(termFilePath);
  const profDump = await fs.readJson(empFilePath);
  await instance.main({ termDump: termDump, profDump: profDump });
}

if (require.main === module) {
  // If called directly, attempt to index the dump in public dir
  const termFilePath = path.join(macros.PUBLIC_DIR, 'getTermDump', 'allTerms.json');
  const empFilePath = path.join(macros.PUBLIC_DIR, 'employeeDump.json');
  fromFile(termFilePath, empFilePath).catch(macros.error);
}

export default instance;
