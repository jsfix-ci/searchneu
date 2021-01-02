/*
 * This file is part of Search NEU and licensed under AGPL3.
 * See the license file in the root folder for details.
 */

import axios from 'axios';
import { isEqual, pickBy } from 'lodash';
import { useSWRInfinite } from 'swr';
import { SearchResult } from '../types';
import { DEFAULT_FILTER_SELECTION, FilterSelection } from './filters';

export interface SearchParams {
  termId: string;
  query: string;
  filters: FilterSelection;
}
interface UseSearchReturn {
  searchData: SearchResult;
  loadMore: () => void;
}

const apiVersion = 2;

/**
 * P is the type of the search params, R is the type of the result item
 *
 * @param initialParams initial params to give fetchresults
 * @param fetchResults function to get the results
 * @returns
 *  results is a list of results
 *  isReady represents whether the results are ready to be displayed
 *  loadMore is a function that triggers loading the next page when invoked
 *  doSearch triggers search execution. Expects a object containing search params
 */
export default function useSearch({
  termId,
  query,
  filters,
}: SearchParams): UseSearchReturn {
  const getKey = (pageIndex: number): string => {
    const nonDefaultFilters = pickBy(
      filters,
      (v, k: keyof FilterSelection) => !isEqual(v, DEFAULT_FILTER_SELECTION[k])
    );
    const stringFilters = JSON.stringify(
      nonDefaultFilters,
      Object.keys(nonDefaultFilters).sort()
    );

    const url = new URL(
      'https://searchneu.com/search?' +
        new URLSearchParams({
          // TODO: is this how we're gonna access the api in the future?
          query,
          termId,
          minIndex: String(pageIndex * 10),
          maxIndex: String((pageIndex + 1) * 10),
          apiVersion: String(apiVersion),
          filters: stringFilters,
        }).toString()
    ).toString();

    return url;
  };

  const { data, setSize } = useSWRInfinite(
    getKey,
    async (url): Promise<SearchResult> => {
      return (await axios.get(url)).data;
    }
  );

  const returnedData = data && {
    filterOptions: data[0].filterOptions,
    results: data.map((d) => d.results).flat(),
  };

  return {
    searchData: returnedData,
    loadMore: () => setSize((s) => s + 1),
  };
}
