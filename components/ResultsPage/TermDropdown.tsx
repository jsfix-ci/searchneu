import React, { ReactElement } from 'react';
import 'semantic-ui-css/components/dropdown.min.css';
import 'semantic-ui-css/components/transition.min.css';
import { Dropdown } from 'semantic-ui-react';

export const termDropDownOptions = [
  {
    text: 'Spring 2021',
    value: '202130',
  },
  {
    text: 'Fall 2020',
    value: '202110',
  },
  {
    text: 'Summer I 2020',
    value: '202040',
  },
  {
    text: 'Summer II 2020',
    value: '202060',
  },
  {
    text: 'Summer Full 2020',
    value: '202050',
  },
];

interface TermDropdownProps {
  termId: string;
  onChange: (t: string) => void;
  compact: boolean;
}

function TermDropdown({
  termId,
  onChange,
  compact = false,
}: TermDropdownProps): ReactElement {
  return (
    <Dropdown
      selection
      fluid
      compact={compact}
      value={termId}
      placeholder="Spring 2020"
      className={`termdropdown ${compact ? 'termdropdown--compact' : ''}`}
      options={termDropDownOptions}
      onChange={(e, data) => onChange(data.value as string)}
    />
  );
}

export default React.memo(TermDropdown);
