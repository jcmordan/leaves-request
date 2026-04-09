import dotenv from 'dotenv'
import createNextIntlPlugin from 'next-intl/plugin'
import { getApiUrl } from 'envUtils'
import type { NextConfig } from 'next'

dotenv.config({ path: '.env' })
dotenv.config({ path: "../.env" });


const withNextIntl = createNextIntlPlugin()

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL('https://i.pravatar.cc/*'),
      new URL('https://placehold.net/*'),
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: 'standalone',
  turbopack: {},
  webpack: config => {
    config.ignoreWarnings = [
      ...(config.ignoreWarnings ?? []),
      {
        module: /thread-stream/,
        message: /Can't resolve 'tap'/,
      },
      {
        module: /thread-stream/,
        message: /Can't resolve 'why-is-node-running'/,
      },
    ]
    config.module.rules.push({
      test: /\.test\.(js|mjs|ts|tsx)$/,
      include: /node_modules/,
      use: 'ignore-loader',
    })
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        ...(Array.isArray(config.watchOptions?.ignored) ? config.watchOptions.ignored : []),
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
        '**/__tests__/**',
      ],
    }
    return config
  },
  experimental: {
    authInterrupts: true,
  },
}

export default withNextIntl(nextConfig)
