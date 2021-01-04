/*
 * This file is part of Search NEU and licensed under AGPL3.
 * See the license file in the root folder for details.
 */
import fs from 'fs-extra';
import path from 'path';
import pMap from 'p-map';
import { Major, InputJsonObject } from '@prisma/client';
import prisma from '../backend/prisma';

// In order to execute this module, you need a directory `data`
// that contains the file `majors.json`. The JSON object in
// that file must conform to the `MajorJSON` interface.
// This file will then insert all majors provided in the file
// into the database.

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
