/*
 * This file is part of Search NEU and licensed under AGPL3.
 * See the license file in the root folder for details.
 */

import Section from '../../classModels/Section';
import mockData from '../../panels/tests/mockData'
import Meeting from '../../classModels/Meeting';

let section : Section;
let section2 : Section;

beforeEach(() => {
  section = Section.create(mockData.probStatsSectionConfig);
  section2 = Section.create(mockData.probStatsConfig2);
});


// TODO: test w/ multiple profs, test with waitlist, test w/o exam, meets on weekends
describe('testing basic getters', () => {
  it('testing getting meeting moments', () => {
    expect(section.getAllMeetingMoments().map((e) => {
      return { start: e.start.toISOString(), end: e.end.toISOString() };
    })).toStrictEqual([
      { start: '1970-01-05T10:30:00.000Z', end: '1970-01-05T11:35:00.000Z' },
      { start: '1970-01-07T10:30:00.000Z', end: '1970-01-07T11:35:00.000Z' },
      { start: '1970-01-08T10:30:00.000Z', end: '1970-01-08T11:35:00.000Z' }]);
  });

  it('testing hashing', () => {
    expect(section.getHash()).toStrictEqual('neu.edu/202030/MATH/3081/30270');
  });

  it('testing getting professors', () => {
    expect(section.getProfs()).toStrictEqual(['Aaron Hoffman']);
  });

  it('gettings days of week as bools', () => {
    expect(section.getDaysOfWeekAsBooleans()).toStrictEqual([false, true, false, true, true, false, false]);
  });
});


it('testing compareTo', () => {
  expect(section.compareTo(section2)).toBeLessThan(0);
  expect(section.compareTo(section)).toBe(0);
  expect(section2.compareTo(section)).toBeGreaterThan(0);
});
