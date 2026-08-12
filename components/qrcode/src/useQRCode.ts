import * as Vue from 'vue'
import { renderQRCode } from './renderer'
import { useGifBackground } from './useGifBackground'
import { useQRCodeDownload } from './useQRCodeDownload'

import type { ComputedRef, Ref } from 'vue'
import type { QRCodeRenderResponse, QRCodeBaseOptions } from './types'

export interface UseQRCodeOptions extends Partial<QRCodeBaseOptions> {
  /**
   * Text to be encoded in the QR code (required)
   */
  text: string
  /**
   * GIF background URL to be loaded and used
   */
  gifBackgroundURL?: string
}

export type QRCodeGenerationStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'error'
  | 'cancelled'

export type QRCodeGenerationConcurrency = 'reject' | 'latest'

export interface UseQRCodeConfig {
  defaultOptions?: Partial<UseQRCodeOptions>
  concurrency?: QRCodeGenerationConcurrency
}

export interface UseQRCodeConfigWithDefaults extends UseQRCodeConfig {
  defaultOptions: UseQRCodeOptions
}

export class QRCodeGenerationCancelledError extends Error {
  constructor(message = 'QR code generation was cancelled') {
    super(message)
    this.name = 'QRCodeGenerationCancelledError'
  }
}

export interface UseQRCodeReturnBase {
  qrcodeURL: Ref<QRCodeRenderResponse>
  isLoading: Ref<boolean>
  status: Ref<QRCodeGenerationStatus>
  error: Ref<Error | null>
  canDownload: ComputedRef<boolean>
  download: (
    fileName?: string,
    sourceOverride?: QRCodeRenderResponse,
  ) => Promise<void>
  cancel: () => void
  reset: () => void
  clear: () => void
  dispose: () => void
}

export interface UseQRCodeReturn extends UseQRCodeReturnBase {
  generate: (options: UseQRCodeOptions) => Promise<QRCodeRenderResponse>
}

export interface UseQRCodeReturnWithDefaults extends UseQRCodeReturnBase {
  generate: (
    options?: Partial<UseQRCodeOptions>,
  ) => Promise<QRCodeRenderResponse>
}

type GenerationJob = {
  id: number
  options: UseQRCodeOptions
  cancelled: boolean
  settled: boolean
  resolve: (result: QRCodeRenderResponse) => void
  reject: (error: Error) => void
}

type OptionalScopeAPI = {
  getCurrentScope?: () => unknown
  onScopeDispose?: (cleanup: () => void) => void
}

/**
 * Composable for generating QR codes.
 *
 * The default `reject` concurrency mode preserves the original API behavior.
 * Use `latest` when only the newest overlapping request should own the result.
 */
export function useQRCode(): UseQRCodeReturn
export function useQRCode(
  config: UseQRCodeConfigWithDefaults,
): UseQRCodeReturnWithDefaults
export function useQRCode(config: UseQRCodeConfig): UseQRCodeReturn
export function useQRCode(
  config: UseQRCodeConfig = {},
): UseQRCodeReturn | UseQRCodeReturnWithDefaults {
  const qrcodeURL = Vue.ref<QRCodeRenderResponse>() as Ref<QRCodeRenderResponse>
  const isLoading = Vue.ref(false) as Ref<boolean>
  const status = Vue.ref<QRCodeGenerationStatus>(
    'idle',
  ) as Ref<QRCodeGenerationStatus>
  const error = Vue.ref<Error | null>(null) as Ref<Error | null>
  const gifBackground = useGifBackground()
  const { canDownload, download } = useQRCodeDownload(qrcodeURL)
  const concurrency = config.concurrency ?? 'reject'
  let sequence = 0
  let disposed = false
  let executing = false
  let activeJob: GenerationJob | null = null
  let pendingJob: GenerationJob | null = null

  const cancelJob = (job: GenerationJob | null, message?: string): void => {
    if (!job || job.settled) return

    job.cancelled = true
    job.settled = true
    job.reject(new QRCodeGenerationCancelledError(message))
  }

  const resolveOptions = (
    options?: Partial<UseQRCodeOptions>,
  ): UseQRCodeOptions => {
    const merged = {
      ...config.defaultOptions,
      ...options,
    } as UseQRCodeOptions

    if (!merged.text) {
      throw new Error('Text is required for QR code generation')
    }

    return merged
  }

  const performGeneration = async (
    options: UseQRCodeOptions,
  ): Promise<QRCodeRenderResponse> => {
    const {
      gifBackgroundURL,
      gifBackground: gifBackgroundOption,
      ...qrOptions
    } = options

    let gifBackgroundBuffer = gifBackgroundOption

    if (gifBackgroundURL) {
      gifBackgroundBuffer =
        gifBackground.getBuffer(gifBackgroundURL) ??
        (await gifBackground.load(gifBackgroundURL))
    }

    const cleanOptions: Partial<QRCodeBaseOptions> = Object.fromEntries(
      Object.entries(qrOptions).filter(([, value]) => value !== void 0),
    )

    if (gifBackgroundBuffer) {
      cleanOptions.gifBackground = gifBackgroundBuffer
    }

    return renderQRCode(cleanOptions as QRCodeBaseOptions)
  }

  const refreshLoading = (): void => {
    isLoading.value = Boolean(
      (activeJob && !activeJob.cancelled && !activeJob.settled) || pendingJob,
    )
  }

  const startJob = (job: GenerationJob): void => {
    executing = true
    activeJob = job

    void performGeneration(job.options)
      .then((result) => {
        if (disposed || job.cancelled || job.settled || job.id !== sequence) {
          cancelJob(job)
          return
        }

        job.settled = true
        qrcodeURL.value = result
        error.value = null
        status.value = 'success'
        job.resolve(result)
      })
      .catch((cause: unknown) => {
        if (disposed || job.cancelled || job.settled || job.id !== sequence) {
          cancelJob(job)
          return
        }

        const generationError =
          cause instanceof Error ? cause : new Error(String(cause))

        job.settled = true
        error.value = generationError
        status.value = 'error'
        job.reject(generationError)
      })
      .finally(() => {
        executing = false

        if (activeJob === job) activeJob = null

        const nextJob = pendingJob
        pendingJob = null

        if (nextJob && !disposed && !nextJob.cancelled) {
          startJob(nextJob)
          return
        }

        refreshLoading()
      })
  }

  const generate = (
    options?: Partial<UseQRCodeOptions>,
  ): Promise<QRCodeRenderResponse> => {
    if (disposed) {
      return Promise.reject(
        new QRCodeGenerationCancelledError(
          'QR code generator has been disposed',
        ),
      )
    }

    let resolvedOptions: UseQRCodeOptions

    try {
      resolvedOptions = resolveOptions(options)
    } catch (cause) {
      const optionsError =
        cause instanceof Error ? cause : new Error(String(cause))

      error.value = optionsError
      status.value = 'error'
      return Promise.reject(optionsError)
    }

    const hasOwnedActiveJob =
      activeJob && !activeJob.cancelled && !activeJob.settled

    if (concurrency === 'reject' && (hasOwnedActiveJob || pendingJob)) {
      return Promise.reject(
        new Error('QR code generation is already in progress'),
      )
    }

    const id = ++sequence

    if (concurrency === 'latest') {
      cancelJob(activeJob, 'QR code generation was replaced by a newer request')
      cancelJob(
        pendingJob,
        'QR code generation was replaced by a newer request',
      )
      pendingJob = null
    }

    error.value = null
    status.value = 'loading'
    isLoading.value = true

    return new Promise<QRCodeRenderResponse>((resolve, reject) => {
      const job: GenerationJob = {
        id,
        options: resolvedOptions,
        cancelled: false,
        settled: false,
        resolve,
        reject,
      }

      if (executing) {
        pendingJob = job
      } else {
        startJob(job)
      }
    })
  }

  const cancel = (): void => {
    if (disposed) return

    sequence++
    cancelJob(activeJob)
    cancelJob(pendingJob)
    pendingJob = null
    gifBackground.clear()
    error.value = null
    status.value = 'cancelled'
    isLoading.value = false
  }

  const reset = (): void => {
    cancel()
    qrcodeURL.value = void 0
    error.value = null
    status.value = 'idle'
  }

  const dispose = (): void => {
    if (disposed) return

    sequence++
    cancelJob(activeJob, 'QR code generator was disposed')
    cancelJob(pendingJob, 'QR code generator was disposed')
    pendingJob = null
    disposed = true
    gifBackground.dispose()
    error.value = null
    status.value = 'cancelled'
    isLoading.value = false
  }

  const scopeAPI = Vue as unknown as OptionalScopeAPI

  if (scopeAPI.getCurrentScope?.() && scopeAPI.onScopeDispose) {
    scopeAPI.onScopeDispose(dispose)
  } else if (Vue.getCurrentInstance()) {
    Vue.onUnmounted(dispose)
  }

  return {
    qrcodeURL,
    isLoading,
    status,
    error,
    generate,
    canDownload,
    download,
    cancel,
    reset,
    clear: reset,
    dispose,
  }
}

export type UseQRCodeReturnType = UseQRCodeReturn
