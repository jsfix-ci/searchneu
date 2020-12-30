/*
 * This file is part of Search NEU and licensed under AGPL3.
 * See the license file in the root folder for details.
 */
import React, { ReactElement } from 'react';
import macros from '../macros';
import { DEFAULT_FILTER_SELECTION, FilterSelection } from './filters';

import 'semantic-ui-css/components/segment.min.css';
interface EmptyResultsProps {
  query: string;
  filtersAreSet: boolean;
  setFilters: (f: FilterSelection) => void;
}

/**
 * Empty page that signifies to user no results were found. If filters are applied, suggests clearing them.
 * If no filters are applied, suggests search on Google.
 */

export default function EmptyResultsContainer({
  query,
  filtersAreSet,
  setFilters,
}: EmptyResultsProps): ReactElement {
  return (
    <div className="Results_EmptyContainer">
      <h3> No Results Found </h3>{' '}
      {filtersAreSet ? (
        <div className="Results_EmptyBottomLine">
          {' '}
          Try
          <div
            className="no-results__clear"
            role="button"
            tabIndex={0}
            onClick={() => setFilters(DEFAULT_FILTER_SELECTION)}
          >
            clearing
          </div>
          some filters to expand your search!
        </div>
      ) : (
        <div className="Results_EmptyBottomLine">
          Want to&nbsp;
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`https://google.com/search?q=${macros.collegeName} ${query}`}
          >
            search for&nbsp;
            <div className="ui compact segment Results_EmptyText">
              <p>{query}</p>
            </div>
            &nbsp;on Google
          </a>
          ?
        </div>
      )}
    </div>
  );
}
