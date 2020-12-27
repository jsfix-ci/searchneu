/*
 * This file is part of Search NEU and licensed under AGPL3.
 * See the license file in the root folder for details.
 */
import React, { useReducer, useCallback } from 'react';
import { useRouter } from 'next/router'
import _ from 'lodash';
import useDeepCompareEffect from 'use-deep-compare-effect';
import logo from '../images/logo_red.svg';
import FilterButton from '../images/FilterButton.svg'
import search from '../search';
import macros from '../macros';
import SearchBar from '../ResultsPage/SearchBar';
import Footer from '../Footer';
import useSearch from '../ResultsPage/useSearch';
import FilterPanel from '../ResultsPage/FilterPanel';
import FilterPills from '../ResultsPage/FilterPills';
import FeedbackModal from '../ResultsPage/FeedbackModal/FeedbackModal';
import EmptyResultsContainer from '../ResultsPage/EmptyResultsContainer';
import MobileSearchOverlay from '../ResultsPage/MobileSearchOverlay';
import useAtTop from '../ResultsPage/useAtTop';
import {
  FilterSelection, QUERY_PARAM_ENCODERS, DEFAULT_FILTER_SELECTION, areFiltersSet,
} from '../ResultsPage/filters';
import ResultsLoader from '../ResultsPage/ResultsLoader';
import {
  BLANK_SEARCH_RESULT, SearchResult, Campus,
} from '../types';
import SearchDropdown from '../ResultsPage/SearchDropdown';
import {
  getAllCampusDropdownOptions, getTermDropdownOptionsForCampus, getCampusByLastDigit, getRoundedTerm,
} from '../global';

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

enum ActionType {
  SET_TERM = 'SET_TERM',
  SET_CAMPUS = 'SET_CAMPUS',
}

type Actions = {
  type: ActionType.SET_CAMPUS,
  pushTermString: (s: string) => void;
  nextCampus: string,
} | {
  type: ActionType.SET_TERM,
  pushTermString: (s: string) => void;
  nextTermString: string
};

interface CampusTermState {
  campus: string;
  termString: string;
}

function stateReducer(prevState: Readonly<CampusTermState>, action: Actions) {
  const nextState = { ...prevState };

  switch (action.type) {
    case ActionType.SET_CAMPUS: {
      nextState.campus = action.nextCampus;
      const newTermString = getRoundedTerm(action.nextCampus as Campus, prevState.termString);
      nextState.termString = newTermString;
      action.pushTermString(newTermString);
      break;
    }
    case ActionType.SET_TERM: {
      nextState.termString = action.nextTermString;
      action.pushTermString(action.nextTermString);
      break;
    }
    default: throw new Error('aiya');
  }

  return nextState;
}

function initializer(params: ReturnType<typeof useParams>): CampusTermState {
  const { termId } = params;
  return {
    campus: getCampusByLastDigit(termId.charAt(termId.length - 1)).toString(),
    termString: termId,
  }
}

export default function Results() {
  const atTop = useAtTop();
  const router = useRouter();
  const [showOverlay, setShowOverlay] = useQueryParam('overlay', BooleanParam);
  const { query = '' } = useParams<{ query: string }>();
  const [qParams, setQParams] = useQueryParams(QUERY_PARAM_ENCODERS);

  //const [campus, setCampus] = useState(getCampusByLastDigit(termId.charAt(termId.length - 1)).toString())
  const [{ campus, termString: termId }, dispatch] = useReducer(stateReducer, useParams(), initializer)
  const allCampuses = getAllCampusDropdownOptions()

  const setSearchQuery = (q: string) => { router.push(`/${termId}/${q}${window.location.search}`); }
  const pushTermString = useCallback((t: string) => { router.push(`/${t}/${query}${window.location.search}`); }, [router, query]);

  const filters: FilterSelection = _.merge({}, DEFAULT_FILTER_SELECTION, qParams);

  const searchParams: SearchParams = {
    termId, query, filters,
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
        <img src={ logo } className='Results__Logo' alt='logo' onClick={ () => { router.push('/'); } } />
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
              onChange={ (nextCampus) => dispatch({ type: ActionType.SET_CAMPUS, nextCampus, pushTermString }) }
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
              onChange={ (nextTermString) => dispatch({ type: ActionType.SET_TERM, nextTermString, pushTermString }) }
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
