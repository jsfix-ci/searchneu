import { GetStaticPathsResult, GetStaticProps } from 'next';
import { Campus } from '../components/types';
import Home from './[campus]/[termId]';

export default Home;

export function getStaticPaths(): GetStaticPathsResult {
  const result: GetStaticPathsResult = { paths: [], fallback: false };

  for (const campus of Object.values(Campus)) {
    result.paths.push({
      params: { campus },
    });
  }
  return result;
}

export const getStaticProps: GetStaticProps = async () => {
  return { props: {} };
};
