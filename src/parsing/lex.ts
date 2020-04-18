export function splitIntoLines(string: string): Array<string> {
  return string.split(/\r\n|\n|\r/)
}

export function splitLineIntoParts(line: string): Array<string> {
  const split = line.split(",")
  return split.map(unescapeLinePart)
  // Splitting on commas before unescaping is okay because the escaped line parts never contain commas.
  // This is because commas are escaped as `\C`, not as `\,`.
}

/**
 * Returns a string with only the following differences:
 * - `\\` is interpreted as `\`
 * - `\C` (with a non-escaped backslash) is interpreted as `,`
 */
export function unescapeLinePart(linePart: string): string {
  // Minor performance note: this code uses repeated .push on Array followed by .join because I assume it is faster than repeated += on string. I did not benchmark to confirm that assumption.

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
  // Reusing `splitLineIntoParts` is simpler than trying to match only until the first comma, and it ensures we won’t have to change this function if we later realize some escape character can affect splitting.
  const parts = splitLineIntoParts(line)
  return parts[0]
}

export function lineIsBlank(line: string): boolean {
  return /^\s*$/.test(line)
}
