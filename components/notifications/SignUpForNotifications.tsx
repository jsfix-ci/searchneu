/*
 * This file is part of Search NEU and licensed under AGPL3.
 * See the license file in the root folder for details.
 */

import React, { ReactElement, useEffect, useState } from 'react';
import { UserInfo } from '../types';
import Keys from '../Keys';
import CourseCheckBox from '../panels/CourseCheckBox';
import SignUpModal, { Step } from './modal/SignUpModal';
import NotifSignUpButton from '../ResultsPage/Results/NotifSignUpButton';
import { Course } from '../types';
import axios from 'axios';

type SignUpForNotificationsProps = {
  course: Course;
  userInfo: UserInfo;
  onSignIn: (token: string) => void;
  showNotificationSignup: boolean;
  fetchUserInfo: () => void;
};

export default function SignUpForNotifications({
  course,
  userInfo,
  onSignIn,
  showNotificationSignup,
  fetchUserInfo,
}: SignUpForNotificationsProps): ReactElement {
  userInfo = {
    token: null,
    phoneNumber: null,
    courseIds: [],
    sectionIds: [],
  };

  const [showModal, setShowModal] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [checked, setChecked] = useState(
    userInfo && userInfo.courseIds.includes(Keys.getClassHash(course))
  );

  // useEffect(() => {
  //   setChecked(userInfo && userInfo.courseIds.includes(Keys.getClassHash(course)));
  // }, [userInfo]);

  const onNotifSignUp = (): void => {
    setShowModal(true);
  };

  const numOpenSections = course.sections.reduce((prev, cur) => {
    if (cur.seatsRemaining > 0) {
      return prev + 1;
    }
    return prev;
  }, 0);

  const openSectionsText =
    numOpenSections === 1
      ? 'There is 1 section with seats left.'
      : `There are ${numOpenSections} sections with seats left.`;

  function onCheckboxClick(): void {
    if (requesting) return; // avoid race conditions by locking out other requests
    setRequesting(true);

    if (checked) {
      setChecked(false); // switch before request to avoid lag
      axios
        .delete(
          `${process.env.NEXT_PUBLIC_NOTIFS_ENDPOINT}/user/subscriptions`,
          {
            data: {
              token: userInfo.token,
              sectionIds: [],
              courseIds: [Keys.getClassHash(course)],
            },
          }
        )
        .catch((e) => {
          setShowModal(true);
          setChecked(true);
          console.error(e);
        })
        .then(() => fetchUserInfo())
        .finally(() => setRequesting(false));
    } else {
      setChecked(true); // switch before request to avoid lag
      axios
        .put(`${process.env.NEXT_PUBLIC_NOTIFS_ENDPOINT}/user/subscriptions`, {
          token: userInfo.token,
          sectionIds: [],
          courseIds: [Keys.getClassHash(course)],
        })
        .catch((e) => {
          setShowModal(true);
          setChecked(false);
          console.error(e);
        })
        .then(() => fetchUserInfo())
        .finally(() => setRequesting(false));
    }
  }

  return showNotificationSignup ? (
    userInfo ? (
      <div className="DesktopSectionPanel__notifs">
        <span className="checkboxLabel">
          Notify me when new sections are added:
        </span>
        <CourseCheckBox checked={checked} onCheckboxClick={onCheckboxClick} />
        <SignUpModal
          visible={showModal}
          onCancel={() => setShowModal(false)}
          onSignIn={onSignIn}
          onSuccess={() => setShowModal(false)}
          defaultStep={Step.Failed}
        />
      </div>
    ) : (
      <>
        <NotifSignUpButton onNotifSignUp={onNotifSignUp} />
        <SignUpModal
          visible={showModal}
          onCancel={() => setShowModal(false)}
          onSignIn={onSignIn}
          onSuccess={() => setShowModal(false)}
        />
      </>
    )
  ) : (
    <div className="allSeatsAvailable">
      <span>{openSectionsText}</span>
    </div>
  );
}
