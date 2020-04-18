import * as yargs from "yargs"
import { InputSource } from "./io_utils"

function chooseInputSource(filePaths: Array<string>): InputSource {
  if (filePaths[0] === "-" || filePaths.length === 0) {
    return { type: "stdin" }
  } else {
    const filePath = filePaths[0]
    return { type: "file", filePath }
  }
}

// Now that I extracted this function `parseArgv`, is this testable by Jest? Can it catch the errors/exit for bad arguments without stopping the whole test?
export function parseArgv(
  argv: Array<string>,
  options: { outputAndExitOnError: boolean } = { outputAndExitOnError: true }
) {
  // yargs.reset() is needed to make multiple `yargs` calls in a single program, e.g. in tests, work independently.
  // That’s why I’m calling it even though the Yargs docs say it’s deprecated. The docs don’t say what to use instead.
  yargs.reset()

  const yargsParser = yargs
    .usage("$0 [option] [file]")
    .example("$0 myTranscribeFile.xsc", "reading input with a file argument")
    .example(
      "cat myTranscribeFile.xsc | $0 > transcribeFileData.json",
      "converting input with stdin and stdout redirection"
    )
    .option("format", {
      alias: "f",
      choices: ["generic", "audacity_label_track"],
      default: "generic",
      description: "Data format to output",
    })
    .exitProcess(options.outputAndExitOnError)
    .check((argv) => {
      const filePaths = argv._
      if (filePaths.length > 1) {
        throw new Error(
          "Multiple files were given as arguments, but only one file can be converted at a time. File paths: " +
            filePaths.join(",")
        )
      }
      return true
    })
    .version()
    .help()

  let yargsArgv
  if (options.outputAndExitOnError) {
    yargsArgv = yargsParser.parse(argv)
  } else {
    yargsArgv = yargsParser.parse(argv, (err: Error | undefined, _argv: Object, _output: string) => {
      if (err) throw err
    })
  }

  if (yargsArgv.format === "audacity_label_track") {
    // TODO parse as generic JS object, then convert that to Audacity’s tab-delimited text format
    console.error("Sorry, we don’t support converting to that format yet.")
    process.exit(1)
  } else {
    // convert to generic JSON format

    const inputSource = chooseInputSource(yargsArgv._)
    return { inputSource, outputFormat: yargsArgv.format }
  }
}
