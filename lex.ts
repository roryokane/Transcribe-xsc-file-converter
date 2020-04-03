export function splitIntoLines(string: string): Array<string> {
  return string.split(/\r\n|\n|\r/)
}

export function splitLineIntoParts(line: string): Array<string> {
  const split = line.split(",")
  return split.map(unescapeLinePart)
}

// Return a string with only the following changes:
// - interpret `\\` as `\`
// - interpret `\C` (with a non-escaped backslash) as `,`
export function unescapeLinePart(linePart: string): string {
  // Performance note: using repeated .push on Array followed by .join because I assume it is faster than repeated += on string. I did not benchmark to confirm that assumption.
  const escapedChars: Array<string> = []
  let nextCharIsEscape = false

  for (const char of linePart) {
    if (nextCharIsEscape) {
      if (char === "\\") {
        escapedChars.push("\\")
      } else if (char === "C") {
        escapedChars.push(",")
      } else {
        throw new Error("couldn’t interpret unknown escape sequence within '" + linePart + "'")
      }
      nextCharIsEscape = false
    } else if (char === "\\") {
      nextCharIsEscape = true
    } else {
      escapedChars.push(char)
    }
  }

  if (nextCharIsEscape) {
    throw new Error(
      "couldn’t interpret line part ending in an escaping ‘\\’ with no following character: '" + linePart + "'"
    )
  }

  return escapedChars.join("")
}

export function getKeyOfLine(line: string): string {
  const parts = splitLineIntoParts(line)
  return parts[0]
}

export function lineIsBlank(line: string): boolean {
  return /^\s*$/.test(line)
}
