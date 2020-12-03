import { DropdownItemProps } from 'semantic-ui-react';
import { Campus } from './types';

export const neuTermDropdownOptions: DropdownItemProps[] = [
  { text: 'Spring 2021', value: '202130' },
  { text: 'Fall 2020', value: '202110' },
  { text: 'Summer I 2020', value: '202040' },
  { text: 'Summer Full 2020', value: '202050' },
  { text: 'Summer II 2020', value: '202060' },
  { text: 'Spring 2020', value: '202030' },
];
// spring 2021 CPS semester
export const cpsTermDropdownOptions: DropdownItemProps[] = [
  // removed because data is not yet up on banner
  // { text: 'Spring 2021 CPS Semester ', value: '202134' },
  // { text: 'Spring 2021 CPS Quarter', value: '202135' },
  { text: 'Winter 2020 CPS Quarter', value: '202125' },
  { text: 'Fall 2020 CPS Semester', value: '202114' },
  { text: 'Fall 2020 CPS Quarter', value: '202115' },
  { text: 'Summer 2020 CPS Semester', value: '202054' },
  { text: 'Summer 2020 CPS Quarter', value: '202055' },
  { text: 'Spring 2020 CPS Semester', value: '202034' },
  { text: 'Spring 2020 CPS Quarter', value: '202034' },
];

export const lawTermDropdownOptions: DropdownItemProps[] = [
  // removed because data is not yet up on banner
  // { text: 'Spring 2021 Law Semester', value: '202132' },
  // { text: 'Spring 2021 Law Quarter', value: '202138' },
  { text: 'Winter 2020 Law Quarter', value: '202128' },
  { text: 'Fall 2020 Law Semester', value: '202112' },
  { text: 'Fall 2020 Law Quarter', value: '202118' },
  { text: 'Summer 2020 Law Semester', value: '202052' },
  { text: 'Summer 2020 Law Quarter', value: '202058' },
  { text: 'Spring 2020 Law Semester', value: '202032' },
  { text: 'Spring 2020 Law Quarter', value: '202038' },
];

export const campusDropdownOptions: DropdownItemProps[] = [
  { text: 'NEU', value: 'NEU' },
  { text: 'CPS', value: 'CPS' },
  { text: 'Law', value: 'LAW' },
];

export function getAllCampusDropdownOptions(): DropdownItemProps[] {
  return campusDropdownOptions;
}

export function getTermDropdownOptionsForCampus(
  c: Campus,
): DropdownItemProps[] {
  switch (c) {
    case Campus.NEU:
      return neuTermDropdownOptions;
    case Campus.CPS:
      return cpsTermDropdownOptions;
    case Campus.LAW:
      return lawTermDropdownOptions;
    default:
      return [];
  }
}

export function getLatestTerm(c: Campus): string {
  switch (c) {
    case Campus.NEU:
      return neuTermDropdownOptions[0].value as string;
    case Campus.CPS:
      return cpsTermDropdownOptions[0].value as string;
    case Campus.LAW:
      return lawTermDropdownOptions[0].value as string;
    default:
      return '';
  }
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

function getSecondToLastDigit(s: string) {
  return s.charAt(s.length - 2);
}

function tryGetMatchingSecondToLastDigitOption(
  secondToLast: string,
  options: DropdownItemProps[],
): DropdownItemProps | undefined {
  for (const option of options) {
    const secondToLastOfOption = getSecondToLastDigit(option.value as string);
    if (secondToLast === secondToLastOfOption) {
      return option;
    }
  }

  return undefined;
}

export function getRoundedTerm(nextCampus: Campus, prevTerm: string): string {
  // what's the logic
  // get the second to last digit
  const secondToLast = getSecondToLastDigit(prevTerm);

  // know the options of the new campus
  const options = getTermDropdownOptionsForCampus(nextCampus);

  // search in there for the value where the second to last digit
  const result = tryGetMatchingSecondToLastDigitOption(secondToLast, options);

  if (result) {
    return result.value as string;
  }
  // here, there was no result with the corresponding digit. so round down and try again.
  const roundedDownDigit = String(Number(secondToLast) - 1);
  const result2 = tryGetMatchingSecondToLastDigitOption(
    roundedDownDigit,
    options,
  );
  return result2.value as string;
}
