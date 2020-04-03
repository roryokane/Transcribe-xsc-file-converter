import * as baretest from "baretest"
import * as assert from "assert"
import { initialParseState } from "./parser"
import { lineHandlers } from "./line_handlers"

const test = baretest("Parser")

test("handleMarker", () => {
  const initialState = { ...initialParseState, currentSection: "Markers" }
  const newState = lineHandlers.B("B,176400,1,,0,0:00:04.000", initialState)
  assert.deepStrictEqual(newState.data.markers.list, [
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
// (probably requires Jest)

test.run()
