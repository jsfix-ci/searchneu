import React, { ReactElement } from 'react';
import { Campus } from '../types';
import { useRouter } from 'next/router';

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
      Hello! Click me :O
    </div>
  );
};

export default ExploratorySearchButton;
