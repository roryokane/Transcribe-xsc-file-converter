import produce from "immer"
import { splitLineIntoParts } from "./lex"
import { ParseState } from "./parse_types"
import { assertCurrentSection } from "./line_parser_helpers"
import { parseMarker } from "./line_parser_for_Marker_line"

// section delimiter line parsers

function parseSectionStart(line: string, currentState: ParseState): ParseState {
  const [_key, sectionName] = splitLineIntoParts(line)
  return produce(currentState, (draftState) => {
    draftState.currentSection = sectionName
  })
}

function parseSectionEnd(line: string, currentState: ParseState): ParseState {
  const [_key, sectionName] = splitLineIntoParts(line)
  if (currentState.currentSection === sectionName) {
    return produce(currentState, (draftState) => {
      draftState.currentSection = null
    })
  } else {
    throw new Error(`end of a section “${sectionName}” that was not known to have began`)
  }
}

// field line parsers

function parseSoundFileName(line: string, currentState: ParseState): ParseState {
  assertCurrentSection("Main", currentState)

  const [_key, filename, _operatingSystemForSomeReason, filePath] = splitLineIntoParts(line)

  return produce(currentState, (draftState) => {
    draftState.data.soundFile.filename = filename
    draftState.data.soundFile.filePath = filePath
  })
}

function parseSoundFileInfo(line: string, currentState: ParseState): ParseState {
  assertCurrentSection("Main", currentState)
  const [
    _key,
    fileType1,
    fileType2,
    _unknown1, // maybe number of audio channels, meaning stereo or mono
    _unknown2,
    bitrate,
    _unknown3,
    audioDurationInSeconds,
  ] = splitLineIntoParts(line)

  return produce(currentState, (draftState) => {
    draftState.data.soundFile.audioDurationInSeconds = parseFloat(audioDurationInSeconds)
  })
}

function parseMarkerNumberContinuously(line: string, currentState: ParseState): ParseState {
  assertCurrentSection("Main", currentState)

  const [_key, numberContinuouslyNumStr] = splitLineIntoParts(line)
  const numberContinuously = Boolean(parseInt(numberContinuouslyNumStr, 10))

  return produce(currentState, (draftState) => {
    draftState.data.markers.autonumbering.numberContinuously = numberContinuously
    // TODO explain better
    // Is this about resuming numbering after custom labels? [A1, second, A3] vs. [A1, second, A2]?
  })
}

function parseMarkerAutoSection(line: string, currentState: ParseState): ParseState {
  assertCurrentSection("Main", currentState)

  const [_key, autoSectionStr] = splitLineIntoParts(line)
  const autonumberSections = !Boolean(parseInt(autoSectionStr, 10)) // 0 means true for this field

  return produce(currentState, (draftState) => {
    draftState.data.markers.autonumbering.byMarkerType.section = autonumberSections
  })
}

function parseMarkerAutoMeasure(line: string, currentState: ParseState): ParseState {
  assertCurrentSection("Main", currentState)

  const [_key, autoMeasureStr] = splitLineIntoParts(line)
  const autonumberMeasures = !Boolean(parseInt(autoMeasureStr, 10)) // 0 means true for this field

  return produce(currentState, (draftState) => {
    draftState.data.markers.autonumbering.byMarkerType.measure = autonumberMeasures
  })
}

function parseMarkerAutoBeat(line: string, currentState: ParseState): ParseState {
  assertCurrentSection("Main", currentState)

  const [_key, autoBeatStr] = splitLineIntoParts(line)
  const autonumberBeats = !Boolean(parseInt(autoBeatStr, 10)) // 0 means true for this field

  return produce(currentState, (draftState) => {
    draftState.data.markers.autonumbering.byMarkerType.beat = autonumberBeats
  })
}

export const lineParsers = {
  // parsers of lines that define sections
  SectionStart: parseSectionStart,
  SectionEnd: parseSectionEnd,
  // parsers of lines for fields in the Main section
  SoundFileName: parseSoundFileName,
  SoundFileInfo: parseSoundFileInfo,
  MarkerNumberContinuously: parseMarkerNumberContinuously,
  MarkerAutoSection: parseMarkerAutoSection,
  MarkerAutoMeasure: parseMarkerAutoMeasure,
  MarkerAutoBeat: parseMarkerAutoBeat,
  // parsers of lines for fields in the Markers section
  S: parseMarker,
  M: parseMarker,
  B: parseMarker,
}
