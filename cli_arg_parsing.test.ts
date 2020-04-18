import { parseArgv } from "./cli_arg_parsing"

function parseArgvInTestMode(argv: Array<string>) {
  return parseArgv(argv, { outputAndExitOnError: false })
}

test("rejects too many file arguments", () => {
  expect(() => {
    parseArgvInTestMode(["file1.xsc", "file2.xsc"])
  }).toThrow()
})

test("rejects unknown format", () => {
  expect(() => {
    parseArgvInTestMode(["--format", "transcribe_version_999"])
  }).toThrow()
})

test("accepts one file", () => {
  expect(parseArgvInTestMode(["some file with spaces.xsc"])).toEqual({
    inputSource: {
      filePath: "some file with spaces.xsc",
      type: "file",
    },
    outputFormat: "generic",
  })
})

test("interprets no files as stdin", () => {
  expect(parseArgvInTestMode([])).toEqual({
    inputSource: { type: "stdin" },
    outputFormat: "generic",
  })
})

test("interprets - as stdin", () => {
  expect(parseArgvInTestMode(["-"])).toEqual({
    inputSource: { type: "stdin" },
    outputFormat: "generic",
  })
})
