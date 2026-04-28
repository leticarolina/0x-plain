// @ts-nocheck
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const userConfigPath = path.join(__dirname, 'next.user-config.mjs')

let userConfigImport = {}
if (fs.existsSync(userConfigPath)) {
  try {
    userConfigImport = (await import('./next.user-config.mjs')).default
  } catch (e) {
    // next.user-config.mjs failed to load, using empty config
  }
}

const __v0_turbopack_root = undefined ?? __dirname

export default async function v0NextConfig(phase, { defaultConfig }) {
  const userConfig = typeof userConfigImport === 'function'
    ? await userConfigImport(phase, { defaultConfig })
    : userConfigImport

  return {
  ...userConfig,
  distDir: '.next',
  devIndicators: false,
  images: {
    ...userConfig.images,
    unoptimized: process.env.NODE_ENV === 'development',
  },
  logging: {
    ...userConfig.logging,
    fetches: { fullUrl: true, hmrRefreshes: true },
    browserToTerminal: true,
  },
  turbopack: {
    ...userConfig.turbopack,
    root: __v0_turbopack_root,
  },
  experimental: {
    ...userConfig.experimental,
    transitionIndicator: true,
    turbopackFileSystemCacheForDev: process.env.TURBOPACK_PERSISTENT_CACHE !== 'false' && process.env.TURBOPACK_PERSISTENT_CACHE !== '0',
    serverActions: {
      ...userConfig.experimental?.serverActions,
      allowedOrigins: [
        ...(userConfig.experimental?.serverActions?.allowedOrigins || []),
        '*.vusercontent.net',
      ],
    },
  },
  allowedDevOrigins: [
    ...(userConfig.allowedDevOrigins || []),
    '*.vusercontent.net',
    '*.dev-vm.vusercontent.net',
  ],
}
}
