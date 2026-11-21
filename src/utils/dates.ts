// Keep sub-minute precision if the user did not change the displayed deadline.
export function toLocalDateTime(iso: string) {
  const date = new Date(iso)
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
}
export function toApiDeadline(value: string, original?: string) {
  if (original && value === toLocalDateTime(original)) return original
  return new Date(value).toISOString()
}
