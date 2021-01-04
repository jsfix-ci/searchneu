import fs from 'fs-extra';
import path from 'path';
import pMap from 'p-map';
import { Major, InputJsonObject } from '@prisma/client';
import prisma from '../backend/prisma';

const FILE_NAME = 'majors.json';
const CONCURRENCY_COUNT = 10;

interface MajorInput {
  id: string;
  yearVersion: string;
  major: InputJsonObject;
  plansOfStudy: InputJsonObject;
}

interface MajorJSON {
  all_objects: MajorInput[];
}

// return the javascript object equivalent of a file in data/
// NOTE Prisma doesn't export its JsonValue/Object type, so have to use this return
function fetchData(): MajorJSON {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', FILE_NAME)));
}

function migrateData(majorDirectory: MajorInput[]): Promise<Major[]> {
  return pMap(majorDirectory, (m: MajorInput) => {
    return prisma.major.create({
      data: {
        majorId: m.id,
        yearVersion: String(m.yearVersion),
        spec: m.major,
        plansOfStudy: m.plansOfStudy,
      }
    });
  }, { concurrency: CONCURRENCY_COUNT });
}

(async () => {
  await migrateData(fetchData().all_objects);
  console.log('Success! You may close.');
})();
