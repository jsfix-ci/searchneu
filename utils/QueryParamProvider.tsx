import { useRouter } from 'next/router';
import React, { memo, ReactElement, useMemo } from 'react';
import { QueryParamProvider as ContextProvider } from 'use-query-params';

export const QueryParamProviderComponent = (props: {
  children?: React.ReactNode;
}): ReactElement => {
  const { children, ...rest } = props;
  const router = useRouter();
  const match = router.asPath.match(/[^?]+/);
  const pathname = match ? match[0] : router.asPath;

  const location = useMemo(
    () =>
      process.browser
        ? window.location
        : ({
            search: router.asPath.replace(/[^?]+/u, ''),
          } as Location),
    [router.asPath]
  );

  const history = useMemo(
    () => ({
      push: ({ search }: Location): Promise<boolean> =>
        router.push(
          { pathname: router.pathname, query: router.query },
          { search, pathname },
          { shallow: true }
        ),
      replace: ({ search }: Location): Promise<boolean> =>
        router.replace(
          { pathname: router.pathname, query: router.query },
          { search, pathname },
          { shallow: true }
        ),
    }),
    // yeah we need this since we don't no want reference equality
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pathname, router.pathname, router.query, location.pathname]
  );

  return (
    <ContextProvider {...rest} history={history} location={location}>
      {children}
    </ContextProvider>
  );
};

export const QueryParamProvider = memo(QueryParamProviderComponent);
