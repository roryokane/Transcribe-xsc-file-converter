import produce from "immer"
import { splitLineIntoParts } from "./lex"
import { NumSubdividionsData, LabelInfo, ParseState } from "./types"
import { assertCurrentSection } from "./line_parser_helpers"

export function parseMarker(line: string, currentState: ParseState): ParseState {
  const [
    markerTypeChar,
    _frameOrByteOrSampleOrSomething, // This is (seconds_elapsed * 44.1) for one test file. 44.1 is the “sampling rate” of that audio file, 44,100 Hz, divided by 1000. Therefore, this value means ???
    labelIsAutoNamedStr,
    labelStr,
    numSubdivisionsStr,
    timestamp,
  ] = splitLineIntoParts(line)

  assertCurrentSection("Markers", currentState)

  return produce(currentState, (draftState) => {
    draftState.data.markers.list.push({
      timestamp: timestampToObject(timestamp),
      markerType: markerTypeCharToObject(markerTypeChar),
      label: labelInfoToObjectOrNull(labelStr, labelIsAutoNamedStr),
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

function timestampToObject(timestampStr: string) {
  const [hours, minutes, seconds] = timestampStr.split(":")
  return {
    string: timestampStr,
    hours: parseInt(hours, 10),
    minutes: parseInt(minutes, 10),
    seconds: parseFloat(seconds),
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
function markerTypeCharToObject(markerTypeChar: string) {
  if (markerTypeChar === "S" || markerTypeChar === "M" || markerTypeChar === "B") {
    return markerTypeDetailsFromChar[markerTypeChar]
  } else {
    throw new Error(`invalid marker type "#{markerTypeChar}" passed to markerTypeCharToObject`)
  }
}

function labelInfoToObjectOrNull(labelStr: string, labelIsAutoNamedStr: string): LabelInfo {
  const labelIsAutoNamed = labelIsAutoNamedStr === "1" ? true : false
  if (labelIsAutoNamed && labelStr === "") {
    return null
  } else {
    return {
      label: labelStr,
      labelIsAutoNamed,
    }
  }
}
