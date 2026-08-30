export function formatDate(value: string, omitYear = false) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime()))
    return value

  return date.toLocaleDateString('en-US', {
    ...(!omitYear ? { year: 'numeric' as const } : {}),
    month: 'short',
    day: 'numeric',
  })
}
