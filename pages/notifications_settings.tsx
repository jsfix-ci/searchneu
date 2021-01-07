import axios from 'axios';
import { ReactElement } from 'react';
import useSWR from 'swr';

export default function NotificationSettings(): ReactElement {
  const { data, error, mutate } = useSWR(
    '/api/user',
    async () => await axios.get('/api/user')
  );
  console.log(data, error);

  if (error) {
    return <div>Ya gotta Zucc yourself before you wreck yourself</div>;
  }

  const userData = data?.data;
  const watchingSections = userData?.watchingSections;
  const watchingCourses = userData?.watchingCourses;

  // TODO: literally any design pass please oh lordy lord lord the tigers come at night with their voices soft as thunder
  return data ? (
    <div>
      <h1>
        Something about welcome to Search NEU Notifications Diana could probably
        make this say something warm and welcoming but I am the Grinch
      </h1>
      <h3>These are the classes you&#39;re watching</h3>
      {watchingCourses?.map((course) => (
        <div key={course.courseHash}>{course.courseHash}</div>
      ))}
      <h3>These are the sections you&#39;re watching</h3>
      {watchingSections?.map((section) => (
        <div key={section.sectionHash}>{section.sectionHash}</div>
      ))}
    </div>
  ) : null;
}
