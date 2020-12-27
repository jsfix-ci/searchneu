/*
 * This file is part of Search NEU and licensed under AGPL3.
 * See the license file in the root folder for details.
 */
import _ from 'lodash';
import { useRouter } from 'next/router';
import React, { useCallback } from 'react';
import useDeepCompareEffect from 'use-deep-compare-effect';
import { BooleanParam, useQueryParam, useQueryParams } from 'use-query-params';
import Footer from '../../components/Footer';
import {
  getAllCampusDropdownOptions, getCampusByLastDigit, getRoundedTerm, getTermDropdownOptionsForCampus
} from '../../components/global';
import FilterButton from '../../components/images/FilterButton.svg';
import Logo from '../../components/images/Logo';
import macros from '../../components/macros';
import EmptyResultsContainer from '../../components/ResultsPage/EmptyResultsContainer';
import FeedbackModal from '../../components/ResultsPage/FeedbackModal/FeedbackModal';
import FilterPanel from '../../components/ResultsPage/FilterPanel';
import FilterPills from '../../components/ResultsPage/FilterPills';
import { areFiltersSet, DEFAULT_FILTER_SELECTION, FilterSelection, QUERY_PARAM_ENCODERS } from '../../components/ResultsPage/filters';
import MobileSearchOverlay from '../../components/ResultsPage/MobileSearchOverlay';
import ResultsLoader from '../../components/ResultsPage/ResultsLoader';
import SearchBar from '../../components/ResultsPage/SearchBar';
import SearchDropdown from '../../components/ResultsPage/SearchDropdown';
import useAtTop from '../../components/ResultsPage/useAtTop';
import useSearch from '../../components/ResultsPage/useSearch';
import search from '../../components/search';
import {
  BLANK_SEARCH_RESULT, Campus, SearchResult
} from '../../components/types';


interface SearchParams {
  termId: string,
  query: string,
  filters: FilterSelection
}

let count = 0;
// Log search queries to amplitude on enter.
function logSearch(searchQuery: string) {
  searchQuery = searchQuery.trim();

  if (searchQuery) {
    count++;
    macros.logAmplitudeEvent('Search', { query: searchQuery.toLowerCase(), sessionCount: count });
  }
}

// Retreive result data from backend.
const fetchResults = async ({ query, termId, filters }: SearchParams, page: number): Promise<SearchResult> => {
  const response: SearchResult = await search.search(query, termId, filters, (1 + page) * 10);
  if (page === 0) {
    logSearch(query);
  }
  return response;
};

export default function Results() {
  const atTop = useAtTop();
  const router = useRouter();
  const [showOverlay, setShowOverlay] = useQueryParam('overlay', BooleanParam);
  const query = router.query.query as string;
  const termId = router.query.termId as string;

  if (!query && !termId) {
    return null;
  }
  
  const [qParams, setQParams] = useQueryParams(QUERY_PARAM_ENCODERS);
  const campus = getCampusByLastDigit(termId.charAt(termId.length - 1)).toString();
  const allCampuses = getAllCampusDropdownOptions();

  const setSearchQuery = (q: string) => { router.push(`/${termId}/${q}${window.location.search}`); }
  const pushTermString = useCallback((t: string) => { router.push(`/${t}/${query}${window.location.search}`); }, [router, query]);

  const filters: FilterSelection = _.merge({}, DEFAULT_FILTER_SELECTION, qParams);

  const searchParams: SearchParams = {
    termId, query , filters,
  };

  const filtersAreSet: Boolean = areFiltersSet(filters);

  const us = useSearch(searchParams, BLANK_SEARCH_RESULT(), fetchResults);

  const {
    isReady, loadMore, doSearch,
  } = us;

  const { results, filterOptions } = us.results;

  useDeepCompareEffect(() => {
    doSearch(searchParams);
  }, [searchParams, doSearch]);

  if (showOverlay && macros.isMobile) {
    return (
      <MobileSearchOverlay
        query={ query }
        filterSelection={ filters }
        filterOptions={ filterOptions }
        setFilterPills={ setQParams }
        setQuery={ (q: string) => setSearchQuery(q) }
        onExecute={ () => setShowOverlay(false) }
      />
    )
  }

  return (
    <div>
      <div className={ `Results_Header ${atTop ? 'Results_Header-top' : ''}` }>
        <div onClick={ () => { router.push('/'); } }>
          <Logo className='Results__Logo' ariaLabel='logo' fill="#E63946"/>
          </div>
        <div className='Results__spacer' />
        {macros.isMobile
        && (
        <div className='Results__mobileSearchFilterWrapper'>
          <div className='Results__searchwrapper'>
            <SearchBar
              onSearch={ setSearchQuery }
              query={ query }
              buttonColor='red'
            />
          </div>
          <img
            src={ FilterButton }
            className='Results__filterButton'
            alt='filter-button'
            onClick={ () => {
              if (macros.isMobile) {
                setShowOverlay(true);
              }
            } }
          />
        </div>
        )}
        {!macros.isMobile
        && (
        <div className='Results__searchwrapper'>
          <SearchBar
            onSearch={ setSearchQuery }
            query={ query }
            buttonColor='red'
          />
        </div>
        )}
        <div className='Breadcrumb_Container'>
          <div className='Breadcrumb_Container__dropDownContainer'>
            <SearchDropdown
              options={ allCampuses }
              value={ campus }
              placeholder='Select a campus'
              onChange={ (nextCampus) => {
                pushTermString(getRoundedTerm(nextCampus as Campus, termId));
              }}
              className='searchDropdown'
              compact={ false }
            />
          </div>
          <span className='Breadcrumb_Container__slash'>/</span>
          <div className='Breadcrumb_Container__dropDownContainer'>
            <SearchDropdown
              options={ getTermDropdownOptionsForCampus(Campus[campus.toUpperCase()]) }
              value={ termId }
              placeholder='Select a term'
              onChange={ (nextTermString) => {
                pushTermString(nextTermString);
              }}
              className='searchDropdown'
              compact={ false }
              key={ campus }
            />
          </div>
        </div>
      </div>
      {!macros.isMobile && <FeedbackModal />}
      <div className='Results_Container'>
        {!macros.isMobile && (
          <>
            <div className='Results_SidebarWrapper'>
              <FilterPanel
                options={ filterOptions }
                selected={ filters }
                setActive={ setQParams }
              />
            </div>
            <div className='Results_SidebarSpacer' />
          </>
        )}
        <div className='Results_Main'>
          { filtersAreSet
          && <FilterPills filters={ filters } setFilters={ setQParams } />}
          {!isReady && <div style={{ visibility: 'hidden' }} />}
          {isReady && results.length === 0 && <EmptyResultsContainer query={ query } filtersAreSet={ filtersAreSet } setFilters={ setQParams } /> }
          {isReady && results.length > 0
            && (
              <ResultsLoader
                results={ results }
                loadMore={ loadMore }
              />
            )}
          <Footer />
        </div>
      </div>
      <div className='botttomPadding' />
    </div>

  );
}
