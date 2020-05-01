import { ParseData, TimestampWithPreparsedParts } from "./parsing/types"

// reference links:
// Label Track file format details: https://manual.audacityteam.org/man/importing_and_exporting_labels.html
// about Label Tracks in Audacity: https://manual.audacityteam.org/man/label_tracks.html
// about Audacity: https://www.audacityteam.org/

function timestampToSeconds(timestampData: TimestampWithPreparsedParts): number {
  const { numericParts } = timestampData
  return numericParts.hoursPart * (60 * 60) + numericParts.minutesPart * 60 + numericParts.secondsPart
}

export function toAudacityLabelTrackFormat(parseData: ParseData): string {
  const outputLines: Array<string> = []

  const markerList = parseData.markers.list
  markerList.forEach((item) => {
    const lineParts = []

    const timestampInSeconds = timestampToSeconds(item.timestamp)
    // make a point label by giving it the same start time and end time
    lineParts.push(timestampInSeconds) // start time
    lineParts.push(timestampInSeconds) // end time

    // When importing markers without labels, Audacity supports either line format: "1\t1" (missing tab-separated label field) or "1\t1\t" (label field present but empty).
    // I chose to export the second format, a present but empty label field, because it’s more likely to avoid bugs in hypothetical other programs that understand Audacity’s label track format.
    let labelName = item.label ? item.label.name : ""
    lineParts.push(labelName)

    outputLines.push(lineParts.join("\t"))
  })

  if (outputLines.length === 0) {
    return ""
    // returning "\n" would be invalid; that causes Audacity to show an error message about a missing label
  } else {
    return outputLines.join("\n") + "\n"
  }
}
