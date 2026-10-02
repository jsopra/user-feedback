// Prefixo opcional para servir o app fora da raiz do domínio (ex.: /user-feedback).
// Lido em build time; ver lib/base-path.ts.
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/+$/, '')

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  ...(basePath ? { basePath } : {}),
  eslint: {
    // Temporariamente desabilitado para focar na migração PostgreSQL
    // TODO: Corrigir erros react/no-unescaped-entities e react-hooks/exhaustive-deps
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@swc/core-linux-x64-gnu',
        'node_modules/@swc/core-linux-x64-musl',
        'node_modules/@esbuild/linux-x64',
      ],
    },
  },
}

export default nextConfig
