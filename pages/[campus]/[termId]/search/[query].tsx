/*
 * This file is part of Search NEU and licensed under AGPL3.
 * See the license file in the root folder for details.
 */
import _ from 'lodash';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { ReactElement, useCallback } from 'react';
import { BooleanParam, useQueryParam, useQueryParams } from 'use-query-params';
import Footer from '../../../../components/Footer';
import {
  getAllCampusDropdownOptions,
  getRoundedTerm,
  getTermDropdownOptionsForCampus,
} from '../../../../components/global';
import FilterButton from '../../../../components/icons/FilterButton.svg';
import Logo from '../../../../components/icons/Logo';
import macros from '../../../../components/macros';
import EmptyResultsContainer from '../../../../components/ResultsPage/EmptyResultsContainer';
import FeedbackModal from '../../../../components/ResultsPage/FeedbackModal/FeedbackModal';
import FilterPanel from '../../../../components/ResultsPage/FilterPanel';
import FilterPills from '../../../../components/ResultsPage/FilterPills';
import {
  areFiltersSet,
  DEFAULT_FILTER_SELECTION,
  FilterSelection,
  QUERY_PARAM_ENCODERS,
} from '../../../../components/ResultsPage/filters';
import MobileSearchOverlay from '../../../../components/ResultsPage/MobileSearchOverlay';
import ResultsLoader from '../../../../components/ResultsPage/ResultsLoader';
import SearchBar from '../../../../components/ResultsPage/SearchBar';
import SearchDropdown from '../../../../components/ResultsPage/SearchDropdown';
import useAtTop from '../../../../components/ResultsPage/useAtTop';
import useSearch, {
  SearchParams,
} from '../../../../components/ResultsPage/useSearch';
import { Campus, EMPTY_FILTER_OPTIONS } from '../../../../components/types';

export default function Results(): ReactElement {
  const atTop = useAtTop();
  const router = useRouter();
  const [showOverlay, setShowOverlay] = useQueryParam('overlay', BooleanParam);
  const query = (router.query.query as string) || '';
  const termId = router.query.termId as string;
  const campus = router.query.campus as string;

  const [qParams, setQParams] = useQueryParams(QUERY_PARAM_ENCODERS);
  const allCampuses = getAllCampusDropdownOptions();

  const setSearchQuery = (q: string): void => {
    router.push(`/${campus}/${termId}/search/${q}${window.location.search}`);
  };
  const setTermAndCampus = useCallback(
    (t: string, newCampus: string) => {
      router.push(
        `/${newCampus}/${t}/search/${query}${window.location.search}`
      );
    },
    [router, query]
  );

  const filters: FilterSelection = _.merge(
    {},
    DEFAULT_FILTER_SELECTION,
    qParams
  );

  const searchParams: SearchParams = {
    termId,
    query,
    filters,
  };

  const { searchData, loadMore } = useSearch(searchParams);

  if (!query && !termId) {
    return null;
  }

  const filtersAreSet: boolean = areFiltersSet(filters);

  if (showOverlay && macros.isMobile) {
    return (
      <MobileSearchOverlay
        query={query}
        filterSelection={filters}
        filterOptions={searchData?.filterOptions || EMPTY_FILTER_OPTIONS()}
        setFilterPills={setQParams}
        setQuery={(q: string) => setSearchQuery(q)}
        onExecute={() => setShowOverlay(false)}
      />
    );
  }

  return (
    <div>
      <Head>
        <title>Search NEU - {query}</title>
      </Head>
      <div className={`Results_Header ${atTop ? 'Results_Header-top' : ''}`}>
        <div
          onClick={() => {
            router.push(`/${campus}/${termId}`);
          }}
        >
          <Logo
            className="Results__Logo"
            aria-label="logo"
            campus={Campus.NEU}
          />
        </div>
        <div className="Results__spacer" />
        {macros.isMobile && (
          <div className="Results__mobileSearchFilterWrapper">
            <div className="Results__searchwrapper">
              <SearchBar
                onSearch={setSearchQuery}
                query={query}
                buttonColor="red"
              />
            </div>
            <FilterButton
              className="Results__filterButton"
              aria-label="filter-button"
              onClick={() => {
                if (macros.isMobile) {
                  setShowOverlay(true);
                }
              }}
            />
          </div>
        )}
        {!macros.isMobile && (
          <div className="Results__searchwrapper">
            <SearchBar
              onSearch={setSearchQuery}
              query={query}
              buttonColor="red"
            />
          </div>
        )}
        <div className="Breadcrumb_Container">
          <div className="Breadcrumb_Container__dropDownContainer">
            <SearchDropdown
              options={allCampuses}
              value={campus}
              placeholder="Select a campus"
              onChange={(nextCampus) => {
                setTermAndCampus(
                  getRoundedTerm(nextCampus as Campus, termId),
                  nextCampus
                );
              }}
              className="searchDropdown"
              compact={false}
            />
          </div>
          <span className="Breadcrumb_Container__slash">/</span>
          <div className="Breadcrumb_Container__dropDownContainer">
            <SearchDropdown
              options={getTermDropdownOptionsForCampus(
                Campus[campus.toUpperCase()]
              )}
              value={termId}
              placeholder="Select a term"
              onChange={(nextTermString) => {
                setTermAndCampus(nextTermString, campus);
              }}
              className="searchDropdown"
              compact={false}
              key={campus}
            />
          </div>
        </div>
      </div>
      {!macros.isMobile && <FeedbackModal />}
      <div className="Results_Container">
        {!macros.isMobile && (
          <>
            <div className="Results_SidebarWrapper">
              <FilterPanel
                options={searchData?.filterOptions || EMPTY_FILTER_OPTIONS()}
                selected={filters}
                setActive={setQParams}
              />
            </div>
            <div className="Results_SidebarSpacer" />
          </>
        )}
        <div className="Results_Main">
          {filtersAreSet && (
            <FilterPills filters={filters} setFilters={setQParams} />
          )}
          {!searchData && <div style={{ visibility: 'hidden' }} />}
          {searchData && searchData.results.length === 0 && (
            <EmptyResultsContainer
              query={query}
              filtersAreSet={filtersAreSet}
              setFilters={setQParams}
            />
          )}
          {searchData && searchData.results.length > 0 && (
            <ResultsLoader results={searchData.results} loadMore={loadMore} />
          )}
          <Footer />
        </div>
      </div>
      <div className="botttomPadding" />
    </div>
  );
}

// this prevents Next js static optimization so we don't have a second search query sent to the backend
export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};
