import { toAudacityLabelTrackFormat } from "./audacity_label_track_export"
import { parse } from "./parsing/parser"
import { readAllOfAFile } from "./io_utils"
import { ParseData } from "./parsing/types"

test("parsed .xsc data with no timestamps can be converted to Audacity Label Track format", async () => {
  const parseDataWithOneMarker: ParseData = {
    soundFile: {},
    markers: {
      list: [],
      autonumbering: { byMarkerType: {} },
    },
  }
  const labelTrackFormat = toAudacityLabelTrackFormat(parseDataWithOneMarker)
  expect(labelTrackFormat).toEqual("")
})

test("parsed .xsc data with a single late, unlabeled timestamp can be converted to Audacity Label Track format", async () => {
  const parseDataWithOneMarker: ParseData = {
    soundFile: {},
    markers: {
      list: [
        {
          label: null,
          markerType: { name: "beat", relativeScope: 1 },
          numSubdivisionsBetweenThisAndNextMarker: { type: "same_as_previous_marker" },
          timestamp: {
            hoursPart: 1,
            minutesPart: 59,
            secondsPart: 4.157,
            string: "1:59:04.157",
          },
        },
      ],
      autonumbering: { byMarkerType: {} },
    },
  }
  const labelTrackFormat = toAudacityLabelTrackFormat(parseDataWithOneMarker)
  expect(labelTrackFormat).toEqual("7144.157\t7144.157\t\n")
})

test("parsed .xsc data with a single labeled timestamp can be converted to Audacity Label Track format", async () => {
  const parseDataWithOneMarker: ParseData = {
    soundFile: {},
    markers: {
      list: [
        {
          label: {
            name: "start of the good part",
            isAutoNamed: false,
          },
          markerType: { name: "beat", relativeScope: 1 },
          numSubdivisionsBetweenThisAndNextMarker: { type: "same_as_previous_marker" },
          timestamp: {
            hoursPart: 0,
            minutesPart: 0,
            secondsPart: 3,
            string: "0:00:03.000",
          },
        },
      ],
      autonumbering: { byMarkerType: {} },
    },
  }
  const labelTrackFormat = toAudacityLabelTrackFormat(parseDataWithOneMarker)
  expect(labelTrackFormat).toEqual("3\t3\tstart of the good part\n")
})

test("the file ‘Windows ME Startup.xsc’ can be converted to Audacity Label Track format", async () => {
  const fileContents = await readAllOfAFile("tests/relatively few markers/Windows ME Startup.xsc")
  const parsed = parse(fileContents)

  const labelTrackFormat = toAudacityLabelTrackFormat(parsed)

  // use snapshot assertion to avoid managing trailing tabs in code files
  expect(labelTrackFormat).toMatchSnapshot()
})
