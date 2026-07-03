# AwesomeQR Optimization And Bug Analysis

This note records the `components/qrcode/core/awesome-qr.js` findings addressed during the `v4.1` beta stabilization work.

## Optimization Points

- The Vue component and `useQRCode` statically imported `AwesomeQR`, so SSR and basic package imports pulled browser canvas and GIF logic too early. Rendering now goes through a lazy renderer.
- GIF parsing and encoding were top-level dependencies. They now load dynamically only when `gifBackground` is used.
- GIF rendering can block the main thread. The packaged build now uses the verified main-thread path while the worker path remains disabled until relative worker URLs pass ESM/CJS smoke tests.
- The browser build depended on a vendored `skia-canvas` browser shim and `path-browserify`. This has been replaced with a small browser canvas adapter.
- `_getAverageRGB` allocated a new array slice for every sampled pixel. It now reads RGBA channels directly from the typed array.
- The normal root entry now stays small and SSR-safe. Heavier renderer modules are emitted as lazy chunks.

## Bug Points

- `gifFrames.forEach(async ...)` did not wait for async frame rendering before `encoder.finish()`. This could finalize GIF output before all frames were processed.
- `autoColor` divided by zero when the sampler found no eligible foreground pixels, producing invalid `rgb(NaN,NaN,NaN)` values.
- QR text encoding used UTF-16 code units directly. Emoji and other surrogate-pair characters could produce incorrect byte data; encoding now goes through `TextEncoder`.
- Browser binary fallback used `Buffer.from(...)`, which exposed a Node-specific global in browser-facing runtime and types. It now returns `Uint8Array`.
- Public types exposed `Buffer` unconditionally. They now use `Uint8Array | ArrayBuffer | string | undefined`.
- Component rendering dropped prop updates while a render was already in progress. The component now queues a rerender and commits only the latest request.

## Remaining Watch Items

- Worker rendering depends on bundler support for module workers. It is currently disabled in packaged builds and should only be re-enabled after Vite, Nuxt, ESM, and CJS package smoke tests pass.
- GIF rendering is still intrinsically heavier than static QR rendering. The lazy split prevents the cost from affecting non-GIF users, but very large GIF backgrounds may still be expensive.
