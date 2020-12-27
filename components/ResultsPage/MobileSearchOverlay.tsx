import React, { useState, useEffect } from 'react';
import FilterPanel from './FilterPanel';
import FilterPills from './FilterPills';
import macros from '../macros';
import IconClose from '../images/IconClose';
import { FilterSelection, FilterOptions, areFiltersSet } from './filters';

/**
 * setFilterPills sets the selected filters
 * setQuery sets the search query from the searchbar
 * onExecute indicates the query should be run and we should return to the results page
 * onClose indicates the user wants to close the overlay and return to wherever we were before
 * filterSelection is the list of selected filters
 * filterOptions is the available options for the filters
 * query is the search query
 */
interface MobileSearchOverlayProps {
  setFilterPills: (f: FilterSelection) => void,
  setQuery: (q: string) => void,
  onExecute: () => void,
  filterSelection: FilterSelection,
  filterOptions: FilterOptions,
  query: string,
}

export default function MobileSearchOverlay({
  setFilterPills, setQuery, filterSelection, filterOptions, query, onExecute,
}: MobileSearchOverlayProps) {
  // controlledQuery represents what's typed into the searchbar - even BEFORE enter is hit
  const [controlledQuery, setControlledQuery] = useState(query);

  // Keep the controlledQuery in sync with the query prop (eg. browser popState)
  useEffect(() => {
    setControlledQuery(query);
  }, [query]);

  // Hide keyboard and execute search
  const search = () => {
    if (macros.isMobile) {
      if (document.activeElement && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }
    setQuery(controlledQuery);
    onExecute();
  };
  return (
    <div className='msearch-overlay'>
      <div className='msearch-overlay__content'>
        <div className='msearch-overlay__pills'>
          {areFiltersSet(filterSelection) && (
            <FilterPills
              filters={ filterSelection }
              setFilters={ setFilterPills }
            />
          )}
        </div>
        <div
          className='msearch-overlay__back'
          role='button'
          tabIndex={ 0 }
          onClick={ search }
        >
          <IconClose fill='#d41b2c' />
        </div>
        <FilterPanel
          options={ filterOptions }
          selected={ filterSelection }
          setActive={ setFilterPills }
        />
      </div>
      <div
        tabIndex={ 0 }
        className='msearch-overlay__execute'
        onClick={ search }
        role='button'
      >
        View all results
      </div>
    </div>
  )
}
