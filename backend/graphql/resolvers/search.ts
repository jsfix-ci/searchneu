import { identity, pickBy, result } from 'lodash';
import searcher from '../../searcher';
import { SearchResult } from '../../search_types';
import { Course, Employee } from '../../types';

interface SearchArgs {
  termId: number;
  query?: string;
  subject?: string[];
  nupath?: string[];
  campus?: string[];
  classType?: string[];
  classIdRange?: { min: number; max: number };
}
const resolvers = {
  Query: {
    search: async (
      parent,
      args: SearchArgs,
    ): Promise<(Course | Employee)[]> => {
      const results = await searcher.search(
        args.query || '',
        String(args.termId),
        0,
        10,
        pickBy(
          {
            subject: args.subject,
            nupath: args.nupath,
            campus: args.campus,
            classType: args.classType,
            classIdRange: args.classIdRange,
          },
          identity,
        ),
      );
      return results.searchContent.map((r) => {
        if (r.type === 'employee') {
          return r.employee;
        }
        return r.class;
      });
    },
  },

  SearchResult: {
    // eslint-disable-next-line no-underscore-dangle
    __resolveType(obj: Course | Employee) {
      return 'firstName' in obj ? 'Employee' : 'ClassOccurrence';
    },
  },
};

export default resolvers;
