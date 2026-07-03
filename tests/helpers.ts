export type Deferred<T> = {
  promise: Promise<T>
  resolve: (value: T | PromiseLike<T>) => void
  reject: (reason?: unknown) => void
}

export function deferred<T>(): Deferred<T> {
  let resolve!: Deferred<T>['resolve']
  let reject!: Deferred<T>['reject']
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve
    reject = promiseReject
  })

  return { promise, resolve, reject }
}

export function arrayBuffer(...values: number[]): ArrayBuffer {
  return new Uint8Array(values.length ? values : [1]).buffer as ArrayBuffer
}

export async function flushPromises(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0))
}

export async function waitFor(
  assertion: () => void | Promise<void>,
  attempts = 40,
): Promise<void> {
  let lastError: unknown

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      await assertion()

      return
    } catch (error) {
      lastError = error
      await flushPromises()
    }
  }

  throw lastError
}
