# Third-party components

- @ffmpeg/ffmpeg 0.12.15 — MIT. Source: https://github.com/ffmpegwasm/ffmpeg.wasm . License: https://github.com/ffmpegwasm/ffmpeg.wasm/blob/main/LICENSE
- @ffmpeg/core 0.12.10 — FFmpeg WebAssembly core, including FFmpeg and enabled third-party codecs. Source and build instructions: https://github.com/ffmpegwasm/ffmpeg.wasm/tree/main/packages/core ; core source: https://github.com/ffmpegwasm/ffmpeg.wasm-core . Consult the release-specific configuration and licenses when redistributing or changing the engine.
- FFmpeg license information: https://ffmpeg.org/legal.html
- Vite and Playwright are build/development tools and are not used as a runtime backend.

The upstream core contains GPL-enabled codecs such as libx264. Retain applicable copyright notices and provide corresponding source and build information as required by the licenses when distributing the engine. The JavaScript wrapper's MIT license does not replace the core's codec licenses.
