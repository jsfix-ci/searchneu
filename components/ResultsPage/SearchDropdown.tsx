import Link from 'next/link';
import React, { ReactElement } from 'react';
import { Dropdown, DropdownItemProps } from 'semantic-ui-react';

interface DropdownProps {
  options: DropdownItemProps[];
  value: string;
  placeholder: string;
  onChange: (t: string) => void;
  className: string;
  compact: boolean;
}

function SearchDropdown({
  options,
  value,
  placeholder,
  onChange,
  className = 'searchDropdown',
  compact = false,
}: DropdownProps): ReactElement {
  return (
    <Dropdown
      selection
      fluid
      compact={compact}
      value={value}
      placeholder={placeholder}
      className={`${className} ${compact ? `${className}--compact` : ''}`}
      options={options.map((o) => ({
        ...o,
        content: (
          <Link href="jfids">
            <a>{o.text}</a>
          </Link>
        ),
      }))}
      onChange={(e, data) => onChange(data.value as string)}
    />
  );
}

export default React.memo(SearchDropdown);
