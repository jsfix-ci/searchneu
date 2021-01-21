import {
  flatten, cloneDeep, groupBy, values,
} from 'lodash';
import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import moment from 'moment';
import macros from '../macros';
import EmployeePanel from '../panels/EmployeePanel';
import { SearchResult, MobileSearchResult } from './Results/SearchResult'
import Keys from '../../../common/Keys';
import {
  Section, SearchItem, Meeting, MomentTuple, TimeToMoment,
} from '../types';

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

interface ResultsLoaderProps {
  results: SearchItem[],
  loadMore: () => void
}

const getGroupedByTimeOfDay = (times): MomentTuple[] => {
  const timeMoments = [];

  if (times) {
    const dayIndices = Object.keys(times);

    for (const dayIndex of dayIndices) {
      times[dayIndex].forEach((event) => {
        //3 is to set in the second week of 1970
        const day = parseInt(dayIndex, 10) + 3;

        const obj = {
          start: moment.utc(event.start * 1000).add(day, 'day'),
          end: moment.utc(event.end * 1000).add(day, 'day'),
        };

        if (parseInt(obj.start.format('YYYY'), 10) !== 1970) {
          macros.error();
        }

        timeMoments.push(obj);
      });
    }
  }

  // returns objects like this: {3540000041400000: Array[3]}
  // if has three meetings per week that meet at the same times
  const groupedByTimeOfDay: TimeToMoment = groupBy(timeMoments, (event) => {
    const zero = moment(event.start).startOf('day');
    return `${event.start.diff(zero)}${event.end.diff(zero)}`;
  });

  // Get the values of the object returned above
  const valuesGroupedByTimeOfDay: MomentTuple[][] = values(groupedByTimeOfDay);

  // And sort by start time
  valuesGroupedByTimeOfDay.sort((meetingsInAday) => {
    const zero = moment(meetingsInAday[0].start).startOf('day');
    return meetingsInAday[0].start.diff(zero);
  });

  return flatten(valuesGroupedByTimeOfDay);
}

const getFormattedSections = (sections: any): Section[] => {
  const formattedSections: Section[] = [];

  sections.forEach((section) => {
    const formattedMeetings: Meeting[] = [];

    section.meetings.forEach((meeting) => {
      formattedMeetings.push({
        location: meeting.where,
        startDate: moment((meeting.startDate + 1) * DAY_IN_MILLISECONDS),
        endDate: moment((meeting.endDate + 1) * DAY_IN_MILLISECONDS),
        times: getGroupedByTimeOfDay(meeting.times),
      });
    });

    section.meetings = formattedMeetings;
    formattedSections.push(section);
  });

  return formattedSections;
}

function ResultsLoader({ results, loadMore }: ResultsLoaderProps) {
  return (
    <InfiniteScroll
      dataLength={ results.length }
      next={ loadMore }
      hasMore
      loader={ null }
    >
      <div className='five column row'>
        <div className='page-home'>
          {results.filter((result) => result !== null && result !== undefined).map((result) => {
            return (
              <ResultItemMemoized
                key={ result.type === 'class' ? Keys.getClassHash(result.class) : result.employee.id }
                result={ result }
              />
            )
          })}
        </div>
      </div>
    </InfiniteScroll>
  )
}

// Memoize result items to avoid unneeded re-renders and to reuse
// If the Panels are updated to function components, we can memoize them instead and remove this
const ResultItemMemoized = React.memo(({ result }:{result}) => {
  if (result.type === 'class') {
    const course = result.class;
    // TODO: Can we get rid of this clone deep?
    course.sections = getFormattedSections(cloneDeep(result.sections));
    return macros.isMobile ? <MobileSearchResult course={ course } /> : <SearchResult course={ course } />;
  }

  if (result.type === 'employee') {
    return <EmployeePanel employee={ result.employee } />;
  }

  macros.log('Unknown type', result.type);
  return null;
});

export default ResultsLoader;