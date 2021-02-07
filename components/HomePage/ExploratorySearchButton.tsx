import React, { ReactElement } from 'react';
import { Campus } from '../types';
import { useRouter } from 'next/router';
import { getTermName } from '../global';

interface ExploratorySearchButtonProps {
  termId: string;
  campus: Campus;
}

const ExploratorySearchButton = ({
  termId,
  campus,
}: ExploratorySearchButtonProps): ReactElement => {
  const router = useRouter();
  return (
    <div
      className="searchByFilters"
      onClick={() => router.push(`/${campus}/${termId}/search`)}
    >
      View all classes for
      <span className="selectedCampusAndTerm">{` ${campus} ${getTermName(
        termId
      )}`}</span>
    </div>
  );
};

export default ExploratorySearchButton;
