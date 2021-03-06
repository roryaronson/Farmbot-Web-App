jest.mock("../../../api/crud", () => ({
  destroy: jest.fn(),
}));

const mockOk = jest.fn();
jest.mock("farmbot-toastr", () => ({ success: mockOk }));

import * as React from "react";
import { mount } from "enzyme";
import { Photos } from "../photos";
import { TaggedImage } from "../../../resources/tagged_resources";
import { fakeImages } from "../../../__test_support__/fake_state/images";
import { defensiveClone } from "../../../util";
import { destroy } from "../../../api/crud";

describe("<Photos/>", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function prepareImages(data: TaggedImage[]): TaggedImage[] {
    const images: TaggedImage[] = [];
    data.forEach((item, index) => {
      const image = defensiveClone(item);
      image.uuid = `Position ${index}`;
      images.push(image);
    });
    return images;
  }

  it("deletes photo", () => {
    const { mock } = destroy as jest.Mock<{}>;
    const dispatch = jest.fn(() => { return Promise.resolve(); });
    const images = prepareImages(fakeImages);
    const currentImage = images[1];
    const props = { images, currentImage, dispatch };
    const wrapper = mount(<Photos {...props} />);
    const deleteButton = wrapper.find("button").at(1);
    expect(deleteButton.text().toLowerCase()).toBe("delete photo");
    deleteButton.simulate("click");
    expect(mock.calls[0][0]).toBe("Position 1");
  });
});
