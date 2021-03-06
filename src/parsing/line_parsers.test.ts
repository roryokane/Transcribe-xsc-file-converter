import { lineParsers } from "./line_parsers"
import { initialParseState } from "./initial_parse_state"

test("a B line can be parsed", () => {
  const initialState = { ...initialParseState, currentSection: "Markers" }
  const newState = lineParsers.B("B,176400,1,,0,0:00:04.000", initialState)
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
        string: "0:00:04.000",
        numericParts: {
          hoursPart: 0,
          minutesPart: 0,
          secondsPart: 4,
        },
      },
    },
  ])
})
