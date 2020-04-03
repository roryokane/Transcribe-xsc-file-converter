import { parse } from "./parsing/parser"
import { readAllFromSource, InputSource } from "./io_utils"

function chooseInputSource(argv: Array<string>): InputSource {
  if (argv.length === 0 || argv[0] === '--') {
    return { type: "stdin" }
  } else {
    const filePath = argv[0]
    return { type: "file", filePath }
  }
}

let fileContentsPromise
// change a `false` to `true` for debug inputs
if (true) {
  const testFilePath = "./tests/relatively few markers/Windows ME Startup.xsc"
  fileContentsPromise = readAllFromSource({ type: "file", filePath: testFilePath })
} else if (false) {
  fileContentsPromise = readAllFromSource({ type: "stdin" })
} else {
  // real program behavior
  const inputSource = chooseInputSource(process.argv)
  fileContentsPromise = readAllFromSource(inputSource)
}

fileContentsPromise
  .then(testFileContents => {
    const parsed = parse(testFileContents)

    if (true) {
      // debug output
      console.error("Output JSON (but in JS syntax):")
      console.dir(parsed, { depth: null, colors: true })
    } else {
      // real output
      console.log(JSON.stringify(parsed, null, 2))
    }
  })
  .catch(err => {
    throw err
  })
