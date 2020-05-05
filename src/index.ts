#!/usr/bin/env node
// The above shebang line is meant for the compiled index.js. It won’t work for index.ts.

import * as yargs from "yargs"
import { parse } from "./parsing/parser"
import { parseNodeProcessArgv } from "./cli_arg_parsing"
import { toAudacityLabelTrackFormat } from "./audacity_label_track_export"
import { readAllFromSource, InputSource } from "./io_utils"

function fail(errorMessage: string, exitCode: number = 1): never {
  console.error(errorMessage)
  process.exit(exitCode)
}

const { inputSource, outputFormat } = parseNodeProcessArgv(process.argv)

let fileContentsPromise
// change a `false` to `true` for debug inputs
if (false) {
  const testFilePath = "./tests/relatively few markers/Windows ME Startup.xsc"
  fileContentsPromise = readAllFromSource({ type: "file", filePath: testFilePath })
} else if (false) {
  fileContentsPromise = readAllFromSource({ type: "stdin" })
} else {
  // real program behavior
  fileContentsPromise = readAllFromSource(inputSource)
}

fileContentsPromise
  .then((testFileContents) => {
    const parsed = parse(testFileContents)

    if (outputFormat === "debug") {
      console.error("Output JSON (but in JS syntax):")
      console.dir(parsed, { depth: null, colors: true })
    } else if (outputFormat === "generic") {
      console.log(JSON.stringify(parsed, null, 2))
    } else {
      // output for outputFormat === "audacity_label_track"
      // use process.stdout.write instead of console.log to avoid adding a trailing newline to an empty file
      process.stdout.write(toAudacityLabelTrackFormat(parsed))
    }
  })
  .catch((err) => {
    if (outputFormat === "debug") {
      throw err
    } else {
      fail(err.name + ": " + err.message)
    }
  })
