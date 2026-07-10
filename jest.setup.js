require("@testing-library/jest-dom");

jest.mock("lucide-react", () =>
  new Proxy(
    { __esModule: true },
    {
      get(target, property) {
        if (property in target) return target[property];
        return (props) =>
          require("react").createElement("svg", {
            ...props,
            "aria-hidden": true,
          });
      },
    },
  ),
);
