export function formatMinutesToText(
  minutes: number,
  startString: string = ""
): string {
  if (minutes === 0) {
    return startString;
  }
  if (minutes < 60) {
    return `${startString} ${minutes} minutes`;
  }
  const hours = Math.floor(minutes / 60);
  return formatMinutesToText(minutes - hours * 60, `${hours} hours`);
}
