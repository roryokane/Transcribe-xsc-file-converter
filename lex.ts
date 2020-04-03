export function splitIntoLines(string: string): Array<string> {
  return string.split(/\r\n|\n|\r/)
}

export function splitLineIntoParts(line: string): Array<string> {
  const split = line.split(",")
  return split.map(unescapeLinePart)
}

// interpret `\\` as `\`
// interpret `\C` (with a non-escaped backslash) as `,`
// FIXME this implementation fails to convert `\\\C` to `\,`
export function unescapeLinePart(linePart: string): string {
  return linePart.replace(/(?<!\\)\\C/g, ",").replace(/\\\\/g, "\\")
}

export function getKeyOfLine(line: string): string {
  const parts = splitLineIntoParts(line)
  return parts[0]
}

export function lineIsBlank(line: string): boolean {
  return /^\s*$/.test(line)
}
