export function joinTruthyStrings(strings: (string | undefined)[], separator: string = '-'): string {
  return strings.filter(s => !!s).join(separator)
}