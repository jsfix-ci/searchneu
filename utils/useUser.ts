import axios from 'axios';
import { pull } from 'lodash';
import useSWR from 'swr';
import Keys from '../components/Keys';
import macros from '../components/macros';
import { Course, Section } from '../components/types';
import {
  DeleteSubscriptionBody,
  PostSubscriptionBody,
} from '../pages/api/subscription';
import { GetUserResponse } from '../pages/api/user';

type UseUserReturn = {
  user: GetUserResponse | undefined;
  subscribeToCourse: (course: Course) => Promise<void>;
  subscribeToSection: (section: Section) => Promise<void>;
  unsubscribeFromSection: (section: Section) => Promise<void>;
  unsubscribeFromCourse: (course: Course) => Promise<void>;
};

export default function useUser(): UseUserReturn {
  const { data: user, error, mutate } = useSWR(
    `/api/user`,
    async (): Promise<GetUserResponse> => (await axios.get('/api/user')).data,
    {
      onErrorRetry: (error) => {
        if (error.status === 401) {
          return;
        }
      },
    }
  );

  const subscribeToCourseUsingHash = async (
    courseHash: string
  ): Promise<void> => {
    const body: PostSubscriptionBody = {
      courseHash,
    };
    console.log('inside useUser');
    await axios.post('/api/subscription', body);
  };

  const subscribeToCourse = async (course: Course): Promise<void> => {
    const courseHash = Keys.getClassHash(course);
    if (user?.followedCourses?.includes(courseHash)) {
      macros.error('user already watching class?', courseHash, user);
      return;
    }

    await subscribeToCourseUsingHash(courseHash);
    mutate();
  };

  const unsubscribeFromCourse = async (course: Course): Promise<void> => {
    const courseHash = Keys.getClassHash(course);
    if (!user?.followedCourses?.includes(courseHash)) {
      macros.error("removed course that doesn't exist on user?", course, user);
      return;
    }
    const sectionHashes = course.sections.map((section) =>
      Keys.getSectionHash(section)
    );
    console.log('sectionHashes', sectionHashes);
    pull(user?.followedCourses, courseHash);
    user.followedSections = user.followedSections.filter(
      (section) => section.slice(0, -6) !== courseHash
    );

    const body: DeleteSubscriptionBody = {
      courseHash: courseHash,
      sectionHashes: sectionHashes,
    };

    macros.log('Unsubscribing from course', user, courseHash, body);

    await axios.delete('/api/subscription', {
      headers: {
        Authorization: '', // TODO: Figure out this stuff whenever the backend gets fixed.
      },
      data: {
        ...body,
      },
    });

    mutate();
  };

  const subscribeToSection = async (section: Section): Promise<void> => {
    if (section.seatsRemaining > 5) {
      macros.error('Not signing up for section that has over 5 seats open.');
      return;
    }
    const sectionHash = Keys.getSectionHash(section);

    if (user?.followedSections?.includes(sectionHash)) {
      macros.error('user already watching section?', section, user);
      return;
    }

    const courseHash = Keys.getClassHash(section);

    const body: PostSubscriptionBody = {
      sectionHash,
    };

    if (!user?.followedCourses?.includes(courseHash)) {
      await subscribeToCourseUsingHash(courseHash);
    }

    macros.log('Adding section to user', user, sectionHash, body);

    await axios.post('/api/subscription', body);

    mutate();
  };

  const unsubscribeFromSection = async (section: Section): Promise<void> => {
    const sectionHash = Keys.getSectionHash(section);

    if (!user?.followedSections?.includes(sectionHash)) {
      macros.error(
        "removed section that doesn't exist on user?",
        section,
        user
      );
      return;
    }

    pull(user?.followedSections, sectionHash);

    const body: DeleteSubscriptionBody = {
      sectionHash: sectionHash,
    };

    await axios.delete('/api/subscription', {
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
    unsubscribeFromCourse,
  };
}
