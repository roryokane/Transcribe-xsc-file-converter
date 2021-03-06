import { splitIntoLines, getKeyOfLine, lineIsBlank } from "./lex"
import { ParseData } from "./types"
import { initialParseState } from "./initial_parse_state"
import { lineParsers } from "./line_parsers"

function throwNotTranscribeFileError(): never {
  throw new Error("file does not appear to a Transcribe! file")
}

function warnIfUnknownVersion(versionLine: string): void {
  if (!versionLine.startsWith("Transcribe!,")) {
    throwNotTranscribeFileError()
  }

  const knownVersions = [
    "Transcribe!,Macintosh OS-X,8,21,7,S,3",
    "Transcribe!,Macintosh OS-X,8,50,7,S,0",
    "Transcribe!,Macintosh OS-X,7,51,7,S,2",
  ]
  if (!knownVersions.includes(versionLine)) {
    console.error(
      `Warning: file format has version “${versionLine}”, which not a version this program has even been tested against. Data may be wrong or missing.`
    )
  }
}

function parse(transcribeFileContents: string): ParseData {
  let parseState = { ...initialParseState }

  const lines = splitIntoLines(transcribeFileContents)
  if (lines.length === 0 || (lines.length === 1 && lines[0] === "")) {
    throw new Error("no input was provided")
  } else if (lines.length < 2) {
    throwNotTranscribeFileError()
  }

  const versionLine = lines[1]
  warnIfUnknownVersion(versionLine)

  for (const line of lines.slice(2)) {
    if (lineIsBlank(line)) continue

    const lineKey = getKeyOfLine(line)
    const lineParser = lineParsers[lineKey]
    if (lineParser) {
      parseState = lineParser(line, parseState)
    }
  }

  // TODO include implicit subdivision markers in the final list of markers, probably distinguished by `markerType`.
  // This is most easily done with post-processing, when it’s easy to look at the timestamp of the next marker.

  return parseState.data
}

export { parse }
