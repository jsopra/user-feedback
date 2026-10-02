/**
 * Prefixo de path quando o app é servido fora da raiz do domínio
 * (ex.: https://exemplo.com/user-feedback). Definido em build time via
 * NEXT_PUBLIC_BASE_PATH e aplicado também ao `basePath` do next.config.
 *
 * O Next prefixa automaticamente <Link>, router.push e /_next/*, mas não
 * fetch(), window.location nem URLs absolutas montadas à mão — use BASE_PATH nesses casos.
 */
export const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/+$/, "")
