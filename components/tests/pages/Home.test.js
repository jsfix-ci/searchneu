/*
 * This file is part of Search NEU and licensed under AGPL3.
 * See the license file in the root folder for details.
 */

import React from 'react';

import Enzyme, { shallow } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';

import Home from '../../../pages/[campus]/[termId]';

jest.mock('next/router', () => ({
  useRouter: () => ({ query: { campus: 'NEU' } }),
}));

jest.mock('use-query-params', () => ({
  useQueryParam: () => ['202030', () => {}],
}));

Enzyme.configure({ adapter: new Adapter() });

it('should render a section', () => {
  const result = shallow(<Home />);
  expect(result.debug()).toMatchSnapshot();
});
