import _ from 'lodash';
import React, { ReactElement } from 'react';
import CheckboxFilter from './CheckboxFilter';
import DropdownFilter from './DropdownFilter';
import { FilterOptions, FilterSelection, FILTERS_IN_ORDER } from './filters';
import RangeFilter from './RangeFilter';
import { useRouter } from 'next/router';

export interface FilterPanelProps {
  options: FilterOptions;
  selected: FilterSelection;
  setActive: (f: FilterSelection) => void;
}

function FilterPanel({
  options,
  selected,
  setActive,
}: FilterPanelProps): ReactElement {
  const router = useRouter();
  const campus = router.query.campus as string;
  return (
    <div className="FilterPanel">
      {FILTERS_IN_ORDER.map(({ key, display, category }, index) => {
        const aFilter = selected[key];
        const setActiveFilter = (a): void => setActive({ [key]: a });
        console.log(`Campus: ${campus}, Display: ${display}`);
        return (
          <React.Fragment key={index}>
            {category === 'Dropdown' &&
              (campus !== 'NEU' || display !== 'Term Half') && (
                <DropdownFilter
                  title={display}
                  options={options[key]}
                  selected={aFilter}
                  setActive={setActiveFilter}
                />
              )}
            {category === 'Checkboxes' && (
              <CheckboxFilter
                title={display}
                options={options[key]}
                selected={aFilter}
                setActive={setActiveFilter}
              />
            )}
            {category === 'Range' && (
              <RangeFilter
                title={display}
                selected={aFilter}
                setActive={setActiveFilter}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default React.memo(FilterPanel, _.isEqual);
