/*
 * This file is part of Search NEU and is licensed under AGPL3.
 * See the license file in the root folder for details.
 */

import { uniqueId } from 'lodash';
import React, { ReactElement, useState } from 'react';
import Tooltip, { TooltipDirection } from '../Tooltip';
import { Course } from '../types';

import { UserInfo } from '../../components/types';

type CourseCheckBoxProps = {
  checked: boolean;
  onCheckboxClick: () => void;
};

export default function CourseCheckBox({
  checked,
  onCheckboxClick,
}: CourseCheckBoxProps): ReactElement {
  const [notifSwitchId] = useState(uniqueId('notifSwitch-'));

  return (
    <div className="signUpSwitch">
      <div className="notifSwitch">
        <input
          checked={checked}
          onChange={onCheckboxClick}
          className="notif-switch-checkbox"
          id={notifSwitchId}
          type="checkbox"
        />
        <label className="notif-switch-label" htmlFor={notifSwitchId}>
          <span className="notif-switch-button" />
        </label>
      </div>
      <Tooltip
        text={
          checked
            ? 'Unsubscribe from notifications for this course.'
            : 'Subscribe to notifications for this course'
        }
        direction={TooltipDirection.Up}
      />
    </div>
  );
}
