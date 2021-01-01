import { GraphQLClient } from 'graphql-request';
import { getSdk } from '../generated/graphql';

const ENDPOINT = 'https://searchneu.com/graphql';

// GraphQL codegen creates a typed SDK by pulling out all operations in *.graphql files in the project.
export const gqlClient = getSdk(new GraphQLClient(ENDPOINT));
