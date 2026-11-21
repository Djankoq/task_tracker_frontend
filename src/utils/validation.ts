export type FieldErrors = Record<string, string>
export function required(value: string, label: string): string | undefined {
  if (!value.trim()) return 'Заполните поле «' + label + '».'
  if (value.includes('\0')) return 'Недопустимый символ в тексте.'
  return undefined
}
export function focusFirstError(form: HTMLFormElement | null, errors: FieldErrors) {
  const name = Object.keys(errors)[0]
  if (name) form?.querySelector<HTMLElement>('[name="' + name + '"]')?.focus()
}
