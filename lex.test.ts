import { unescapeLinePart, splitLineIntoParts } from "./lex"

describe("unescapeLinePart", () => {
  test("does nothing to normal text", () => {
    expect(unescapeLinePart("In the key of C")).toEqual("In the key of C")
    expect(unescapeLinePart("1")).toEqual("1")
  })

  test("does nothing to a blank string", () => {
    expect(unescapeLinePart("")).toEqual("")
  })

  test("handles an escaped backslash correctly", () => {
    expect(unescapeLinePart("a \\\\ b")).toEqual("a \\ b")
  })

  test("handles an escaped comma correctly", () => {
    expect(unescapeLinePart("a \\C b")).toEqual("a , b")
  })

  test.skip("handles escaped backslahes and commas next to each other", () => {
    expect(unescapeLinePart("a \\\\\\C b \\C\\\\ c")).toEqual("a \\, b ,\\ c")
  })
})

describe("splitLineIntoParts", () => {
  test("splits a line with two parts", () => {
    expect(splitLineIntoParts("SomeData,3")).toEqual(["SomeData", "3"])
  })

  test("splits a line with blank parts", () => {
    expect(splitLineIntoParts("SomeData,,3,,")).toEqual(["SomeData", "", "3", "", ""])
  })

  test("splits lines with escape sequences near the commas", () => {
    expect(
      splitLineIntoParts("SomeData,label \\C with \\\\ escape sequences,\\C another \\C,\\\\ another \\\\,3")
    ).toEqual(["SomeData", "label , with \\ escape sequences", ", another ,", "\\ another \\", "3"])
  })
})
