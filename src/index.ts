#!/usr/bin/env node
// The above shebang line is meant for the compiled index.js. It won’t work for index.ts.

import * as yargs from "yargs"
import { parse } from "./parsing/parser"
import { parseNodeProcessArgv } from "./cli_arg_parsing"
import { readAllFromSource, InputSource } from "./io_utils"

function fail(errorMessage: string, exitCode: number = 1): never {
  console.error(errorMessage)
  process.exit(exitCode)
}

const { inputSource, outputFormat } = parseNodeProcessArgv(process.argv)

if (outputFormat === "audacity_label_track") {
  // TODO parse as generic JS object, then convert that to Audacity’s tab-delimited text format
  fail("Sorry, we don’t support converting to that format yet.")
}

// convert to generic JSON format:

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
    let parsed
    try {
      parsed = parse(testFileContents)
    } catch (err) {
      if (outputFormat !== "debug") {
        fail(err.name + ": " + err.message)
      }
    }

    if (outputFormat === "debug") {
      console.error("Output JSON (but in JS syntax):")
      console.dir(parsed, { depth: null, colors: true })
    } else {
      // output for outputFormat === "generic"
      console.log(JSON.stringify(parsed, null, 2))
    }
  })
  .catch((err) => {
    throw err
  })
