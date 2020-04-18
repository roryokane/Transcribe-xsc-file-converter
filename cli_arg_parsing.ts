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

/**
 * Parse command-line arguments and return an object describing parameters of the requested file conversion. If there is an error in the arguments, an error message will be printed and the program will exit unless the parameter `options.outputAndExitOnError` is false. Also, an error in the argument might cause an error to be thrown, depending on how the Yargs library works.
 * @param processArgv Command-line arguments straight from `process.argv`, meaning the first two elements should be `process.execPath` and the path to the JavaScript file being executed.
 * @param options
 */
export function parseNodeProcessArgv(
  processArgv: Array<string>,
  options: { outputAndExitOnError: boolean } = { outputAndExitOnError: true }
) {
  return parseCleanArgv(processArgv.slice(2), options)
}

export function parseCleanArgv(
  cleanArgv: Array<string>,
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
    yargsArgv = yargsParser.parse(cleanArgv)
  } else {
    yargsArgv = yargsParser.parse(cleanArgv, (err: Error | undefined, _argv: Object, _output: string) => {
      if (err) throw err
    })
  }

  const inputSource = chooseInputSource(yargsArgv._)
  return { inputSource, outputFormat: yargsArgv.format }
}
