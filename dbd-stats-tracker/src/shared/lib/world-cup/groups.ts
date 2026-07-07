const GROUP_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function groupLetter(groupIndex: number): string {
  return GROUP_LETTERS[groupIndex] ?? String(groupIndex + 1);
}
