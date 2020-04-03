import { initialParseState } from "./parser"
import { lineHandlers } from "./line_handlers"

test("handleMarker", () => {
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

// TODO write fixture test
