import { splitIntoLines, splitLineIntoParts, getKeyOfLine, lineIsBlank } from "./lex"
import { MarkerType, NumSubdividionsData, LabelInfo, ParseState, ParseData } from "./parse_types"
import { lineHandlers } from "./line_handlers"

// initial state

const initialParseState: ParseState = {
  data: {
    soundFile: {},
    markers: {
      list: [],
      autonumbering: { byMarkerType: {} },
    },
  },
  currentSection: null,
}

// general parsing logic

function warnIfUnknownVersion(versionLine: string): void {
  if (!versionLine.startsWith("Transcribe!,")) {
    throw new Error("file does not appear to a Transcribe! file")
  }

  const knownVersions = ["Transcribe!,Macintosh OS-X,8,21,7,S,3", "Transcribe!,Macintosh OS-X,8,50,7,S,0"]
  if (!knownVersions.includes(versionLine)) {
    console.error(
      `Warning: file format has version “${versionLine}”, which not a version this program has even been tested against. Data may be wrong or missing.`
    )
  }
}

function parse(transcribeFileContents: string): ParseData {
  let parseState = { ...initialParseState }

  const lines = splitIntoLines(transcribeFileContents)
  const versionLine = lines[1]
  warnIfUnknownVersion(versionLine)

  for (const line of lines.slice(2)) {
    if (lineIsBlank(line)) continue

    const lineKey = getKeyOfLine(line)
    const lineHandler = lineHandlers[lineKey]
    if (lineHandler) {
      parseState = lineHandler(line, parseState)
    }
  }

  // TODO include implicit subdivision markers in the final list of markers, probably distinguished by `markerType`.
  // This is most easily done with post-processing, when it’s easy to look at the timestamp of the next marker.

  return parseState.data
}

// only parse is meant to be public; the rest is exported only for tests
export { parse, initialParseState }
