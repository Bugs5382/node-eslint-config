import { render } from "@testing-library/react";
import { test } from "vitest";

test("card", () => {
  const { getByText } = render(<div>hi</div>);
  getByText("hi");
});
