import type { MaybeArray } from './types'

/**
 * Call one or multiple functions with the same arguments
 */
export function call<T extends (...args: never[]) => unknown>(
  funcs: MaybeArray<T> | null | undefined,
  ...args: Parameters<T>
): void {
  if (!funcs) return

  if (Array.isArray(funcs)) {
    funcs.forEach((func) => func?.(...args))
  } else {
    funcs(...args)
  }
}
