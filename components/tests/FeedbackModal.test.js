/*
 * This file is part of Search NEU and licensed under AGPL3.
 * See the license file in the root folder for details.
 */

import React from "react";

import Enzyme, { shallow } from "enzyme";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";

import FeedbackModal from "../FeedbackModal";

Enzyme.configure({ adapter: new Adapter() });

it("should render the form", () => {
  function closeForm() {}

  const result = shallow(
    <FeedbackModal
      closeForm={closeForm}
      feedbackModalOpen
      toggleForm={() => {}}
    />
  ).debug();
  expect(result).toMatchSnapshot();
});

it("should render form is closed", () => {
  function closeForm() {}

  const result = shallow(
    <FeedbackModal
      closeForm={closeForm}
      feedbackModalOpen={false}
      toggleForm={() => {}}
    />
  ).debug();
  expect(result).toMatchSnapshot();
});
