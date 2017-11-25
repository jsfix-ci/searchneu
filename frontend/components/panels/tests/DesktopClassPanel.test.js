/*
 * This file is part of Search NEU and licensed under AGPL3.
 * See the license file in the root folder for details.
 */

import React from 'react';
import renderer from 'react-test-renderer';
import ShallowRenderer from 'react-test-renderer/shallow';


import mockData from './mockData';
import DesktopClassPanel from '../DesktopClassPanel';


it('should render some stuff', () => {

  const component = renderer.create(<DesktopClassPanel aClass={mockData.cs1210} />);
  expect(component).toMatchSnapshot();

});
