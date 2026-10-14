import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

const coral = '#FF6B4A'

export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...minimal2023Preset,
    transparent: {
      ...minimal2023Preset.transparent,
      sizes: [192, 512],
      favicons: [[48, 'favicon.ico']],
    },
    maskable: {
      ...minimal2023Preset.maskable,
      sizes: [512],
      padding: 0.2,
      resizeOptions: { background: coral, fit: 'contain' },
    },
    apple: {
      ...minimal2023Preset.apple,
      sizes: [180],
      padding: 0,
      resizeOptions: { background: coral, fit: 'contain' },
    },
  },
  images: ['public/icon.svg'],
})
