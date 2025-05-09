import { cn } from "@/lib/utils";

describe("cn", () => {
  it("should return an empty string if no arguments are provided", () => {
    expect(cn()).toEqual("");
  });

  it("should return the provided class names", () => {
    expect(cn("class1", "class2")).toEqual("class1 class2");
  });

  it("should ignore falsy values", () => {
    expect(cn("class1", null, undefined, false, "class2")).toEqual("class1 class2");
  });

  it("should handle complex class names", () => {
    expect(cn("text-blue-500", "hover:text-blue-700", "focus:outline-none")).toEqual(
      "text-blue-500 hover:text-blue-700 focus:outline-none"
    );
  });
});