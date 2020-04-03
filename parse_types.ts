export type MarkerType =
  | { name: "section"; relativeScope: 3 }
  | { name: "measure"; relativeScope: 2 }
  | { name: "beat"; relativeScope: 1 }
export type NumSubdividionsData = {
  type: "same_as_previous_marker" | "constant"
  numSubdivisionsBetweenThisMarkerAndNext?: number
}
export type LabelInfo = null | { label: string; labelIsAutoNamed: boolean }

export interface ParseData {
  soundFile: any // TODO
  markers: {
    list: Array<{
      timestamp: { string: string; hours: number; minutes: number; seconds: number }
      markerType: MarkerType
      label: LabelInfo
      numSubdivisionsBetweenThisAndNextMarker: NumSubdividionsData
    }>
    autonumbering: any // TODO
  }
}

export interface ParseState {
  data: ParseData
  currentSection: void | string
}
