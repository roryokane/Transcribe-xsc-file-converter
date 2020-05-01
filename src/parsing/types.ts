export type MarkerType =
  | { name: "section"; relativeScope: 3 }
  | { name: "measure"; relativeScope: 2 }
  | { name: "beat"; relativeScope: 1 }
export type NumSubdividionsData = {
  type: "same_as_previous_marker" | "constant"
  numSubdivisionsBetweenThisMarkerAndNext?: number
}
export type LabelInfo = null | { label: string; labelIsAutoNamed: boolean }
export type TimestampAndParts = { string: string; hoursPart: number; minutesPart: number; secondsPart: number }

export interface ParseData {
  soundFile: {
    filename?: string
    filePath?: string
    audioDurationInSeconds?: number
  }
  markers: {
    list: Array<{
      timestamp: TimestampAndParts
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
