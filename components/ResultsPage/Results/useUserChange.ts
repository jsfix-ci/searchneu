import { useEffect, useState } from 'react';
import Keys from '../../Keys';
import { Course } from '../../types';
import user from '../../user';

export default function useUserChange(aClass: Course): boolean {
  const [userIsWatchingClass, setUserIsWatchingClass] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onUserUpdate = () => {
    // Show the notification toggles if the user is watching this class.
    const isWatching = user.isWatchingClass(Keys.getClassHash(aClass));
    if (isWatching !== userIsWatchingClass) {
      setUserIsWatchingClass(isWatching);
    }
  };

  useEffect(() => {
    setUserIsWatchingClass(user.isWatchingClass(Keys.getClassHash(aClass)));
    user.registerUserChangeHandler(onUserUpdate);
    return () => user.unregisterUserChangeHandler(onUserUpdate);
  }, [onUserUpdate]);

  return userIsWatchingClass;
}
