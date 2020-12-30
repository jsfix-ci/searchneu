/*
 * This file is part of Search NEU and is licensed under AGPL3.
 * See the license file in the root folder for details.
 */

import { uniqueId } from 'lodash';
import React, { ReactElement, useEffect, useState } from 'react';
import { Icon } from 'semantic-ui-react';
import IconCheckMark from '../icons/IconCheckmark';
import Keys from '../Keys';
import macros from '../macros';
import { Section } from '../types';
import user from '../user';

type NotifCheckBoxProps = {
  section: Section;
};

export default function NotifCheckBox({
  section,
}: NotifCheckBoxProps): ReactElement {
  const [checked, setChecked] = useState(
    user.isWatchingSection(Keys.getSectionHash(section))
  );
  const [notifSwitchId] = useState(uniqueId('notifSwitch-'));

  function onCheckboxClick(): void {
    if (checked) {
      user.removeSection(section);
      setChecked(false);
    } else {
      user.addSection(section);
      setChecked(true);
    }
  }

  useEffect(() => {
    function onUserUpdate(): void {
      setChecked(user.isWatchingSection(Keys.getSectionHash(section)));
    }
    user.registerUserChangeHandler(onUserUpdate);
    return () => user.unregisterUserChangeHandler(onUserUpdate);
  }, [section]);

  if (section.seatsRemaining > 5) {
    return (
      <div
        style={{ color: '#d3d3d3' }}
        data-tip="There are still seats remaining for this section"
        className="inlineBlock"
      >
        <Icon name="info circle" className="myIcon" />
      </div>
    );
  }

  return (
    <div
      data-tip="Sign up for notifications for this section"
      className="inlineBlock"
    >
      {macros.isMobile ? (
        <div
          className={
            checked ? 'notifSubscribeButton--checked' : 'notifSubscribeButton'
          }
          role="button"
          tabIndex={0}
          onClick={onCheckboxClick}
        >
          {checked && <IconCheckMark />}
          <span>{checked ? 'Subscribed' : 'Subscribe'}</span>
        </div>
      ) : (
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
      )}
    </div>
  );
}
