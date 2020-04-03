import * as fs from "fs"
import * as util from "util"

const readFile = util.promisify(fs.readFile)

// the following function is from https://stackoverflow.com/a/54565854
async function readStreamContents(stream: NodeJS.ReadStream): Promise<string> {
  const chunks = []
  for await (const chunk of stream) chunks.push(chunk)
  return Buffer.concat(chunks).toString("utf8")
}

function readAllOfStdin(): Promise<string> {
  return readStreamContents(process.stdin)
}

async function readAllOfAFile(filePath: string): Promise<string> {
  try {
    const testFileBuffer = await readFile(filePath)
    return testFileBuffer.toString()
  } catch (err) {
    throw err
  }
}

export type InputSource = { type: "stdin" } | { type: "file"; filePath: string }
export async function readAllFromSource(sourceDescriptor: InputSource): Promise<string> {
  if (sourceDescriptor.type === "stdin") {
    return readAllOfStdin()
  } else {
    return readAllOfAFile(sourceDescriptor.filePath)
  }
}
