import { gql } from 'apollo-server';

const typeDef = gql`
  extend type Query {
    search(
      termId: Int!
      query: String
      subject: [String!]
      nupath: [String!]
      campus: [String!]
      classType: [String!]
      classIdRange: IntRange
    ): [SearchResult]
  }

  input IntRange {
    min: Int!
    max: Int!
  }

  union SearchResult = ClassOccurrence | Employee
`;

export default typeDef;
