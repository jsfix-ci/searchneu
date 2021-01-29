import axios from 'axios';
import { ReactElement } from 'react';
import useSWR from 'swr';

export default function NotificationSettings(): ReactElement {
  const { data, error, mutate } = useSWR(
    '/api/user',
    async () => await axios.get('/api/user')
  );

  if (error) {
    return <div>Ya gotta Zucc yourself before you wreck yourself</div>;
  }

  const userData = data?.data;
  const watchingSections = userData?.watchingSections;
  const watchingCourses = userData?.watchingCourses;

  const coursesBundledWithSections = [];
  for (const course in watchingCourses) {
    coursesBundledWithSections.push({
      course,
      sections: watchingSections.filter((section) =>
        section.startsWith(course)
      ),
    });
  }

  // TODO: literally any design pass please oh lordy lord lord the tigers come at night with their voices soft as thunder
  return data ? (
    <div>
      <h1>
        Something about welcome to Search NEU Notifications Diana could probably
        make this say something warm and welcoming but I am the Grinch
      </h1>
      {coursesBundledWithSections.map((item) => (
        <div key={item.course}>
          <h3>{item.course}</h3>
          {item.sections.map((section) => (
            <p key={section}>{section}</p>
          ))}
        </div>
      ))}
    </div>
  ) : null;
}
