import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';

Enzyme.configure({ adapter: new Adapter() });

const TestHook = ({ callback }) => {
  callback();
  return null;
};

export default function TestHookComponent(callback) {
  return mount(<TestHook callback={callback} />);
}
