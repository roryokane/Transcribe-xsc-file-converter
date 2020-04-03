import { initialParseState, parse } from "./parser"
import { lineHandlers } from "./line_handlers"
import { readAllOfAFile } from "./io_utils"

test("a B line can be parsed", () => {
  const initialState = { ...initialParseState, currentSection: "Markers" }
  const newState = lineHandlers.B("B,176400,1,,0,0:00:04.000", initialState)
  expect(newState.data.markers.list).toEqual([
    {
      label: null,
      markerType: {
        name: "beat",
        relativeScope: 1,
      },
      numSubdivisionsBetweenThisAndNextMarker: {
        type: "same_as_previous_marker",
      },
      timestamp: {
        hours: 0,
        minutes: 0,
        seconds: 4,
        string: "0:00:04.000",
      },
    },
  ])
})

test("the file ‘Windows ME Startup.xsc’ can be parsed", async () => {
  const fileContents = await readAllOfAFile("tests/relatively few markers/Windows ME Startup.xsc")
  const parsed = parse(fileContents)
  expect(parsed).toMatchSnapshot()
})
