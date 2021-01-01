import axios from 'axios';
import { pull } from 'lodash';
import useSWR from 'swr';
import { v4 } from 'uuid';
import Keys from '../components/Keys';
import macros from '../components/macros';
import { Course, Section, User } from '../components/types';
import { useLocalStorage } from './useLocalStorage';

type UseUserReturn = {
  user: User;
  subscribeToCourse: (course: Course) => Promise<void>;
  subscribeToSection: (section: Section) => Promise<void>;
  unsubscribeFromSection: (section: Section) => Promise<void>;
};

type UserCredentials = {
  loginKey: string;
  senderId: string;
};

export default function useUser(): UseUserReturn {
  const [
    { loginKey, senderId },
    setUserCredentials,
  ] = useLocalStorage<UserCredentials>('userCredentials', {
    loginKey: '',
    senderId: '',
  });

  if (!loginKey) {
    setUserCredentials({
      loginKey: v4(),
      senderId,
    });
  }

  const { data: user, error, mutate } = useSWR(
    `https://searchneu.com/user`,
    async (): Promise<User> =>
      await axios.post('https://searchneu.com/user', {
        loginKey,
      })
  );

  if (error) {
    macros.log('Data in localStorage is invalid, deleting');
    setUserCredentials({
      loginKey: '',
      senderId: '',
    });
  }

  if (!senderId && user?.user?.facebookMessengerId) {
    setUserCredentials({
      loginKey,
      senderId: user.user.facebookMessengerId,
    });
  }

  const subscribeToCourseUsingHash = async (
    courseHash: string
  ): Promise<void> => {
    const body = {
      loginKey,
      senderId,
      classHash: courseHash,
    };

    await axios.post('https://searchneu.com/subscription', { ...body });
  };

  const subscribeToCourse = async (course: Course): Promise<void> => {
    const courseHash = Keys.getClassHash(course);
    if (user?.user?.watchingClasses?.includes(courseHash)) {
      macros.error('user already watching class?', courseHash, user.user);
      return;
    }

    await subscribeToCourseUsingHash(courseHash);
    mutate();
  };

  const subscribeToSection = async (section: Section): Promise<void> => {
    if (section.seatsRemaining > 5) {
      macros.error('Not signing up for section that has over 5 seats open.');
      return;
    }
    const sectionHash = Keys.getSectionHash(section);

    if (user?.user?.watchingSections.includes(sectionHash)) {
      macros.error('user already watching section?', section, user.user);
      return;
    }

    const courseHash = Keys.getClassHash(section);

    const body = {
      loginKey,
      senderId,
      sectionHash,
    };

    if (!user?.user?.watchingClasses.includes(courseHash)) {
      await subscribeToCourseUsingHash(courseHash);
    }

    macros.log('Adding section to user', user.user, sectionHash, body);

    await axios.post('https://searchneu.com/subscription', { ...body });

    mutate();
  };

  const unsubscribeFromSection = async (section: Section): Promise<void> => {
    const sectionHash = Keys.getSectionHash(section);

    if (!user?.user?.watchingSections?.includes(sectionHash)) {
      macros.error(
        "removed section that doesn't exist on user?",
        section,
        user
      );
      return;
    }

    pull(user?.user?.watchingSections, sectionHash);

    const body = {
      loginKey: loginKey,
      senderId: senderId,
      sectionHash: sectionHash,
      notifData: {
        classId: '', // TODO: when delete works on the backend, figure out how to get these LMAO. Check out `user.js` in older search commits
        subject: '',
        crn: section.crn,
      },
    };

    await axios.delete('https://searchneu.com/subscription', {
      headers: {
        Authorization: '', // TODO: Figure out this stuff whenever the backend gets fixed.
      },
      data: {
        ...body,
      },
    });

    mutate();
  };

  return {
    user,
    subscribeToCourse,
    subscribeToSection,
    unsubscribeFromSection,
  };
}
