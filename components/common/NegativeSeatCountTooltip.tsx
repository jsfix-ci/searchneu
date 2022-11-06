import React, { ReactElement } from 'react';
import IconInfo from '../icons/info-icon.svg';
import Tooltip, { TooltipDirection } from '../Tooltip';

const TOOLTIP_MESSAGE =
  'Negative seat counts are displayed when students override into a course.';
export default function SearchInfoIcon() {
  return (
    <div className="SearchInfoIcon">
      <IconInfo className="SearchInfoIcon__icon" />
      <Tooltip text={TOOLTIP_MESSAGE} direction={TooltipDirection.Down} />
    </div>
  );
}
