import { ParseState } from "./types"

export function assertCurrentSection(expectedSection: string, currentState: ParseState): void {
  if (currentState.currentSection !== expectedSection) {
    throw new Error(
      `found a field expected to be in the ${expectedSection} section in the ${currentState.currentSection} section instead; change code to support that`
    )
  }
}
