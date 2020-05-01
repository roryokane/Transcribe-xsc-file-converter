export type MarkerType =
  | { name: "section"; relativeScope: 3 }
  | { name: "measure"; relativeScope: 2 }
  | { name: "beat"; relativeScope: 1 }
export type NumSubdividionsData = {
  type: "same_as_previous_marker" | "constant"
  numSubdivisionsBetweenThisMarkerAndNext?: number
}
export type LabelInfo = null | { name: string; isAutoNamed: boolean }
export type TimestampWithPreparsedParts = {
  string: string
  numericParts: { hoursPart: number; minutesPart: number; secondsPart: number }
}

export interface ParseData {
  soundFile: {
    filename?: string
    filePath?: string
    audioDurationInSeconds?: number
  }
  markers: {
    list: Array<{
      timestamp: TimestampWithPreparsedParts
      markerType: MarkerType
      label: LabelInfo
      numSubdivisionsBetweenThisAndNextMarker: NumSubdividionsData
    }>
    autonumbering: {
      byMarkerType: { section?: boolean; measure?: boolean; beat?: boolean }
      numberContinuously?: boolean
    }
  }
}

export interface ParseState {
  data: ParseData
  currentSection: null | string
}

export type LineParser = (line: string, currentState: ParseState) => ParseState
