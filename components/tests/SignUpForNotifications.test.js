/*
 * This file is part of Search NEU and licensed under AGPL3.
 * See the license file in the root folder for details.
 */

import React from 'react';

import Enzyme, { shallow } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';

import SignUpForNotifications from '../SignUpForNotifications';
import mockData from '../panels/tests/mockData';

Enzyme.configure({ adapter: new Adapter() });

beforeEach(() => {
  window.location.hash = '#fbtest';
});

afterEach(() => {
  window.location.hash = '#';
});

it('should render', () => {
  const result = shallow(
    <SignUpForNotifications
      course={mockData.cs1210}
      userIsWatchingClass={false}
    />
  ).debug();
  expect(result).toMatchSnapshot();
});

it('should render', () => {
  const result = shallow(
    <SignUpForNotifications course={mockData.cs1210} userIsWatchingClass />
  ).debug();
  expect(result).toMatchSnapshot();
});

it('should render the fb button after the button is clicked', async (done) => {
  const wrapper = shallow(
    <SignUpForNotifications
      course={mockData.cs1210}
      userIsWatchingClass={false}
    />
  );
  const instance = wrapper.instance();

  await instance.onSubscribeToggleChange();

  wrapper.update();

  expect(wrapper.contains('Click this button to continue')).toBeTruthy();
  done();
});
