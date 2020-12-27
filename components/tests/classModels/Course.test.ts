import Course from '../../classModels/Course';
import mockData from '../../panels/tests/mockData';

let course : Course;

beforeEach(() => {
  course = Course.create(mockData.cs2500Config);
  course.loadSectionsFromServerList(mockData.course2500Sections);
});

describe('tests basic getters', () => {
  it('hashing', () => {
    expect(course.getHash()).toBe('neu.edu/202110/CS/2500');
  });

  it('is at least one section full', () => {
    expect(course.hasAtLeastOneSectionFull()).toBe(true);
  });
});
