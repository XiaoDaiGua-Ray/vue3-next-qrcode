import type { MaybeArray } from './types'

/**
 * Call one or multiple functions with the same arguments
 */
export function call<T extends (...args: any[]) => any>(
  funcs: MaybeArray<T>,
  ...args: Parameters<T>
): void {
  if (!funcs) return

  if (Array.isArray(funcs)) {
    funcs.forEach((func) => func?.(...args))
  } else {
    funcs(...args)
  }
}
