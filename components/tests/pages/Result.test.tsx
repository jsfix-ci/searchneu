/*
 * This file is part of Search NEU and licensed under AGPL3.
 * See the license file in the root folder for details.
 */

import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { shallow } from 'enzyme';
import React from 'react';
import Results from '../../../pages/[campus]/[termId]/search/[query]';




jest.mock('react-router-dom', () => ({
  useHistory: () => ({
    push: jest.fn(),
  }),
  useParams: () => ({ campus: 'NEU', termId:'202030', query: 'cs' }),
}));

Enzyme.configure({ adapter: new Adapter() });

it('should render a section', () => {
  const result = shallow(<Results />);
  expect(result).toMatchSnapshot();
});
