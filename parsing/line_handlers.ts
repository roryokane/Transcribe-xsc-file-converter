import produce from "immer"
import { splitLineIntoParts } from "./lex"
import { MarkerType, NumSubdividionsData, LabelInfo, ParseState } from "./parse_types"

// section handlers

function handleSectionStart(line: string, currentState: ParseState): ParseState {
  const [_key, sectionName] = splitLineIntoParts(line)
  return produce(currentState, draftState => {
    draftState.currentSection = sectionName
  })
}

function handleSectionEnd(line: string, currentState: ParseState): ParseState {
  const [_key, sectionName] = splitLineIntoParts(line)
  if (currentState.currentSection === sectionName) {
    return produce(currentState, draftState => {
      draftState.currentSection = null
    })
  } else {
    throw new Error(`end of a section “${sectionName}” that was not known to have started`)
  }
}

// line handlers

function assertCurrentSection(expectedSection: string, currentState: ParseState): void {
  if (currentState.currentSection !== expectedSection) {
    throw new Error("found marker data key outside of Markers section; change code to support that")
  }
}

function handleSoundFileName(line: string, currentState: ParseState): ParseState {
  assertCurrentSection("Main", currentState)

  const [_key, filename, _operatingSystemForSomeReason, filePath] = splitLineIntoParts(line)

  return produce(currentState, draftState => {
    draftState.data.soundFile.filename = filename
    draftState.data.soundFile.filePath = filePath
  })
}

function handleSoundFileInfo(line: string, currentState: ParseState): ParseState {
  assertCurrentSection("Main", currentState)
  const [
    _key,
    fileType1,
    fileType2,
    _unknown1,
    _unknown2,
    bitrate,
    _unknown3,
    audioDurationInSeconds,
  ] = splitLineIntoParts(line)

  return produce(currentState, draftState => {
    draftState.data.soundFile.audioDurationInSeconds = audioDurationInSeconds
  })
}

function handleMarkerNumberContinuously(line: string, currentState: ParseState): ParseState {
  assertCurrentSection("Main", currentState)

  const [_key, numberContinuouslyNumStr] = splitLineIntoParts(line)
  const numberContinuously = Boolean(parseInt(numberContinuouslyNumStr, 10))

  return produce(currentState, draftState => {
    draftState.data.markers.autonumbering.numberContinuously = numberContinuously
    // TODO explain better
    // Is this about resuming numbering after custom labels? [A1, second, A3] vs. [A1, second, A2]?
  })
}

function handleMarkerAutoSection(line: string, currentState: ParseState): ParseState {
  assertCurrentSection("Main", currentState)

  const [_key, autoSectionStr] = splitLineIntoParts(line)
  const autonumberSections = !Boolean(parseInt(autoSectionStr, 10)) // 0 means true for this field

  return produce(currentState, (draftState) => {
    draftState.data.markers.autonumbering.byMarkerType.section = autonumberSections
  })
}

function handleMarkerAutoMeasure(line: string, currentState: ParseState): ParseState {
  assertCurrentSection("Main", currentState)

  const [_key, autoMeasureStr] = splitLineIntoParts(line)
  const autonumberMeasures = !Boolean(parseInt(autoMeasureStr, 10)) // 0 means true for this field

  return produce(currentState, (draftState) => {
    draftState.data.markers.autonumbering.byMarkerType.measure = autonumberMeasures
  })
}

function handleMarkerAutoBeat(line: string, currentState: ParseState): ParseState {
  assertCurrentSection("Main", currentState)

  const [_key, autoBeatStr] = splitLineIntoParts(line)
  const autonumberBeats = !Boolean(parseInt(autoBeatStr, 10)) // 0 means true for this field

  return produce(currentState, (draftState) => {
    draftState.data.markers.autonumbering.byMarkerType.beat = autonumberBeats
  })
}

// only used in handleMarker
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

// only used in handleMarker
function timestampToObject(timestampStr: string) {
  const [hours, minutes, seconds] = timestampStr.split(":")
  return {
    string: timestampStr,
    hours: parseInt(hours, 10),
    minutes: parseInt(minutes, 10),
    seconds: parseFloat(seconds),
  }
}

// only used in handleMarker
const markerTypeDetailsFromChar = {
  S: { name: "section", relativeScope: 3 },
  M: { name: "measure", relativeScope: 2 },
  B: { name: "beat", relativeScope: 1 },
}
function markerTypeCharToObject(markerTypeChar: string) {
  return markerTypeDetailsFromChar[markerTypeChar]
}

// only used in handleMarker
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

function handleMarker(line: string, currentState: ParseState): ParseState {
  const [
    markerTypeChar,
    _frameOrByteOrSampleOrSomething, // this is (seconds_elapsed * 44.1) for one test file. This is 1/1000 times of the “sampling rate” of that audio file, 44,100 Hz. Therefore, this value means ???
    labelIsAutoNamedStr,
    labelStr,
    numSubdivisionsStr,
    timestamp,
  ] = splitLineIntoParts(line)

  assertCurrentSection("Markers", currentState)

  return produce(currentState, draftState => {
    draftState.data.markers.list.push({
      timestamp: timestampToObject(timestamp),
      markerType: markerTypeCharToObject(markerTypeChar),
      label: labelInfoToObjectOrNull(labelStr, labelIsAutoNamedStr),
      numSubdivisionsBetweenThisAndNextMarker: numSubdivisionsStringToObject(numSubdivisionsStr),
    })
  })
}

export const lineHandlers = {
  // sections
  SectionStart: handleSectionStart,
  SectionEnd: handleSectionEnd,
  // in the Main section
  SoundFileName: handleSoundFileName,
  SoundFileInfo: handleSoundFileInfo,
  MarkerNumberContinuously: handleMarkerNumberContinuously,
  MarkerAutoSection: handleMarkerAutoSection,
  MarkerAutoMeasure: handleMarkerAutoMeasure,
  MarkerAutoBeat: handleMarkerAutoBeat,
  // in the Markers section
  S: handleMarker,
  M: handleMarker,
  B: handleMarker,
}
