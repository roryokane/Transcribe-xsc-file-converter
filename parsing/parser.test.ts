import { parse } from "./parser"
import { readAllOfAFile } from "../io_utils"

test("the file ‘Windows ME Startup.xsc’ can be parsed", async () => {
  const fileContents = await readAllOfAFile("tests/relatively few markers/Windows ME Startup.xsc")
  const parsed = parse(fileContents)
  expect(parsed).toMatchSnapshot()
})
