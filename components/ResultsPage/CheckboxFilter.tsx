import React, { ReactElement } from 'react';
import CheckboxGroup from './CheckboxGroup';
import { Option } from './filters';
import { getTotalAggregation } from '../../utils/filterUtils';

interface CheckboxFilterProps {
  title: string;
  options: Option[];
  selected: string[];
  setActive: (a: string[]) => void;
}

export default function CheckboxFilter({
  title,
  options,
  selected,
  setActive,
}: CheckboxFilterProps): ReactElement {
  return (
    <div className="CheckboxFilter">
      <span className="CheckboxFilter__title">
        {title}
        {getTotalAggregation(selected, options)}
      </span>
      <CheckboxGroup
        name="CheckboxFilter"
        value={selected}
        onChange={setActive}
      >
        {(Checkbox) => (
          <>
            {options.map((option) => (
              <div key={option.value} className="CheckboxFilter__element">
                <label className="CheckboxFilter__text">
                  <Checkbox value={option.value} />
                  <span className="CheckboxFilter__checkbox" />
                  {option.value}
                  <span className="CheckboxFilter__count">{option.count}</span>
                </label>
              </div>
            ))}
          </>
        )}
      </CheckboxGroup>
    </div>
  );
}
