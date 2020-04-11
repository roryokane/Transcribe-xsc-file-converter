import { parseArgv } from "./cli_arg_parsing"

test.skip("rejects too many file arguments", () => {
  expect(() => {
    parseArgv(["file1.xsc", "file2.xsc"])
  }).toThrow()
})

test.skip("rejects unknown format", () => {
  expect(() => {
    parseArgv(["--format", "transcribe_version_999"])
  }).toThrow()
})

test.skip("accepts one file", () => {
  expect(parseArgv(["some file with spaces.xsc"])).toEqual({}) // TODO
  // expect(() => {
  //   parseArgv(["some file with spaces.xsc"])
  // }).not.toThrow()
})

test.skip("interprets no files as stdin", () => {
  expect(() => {
    parseArgv([])
  }).not.toThrow()
})

test.skip("interprets - as stdin", () => {
  expect(() => {
    parseArgv(["-"])
  }).not.toThrow()
})
