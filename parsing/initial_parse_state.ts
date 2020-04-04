import { ParseState } from "./types"

export const initialParseState: ParseState = {
  data: {
    soundFile: {},
    markers: {
      list: [],
      autonumbering: { byMarkerType: {} },
    },
  },
  currentSection: null,
}
