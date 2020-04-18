import { parseArgv } from "./cli_arg_parsing"

function parseArgvInTestMode(argv: Array<string>) {
  return parseArgv(argv, { outputAndExitOnError: false })
}

test.skip("rejects too many file arguments", () => {
  expect(() => {
    parseArgv(["file1.xsc", "file2.xsc"], { outputAndExitOnError: false })
  }).toThrow()
})

test.skip("rejects unknown format", () => {
  expect(() => {
    parseArgv(["--format", "transcribe_version_999"], { outputAndExitOnError: false })
  }).toThrow()
})

test("accepts one file", () => {
  expect(parseArgv(["some file with spaces.xsc"], { outputAndExitOnError: false })).toEqual({
    inputSource: {
      filePath: "some file with spaces.xsc",
      type: "file",
    },
    outputFormat: "generic",
  })
})

test("interprets no files as stdin", () => {
  expect(parseArgv([], { outputAndExitOnError: false })).toEqual({
    inputSource: { type: "stdin" },
    outputFormat: "generic",
  })
})

test("interprets - as stdin", () => {
  expect(parseArgv(["-"], { outputAndExitOnError: false })).toEqual({
    inputSource: { type: "stdin" },
    outputFormat: "generic",
  })
})
