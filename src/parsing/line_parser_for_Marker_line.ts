import produce from "immer"
import { splitLineIntoParts } from "./lex"
import { NumSubdividionsData, LabelInfo, ParseState, TimestampAndParts } from "./types"
import { assertCurrentSection } from "./line_parser_helpers"

export function parseMarker(line: string, currentState: ParseState): ParseState {
  const [
    markerTypeChar,
    _frameOrByteOrSampleOrSomething, // This is (seconds_elapsed * 44.1) for one test file. 44.1 is the “sampling rate” of that audio file, 44,100 Hz, divided by 1000. Therefore, this value means ???
    labelIsAutoNamedStr,
    labelName,
    numSubdivisionsStr,
    timestamp,
  ] = splitLineIntoParts(line)

  assertCurrentSection("Markers", currentState)

  return produce(currentState, (draftState) => {
    draftState.data.markers.list.push({
      timestamp: timestampToObject(timestamp),
      markerType: markerTypeCharToObject(markerTypeChar),
      label: labelInfoToObjectOrNull(labelName, labelIsAutoNamedStr),
      numSubdivisionsBetweenThisAndNextMarker: numSubdivisionsStringToObject(numSubdivisionsStr),
    })
  })
}

function numSubdivisionsStringToObject(numSubdivisionsStr: string): NumSubdividionsData {
  const numSubdivisionsValue = parseInt(numSubdivisionsStr, 10)

  if (numSubdivisionsValue === 0) {
    return { type: "same_as_previous_marker" }
  } else if (numSubdivisionsValue === 1) {
    return {
      type: "constant",
      numSubdivisionsBetweenThisMarkerAndNext: 0,
    }
  } else {
    return {
      type: "constant",
      numSubdivisionsBetweenThisMarkerAndNext: numSubdivisionsValue,
    }
  }
}

function timestampToObject(timestampStr: string): TimestampAndParts {
  const [hours, minutes, seconds] = timestampStr.split(":")
  return {
    string: timestampStr,
    hoursPart: parseInt(hours, 10),
    minutesPart: parseInt(minutes, 10),
    secondsPart: parseFloat(seconds),
  }
}

type MarkerTypeDetailsFromChar = {
  S: { name: "section"; relativeScope: 3 }
  M: { name: "measure"; relativeScope: 2 }
  B: { name: "beat"; relativeScope: 1 }
}
const markerTypeDetailsFromChar: MarkerTypeDetailsFromChar = {
  S: { name: "section", relativeScope: 3 },
  M: { name: "measure", relativeScope: 2 },
  B: { name: "beat", relativeScope: 1 },
}
// If you want to simplify the above duplication, read https://www.typescriptlang.org/docs/handbook/advanced-types.html and see if anything applies. Searches didn’t bring up anything more specific than that page.
function markerTypeCharToObject(markerTypeChar: string) {
  if (markerTypeChar === "S" || markerTypeChar === "M" || markerTypeChar === "B") {
    return markerTypeDetailsFromChar[markerTypeChar]
  } else {
    throw new Error(`invalid marker type "#{markerTypeChar}" passed to markerTypeCharToObject`)
  }
}

function labelInfoToObjectOrNull(name: string, isAutoNamedStr: string): LabelInfo {
  const isAutoNamed = isAutoNamedStr === "1" ? true : false
  if (isAutoNamed && name === "") {
    return null
  } else {
    return { name, isAutoNamed }
  }
}
