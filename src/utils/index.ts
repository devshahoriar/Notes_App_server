export function validateError(error: any): string {
  if (!error.success) {
    const firstError = error.error.errors[0].message
    return firstError
  }
  return ''
}