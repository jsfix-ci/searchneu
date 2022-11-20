import _ from 'lodash';
import { Campus } from './types';
import { gqlClient } from '../utils/courseAPIClient';
import getTermInfos from '../utils/TermInfoProvider';

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

export function getTermNameFromId(termId: string, campus: string): string {
  const termInfos = getTermInfos()[campus];
  const termInfo = termInfos.find((term) => term.value === termId);

  if (termInfo === undefined || termInfo === null) {
    throw new Error(
      'No Matching Term Name for Term Id: ' + termId + ' for College ' + campus
    );
  }
  return termInfo.text;
}
