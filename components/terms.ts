import _ from 'lodash';
import { Campus } from './types';
import { gqlClient } from '../utils/courseAPIClient';

/** Information about a term */
export interface TermInfo {
  /** Display text */
  text: string;
  /** Term ID */
  value: string;
  href: string;
}

/**
 * Queries the backend for information about the terms for all campuses
 */
export async function fetchTermInfo(): Promise<Record<Campus, TermInfo[]>> {
  // Creates a dict of {campus : TermInfo[] }
  const allTermInfos = {
    [Campus.NEU]: [],
    [Campus.CPS]: [],
    [Campus.LAW]: [],
  };

  for (const college of Object.keys(Campus)) {
    // Query the TermInfos from the GraphQL client
    const rawTermInfos = (
      await gqlClient.getTermIDsByCollege({ subCollege: college })
    )['termInfos'];

    // Map the TermInfos to add a link parameter
    const termInfos: TermInfo[] = rawTermInfos.map((term) => {
      return {
        text: term['text'],
        value: term['termId'],
        href: `/${college}/${term['termId']}`,
      };
    });

    allTermInfos[college] = termInfos;
  }

  return allTermInfos;
}

// Returns the latest (ie. most recent) term for the given campus
export function getLatestTerm(
  termInfos: Record<Campus, TermInfo[]>,
  c: Campus
): string {
  const campusTerms = termInfos[c];
  if (campusTerms.length > 0) {
    return campusTerms[0].value as string;
  }
  return '';
}

export function getCampusByLastDigit(t: string): Campus {
  switch (t) {
    case '0':
      return Campus.NEU;
    case '2':
    case '8':
      return Campus.LAW;
    case '4':
    case '5':
      return Campus.CPS;
    default:
      throw new Error('unexpected campus digit');
  }
}

export function greaterTermExists(
  terminfos: TermInfo[],
  termId: string
): boolean {
  return _.some(terminfos, (option) => {
    const diff = Number(option.value) - Number(termId);
    return diff > 0 && diff % 10 === 0;
  });
}

/** Get the term within the given campus that is closest to the given term (in a diff campus) */
export function getRoundedTerm(
  termInfos: Record<Campus, TermInfo[]>,
  nextCampus: Campus,
  prevTerm: string
): string {
  const prevTermInt = Number(prevTerm);

  const closestTerm = termInfos[nextCampus].reduce(
    (prev, current: TermInfo) => {
      const curTermInt = Number(current.value);
      const diff = Math.abs(prevTermInt - curTermInt);
      // Returns the term which is closest to the previous term
      if (diff < prev.diff) {
        return { termStr: current.value, diff: diff };
      }
      return prev;
      // Initial value (which will always be replaced)
    },
    { termStr: '', diff: Number.MAX_SAFE_INTEGER }
  );

  return closestTerm.termStr;
}

// Get the name version of a term id
export function getTermName(
  termInfos: Record<Campus, TermInfo[]>,
  termId: string
): string {
  // gather all termId to term name mappings
  const allTermMappings: TermInfo[] = Object.values(termInfos).reduce(
    (prev, cur) => {
      return prev.concat(cur);
    },
    []
  );

  // return first instance of the termId matching a termId in a id-name mapping
  const termName = allTermMappings.find(
    (termMapping: TermInfo): boolean => termMapping.value === termId
  );

  return termName ? termName.text : '';
}

/**
 * CPS/LAW use different semester names than NEU.
 * Current semester names for NEU campus: Fall, Winter, Spring, Summer I, Summer II, and Summer Full.
 * Current semester names for CPS/LAW campus: Fall Semester, Fall Quarter, Winter Quarter,
 * Spring Semester, Spring Quarter, Summer Semester, Summer Quarter.
 * Each semester corresponds to a different 2-digits number (last two digits of the term id).
 */
export function getSemesterNameFromTermId(termId: string): string {
  const semesterDigit = termId.slice(-2);
  const semesterDigitMap = {
    '10': 'Fall',
    '14': 'Fall Semester',
    '15': 'Fall Quarter',
    '20': 'Winter',
    '25': 'Winter Quarter',
    '30': 'Spring',
    '34': 'Spring Semester',
    '35': 'Spring Quarter',
    '40': 'Summer I',
    '50': 'Summer Full',
    '54': 'Summer Semester',
    '55': 'Summer Quarter',
    '60': 'Summer II',
  };

  if (!semesterDigitMap[semesterDigit])
    throw new Error('Unexpected season digit: ' + semesterDigit);
  else return semesterDigitMap[semesterDigit];
}

// returns the year the term occurs in
export function getYearFromTermId(termId: string): number {
  const givenYear: number = parseInt(termId.substr(0, 4));
  const seasonDigit: number = parseInt(termId.charAt(termId.length - 2));
  // Fall and Winter semesters occurs in the previous year from the given year from termId.
  // ex: 202110 should be Fall 2020 not Fall 2021
  // Fall semesters have season digit 1; Winter semesters have season digit 2.
  if (seasonDigit < 3) {
    return givenYear - 1;
  } else {
    return givenYear;
  }
}
